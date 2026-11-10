import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Stop = string | { title?: string | null; description?: string | null };

type ItineraryPdfData = {
  id: number;
  status: string;
  observations?: string | null;
  totalAmount?: number | string | null;
  createdAt?: Date | string | null;
  client?: { fullName?: string | null; email?: string | null; phone?: string | null; documentNumber?: string | null } | null;
  operator?: { fullName?: string | null; email?: string | null } | null;
  items?: Array<{
    id: number;
    quantityPeople?: number | null;
    unitPrice?: number | string | null;
    subtotal?: number | string | null;
    includesDrink?: boolean | null;
    drinkDetails?: string | null;
    returnTime?: string | null;
    activity?: {
      name?: string | null;
      imageUrl?: string | null;
      meetingPoint?: string | null;
      meetingTime?: string | null;
      stops?: Stop[] | null;
      safetyNotes?: string | null;
      emergencyContacts?: string | null;
    } | null;
    schedule?: { scheduleDate?: string | Date | null; startTime?: string | Date | null; endTime?: string | Date | null } | null;
  }>;
};

// ---------------------------------------------------------------------------
// VALORES POR DEFECTO DE ACTIVIDADES
// Se buscan por palabra clave en el nombre de la actividad (sin tildes ni mayúsculas).
// Si varias coinciden (ej. "Paseo al atardecer en Catamarán por la Bahía"),
// se combinan en orden: las de abajo sobrescriben a las de arriba.
// ---------------------------------------------------------------------------
type ActivityDefaults = {
  meetingPoint?: string;
  meetingTime?: string;
  returnTime?: string;
  drinkDetails?: string;
  stops?: Array<{ title: string; description: string }>;
};

const GENERIC_STOPS = [
  { title: 'Encuentro y Bienvenida', description: 'Recepción por guía profesional y charla técnica de la experiencia.' },
  { title: 'Recorrido Principal Guiado', description: 'Desarrollo de las actividades turísticas con acompañamiento continuo.' },
  { title: 'Cierre y Retorno Seguro', description: 'Finalización de la jornada en el punto de encuentro coordinado.' },
];

const GENERIC_DEFAULTS: ActivityDefaults = {
  meetingPoint: 'Lobby del Hotel o Punto acordado con el Operador',
  drinkDetails: 'Agua embotellada 500ml',
  stops: GENERIC_STOPS,
};

const ACTIVITY_DEFAULTS: Array<{ keyword: string; values: ActivityDefaults }> = [
  {
    keyword: 'city tour',
    values: {
      meetingPoint: 'Torre del Reloj (Plaza de la Paz) o Lobby del Hotel',
      meetingTime: '08:00 a. m.',
      returnTime: '12:00 p. m.',
      drinkDetails: 'Agua embotellada 500ml',
      stops: [
        { title: 'Convento de La Popa', description: 'Visita guiada al claustro y mirador panorámico 360° de la bahía colonial.' },
        { title: 'Castillo San Felipe de Barajas', description: 'Exploración de baluartes militares, galerías subterráneas y baterías.' },
        { title: 'Monumento Botero y Plazas del Centro', description: 'Caminata histórica por Santo Domingo, San Pedro Claver y Murallas.' },
      ],
    },
  },
  {
    keyword: 'bahia',
    values: {
      meetingTime: '05:00 p. m.',
      returnTime: '11:00 p. m.',
    },
  },
  {
    keyword: 'catamar',
    values: {
      drinkDetails: 'Shots de aguardiente durante el recorrido',
    },
  },
];

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const getActivityDefaults = (name: string): { values: ActivityDefaults; matched: boolean } => {
  const normalized = normalize(name);
  let values: ActivityDefaults = { ...GENERIC_DEFAULTS };
  let matched = false;
  for (const entry of ACTIVITY_DEFAULTS) {
    if (normalized.includes(entry.keyword)) {
      values = { ...values, ...entry.values };
      matched = true;
    }
  }
  return { values, matched };
};

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------
const formatCurrency = (value: number | string | null | undefined) =>
  `$${Number(value || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-CO');
};

// Formato manual "08:30 a. m." (evita espacios Unicode especiales que la fuente
// estándar del PDF no sabe dibujar). Las columnas tipo TIME llegan como
// 1970-01-01T08:30Z, por eso se leen en UTC para no restar 5 horas.
const formatTime = (value: Date | string | null | undefined) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    return toAmPm(h, m);
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  const isTimeOnly = date.getUTCFullYear() === 1970;
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: isTimeOnly ? 'UTC' : 'America/Bogota',
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour')?.value || 0) % 24;
  const m = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return toAmPm(h, m);
};

const toAmPm = (h: number, m: number) => {
  const suffix = h >= 12 ? 'p. m.' : 'a. m.';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

const toStop = (stop: Stop): { title: string; description: string } =>
  typeof stop === 'string'
    ? { title: stop, description: '' }
    : { title: stop?.title || '', description: stop?.description || '' };

// ---------------------------------------------------------------------------
// Generador
// ---------------------------------------------------------------------------
export const generateItineraryPdf = (itinerary: ItineraryPdfData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: 'LETTER', bufferPages: true });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Paleta DC EXPERIENCE
    const brandNavy = '#071F38';
    const brandOcean = '#0A3B66';
    const brandBlue = '#0284C7';
    const brandCyanLight = '#7DD3FC';
    const brandTextLight = '#F0F9FF';
    const textColor = '#334155';
    const mutedColor = '#64748B';
    const lightBg = '#F8FAFC';
    const borderColor = '#BAE6FD';
    const softBorder = '#E2E8F0';

    const left = 36;
    const contentWidth = 540;
    const footerLineY = 738;
    const contentBottom = footerLineY - 10; // nada del contenido baja de aquí
    let y = 0;

    const ensureSpace = (height: number) => {
      if (y + height > contentBottom) {
        doc.addPage();
        y = 36;
      }
    };

    // ---------------- Encabezado ----------------
    const headerHeight = 98;
    const headerGradient = doc.linearGradient(0, 0, 612, headerHeight);
    headerGradient.stop(0, '#061A30');
    headerGradient.stop(0.42, '#0A3B66');
    headerGradient.stop(0.8, '#006699');
    headerGradient.stop(1, '#0084B4');
    doc.rect(0, 0, 612, headerHeight).fill(headerGradient);

    const accentGradient = doc.linearGradient(0, headerHeight, 612, headerHeight);
    accentGradient.stop(0, '#00B4D8');
    accentGradient.stop(0.5, '#48CAE4');
    accentGradient.stop(1, '#90E0EF');
    doc.rect(0, headerHeight, 612, 3).fill(accentGradient);

    const possibleLogoPaths = [
      path.resolve(__dirname, '../assets/dc_experience_logo.png'),
      path.resolve(__dirname, '../assets/dc_logo.png'),
      path.resolve(__dirname, '../assets/logo.png'),
      path.resolve(__dirname, '../../frontend/public/dc_experience_logo.png'),
      path.resolve(__dirname, '../../frontend/public/dc_logo.png'),
      path.resolve(__dirname, '../../../frontend/public/dc_experience_logo.png'),
      path.resolve(__dirname, '../../../frontend/public/dc_logo.png'),
    ];
    const logoFilePath = possibleLogoPaths.find((p) => fs.existsSync(p));

    const logoX = 36;
    const logoY = 17;
    const logoSize = 62;
    let hasLoadedRasterLogo = false;

    if (logoFilePath) {
      try {
        doc.save();
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).fill('#FFFFFF');
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).lineWidth(1.2).stroke('#38BDF8');
        doc.roundedRect(logoX + 2, logoY + 2, logoSize - 4, logoSize - 4, 8).clip();
        doc.image(logoFilePath, logoX + 2, logoY + 2, { fit: [logoSize - 4, logoSize - 4], align: 'center', valign: 'center' });
        doc.restore();
        hasLoadedRasterLogo = true;
      } catch {
        doc.restore();
        hasLoadedRasterLogo = false;
      }
    }

    if (!hasLoadedRasterLogo) {
      doc.save();
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).fill('#FFFFFF');
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).lineWidth(1.2).stroke('#38BDF8');
      doc.fillColor('#0A3B66').fontSize(22).font('Helvetica-Bold').text('DC', logoX, logoY + 12, { width: logoSize, align: 'center' });
      doc.fillColor('#0284C7').fontSize(6).font('Helvetica-Bold').text('EXPERIENCE', logoX, logoY + 39, { width: logoSize, align: 'center' });
      doc.restore();
    }

    const brandTextX = 110;
    doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('DC EXPERIENCE', brandTextX, 20);
    doc.fillColor(brandCyanLight).fontSize(8.5).font('Helvetica-Bold').text('AGENCIA DE TURISMO', brandTextX, 44);
    doc.fillColor(brandTextLight).fontSize(7.5).font('Helvetica');
    doc.text('NIT: 1047438408-4  •  Email: dcexperiencectg@gmail.com', brandTextX, 58);
    doc.text('Celular: +57 317 827 3197  •  Cartagena de Indias, Colombia', brandTextX, 70);

    doc.fillColor('#38BDF8').fontSize(13.5).font('Helvetica-Bold').text('ITINERARIO DE VIAJE', 350, 20, { align: 'right', width: 226 });
    const formattedItNumber = `Nº IT-${String(itinerary.id).padStart(4, '0')}`;
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text(formattedItNumber, 350, 39, { align: 'right', width: 226 });

    const badgeWidth = 144;
    const badgeX = 576 - badgeWidth;
    doc.roundedRect(badgeX, 59, badgeWidth, 18, 9).fill(brandBlue);
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('ESTADO: CONFIRMADO', badgeX, 64, { align: 'center', width: badgeWidth });

    // ---------------- Cliente / Reserva ----------------
    y = 112;
    doc.rect(left, y, contentWidth, 74).fill(lightBg);

    doc.fillColor(brandOcean).fontSize(9.5).font('Helvetica-Bold').text('INFORMACIÓN DEL CLIENTE', 48, y + 9);
    doc.fillColor(textColor).fontSize(8).font('Helvetica');
    doc.text(`Cliente: ${itinerary.client?.fullName || 'N/A'}`, 48, y + 24);
    doc.text(`Documento: ${itinerary.client?.documentNumber || 'N/A'}`, 48, y + 36);
    doc.text(`Teléfono: ${itinerary.client?.phone || 'N/A'}`, 48, y + 48);
    doc.text(`Email Cliente: ${itinerary.client?.email || 'N/A'}`, 48, y + 60);

    doc.fillColor(brandOcean).fontSize(9.5).font('Helvetica-Bold').text('DETALLES DE RESERVA', 310, y + 9);
    doc.fillColor(textColor).fontSize(8).font('Helvetica');
    doc.text(`Fecha Emisión: ${formatDate(itinerary.createdAt)}`, 310, y + 24);
    doc.text(`Operador Resp.: ${itinerary.operator?.fullName || 'Daniela Pájaro'}`, 310, y + 36);
    doc.text(`Correo del Operador: ${itinerary.operator?.email || 'dcexperiencectg@gmail.com'}`, 310, y + 48);
    doc.text('Contacto Operador: +57 317 827 3197', 310, y + 60);

    y += 74 + 12;

    // ---------------- Actividades ----------------
    const items = itinerary.items || [];
    let safetyNote = '';
    let emergencyContact = '';

    if (items.length === 0) {
      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica').text('No hay actividades registradas en este itinerario.', 48, y);
      y += 24;
    }

    items.forEach((item, index) => {
      const activity = item.activity || {};
      const name = activity.name || 'Actividad Turística';
      const { values: defaults, matched } = getActivityDefaults(name);

      // Para actividades con valores por defecto definidos arriba, esos valores mandan.
      const meetingPoint = (matched ? defaults.meetingPoint : activity.meetingPoint || defaults.meetingPoint) || '';
      const meetingTime =
        defaults.meetingTime || activity.meetingTime || formatTime(item.schedule?.startTime) || 'Por confirmar';
      const returnTime = defaults.returnTime || item.returnTime || formatTime(item.schedule?.endTime) || 'Por confirmar';
      const includesDrink = item.includesDrink ?? true;
      const drinkDetails = (matched ? defaults.drinkDetails : item.drinkDetails || defaults.drinkDetails) || '';
      const rawStops: Stop[] = matched ? defaults.stops || [] : activity.stops?.length ? activity.stops : defaults.stops || [];
      const stops = rawStops.map(toStop).filter((s) => s.title);

      if (!safetyNote && activity.safetyNotes) safetyNote = activity.safetyNotes;
      if (!emergencyContact && activity.emergencyContacts) emergencyContact = activity.emergencyContacts;

      // Medir la tarjeta para no partirla entre páginas
      const stopTextX = 72;
      const stopTextWidth = 576 - 12 - stopTextX;
      doc.fontSize(7);
      const stopHeights = stops.map((s) =>
        Math.max(13, doc.font('Helvetica').heightOfString(`${s.title} — ${s.description}`, { width: stopTextWidth }) + 5)
      );
      const titleBarH = 22;
      const infoH = 34;
      const stopsHeaderH = stops.length ? 15 : 0;
      const stopsH = stopHeights.reduce((a, b) => a + b, 0);
      const cardH = titleBarH + infoH + stopsHeaderH + stopsH + 6;

      ensureSpace(cardH);
      const cardTop = y;

      // Barra del título
      doc.roundedRect(left, y, contentWidth, titleBarH, 5).fill(brandNavy);
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(`${index + 1}. ${name.toUpperCase()}`, 48, y + 7, {
        width: 300,
        height: 11,
        ellipsis: true,
        lineBreak: false,
      });
      doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text(
        `PAX: ${item.quantityPeople || 1}  •  P. UNIT: ${formatCurrency(item.unitPrice)}  •  SUBTOTAL: ${formatCurrency(item.subtotal)}`,
        300,
        y + 8,
        { width: 266, align: 'right', lineBreak: false }
      );
      y += titleBarH;

      // Cuerpo con borde
      doc.rect(left, y, contentWidth, cardH - titleBarH).lineWidth(0.6).stroke(softBorder);

      // Punto de encuentro / bebida (izquierda) y horarios (derecha)
      const row1 = y + 6;
      const row2 = y + 20;
      doc.fillColor(brandOcean).fontSize(7).font('Helvetica-Bold');
      doc.text('PUNTO DE ENCUENTRO:', 48, row1);
      doc.text('INCLUYE BEBIDA:', 48, row2);
      doc.fillColor(textColor).font('Helvetica').fontSize(7);
      doc.text(meetingPoint || 'Por confirmar', 140, row1, { width: 230, height: 9, ellipsis: true, lineBreak: false });
      doc.text(includesDrink ? `Sí · Detalle: ${drinkDetails}` : 'No', 140, row2, {
        width: 230,
        height: 9,
        ellipsis: true,
        lineBreak: false,
      });

      doc.fillColor(brandOcean).fontSize(7).font('Helvetica-Bold');
      doc.text('HORA DE CITA:', 400, row1);
      doc.text('RETORNO EST.:', 400, row2);
      doc.fillColor(brandBlue).font('Helvetica-Bold').fontSize(7.5).text(`${meetingTime} (Puntual)`, 470, row1 - 0.5, {
        width: 100,
        lineBreak: false,
      });
      doc.fillColor(textColor).font('Helvetica-Bold').fontSize(7.5).text(returnTime, 470, row2 - 0.5, {
        width: 100,
        lineBreak: false,
      });
      y += infoH;

      // Paradas
      if (stops.length) {
        doc.moveTo(left, y).lineTo(left + contentWidth, y).lineWidth(0.5).stroke(softBorder);
        doc.fillColor(brandNavy).fontSize(7.5).font('Helvetica-Bold').text('ITINERARIO DE PARADAS / RECORRIDO PASO A PASO:', 48, y + 5);
        y += stopsHeaderH;

        stops.forEach((stop, sIdx) => {
          doc.roundedRect(52, y + 1, 11, 9, 2).fill(brandBlue);
          doc.fillColor('#FFFFFF').fontSize(6).font('Helvetica-Bold').text(String(sIdx + 1), 52, y + 3, { width: 11, align: 'center' });

          doc.fillColor(brandNavy).fontSize(7).font('Helvetica-Bold').text(`Parada ${sIdx + 1}: ${stop.title}`, stopTextX, y + 2, {
            width: stopTextWidth,
            continued: !!stop.description,
          });
          if (stop.description) {
            doc.fillColor(mutedColor).font('Helvetica').text(`  — ${stop.description}`);
          }
          y += stopHeights[sIdx];
        });
      }

      y = cardTop + cardH + 10;
    });

    // ---------------- Nota de seguridad + Emergencias (una sola vez) ----------------
    safetyNote = safetyNote || 'Recuerda cuidar y proteger tus pertenencias personales en todo momento.';
    emergencyContact = emergencyContact || '+57 317 827 3197 (DC Experience)';

    const notesH = 30;
    const totalsH = 54;
    const condH = 40;
    ensureSpace(notesH + 10 + totalsH + 10 + condH);

    doc.rect(left, y, contentWidth, notesH).fill('#F0F9FF');
    doc.rect(left, y, 3, notesH).fill(brandBlue);
    doc.fillColor(brandOcean).fontSize(7.5).font('Helvetica-Bold').text('NOTA DE SEGURIDAD', 48, y + 6);
    doc.fillColor(textColor).fontSize(7).font('Helvetica').text(safetyNote, 48, y + 17, { width: 320, height: 9, ellipsis: true, lineBreak: false });
    doc.fillColor('#B91C1C').fontSize(7.5).font('Helvetica-Bold').text('EMERGENCIAS', 400, y + 6);
    doc.fillColor(brandBlue).fontSize(7.5).font('Helvetica-Bold').text(emergencyContact, 400, y + 17, { width: 170, lineBreak: false });
    y += notesH + 10;

    // ---------------- Observaciones / Total ----------------
    doc.rect(left, y, 320, totalsH).fill(lightBg);
    doc.fillColor(brandNavy).fontSize(8.5).font('Helvetica-Bold').text('OBSERVACIONES / NOTAS:', 46, y + 8);
    doc.fillColor(textColor).fontSize(8).font('Helvetica').text(
      itinerary.observations || 'Sin observaciones registradas. Presentar este voucher digital o impreso al iniciar cada actividad.',
      46,
      y + 22,
      { width: 300, height: 26, ellipsis: true }
    );

    doc.rect(370, y, 206, totalsH).fill('#F0FDF4');
    doc.fillColor('#0369A1').fontSize(9).font('Helvetica-Bold').text('TOTAL A PAGAR (CONFIRMADO):', 382, y + 11);
    doc.fillColor(brandBlue).fontSize(15).font('Helvetica-Bold').text(formatCurrency(itinerary.totalAmount), 382, y + 27, {
      align: 'right',
      width: 182,
    });
    y += totalsH + 10;

    // ---------------- Condiciones generales ----------------
    doc.rect(left, y, contentWidth, condH).fill(lightBg);
    doc.fillColor(brandOcean).fontSize(8).font('Helvetica-Bold').text('CONDICIONES GENERALES Y ASISTENCIA DC EXPERIENCE', 46, y + 7);
    doc.fillColor('#475569').fontSize(7).font('Helvetica').text(
      '• Presentarse en el punto de encuentro en la hora indicada de cita previa con documento de identidad y voucher.\n' +
      '• Línea corporativa de asistencia DC EXPERIENCE: +57 317 827 3197  •  Email: dcexperiencectg@gmail.com.',
      46,
      y + 19,
      { width: 520 }
    );
    y += condH;

    // ---------------- Pie de página en cada hoja ----------------
    // Se baja temporalmente el margen inferior para que PDFKit NO cree
    // páginas en blanco al escribir el pie (eso causaba las 3 páginas).
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const previousBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc.rect(left, footerLineY, contentWidth, 1).fill(brandBlue);
      doc.fillColor(brandOcean).fontSize(7.5).font('Helvetica-Bold').text(
        '¡Gracias por elegir DC EXPERIENCE! Su mejor experiencia turística en Cartagena de Indias y el Caribe.',
        left,
        footerLineY + 7,
        { align: 'center', width: contentWidth, lineBreak: false }
      );
      doc.fillColor(mutedColor).fontSize(6.5).font('Helvetica').text(
        `Documento oficial de reserva · DC EXPERIENCE · NIT: 1047438408-4 · Email: dcexperiencectg@gmail.com · Cel: +57 317 827 3197 · Pág. ${i - range.start + 1} de ${totalPages}`,
        left,
        footerLineY + 19,
        { align: 'center', width: contentWidth, lineBreak: false }
      );

      doc.page.margins.bottom = previousBottom;
    }

    doc.end();
  });
};

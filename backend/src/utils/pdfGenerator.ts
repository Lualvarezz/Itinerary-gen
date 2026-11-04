import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    activity?: { name?: string | null; imageUrl?: string | null } | null;
    schedule?: { scheduleDate?: string | Date | null; startTime?: string | Date | null; endTime?: string | Date | null } | null;
  }>;
};

const formatCurrency = (value: number | string | null | undefined) =>
  `$${Number(value || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-CO');
};

const formatTime = (value: Date | string | null | undefined) => {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

export const generateItineraryPdf = (itinerary: ItineraryPdfData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    // LETTER is 612 x 792 pt. Set autoFirstPage: true and keep margins compact to prevent overflow
    const doc = new PDFDocument({ margin: 36, size: 'LETTER', bufferPages: true });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Colors
    const primaryColor = '#0F172A'; // Slate 900
    const accentColor = '#10B981'; // Emerald 500
    const textColor = '#334155'; // Slate 700
    const mutedColor = '#64748B'; // Slate 500
    const lightBg = '#F8FAFC'; // Slate 50
    const borderColor = '#E2E8F0'; // Slate 200

    // Header / Membrete (0 to 92 pt)
    doc.rect(0, 0, 612, 94).fill(primaryColor);

    // Left: Company Info
    doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('ITINERARY-GEN', 36, 22);
    doc.fontSize(9.5).font('Helvetica').fillColor('#E2E8F0').text('Agencia de Viajes & Experiencias Turísticas', 36, 46);
    doc.fontSize(8.5).fillColor('#94A3B8').text('NIT: 900.123.456-7  |  Email: reservas@itinerarygen.com  |  Celular: +57 300 123 4567', 36, 62);

    // Right: Document Title, Itinerary Number & Status
    doc.fillColor(accentColor).fontSize(14).font('Helvetica-Bold').text('ITINERARIO DE VIAJE', 350, 22, { align: 'right', width: 226 });
    
    // Nº IT-0001 (padStart 4: 0001, 0002, etc.)
    const formattedItNumber = `Nº IT-${String(itinerary.id).padStart(4, '0')}`;
    doc.fillColor('#F1F5F9').fontSize(11).font('Helvetica-Bold').text(formattedItNumber, 350, 42, { align: 'right', width: 226 });
    
    // Status box / text: ESTADO: CONFIRMADO
    doc.fillColor(accentColor).fontSize(9.5).font('Helvetica-Bold').text('ESTADO: CONFIRMADO', 350, 62, { align: 'right', width: 226 });

    // Client & Trip Info Box
    let y = 106;
    doc.rect(36, y, 540, 72).fill(lightBg).stroke(borderColor);

    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('INFORMACIÓN DEL CLIENTE', 48, y + 10);
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
    doc.text(`Cliente: ${itinerary.client?.fullName || 'N/A'}`, 48, y + 26);
    doc.text(`Documento: ${itinerary.client?.documentNumber || 'N/A'}`, 48, y + 40);
    doc.text(`Teléfono: ${itinerary.client?.phone || 'N/A'}`, 48, y + 54);

    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('DETALLES DE RESERVA', 310, y + 10);
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
    doc.text(`Fecha Emisión: ${formatDate(itinerary.createdAt)}`, 310, y + 26);
    doc.text(`Operador Resp.: ${itinerary.operator?.fullName || 'Operador Itinerary-Gen'}`, 310, y + 40);
    doc.text(`Correo: ${itinerary.client?.email || 'N/A'}`, 310, y + 54);

    // Items Table Header
    y += 84;
    doc.rect(36, y, 540, 22).fill(primaryColor);
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
    doc.text('ACTIVIDAD / EXPERIENCIA', 48, y + 6);
    doc.text('FECHA Y HORARIO', 270, y + 6);
    doc.text('PAX', 400, y + 6, { width: 35, align: 'center' });
    doc.text('P. UNIT', 445, y + 6, { width: 60, align: 'right' });
    doc.text('SUBTOTAL', 510, y + 6, { width: 56, align: 'right' });

    y += 22;
    const items = itinerary.items || [];

    // Thumbnail path check
    const defaultThumbPath = path.resolve(__dirname, '../assets/activity_thumb.jpg');
    const hasThumb = fs.existsSync(defaultThumbPath);

    if (items.length === 0) {
      y += 8;
      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica').text('No hay actividades registradas en este itinerario.', 48, y);
      y += 24;
    } else {
      items.forEach((item, index) => {
        const rowHeight = 48;
        const bg = index % 2 === 0 ? '#FFFFFF' : lightBg;
        doc.rect(36, y, 540, rowHeight).fill(bg).stroke(borderColor);

        // Thumbnail / miniatura de la actividad
        const thumbX = 44;
        const thumbY = y + 5;
        const thumbSize = 38;

        if (hasThumb) {
          try {
            doc.save();
            doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4).clip();
            doc.image(defaultThumbPath, thumbX, thumbY, { width: thumbSize, height: thumbSize });
            doc.restore();
            // Subtle border around thumbnail
            doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4).lineWidth(0.5).stroke('#CBD5E1');
          } catch {
            // Fallback decorative square
            doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4).fill('#E2E8F0');
          }
        } else {
          doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4).fill('#E2E8F0');
          doc.fillColor('#64748B').fontSize(7).font('Helvetica').text('TOUR', thumbX + 8, thumbY + 15);
        }

        // Activity Title & Details
        const textStartX = 90;
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text(
          item.activity?.name || 'Actividad Turística',
          textStartX,
          y + 11,
          { width: 172, height: 26, ellipsis: true }
        );

        // Date and Schedule
        doc.fillColor(textColor).font('Helvetica').fontSize(8).text(
          `${formatDate(item.schedule?.scheduleDate)}\n${formatTime(item.schedule?.startTime)} - ${formatTime(item.schedule?.endTime)}`,
          270,
          y + 11,
          { width: 125 }
        );

        // Pax
        doc.text(String(item.quantityPeople || 1), 400, y + 17, { width: 35, align: 'center' });

        // Unit Price
        doc.text(formatCurrency(item.unitPrice), 445, y + 17, { width: 60, align: 'right' });

        // Subtotal
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text(
          formatCurrency(item.subtotal),
          510,
          y + 17,
          { width: 56, align: 'right' }
        );

        y += rowHeight;
      });
    }

    // Observations & Total Box
    y += 12;
    const boxHeight = 54;

    // Observations (Left)
    doc.rect(36, y, 320, boxHeight).fill(lightBg).stroke(borderColor);
    doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text('OBSERVACIONES / NOTAS:', 46, y + 8);
    doc.fillColor(textColor).fontSize(8).font('Helvetica').text(
      itinerary.observations || 'Sin observaciones registradas. Presentar este voucher digital o impreso al iniciar cada actividad.',
      46,
      y + 22,
      { width: 300, height: 26, ellipsis: true }
    );

    // Total box (Right)
    doc.rect(370, y, 206, boxHeight).fill('#F0FDF4').stroke(accentColor);
    doc.fillColor('#166534').fontSize(9).font('Helvetica-Bold').text('TOTAL A PAGAR (CONFIRMADO):', 382, y + 11);
    doc.fillColor('#047857').fontSize(15).font('Helvetica-Bold').text(
      formatCurrency(itinerary.totalAmount),
      382,
      y + 27,
      { align: 'right', width: 182 }
    );

    // Policy / Guarantee notice
    y += boxHeight + 14;
    doc.rect(36, y, 540, 44).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#1E293B').fontSize(8).font('Helvetica-Bold').text('CONDICIONES GENERALES Y ASISTENCIA', 46, y + 7);
    doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text(
      '• Presentarse 15 minutos antes en el punto de encuentro acordado.\n• En caso de dudas sobre el itinerario o cambios de horario, comuníquese a la línea de asistencia corporativa: +57 300 123 4567.',
      46,
      y + 20,
      { width: 520 }
    );

    // Footer (fixed near bottom, guaranteed 1 page)
    const footerY = 720;
    doc.rect(36, footerY, 540, 1).fill('#CBD5E1');
    doc.fillColor('#64748B').fontSize(7.5).font('Helvetica');
    doc.text(
      '¡Gracias por elegir Itinerary-Gen! Por favor conserve este comprobante durante todo el recorrido.',
      36,
      footerY + 8,
      { align: 'center', width: 540 }
    );
    doc.fillColor('#94A3B8').fontSize(7).text(
      'Documento oficial de reserva · Generado automáticamente por Itinerary-Gen · www.itinerarygen.com',
      36,
      footerY + 20,
      { align: 'center', width: 540 }
    );

    doc.end();
  });
};

import PDFDocument from 'pdfkit';

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
    activity?: { name?: string | null } | null;
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
    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Colors
    const primaryColor = '#0F172A'; // Slate 900
    const accentColor = '#10B981'; // Emerald 500
    const textColor = '#334155'; // Slate 700
    const lightBg = '#F8FAFC'; // Slate 50

    // Header / Membrete
    doc.rect(0, 0, 612, 110).fill(primaryColor);

    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('CARTAGENA TOURS', 40, 30);
    doc.fontSize(10).font('Helvetica').text('Agencia de Viajes & Experiencias Turísticas', 40, 58);
    doc.text('NIT: 900.123.456-7 | info@cartagenatours.co | +57 300 000 0000', 40, 72);

    doc.fillColor(accentColor).fontSize(16).font('Helvetica-Bold').text('ITINERARIO DE VIAJE', 400, 30, { align: 'right' });
    doc.fillColor('#94A3B8').fontSize(11).font('Helvetica').text(`Nº IT-${String(itinerary.id).padStart(5, '0')}`, 400, 52, { align: 'right' });
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(`ESTADO: ${itinerary.status === 'confirmed' ? 'CONFIRMADO' : 'BORRADOR'}`, 400, 72, { align: 'right' });

    // Client & Trip Info Box
    let y = 130;
    doc.rect(40, y, 532, 85).fill(lightBg).stroke('#E2E8F0');

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL CLIENTE', 55, y + 12);
    doc.fillColor(textColor).fontSize(10).font('Helvetica');
    doc.text(`Cliente: ${itinerary.client?.fullName || 'N/A'}`, 55, y + 32);
    doc.text(`Documento: ${itinerary.client?.documentNumber || 'N/A'}`, 55, y + 48);
    doc.text(`Correo: ${itinerary.client?.email || 'N/A'}`, 55, y + 64);

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('DETALLES DE RESERVA', 320, y + 12);
    doc.fillColor(textColor).fontSize(10).font('Helvetica');
    doc.text(`Fecha Emisión: ${formatDate(itinerary.createdAt)}`, 320, y + 32);
    doc.text(`Operador Resp.: ${itinerary.operator?.fullName || 'Operador Turístico'}`, 320, y + 48);
    doc.text(`Teléfono: ${itinerary.client?.phone || 'N/A'}`, 320, y + 64);

    // Items Table Header
    y += 105;
    doc.rect(40, y, 532, 24).fill(primaryColor);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    doc.text('ACTIVIDAD / EXPERIENCIA', 50, y + 7);
    doc.text('FECHA Y HORARIO', 260, y + 7);
    doc.text('PAX', 410, y + 7, { width: 30, align: 'center' });
    doc.text('P. UNIT', 450, y + 7, { width: 55, align: 'right' });
    doc.text('SUBTOTAL', 510, y + 7, { width: 55, align: 'right' });

    y += 24;
    doc.font('Helvetica').fontSize(9).fillColor(textColor);

    const items = itinerary.items || [];
    if (items.length === 0) {
      y += 10;
      doc.text('No hay actividades registradas en este itinerario.', 50, y);
      y += 20;
    } else {
      items.forEach((item, index) => {
        const bg = index % 2 === 0 ? '#FFFFFF' : lightBg;
        doc.rect(40, y, 532, 28).fill(bg);

        doc.fillColor(primaryColor).font('Helvetica-Bold').text(item.activity?.name || 'Actividad', 50, y + 8, { width: 200 });
        doc.fillColor(textColor).font('Helvetica').text(
          `${formatDate(item.schedule?.scheduleDate)} (${formatTime(item.schedule?.startTime)} - ${formatTime(item.schedule?.endTime)})`,
          260,
          y + 8,
          { width: 140 }
        );
        doc.text(String(item.quantityPeople || 1), 410, y + 8, { width: 30, align: 'center' });
        doc.text(formatCurrency(item.unitPrice), 450, y + 8, { width: 55, align: 'right' });
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(formatCurrency(item.subtotal), 510, y + 8, { width: 55, align: 'right' });

        y += 28;
      });
    }

    // Observations & Total Box
    y += 15;
    if (itinerary.observations) {
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('OBSERVACIONES / NOTAS:', 40, y);
      y += 14;
      doc.fillColor(textColor).fontSize(9).font('Helvetica').text(itinerary.observations, 40, y, { width: 320 });
    }

    // Total box on the right
    doc.rect(380, y - 10, 192, 45).fill(lightBg).stroke(accentColor);
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('TOTAL A PAGAR:', 395, y + 4);
    doc.fillColor(accentColor).fontSize(16).font('Helvetica-Bold').text(formatCurrency(itinerary.totalAmount), 395, y + 20, { align: 'right', width: 165 });

    // Footer
    const footerY = 730;
    doc.rect(40, footerY, 532, 1).fill('#CBD5E1');
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica');
    doc.text('¡Gracias por elegir Cartagena Tours! Por favor conserve este comprobante durante todo el recorrido.', 40, footerY + 10, { align: 'center' });
    doc.text('Documento generado automáticamente · Estado confirmado sujeto a la presentación del voucher.', 40, footerY + 22, { align: 'center' });

    doc.end();
  });
};

type ItineraryPdfData = {
  id: number;
  status: string;
  observations?: string | null;
  totalAmount?: number | string | null;
  createdAt?: Date | string | null;
  client?: { fullName?: string | null; email?: string | null; phone?: string | null } | null;
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

const escapePdfText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const formatCurrency = (value: number | string | null | undefined) =>
  `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return 'Sin fecha';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-CO');
};

const formatTime = (value: Date | string | null | undefined) => {
  if (!value) return 'Sin horario';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

export const generateItineraryPdf = (itinerary: ItineraryPdfData) => {
  const lines = [
    'AGENCIA CARTAGENA TOURS',
    'Itinerario turístico premium',
    'www.cartagenatours.example',
    '',
    `Número: IT-${itinerary.id}`,
    `Cliente: ${itinerary.client?.fullName || 'Sin cliente'}`,
    `Correo: ${itinerary.client?.email || 'Sin correo'}`,
    `Teléfono: ${itinerary.client?.phone || 'Sin teléfono'}`,
    `Operador: ${itinerary.operator?.fullName || 'Sin operador'}`,
    `Estado: ${itinerary.status === 'confirmed' ? 'Confirmado' : 'Borrador'}`,
    `Creado: ${formatDate(itinerary.createdAt)}`,
    '',
    'Detalle del itinerario',
    'Plan de experiencia personalizado',
    'Incluye transporte, guías locales y acceso preferencial.',
  ];

  if (itinerary.observations) {
    lines.push(`Observaciones: ${itinerary.observations}`);
  }

  lines.push('');

  (itinerary.items || []).forEach((item, index) => {
    lines.push(`${index + 1}. ${item.activity?.name || 'Actividad sin nombre'}`);
    lines.push(`   Fecha: ${formatDate(item.schedule?.scheduleDate)}`);
    lines.push(`   Horario: ${formatTime(item.schedule?.startTime)} - ${formatTime(item.schedule?.endTime)}`);
    lines.push(`   Personas: ${item.quantityPeople || 1}`);
    lines.push(`   Precio unitario: ${formatCurrency(item.unitPrice)}`);
    lines.push(`   Subtotal: ${formatCurrency(item.subtotal)}`);
    lines.push('');
  });

  lines.push(`Total general: ${formatCurrency(itinerary.totalAmount)}`);
  lines.push('');
  lines.push('Este documento fue generado automáticamente desde el módulo de itinerarios.');

  const contentLines = lines.map((line, index) => {
    const y = 760 - index * 12;
    return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  });

  const content = contentLines.join('\n');
  const contentLength = Buffer.byteLength(content, 'utf8');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  const pdfParts: string[] = ['%PDF-1.4'];
  const offsets: number[] = [];
  let pdf = '';

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdfParts.push(pdf);
  pdfParts.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);

  offsets.forEach((offset) => {
    pdfParts.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
  });

  pdfParts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return Buffer.from(pdfParts.join(''), 'binary');
};

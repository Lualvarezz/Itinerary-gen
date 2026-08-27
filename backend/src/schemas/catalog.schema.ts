import { z } from 'zod';

export const createActivitySchema = z.object({
  name: z.string().min(1, 'El nombre de la actividad es requerido'),
  description: z.string().max(2250, 'La descripción / detalles no puede superar los 2250 caracteres').optional().nullable(),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  durationMinutes: z.coerce.number().min(1, 'La duración debe ser al menos de 1 minuto'),
  touristPlaceId: z.coerce.number().int().positive('Lugar turístico inválido'),
  categoryId: z.coerce.number().int().positive('Categoría inválida'),
  imageUrl: z.string().optional().nullable(),
  createdByUserId: z.string().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

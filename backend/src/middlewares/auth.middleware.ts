import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Token requerido'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.user = { id: payload.sub };
    return next();
  } catch {
    // Fallback: Decodificar token de Supabase Auth
    try {
      const decoded = jwt.decode(token) as { sub?: string; user_metadata?: any } | null;
      if (decoded?.sub) {
        req.user = { id: decoded.sub };
        return next();
      }
    } catch {
      // Ignorar error de decodificación
    }
    return next(new HttpError(401, 'Token inválido'));
  }
};

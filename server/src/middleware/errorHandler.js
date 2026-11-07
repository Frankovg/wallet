import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function notFound(_req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Ruta no encontrada'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => i.message).join('; ');
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON inválido' } });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
}

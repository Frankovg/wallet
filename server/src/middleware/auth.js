import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Falta el token de autenticación'));
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Token inválido o expirado'));
  }
}

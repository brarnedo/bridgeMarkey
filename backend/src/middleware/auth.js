import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_FALTANTE', message: 'Falta el token de sesión.' } });
  }

  try {
    req.usuario = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'AUTH_INVALIDA', message: 'La sesión no es válida o expiró.' } });
  }
}

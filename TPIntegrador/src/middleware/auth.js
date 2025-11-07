import jwt from 'jsonwebtoken';
import { ErrorAuth } from '../errores/ErrorApp.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export const generarToken = (payload) => {
  const secreto = process.env.JWT_SECRET || 'secret_dev_change_it';
  return jwt.sign(payload, secreto, { expiresIn: '2h' });
};

export const verificarToken = (req) => {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    const secreto = process.env.JWT_SECRET || 'secret_dev_change_it';
    const decoded = jwt.verify(token, secreto);
    return decoded;
  } catch (err) {
    return null;
  }
};

export const esAdmin = (req, res, next) => {
  const decoded = verificarToken(req);
  if (!decoded) {
    return res.status(401).json({ mensaje: 'Token inválido o ausente' });
  }
  if (decoded.tipo_usuario !== 1) {
    return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol administrador' });
  }
  // Adjuntamos info del usuario al request
  req.usuario = decoded;
  next();
};

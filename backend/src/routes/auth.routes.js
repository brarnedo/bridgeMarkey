import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as userRepository from '../data/userRepository.js';
import * as credentialsRepository from '../data/credentialsRepository.js';
import * as accessRepository from '../data/accessRepository.js';

export const authRouter = Router();

function firmarSesion(usuario) {
  return jwt.sign(
    { sub: usuario.id, email: usuario.email, empresa: usuario.empresa },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

authRouter.post('/registro', async (req, res, next) => {
  try {
    const { email, password, empresa } = req.body;
    if (!email || !password || !empresa) {
      return res.status(400).json({ success: false, error: { code: 'PARAM_INVALIDO', message: 'email, password y empresa son requeridos.' } });
    }

    const existente = await userRepository.buscarPorEmail(email);
    if (existente) {
      return res.status(409).json({ success: false, error: { code: 'USUARIO_EXISTENTE', message: 'Ya existe una cuenta con ese email.' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await userRepository.crearUsuario({ email, passwordHash, empresa });

    // Se genera la key/token de sandbox apenas se registra:
    // es la misma que va a usar en el portal y en su propio desarrollo.
    const credenciales = await credentialsRepository.obtenerOCrearCredenciales(usuario.id);

    // Habilita automáticamente el pool base (ver accessRepository) —
    // las APIs custom NO se tocan acá, se habilitan a mano por usuario.
    await accessRepository.habilitarPoolBase(usuario.id);

    res.json({
      success: true,
      data: { token: firmarSesion(usuario), credenciales },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await userRepository.buscarPorEmail(email);
    console.log(usuario);
    if (!usuario) {
      return res.status(401).json({ success: false, error: { code: 'CREDENCIALES_INVALIDAS', message: 'Email o contraseña incorrectos.' } });
    }

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ success: false, error: { code: 'CREDENCIALES_INVALIDAS', message: 'Email o contraseña incorrectos.' } });
    }

    const credenciales = await credentialsRepository.obtenerOCrearCredenciales(usuario.id);

    res.json({
      success: true,
      data: { token: firmarSesion(usuario), credenciales },
    });
  } catch (err) {
    next(err);
  }
});

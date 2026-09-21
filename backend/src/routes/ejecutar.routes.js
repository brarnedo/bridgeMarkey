import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const ejecutarRouter = Router();

ejecutarRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { endpoint, filtro, apiKey, token, url, aplicacion } = req.body;


    console.log(req.body);
    
    if (!endpoint || !apiKey || !token || !url || !aplicacion) {
      return res.status(400).json({
        success: false,
        error: { code: 'PARAM_INVALIDO', message: 'Faltan datos de conexión (apiKey, token, url o aplicacion).' },
      });
    }

    const respuestaGateway = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token },
      body: JSON.stringify({ aplicacion, apiKey, operacion: endpoint, filtro: filtro || {} }),
    });

    const data = await respuestaGateway.json();
    res.status(respuestaGateway.status).json(data);
  } catch (err) {
    next(err);
  }
});
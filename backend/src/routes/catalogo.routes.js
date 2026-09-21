import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as catalogRepository from '../data/catalogRepository.js';

export const catalogoRouter = Router();

// Requiere sesión porque la visibilidad de categorías/APIs se filtra
// por usuario (ver README > Visibilidad de APIs por cliente). En modo
// "archivo" igual exige el token, aunque ese filtro no aplique — así
// el comportamiento no cambia sorpresivamente al pasar a Supabase.
catalogoRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const catalogo = await catalogRepository.obtenerCatalogo(req.usuario.sub);
    res.json({ success: true, data: catalogo });
  } catch (err) {
    next(err);
  }
});

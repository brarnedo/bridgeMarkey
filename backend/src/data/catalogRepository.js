import { config } from '../config.js';
import * as fileAdapter from './adapters/fileAdapter.js';
import * as supabaseCatalogAdapter from './adapters/supabaseCatalogAdapter.js';

// El resto del proyecto SIEMPRE llama a esta función — nunca a los
// adapters directamente. `usuarioId` habilita el filtro de visibilidad
// por cliente cuando la fuente es Supabase; en modo "archivo" se
// ignora, porque un JSON estático no puede tener bloqueos por usuario
// (ver README > Visibilidad de APIs por cliente).
export async function obtenerCatalogo(usuarioId) {
  if (config.dataSource === 'supabase') {
    return supabaseCatalogAdapter.obtenerCatalogo(usuarioId);
  }
  return fileAdapter.obtenerCatalogo(usuarioId);
}

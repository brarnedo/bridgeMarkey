import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOGO_PATH = path.join(__dirname, '../../../data-files/catalogo.json');

// Fuente de solo lectura: se actualiza subiendo un nuevo catalogo.json
// al repo y haciendo deploy. Pensada como respaldo si no hay Supabase.
// No soporta visibilidad por usuario (recibe usuarioId mismo por
// firma, pero lo ignora) — ver README > Visibilidad de APIs por cliente.
export async function obtenerCatalogo(usuarioId) { // eslint-disable-line no-unused-vars
  const raw = await readFile(CATALOGO_PATH, 'utf-8');
  return JSON.parse(raw);
}

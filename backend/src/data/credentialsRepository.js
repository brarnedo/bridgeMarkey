import crypto from 'node:crypto';
import { getSupabaseClient } from './adapters/supabaseClient.js';
import 'dotenv/config';
import { config } from 'dotenv';

// Tabla esperada: credenciales(cred_codigo, cred_usuario -> usu_codigo,
//                                cred_api_key, cred_token, cred_creado_en)
// Igual que userRepository: requiere escritura persistente, por eso
// siempre Supabase, sin modo archivo.

function normalizar(row) {
  if (!row) return null;
  return {
    apiKey: row.cred_api_key,
    token: row.cred_token,
    aplicacion: row.cred_aplicacion,
    url: row.cred_url,
  };
}


export async function obtenerOCrearCredenciales(usuarioId) {

  const supabase = getSupabaseClient();

  const { data: existentes, error: errBusqueda } = await supabase
    .from('credenciales')
    .select('*')
    .eq('cred_usuario', usuarioId)
    .maybeSingle();
  if (errBusqueda) throw errBusqueda;
  if (existentes) return normalizar(existentes);

 const nuevas = {
  cred_usuario: usuarioId,
  cred_api_key: crypto.randomUUID(),
  cred_token: config.sandboxToken,
  cred_aplicacion: config.sandboxDatabase,
  cred_url: config.gatewayUrl, // valor por defecto de sandbox, no fijo para siempre
};

  const { data, error } = await supabase
    .from('credenciales')
    .insert(nuevas)
    .select()
    .single();
  if (error) throw error;
  return normalizar(data);
}

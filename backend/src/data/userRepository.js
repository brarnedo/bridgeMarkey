import { getSupabaseClient } from './adapters/supabaseClient.js';

// A diferencia del catálogo, esto SIEMPRE usa Supabase — no tiene
// modo "archivo" (ver README para el porqué).
// Tabla esperada: usuarios(usu_codigo, usu_email, usu_password_hash,
//                           usu_empresa, usu_creado_en)
//
// Las funciones devuelven objetos normalizados (camelCase, sin el
// prefijo de tabla) para que el resto del código nunca dependa de
// cómo se llaman las columnas en Supabase.

function normalizar(row) {
  if (!row) return null;
  return {
    id: row.usu_codigo,
    email: row.usu_email,
    passwordHash: row.usu_password_hash,
    empresa: row.usu_empresa,
  };
}

export async function buscarPorEmail(email) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('usu_email', email)
    .maybeSingle();
  if (error) throw error;
  return normalizar(data);
}

export async function crearUsuario({ email, passwordHash, empresa }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ usu_email: email, usu_password_hash: passwordHash, usu_empresa: empresa })
    .select()
    .single();
  if (error) throw error;
  return normalizar(data);
}

import { getSupabaseClient } from './supabaseClient.js';

// Esquema esperado en Supabase (ver README > Modelo de datos):
//   categorias(cat_codigo, cat_clave, cat_label, cat_status, cat_count_planificado)
//   apis(api_codigo, api_clave, api_categoria -> cat_codigo, api_metodo, api_endpoint,
//        api_titulo, api_descripcion, api_descripcion_larga, api_parametros jsonb,
//        api_ejemplo_request jsonb, api_ejemplo_response jsonb, api_errores jsonb,
//        api_origen 'base' | 'custom')
//   usuario_api_acceso(uaa_codigo, uaa_usuario -> usu_codigo, uaa_api -> api_codigo, uaa_habilitada)
//
// Regla única, sin casos especiales: una API se ve SOLO si existe una fila
// en usuario_api_acceso para ese usuario con uaa_habilitada = true. No hay
// "visible por defecto" implícito en ningún lado — el pool base se habilita
// explícitamente al registrarse (ver accessRepository.habilitarPoolBase).
// Las categorías ya no tienen bloqueo propio: son solo una etiqueta para
// agrupar en pantalla.
export async function obtenerCatalogo(usuarioId) {
  const supabase = getSupabaseClient();

  const [
    { data: categorias, error: errCat },
    { data: apis, error: errApis },
    { data: accesos, error: errAcceso },
  ] = await Promise.all([
    supabase.from('categorias').select('*'),
    supabase.from('apis').select('*'),
    supabase.from('usuario_api_acceso').select('uaa_api').eq('uaa_usuario', usuarioId).eq('uaa_habilitada', true),
  ]);

  if (errCat) throw errCat;
  if (errApis) throw errApis;
  if (errAcceso) throw errAcceso;

  const apisHabilitadas = new Set((accesos || []).map((a) => a.uaa_api));
  const claveDeCategoria = new Map(categorias.map((c) => [c.cat_codigo, c.cat_clave]));

  const apisVisibles = apis.filter((a) => apisHabilitadas.has(a.api_codigo));

  return {
    categorias: categorias.map((c) => ({
      key: c.cat_clave,
      label: c.cat_label,
      status: c.cat_status,
      countPlanificado: c.cat_count_planificado,
    })),
    apis: apisVisibles.map((a) => ({
      id: a.api_clave,
      categoria: claveDeCategoria.get(a.api_categoria),
      metodo: a.api_metodo,
      endpoint: a.api_endpoint,
      titulo: a.api_titulo,
      descripcion: a.api_descripcion,
      descripcionLarga: a.api_descripcion_larga,
      parametros: a.api_parametros,
      ejemploRequest: a.api_ejemplo_request,
      ejemploResponse: a.api_ejemplo_response,
      errores: a.api_errores,
    })),
  };
}
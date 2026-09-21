import { getSupabaseClient } from './adapters/supabaseClient.js';

// Único lugar del código donde "el pool base se ve automáticamente" deja
// de ser una regla implícita y pasa a ser un paso explícito: al crear un
// usuario, se le crea una fila de acceso habilitada por cada API marcada
// como 'base'. Las APIs 'custom' nunca se tocan acá — esas se habilitan
// a mano, API por API, para el usuario puntual que corresponda.
export async function habilitarPoolBase(usuarioId) {
  const supabase = getSupabaseClient();

  const { data: apisBase, error: errApis } = await supabase
    .from('apis')
    .select('api_codigo')
    .eq('api_origen', 'base');
  if (errApis) throw errApis;

  if (!apisBase || apisBase.length === 0) return;

  const filas = apisBase.map((a) => ({
    uaa_usuario: usuarioId,
    uaa_api: a.api_codigo,
    uaa_habilitada: true,
  }));

  const { error: errInsert } = await supabase
    .from('usuario_api_acceso')
    .upsert(filas, { onConflict: 'uaa_usuario,uaa_api' });
  if (errInsert) throw errInsert;
}
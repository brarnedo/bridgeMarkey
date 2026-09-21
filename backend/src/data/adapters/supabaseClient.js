import { createClient } from '@supabase/supabase-js';
import { config, assertSupabaseConfigured } from '../../config.js';

let client = null;

// Instancia única y perezosa: no se conecta hasta que alguien la pide,
// así el modo "archivo" puede correr sin tener Supabase configurado.
export function getSupabaseClient() {
  if (!client) {
    assertSupabaseConfigured();
    client = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }
  return client;
}

import 'dotenv/config';

export const config = {

  port: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // "supabase" | "archivo" — controla SOLO la fuente del catálogo.
  // Usuarios y credenciales siempre usan Supabase (ver README).
  dataSource: process.env.DATA_SOURCE || 'archivosss',

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-cambiar',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  gatewayUrl: process.env.GATEWAY_URL,

  sandboxToken: process.env.SANDBOX_TOKEN,
ambiente: process.env.AMBIENTE,


};

export function assertSupabaseConfigured() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error(
      'Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY en el .env. ' +
      'Usuarios y credenciales requieren Supabase incluso si DATA_SOURCE=archivo.'
    );
  }
}

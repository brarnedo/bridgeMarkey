# Markey Connect — Scaffold inicial

Portal de developers para que empresas de chatbot integren turnos de Markey.
Este scaffold arma el **esqueleto funcional**: auth, catálogo con switch de
fuente de datos, y el proxy de pruebas. La lógica de negocio de los stored
procedures (y su conexión final a cada base real) queda para la etapa
correspondiente del plan.

## Estructura

```
markey-connect/
  backend/            Node/Express
    src/
      routes/          auth, catalogo, ejecutar
      middleware/       auth.js (valida JWT de sesión)
      data/            repositorios + adapters (el switch vive acá)
    data-files/
      catalogo.json     catálogo de ejemplo (modo "archivo")
  frontend/           React + Vite
    src/
      pages/            Login, Catalogo, ApiDetail
      components/       Topbar, CredencialesPanel, TesterPanel
      api/client.js      cliente HTTP hacia el backend
```

## Cómo correrlo local

```bash
# Backend
cd backend
cp .env.example .env      # completar según corresponda
npm install
npm run dev                # http://localhost:4000

# Frontend (en otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Con `DATA_SOURCE=archivo` en el `.env` del backend, el catálogo funciona
sin Supabase. **Registro y login sí necesitan Supabase configurado** (ver
la sección siguiente) — no hay forma de evitarlo, es una limitación real
del entorno, no una simplificación del scaffold.

## Por qué usuarios/credenciales no tienen modo "archivo"

El catálogo puede vivir en un JSON versionado porque es de **solo
lectura en tiempo de ejecución** — se actualiza haciendo commit + deploy.
Registrar un usuario nuevo, en cambio, es una **escritura en tiempo de
ejecución**, y el sistema de archivos de las funciones serverless de
Vercel es efímero: no persiste entre invocaciones ni sobrevive a un
redeploy. Por eso `userRepository.js` y `credentialsRepository.js`
siempre usan Supabase, sin excepción. Si en algún momento no se paga la
suscripción, lo que se pierde es el **alta de nuevas empresas** — el
catálogo para las que ya están integradas sigue funcionando igual con
el archivo.

## Modelo de datos esperado en Supabase

Cada tabla tiene su propio código como PK (en vez de un `id` genérico),
con el prefijo de la tabla — mismo criterio que ya usan en Markey
(`paciCodigo`, `turnCodigo`, etc.). Usé `snake_case` en vez de
`camelCase` a propósito: Postgres pliega a minúsculas los identificadores
sin comillas, así que un nombre tipo `usuCodigo` obligaría a poner
comillas dobles en cada query manual que corran en el SQL Editor de
Supabase. Si prefieren mantener la paridad visual exacta con Markey
igual se puede, pero con esa fricción extra — avisen si lo prefieren así.

```sql
create table usuarios (
  usu_codigo uuid primary key default gen_random_uuid(),
  usu_email text unique not null,
  usu_password_hash text not null,
  usu_empresa text not null,
  usu_creado_en timestamptz default now()
);

create table credenciales (
  cred_codigo uuid primary key default gen_random_uuid(),
  cred_usuario uuid references usuarios(usu_codigo) unique not null,
  cred_api_key text unique not null,
  cred_token text not null,
  cred_creado_en timestamptz default now()
);

create table categorias (
  cat_codigo serial primary key,
  cat_clave text unique not null,        -- slug legible: 'turnos', 'pacientes'
  cat_label text not null,
  cat_status text not null,              -- 'live' | 'soon'
  cat_count_planificado int
);

create table apis (
  api_codigo serial primary key,
  api_clave text unique not null,        -- slug legible: 'disponibilidad'
  api_categoria int references categorias(cat_codigo) not null,
  api_metodo text not null,              -- 'GET' | 'POST'
  api_endpoint text not null,            -- nombre del stored procedure
  api_titulo text not null,
  api_descripcion text not null,
  api_descripcion_larga text not null,
  api_parametros jsonb not null,
  api_ejemplo_request jsonb not null,
  api_ejemplo_response jsonb not null,
  api_errores jsonb not null
);

-- Visibilidad de APIs por cliente (ver sección siguiente)
create table usuario_categoria_bloqueo (
  ucb_codigo serial primary key,
  ucb_usuario uuid references usuarios(usu_codigo) not null,
  ucb_categoria int references categorias(cat_codigo) not null,
  unique (ucb_usuario, ucb_categoria)
);

create table usuario_api_bloqueo (
  uab_codigo serial primary key,
  uab_usuario uuid references usuarios(usu_codigo) not null,
  uab_api int references apis(api_codigo) not null,
  unique (uab_usuario, uab_api)
);
```

`backend/src/data/adapters/supabaseCatalogAdapter.js` ya está escrito
contra este esquema — activarlo es solo crear las tablas, cargar los
datos y poner `DATA_SOURCE=supabase`. El adapter traduce los códigos
internos (`cat_codigo`, `api_codigo`) a los slugs legibles (`key`, `id`)
antes de devolver el catálogo, así que **el contrato que consume el
frontend no cambia** sea cual sea la fuente de datos.

## Visibilidad de APIs por cliente

Modelo **"todo visible por defecto, con bloqueos puntuales"** — no hace
falta dar de alta permisos para cada cliente nuevo, solo para las
excepciones:

- Bloquear una fila en `usuario_categoria_bloqueo` oculta **toda** esa
  categoría para ese usuario (todas sus APIs, aunque no estén bloqueadas
  individualmente).
- Bloquear una fila en `usuario_api_bloqueo` oculta **solo** esa API
  puntual, aunque su categoría siga visible.

`obtenerCatalogo(usuarioId)` en el adapter de Supabase resuelve ambas
tablas y filtra antes de devolver la respuesta — el frontend nunca ve
las APIs bloqueadas, ni siquiera en la lista.

**Por qué esto no tiene modo "archivo":** los bloqueos son por usuario,
y los usuarios solo existen en Supabase (ver sección anterior). Un
`catalogo.json` estático no puede representar "el cliente X no ve la
categoría Y" sin convertirse en un archivo por cliente — así que, igual
que el registro/login, esta función depende de que Supabase esté activo.
En modo "archivo" el catálogo se sirve completo, sin distinción por
usuario (degradación aceptable: es el mismo escenario en el que tampoco
hay altas de cuentas nuevas).

## El switch de fuente de datos, en una frase

Todo el resto del código llama siempre a `catalogRepository.obtenerCatalogo()`
— nunca a un adapter directamente. Cambiar de Supabase a archivo (o al
revés) es cambiar una variable de entorno, no tocar código.

## Pendiente para las próximas etapas del plan

- Conectar `appObtenerDisponibilidad`, `appReservarTurno`, `appCancelarTurno`
  y `appReprogramarTurno` reales una vez definidos (paso 2 del plan).
- Confirmar si el gateway acepta llamadas desde el dominio del portal sin
  problema de CORS (hoy el backend ya actúa de proxy para evitar el tema,
  pero conviene validarlo en el ambiente real).
- Herramienta local de carga de catálogo a Supabase + script de
  exportación a `catalogo.json` (paso 5 del plan).
- Reemplazar el ícono de texto (▦ / ☰) del toggle de vista por los SVG
  ya usados en la maqueta, si se quiere el detalle visual exacto.

# Publicar Motordata con Supabase y Vercel

Esta guía está escrita para dejar el proyecto conectado a una base de datos real
en Supabase y publicado en Vercel.

## 1. Crear el proyecto en Supabase

1. Entrá a https://supabase.com.
2. Creá una cuenta o iniciá sesión.
3. Tocá **New project**.
4. Elegí una organización.
5. Poné un nombre, por ejemplo `motordata`.
6. Elegí una contraseña segura para la base de datos.
7. Elegí una región cercana.
8. Esperá a que Supabase termine de crear el proyecto.

## 2. Crear la tabla de vehículos

1. En Supabase, entrá a tu proyecto.
2. En el menú izquierdo, abrí **SQL Editor**.
3. Tocá **New query**.
4. Copiá el contenido del archivo `supabase/schema.sql`.
5. Pegalo en Supabase.
6. Tocá **Run**.

Eso crea la tabla `listings`, que guarda las publicaciones de vehículos.

## 3. Conseguir las claves de Supabase

En Supabase:

1. Andá a **Project Settings**.
2. Entrá en **API**.
3. Copiá estos datos:
   - **Project URL**
   - **anon public key** o **publishable key**
   - **service_role key**

Importante: la `service_role key` es secreta. No se muestra en el navegador y no
hay que compartirla.

## 4. Crear `.env.local`

En la raíz del proyecto, creá un archivo llamado `.env.local`.

Usá este formato:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=PEGAR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGAR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=PEGAR_SERVICE_ROLE_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ELEGIR_UNA_CONTRASEÑA_SEGURA

MERCADO_PAGO_ACCESS_TOKEN=
```

Después reiniciá el servidor:

```bash
npm run dev
```

## 5. Probar localmente

1. Entrá a `http://localhost:3000/publicar`.
2. Cargá un vehículo de prueba.
3. Entrá a Supabase.
4. Abrí **Table Editor**.
5. Revisá la tabla `listings`.

Si aparece el vehículo, Supabase ya está conectado.

## 6. Subir el proyecto a GitHub

Vercel trabaja muy cómodo desde GitHub.

1. Creá un repositorio en GitHub.
2. Subí el proyecto.
3. No subas `.env.local`, porque tiene claves secretas.

El archivo `.gitignore` ya evita subir `.env.local`.

## 7. Crear el proyecto en Vercel

1. Entrá a https://vercel.com.
2. Iniciá sesión.
3. Tocá **Add New Project**.
4. Importá el repositorio de GitHub.
5. Vercel va a detectar Next.js automáticamente.
6. Antes de desplegar, agregá las variables de entorno.

## 8. Variables de entorno en Vercel

En Vercel, dentro del proyecto:

1. Entrá a **Settings**.
2. Entrá a **Environment Variables**.
3. Agregá estas variables:

```env
NEXT_PUBLIC_SITE_URL=https://TU-DOMINIO-O-URL-DE-VERCEL
NEXT_PUBLIC_SUPABASE_URL=PEGAR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGAR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=PEGAR_SERVICE_ROLE_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ELEGIR_UNA_CONTRASEÑA_SEGURA
MERCADO_PAGO_ACCESS_TOKEN=
```

Si todavía no usás Mercado Pago, dejá `MERCADO_PAGO_ACCESS_TOKEN` vacío o no lo
agregues.

## 9. Hacer deploy

1. Volvé a la pantalla principal del proyecto en Vercel.
2. Tocá **Deploy**.
3. Esperá a que termine.
4. Abrí la URL que te da Vercel.

## 10. Probar en producción

En la web publicada:

1. Entrá a `/publicar`.
2. Cargá un vehículo de prueba.
3. Mirá Supabase, tabla `listings`.
4. Entrá a `/admin/autos`.
5. El navegador te va a pedir usuario y contraseña.
6. Usá los datos de `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
7. Aprobá el vehículo.
8. Volvé a la home y buscá vehículos.

## Qué quedó preparado en el código

- `supabase/schema.sql`: crea la tabla necesaria.
- `lib/supabaseAdmin.ts`: conecta el servidor Next con Supabase.
- `app/api/listings`: API para listar y guardar publicaciones.
- `app/api/listings/[id]`: API para editar o borrar publicaciones.
- `app/api/public/listings`: API pública que solo devuelve publicaciones aprobadas.
- `proxy.ts`: protege `/admin` y las operaciones privadas de `/api/listings`.
- `.env.example`: muestra qué variables hay que configurar.

## Nota importante para principiantes

El proyecto todavía mantiene `localStorage` como respaldo para desarrollo.
Eso significa:

- Si no configurás Supabase, la app sigue funcionando en tu navegador.
- Si configurás Supabase, las publicaciones nuevas se guardan también en la base
  de datos.

Cuando Supabase esté probado, se puede dar el siguiente paso: quitar el modo
local y dejar todo 100% en base de datos.

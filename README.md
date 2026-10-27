# CoSpace

CoSpace es una aplicación web para explorar espacios de trabajo y gestionar reservas. El repositorio incluye páginas públicas de espacios, registro e inicio de sesión, páginas privadas para reservas y un área administrativa para gestionar espacios.

Esta documentación describe solo lo que está presente en el código actual. Hay algunas diferencias entre rutas y configuraciones que se señalan en las secciones correspondientes y que conviene verificar antes de desplegar.

## Funcionalidades implementadas

- Página de inicio y catálogo público de espacios activos, con vista de detalle.
- Registro de usuarios con validación de datos y almacenamiento de contraseñas mediante hash.
- Inicio y cierre de sesión con cookies `HttpOnly`, tokens JWT de acceso y renovación.
- Consulta de la sesión actual mediante la API.
- Creación de espacios por administradores y edición de sus datos y estado activo.
- Creación, consulta y cancelación de reservas:
  - Una reserva debe durar entre 1 y 4 horas completas y realizarse dentro de los próximos 30 días.
  - El horario se valida en la zona `America/Bogota`, entre las 07:00 y las 21:00, en horas completas y dentro del mismo día.
  - El servidor limita a tres las reservas futuras confirmadas por usuario y evita solapamientos del espacio o del usuario.
  - El precio total se calcula en el servidor a partir del precio por hora.
  - El propietario puede cancelar con al menos dos horas de anticipación; un administrador puede cancelar sin ese límite.
- Los espacios con reservas confirmadas futuras no se pueden desactivar.

Las reglas de reserva y los permisos anteriores están aplicados en los handlers de la API. Las páginas incluidas en el repositorio no implican que existan otras operaciones no enumeradas aquí.

## Tecnologías y herramientas

Versiones declaradas en `package.json`:

- Next.js `16.4.3`
- React y React DOM `19.3.0`
- Prisma CLI y cliente `^6.19.3`
- TypeScript `^5`
- Tailwind CSS `^4` y `@tailwindcss/turbopack` `^4`
- Zod `^4.6.7`
- `jose` `^6.2.13`
- `bcryptjs` `^3.0.3`
- ESLint `^9` con configuración de Next.js `16.4.3`

La aplicación usa App Router, PostgreSQL mediante Prisma y componentes React. `next.config.ts` habilita React Compiler, Cache Components y partial prefetching, y configura el loader de Tailwind para Turbopack.

El proyecto no declara una versión mínima o recomendada de Node.js en `package.json`; utiliza una versión compatible con Next.js 16 y npm.

## Requisitos previos

- Node.js y npm compatibles con las dependencias del proyecto.
- Una base de datos PostgreSQL accesible desde la aplicación.
- Las variables de entorno requeridas, descritas abajo.

## Instalación y configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` local. Puedes partir de `.env.example`, reemplazando los valores de ejemplo por valores propios y manteniéndolos fuera del control de versiones.

3. Configura la conexión PostgreSQL y los secretos JWT. En la sección [Variables de entorno](#variables-de-entorno) se detallan los nombres leídos por el código.

4. Genera el cliente de Prisma:

   ```bash
   npx prisma generate
   ```

5. Asegúrate de que la base de datos tenga el esquema correspondiente antes de utilizar las funciones que acceden a ella. El repositorio contiene una migración inicial, pero `package.json` no define scripts de migración ni de seed. No se aplica ninguna migración automáticamente mediante los scripts documentados aquí.

6. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La configuración de Next.js usa el puerto predeterminado de Next.js (normalmente `http://localhost:3000`).

## Variables de entorno

El código y `.env.example` contienen las siguientes variables relevantes:

| Variable | Uso verificado |
|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL usada por Prisma. |
| `JWT_ACCESS_SECRET` | Secreto para firmar y verificar los tokens JWT de acceso. |
| `JWT_REFRESH_SECRET` | Secreto para firmar y verificar los tokens JWT de renovación. |
| `NEXT_PUBLIC_APP_URL` | URL base usada por la página de detalle de un espacio para solicitar datos a la API durante la renderización del servidor. Si no está definida, el código usa `http://localhost:3000`. |

No se deben incluir valores privados en este archivo ni en el repositorio. Los secretos JWT deben definirse antes de usar las rutas de autenticación; la biblioteca de autenticación lanza un error si faltan.

`.env.example` también declara `ACCESS_TOKEN_EXPIRES_IN` y `REFRESH_TOKEN_EXPIRES_IN`, pero el código actual no las consulta: la duración está fijada en el código en 15 minutos para el token de acceso y 7 días para el de renovación. Verifica si esas variables de ejemplo deben conservarse o si se pretende que sean configurables.

## Base de datos y Prisma

- El proveedor de base de datos configurado en `prisma/schema.prisma` es PostgreSQL.
- Prisma lee la conexión desde `DATABASE_URL`; `prisma.config.ts` apunta a `prisma/schema.prisma` y a `prisma/migrations`.
- El cliente se genera en `src/generated/prisma` mediante el generador configurado en el esquema.
- Los modelos presentes son `Role`, `User`, `Space`, `Reservation` y `RefreshToken`.
- Los enums definidos son `NameRole` (`USER`, `ADMIN`), `SpaceType` (`DESK`, `MEETING_ROOM`, `PHONE_BOOTH`) y `ReservationStatus` (`CONFIRMED`, `CANCELLED`).
- Hay una migración inicial en `prisma/migrations/20261027120728_init/`.
- `prisma/seed.ts` crea o actualiza los roles `USER` y `ADMIN`. El seed no tiene un comando configurado en `package.json`; además, el registro requiere que exista el rol `USER`.

No se ejecutaron migraciones ni seeds al preparar esta documentación. Antes de usar una base de datos, confirma el estado del esquema y decide explícitamente cómo aplicar la migración y el seed disponibles.

## Comandos disponibles

Los siguientes scripts están definidos en `package.json`:

| Comando | Propósito |
|---|---|
| `npm run dev` | Inicia Next.js en modo desarrollo. |
| `npm run build` | Compila la aplicación para producción. |
| `npm start` | Inicia el servidor de producción de Next.js; se utiliza después de compilar. |
| `npm run lint` | Ejecuta ESLint. |

`npx prisma generate` usa la dependencia Prisma y la configuración del proyecto para generar el cliente. No hay scripts de `test`, migración o seed declarados en `package.json`.

## Estructura principal

```text
prisma/
  migrations/       Migración inicial
  schema.prisma     Modelos, enums y configuración del cliente
  seed.ts           Creación de los roles USER y ADMIN
src/
  app/
    (admin)/        Páginas del área administrativa
    (auth)/         Páginas de registro e inicio de sesión
    (private)/      Páginas privadas de cuenta y reservas
    (public)/       Catálogo y detalle público de espacios
    api/            Route handlers de la API
  components/       Componentes compartidos de interfaz
  lib/              Autenticación, sesión e instancia de Prisma
  proxy.ts          Protección de rutas de página
next.config.ts      Configuración de Next.js
prisma.config.ts    Configuración de Prisma CLI
```

También existe un `proxy.ts` en la raíz, además de `src/proxy.ts`; sus diferencias se describen en [Autenticación y protección de rutas](#autenticación-roles-y-protección-de-rutas).

## API

Las rutas siguientes corresponden a handlers presentes en `src/app/api`. Las rutas protegidas validan la cookie de acceso en el servidor; las rutas administrativas requieren además el rol `ADMIN`.

| Método | Endpoint | Propósito y acceso |
|---|---|---|
| `POST` | `/api/auth/register` | Registro público. Asigna el rol `USER`; requiere que ese rol exista en la base de datos. |
| `POST` | `/api/auth/login` | Inicio de sesión público. Valida credenciales y establece cookies de acceso y renovación. |
| `POST` | `/api/auth/refresh` | Renueva la sesión usando la cookie `refreshToken`; no requiere un access token válido. |
| `POST` | `/api/auth/logout` | Cierra la sesión, intenta revocar el token de renovación y elimina las cookies. |
| `GET` | `/api/me` | Devuelve el usuario de la sesión autenticada. Requiere cookie `accessToken`. |
| `GET` | `/api/spaces` | Lista espacios activos; público. |
| `POST` | `/api/spaces` | Crea un espacio; requiere sesión y rol `ADMIN`. |
| `GET` | `/api/spaces/[id]` | Consulta un espacio activo por ID; público. |
| `PATCH` | `/api/spaces/[id]` | Actualiza datos o estado de un espacio; requiere sesión y rol `ADMIN`. |
| `GET` | `/api/reservations` | Consulta reservas; requiere sesión. `ADMIN` puede consultar todas y `USER` solo las propias. |
| `POST` | `/api/reservations` | Crea una reserva para el usuario autenticado; requiere sesión. |
| `PATCH` | `/api/reservations/[id]` | Cancela una reserva confirmada; requiere que la sesión pertenezca al propietario o tenga rol `ADMIN`. |

No se encontró un handler `GET` en `/api/auth/me` ni un handler para consultar una reserva individual. El componente de navegación solicita `/api/auth/me`, mientras que el handler de sesión está definido en `/api/me`; por tanto, ese punto de integración debe verificarse. No se documentan métodos HTTP para los que no exista handler.

## Autenticación, roles y protección de rutas

- Los roles definidos son `USER` y `ADMIN`.
- La autenticación usa JWT con algoritmo `HS256`. El login almacena los tokens en cookies `HttpOnly`, `SameSite=Lax` y con `Secure` cuando `NODE_ENV` es `production`.
- El token de acceso tiene una vigencia fijada en 15 minutos; el refresh token, en 7 días. La renovación rota el refresh token y almacena su hash en la base de datos.
- La lógica de sesión de la API verifica el access token. Las operaciones administrativas comprueban además el rol `ADMIN`; las reservas se limitan según el propietario o el rol.
- Hay dos implementaciones de proxy: `src/proxy.ts` protege `/dashboard` y `/admin`, mientras que el `proxy.ts` de la raíz también contempla rutas `/reservations`. Sus comportamientos ante secretos ausentes y cookies difieren. El repositorio contiene ambas, así que debe confirmarse cuál es la implementación prevista para Next.js en esta estructura antes de depender de la protección a nivel de página. Las comprobaciones de permisos de los handlers de API son independientes.

## Desarrollo y producción

Desarrollo:

```bash
npm run dev
```

Compilación y ejecución de producción:

```bash
npm run build
npm start
```

Configura las variables de entorno en el entorno de ejecución y confirma que PostgreSQL y el esquema Prisma estén disponibles. No hay un proceso de migración o seed integrado en estos comandos.

## Despliegue en Vercel

El proyecto usa Next.js y contiene los archivos de configuración de Next.js y Prisma. No se encontró un `vercel.json` ni una configuración específica de despliegue. Para un despliegue, será necesario proporcionar de forma segura las variables requeridas y una base de datos PostgreSQL accesible desde el entorno. Configura `NEXT_PUBLIC_APP_URL` con la URL pública correspondiente para que la página de detalle no use su fallback local. El flujo de migraciones y seed debe resolverse explícitamente; no está definido por scripts del proyecto.

No se afirma que el despliegue o la compilación en Vercel hayan sido probados.

## Consideraciones y puntos por verificar

- **Endpoint de sesión en la navegación:** el componente de navegación pide `/api/auth/me`, pero el handler existente está en `/api/me`.
- **Protección de páginas:** coexisten `src/proxy.ts` y `proxy.ts` en la raíz, con matchers y comportamiento distintos.
- **Variables de expiración:** `ACCESS_TOKEN_EXPIRES_IN` y `REFRESH_TOKEN_EXPIRES_IN` figuran en `.env.example`, pero el código usa duraciones fijas.
- **Preparación de base de datos:** existe un seed para los roles, pero no hay script configurado para ejecutarlo; el registro no puede asignar `USER` hasta que el rol exista.
- **Rutas enlazadas desde la interfaz:** hay referencias de navegación a páginas administrativas de reservas que no aparecen como páginas bajo `src/app`; su disponibilidad debe confirmarse antes de presentarlas como funcionalidad de interfaz.

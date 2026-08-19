# Project Context — Generador de Itinerarios Turísticos Personalizados

## 1. Visión general del proyecto

Este proyecto es un MVP para agencias de turismo en Cartagena, Colombia. La solución está pensada para ser usada exclusivamente por operadores turísticos que registran clientes, crean itinerarios, seleccionan actividades y generan un PDF profesional del viaje.

El objetivo principal del MVP es reducir el tiempo que tarda un operador en construir un itinerario turístico y entregarlo de forma organizada.

## 2. Alcance del MVP

El MVP incluye:
- autenticación de usuarios con roles
- gestión de clientes
- gestión de categorías, lugares turísticos y actividades
- gestión de horarios
- creación de itinerarios con detalle de actividades
- generación de PDFs del itinerario
- interfaz web moderna para operadores y administradores

No está pensado para uso directo por turistas.

## 3. Stack tecnológico elegido

### Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- React Router
- React Hook Form
- TanStack Query
- Axios
- React Hot Toast
- Heroicons

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT
- Bcrypt
- Zod

### Base de datos
- Supabase PostgreSQL

### Control de versiones
- Git

## 4. Arquitectura propuesta

### Backend
Se implementó una estructura basada en principios de Clean Architecture y separación de responsabilidades.

Capas principales:
- routes: definición de endpoints HTTP
- controllers: recepción de peticiones y respuesta HTTP
- services: lógica de negocio
- repositories: acceso a datos
- middlewares: autenticación y manejo de errores
- schemas: validaciones con Zod
- utils: utilidades compartidas
- lib: conexión a Prisma y recursos compartidos

### Frontend
Se implementó una estructura simple y escalable con:
- pages: pantallas de la aplicación
- components: componentes reutilizables
- lib: cliente HTTP y utilidades compartidas

## 5. Estructura del repositorio

### Raíz del proyecto
- [prompt.txt](prompt.txt): prompt original de negocio y requisitos
- [supabase_schema.sql](supabase_schema.sql): script SQL inicial con la propuesta de base de datos
- [README.md](README.md): documentación inicial del proyecto
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): este archivo, con contexto técnico y funcional

### Backend
Ubicación: [backend](backend)

Archivos principales:
- [backend/package.json](backend/package.json): dependencias y scripts
- [backend/tsconfig.json](backend/tsconfig.json): configuración de TypeScript
- [backend/.env](backend/.env): variables de entorno locales
- [backend/.env.example](backend/.env.example): ejemplo de variables de entorno
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma): modelo Prisma inicial
- [backend/prisma/seed.ts](backend/prisma/seed.ts): seed inicial para datos base
- [backend/src/app.ts](backend/src/app.ts): configuración principal de Express
- [backend/src/server.ts](backend/src/server.ts): punto de entrada del servidor
- [backend/src/config/env.ts](backend/src/config/env.ts): lectura de variables de entorno
- [backend/src/lib/prisma.ts](backend/src/lib/prisma.ts): cliente Prisma singleton
- [backend/src/middlewares/auth.middleware.ts](backend/src/middlewares/auth.middleware.ts): autenticación JWT
- [backend/src/middleware/errorHandler.ts](backend/src/middleware/errorHandler.ts): manejo centralizado de errores
- [backend/src/utils/httpError.ts](backend/src/utils/httpError.ts): error HTTP personalizado
- [backend/src/schemas/auth.schema.ts](backend/src/schemas/auth.schema.ts): validaciones para auth
- [backend/src/routes/auth.routes.ts](backend/src/routes/auth.routes.ts): rutas de login y registro
- [backend/src/routes/health.routes.ts](backend/src/routes/health.routes.ts): endpoint de salud
- [backend/src/routes/v1/clients.routes.ts](backend/src/routes/v1/clients.routes.ts): CRUD de clientes
- [backend/src/routes/v1/catalog.routes.ts](backend/src/routes/v1/catalog.routes.ts): catálogo de categorías, lugares y actividades
- [backend/src/routes/v1/itineraries.routes.ts](backend/src/routes/v1/itineraries.routes.ts): horarios y itinerarios

### Frontend
Ubicación: [frontend](frontend)

Archivos principales:
- [frontend/package.json](frontend/package.json): dependencias y scripts
- [frontend/vite.config.ts](frontend/vite.config.ts): configuración de Vite
- [frontend/src/App.tsx](frontend/src/App.tsx): enrutamiento principal
- [frontend/src/main.tsx](frontend/src/main.tsx): punto de entrada de React
- [frontend/src/styles.css](frontend/src/styles.css): estilos base con Tailwind
- [frontend/src/lib/api.ts](frontend/src/lib/api.ts): cliente Axios para el backend
- [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx): pantalla de login
- [frontend/src/pages/DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx): dashboard inicial
- [frontend/src/pages/ClientsPage.tsx](frontend/src/pages/ClientsPage.tsx): gestión de clientes
- [frontend/src/pages/ItinerariesPage.tsx](frontend/src/pages/ItinerariesPage.tsx): gestión de itinerarios

## 6. Estado actual del desarrollo

### Backend
Se implementaron las siguientes capacidades base:
- estructura inicial de Express con TypeScript
- configuración de variables de entorno
- cliente Prisma preparado para Supabase
- autenticación JWT básica con middleware
- endpoint de health
- auth routes para login/registro
- CRUD inicial de clientes
- módulos de catálogo: categorías, lugares turísticos y actividades
- módulos de itinerarios y horarios

### Frontend
Se implementaron las siguientes capacidades base:
- estructura inicial de React + Vite + TypeScript
- Tailwind configurado
- enrutamiento base con React Router
- páginas de login, dashboard, clientes e itinerarios
- cliente Axios para consumir el backend

## 7. Modelo de datos base

El modelo de datos está inspirado en el esquema SQL original y busca cubrir:
- usuarios
- clientes
- categorías
- lugares turísticos
- actividades
- horarios
- itinerarios
- detalle de itinerarios

### Entidades principales
- User
- AgencyProfile
- Category
- TouristPlace
- Activity
- Client
- Schedule
- Itinerary
- ItineraryItem

## 8. Reglas de negocio contempladas hasta ahora

Se han tenido en cuenta, al menos en la estructura inicial, las siguientes reglas de negocio:
- los itinerarios deben estar asociados a un cliente
- los usuarios pueden autenticarse con JWT
- los endpoints protegidos requieren token válido
- los clientes se gestionan con un flujo CRUD base
- las actividades dependen de categoría y lugar turístico
- los horarios y los itinerarios forman el flujo principal del operador

## 9. Decisiones de implementación importantes

### Backend
- Se prefirió una estructura modular para facilitar escalabilidad.
- Se separó la lógica de negocio en services para evitar acoplar el controlador con el acceso a datos.
- Se utilizará Prisma como capa de acceso a datos para mantener el esquema tipado.
- Se utilizará JWT para autenticación y middleware para proteger rutas.
- Se usarán validaciones con Zod para entrada de datos.

### Frontend
- Se prefirió una arquitectura simple de páginas + componentes para el MVP.
- Se centralizó el consumo HTTP con Axios para evitar duplicación.
- Se usó React Router para navegación básica entre pantallas clave.
- Se usó Tailwind para mantener un diseño limpio y moderno.

## 10. Estado de integración con Supabase

Se preparó la conexión de la app con Supabase mediante:
- variables de entorno en [backend/.env](backend/.env)
- esquema Prisma en [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- cliente Prisma en [backend/src/lib/prisma.ts](backend/src/lib/prisma.ts)

La integración aún debe completarse con migraciones reales y verificación contra la base de datos en Supabase.

## 11. Próximos pasos recomendados

1. Completar migraciones Prisma contra Supabase.
2. Validar que los modelos realmente se creen en la base de datos.
3. Probar los endpoints con herramientas como Postman o Insomnia.
4. Implementar autenticación completa con login real y almacenamiento de JWT en frontend.
5. Crear pantallas CRUD más completas para categorías, lugares turísticos y actividades.
6. Implementar generación de PDFs.
7. Agregar navegación lateral, layout principal y protección de rutas en el frontend.
8. Mejorar los formularios con React Hook Form y feedback con React Hot Toast.

## 12. Notas para futuros agentes

- El proyecto sigue una evolución incremental. No se debe asumir que todo está listo para producción.
- La base de la arquitectura ya está diseñada y es lo suficientemente limpia como para seguir agregando módulos.
- La prioridad actual es consolidar la conexión con Supabase, validar las migraciones y completar el flujo de negocio del operador.
- Si se retoma el proyecto en otra sesión, el punto de entrada recomendado es:
  - backend: [backend/src/app.ts](backend/src/app.ts)
  - frontend: [frontend/src/App.tsx](frontend/src/App.tsx)
  - esquema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

## 13. Resumen ejecutivo

Este proyecto ya tiene una base sólida para un MVP funcional: backend modular, frontend inicial, estructura de datos preparada y rutas principales definidas. El siguiente paso natural es terminar la integración con Supabase y convertir la aplicación en un flujo operativo completo para operadores turísticos.

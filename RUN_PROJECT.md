# Cómo ejecutar el proyecto localmente

## 1. Backend

Abre una terminal en la carpeta backend:

```powershell
cd backend
npm install
npm run dev
```

El backend quedará disponible en:
- http://localhost:4000/health
- http://localhost:4000/api/health

## 2. Frontend

Abre otra terminal en la carpeta frontend:

```powershell
cd frontend
npm install
npm run dev
```

El frontend quedará disponible en:
- http://localhost:5173

## 3. Variables de entorno

El backend ya trae un archivo .env con valores base para la conexión. Si necesitas ajustar la conexión a Supabase, edita:

- backend/.env

## 4. Probar el flujo

1. Abre la URL del frontend en el navegador.
2. Ve a /login.
3. Usa la pantalla de clientes para crear registros.
4. Usa la pantalla de actividades para ver el catálogo.
5. Usa la pantalla de itinerarios para revisar los itinerarios creados.

## 5. Notas importantes

- El backend aún está en fase de desarrollo, por lo que algunas operaciones pueden requerir la base de datos real de Supabase para funcionar completamente.
- Si la conexión a Prisma falla, revisa las credenciales en backend/.env.

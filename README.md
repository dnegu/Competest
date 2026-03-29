# Competest - Plataforma de Evaluación

Competest es una aplicación moderna de evaluación y pruebas construida con **Next.js**, **Supabase** y **Tailwind CSS**.

## 🚀 Tecnologías Principales

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Base de Datos y Autenticación:** [Supabase](https://supabase.com/)
- **Gestión de Estado:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Componentes UI:** [Shadcn UI](https://ui.shadcn.com/) & [Base UI](https://base-ui.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en **features** dentro de `src/`:

- `src/app/`: Rutas, layouts y páginas (Next.js App Router).
- `src/features/`: Lógica de negocio dividida por módulos:
  - `auth`: Gestión de sesiones y usuarios.
  - `test-engine`: Motor de ejecución de pruebas y lógica de evaluación.
  - `test-module`: Definición y componentes de módulos de test.
- `src/components/`: Componentes UI genéricos y compartidos.
- `src/lib/`: Utilidades y configuraciones de clientes.
- `src/providers/`: Proveedores de contexto (React Query, Auth, etc.).
- `supabase/`: Migraciones y configuración de base de datos.

## 🛠️ Configuración Local

### 1. Requisitos previos
- Node.js 20+ (Recomendado)
- Instancia de Supabase activa.

### 2. Instalación
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz con las siguientes variables:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Ejecución
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera el build optimizado para producción.
- `npm run start`: Inicia el servidor en modo producción.
- `npm run lint`: Ejecuta el análisis de código estático (ESLint).

## 🔒 Notas de Desarrollo
- El archivo `.idea/` ha sido añadido al `.gitignore` para evitar conflictos entre entornos de desarrollo.
- Se utiliza un sistema de tipos estricto para las preguntas y respuestas (`QuestionType`, `TestPayload`, etc.) definidos en los módulos de features.

---
© 2025 Competest

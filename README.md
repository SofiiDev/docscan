# ComprasApp

Sistema de gestión de compras y cotizaciones con IA, construido con React + Vite + Tailwind CSS. Integra la API de Claude para extracción automática de cotizaciones y generación de Órdenes de Compra.

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Flujo de Compras** | Timeline visual del proceso completo: solicitud → remito → pago |
| **Cotizaciones** | Upload de PDF/Word/Excel, extracción con IA, tabla comparativa |
| **Proveedores** | ABM completo con categorías, condiciones de pago, rating |
| **Órdenes de Compra** | Ciclo de vida completo con generación de texto formal vía IA |
| **Remitos y Pagos** | Control de recepción, diferencias con OC, historial de pagos |

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd compras-app
npm install
```

### 2. Configurar variable de entorno

```bash
cp .env.example .env
```

Editá `.env` y colocá tu API key de Anthropic:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Obtené tu API key en [console.anthropic.com](https://console.anthropic.com/)

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrí http://localhost:5173

### 4. Build de producción

```bash
npm run build
```

## Deploy en Netlify

### Opción A — Deploy automático desde GitHub

1. Subí el repositorio a GitHub
2. En Netlify: **Add new site → Import an existing project**
3. Conectá tu repositorio
4. Configurá la variable de entorno:
   - **Key:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** tu API key
5. Netlify detectará automáticamente el `netlify.toml` con:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Redirect SPA: `/* → /index.html`

### Opción B — Deploy manual (drag & drop)

```bash
npm run build
# Subí la carpeta /dist a netlify.com/drop
```

Luego configurá la variable de entorno en **Site settings → Environment variables**.

## Stack tecnológico

- **React 19** + **TypeScript**
- **Vite 6** — build tool
- **Tailwind CSS v4** — estilos
- **Context API + useReducer** — estado global con persistencia en localStorage
- **Claude API** (claude-sonnet-4-20250514) — extracción de documentos y generación de texto

## Estructura del proyecto

```
src/
  components/
    Cotizaciones/      # Comparador, tabla comparativa, upload
    Proveedores/       # ABM proveedores
    Ordenes/           # Órdenes de compra y flujo de aprobación
    Flujo/             # Timeline de solicitudes
    Remitos/           # Remitos y pagos
    shared/            # Layout, navbar
  context/
    AppContext.tsx      # Estado global + persistencia localStorage
  utils/
    claudeApi.ts       # Integración con API de Claude
    fileParser.ts      # Conversión de archivos a base64
    helpers.ts         # Utilidades (fechas, moneda, IDs)
  types/
    index.ts           # Tipos TypeScript de toda la app
```

## Notas de seguridad

- La API key de Anthropic se expone en el cliente (es una app 100% client-side).
- Para producción se recomienda agregar un proxy backend o restringir el uso de la key por dominio en la consola de Anthropic.
- Nunca comitees el archivo `.env`.

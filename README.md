# LUBENS FARNESIO - Sistema de Gestión de Reservas

Sistema profesional para gestionar el estado de 80 viviendas de la promoción LUBENS FARNESIO, desarrollado con React + Vite, TailwindCSS, shadcn/ui y Supabase.

## 🚀 Características Principales

- **Gestión de Estados**: Sistema completo de estados (Libre, Bloqueada, Reservada) con máquina de estados y validaciones
- **Dashboard Analytics**: KPIs en tiempo real, gráficos de distribución y últimos cambios
- **Importación/Exportación**: Subida masiva desde Excel/CSV con validaciones y plantilla descargable
- **Trazabilidad Completa**: Historial detallado de todos los cambios con auditoría
- **Notificaciones Email**: Sistema automatizado de notificaciones por email en cada cambio
- **Roles y Permisos**: Sistema de usuarios con roles diferenciados (admin, gestor, promotor, viewer)
- **Interfaz Responsive**: Diseño moderno y completamente responsive

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui + Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Importación**: SheetJS para Excel/CSV
- **Gráficos**: Recharts
- **Validaciones**: Zod + React Hook Form

## 📋 Prerrequisitos

- Node.js 18+
- Cuenta de Supabase
- Cuenta de Resend (para emails) u otro proveedor SMTP

## ⚡ Setup Rápido

### 1. Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL en orden:
   - `supabase/migrations/01_schema.sql`
   - `supabase/migrations/02_policies.sql`
   - `supabase/migrations/03_rpc_change_estado.sql`
   - `supabase/migrations/04_seed.sql`

### 2. Deploy de Edge Function

```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Deploy de la función de email
supabase functions deploy sendStatusEmail

# Configurar variables de entorno en Supabase
supabase secrets set RESEND_API_KEY=tu_resend_api_key
supabase secrets set MAIL_FROM=no-reply@lubensfarnesio.app
supabase secrets set MAIL_TO_DEFAULT=jlherrero@vallenova.es
```

### 3. Configuración Local

```bash
# Clonar e instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar variables en .env
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key

# Iniciar desarrollo
npm run dev
```

## 👥 Usuarios y Roles

### Roles Disponibles
- **admin**: Acceso completo al sistema
- **gestor**: Lectura y cambios de estado, importación autorizada
- **promotor**: Lectura y cambios de estado limitados
- **viewer**: Solo lectura

### Usuarios Precargados
El sistema incluye personas precargadas:

**GESTORES (VALLENOVA)**:
- Juan L. Herrero (jlherrero@vallenova.es)
- Yolanda Alba
- Ignacio Tejerina
- Juan L. Blanco
- Liliam Arroyo

**PROMOTORES**:
- Pedro Zalama Casanova
- Pedro Zalama Hernández
- José Miguel Velasco

## 📊 Modelo de Datos

### Tablas Principales
- **profiles**: Perfiles de usuario enlazados con auth.users
- **personas**: Catálogo de gestores y promotores
- **viviendas**: Inventario de las 80 viviendas
- **reservas**: Reservas de clientes
- **cambios_estado**: Auditoría de cambios
- **import_jobs**: Trabajos de importación

### Estados y Transiciones
- **LIBRE** → BLOQUEADA | RESERVADA
- **BLOQUEADA** → LIBRE | RESERVADA  
- **RESERVADA** → LIBRE | BLOQUEADA

## 📥 Importación de Datos

### Plantilla Excel
El sistema genera una plantilla con las columnas exactas:
- Portal, Planta, Letra, Tipología, Orientación
- Dormitorios, Superficies, PVP Final
- Estado, Gestor, Responsable, Observaciones

### Proceso de Importación
1. Descargar plantilla desde la app
2. Completar datos en Excel/CSV
3. Subir archivo (drag & drop o selección)
4. Previsualización con validaciones
5. Importación con reporte de errores

## 📧 Sistema de Notificaciones

Cada cambio de estado envía automáticamente un email a `jlherrero@vallenova.es` con:
- Vivienda afectada (código único)
- Cambio de estado (de → a)
- Gestor y responsable asignados
- Motivo del cambio
- Usuario que realizó el cambio
- Enlace directo a la ficha

## 🔐 Seguridad

### Row Level Security (RLS)
Todas las tablas tienen RLS activado con políticas específicas por rol.

### Cambios de Estado Seguros
Los cambios se realizan mediante RPC `rpc_change_estado` que:
- Valida transiciones permitidas
- Requiere motivo para estados no-libres
- Registra auditoría completa
- Ejecuta en transacción atómica

## 🚀 Despliegue

### Netlify/Vercel
```bash
# Build de producción
npm run build

# Configurar variables de entorno en el hosting
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

## 📈 Características Avanzadas

### Filtros Inteligentes
- Búsqueda por texto libre
- Filtros múltiples combinables
- Estados como chips clickeables
- Persistencia de filtros

### Exportaciones
- Excel/CSV de datos filtrados
- Plantilla descargable
- Formato optimizado para análisis

### UI/UX Premium
- Animaciones sutiles y micro-interacciones
- Componentes shadcn/ui consistentes
- Diseño responsive mobile-first
- Sistema de colores semántico
- Loading states y feedback visual

## 🧪 Testing y Calidad

### Validaciones
- Formularios con Zod
- Validaciones de negocio en RPC
- Manejo de errores con toasts

### Criterios de Aceptación ✅
- [x] Importación de 80 viviendas sin errores
- [x] Filtros y exportación funcionando
- [x] Cambios de estado con motivo y responsables
- [x] Emails automáticos en cada cambio
- [x] Dashboard con KPIs y últimos cambios
- [x] RLS impide escrituras directas
- [x] App responsive y estable

## 📞 Soporte

Para cualquier consulta técnica:
- Revisar logs de Supabase para errores de base de datos
- Verificar configuración de Edge Functions para emails
- Comprobar variables de entorno en producción

## 🔄 Próximas Mejoras

- [ ] Notificaciones push en tiempo real
- [ ] Filtros avanzados por fechas
- [ ] Reportes PDF automáticos
- [ ] API REST para integraciones externas
- [ ] Modo offline con sincronización
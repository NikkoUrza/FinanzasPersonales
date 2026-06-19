# 💰 Mis Finanzas Personales

Una aplicación web para administrar tus finanzas personales construida con React y Vite.

## Características

- **Dashboard**: Vista general de tu situación financiera
  - Total de ingresos
  - Total de egresos
  - Balance actual
  - Deudas pendientes

- **Gestión de Ingresos**
  - Registrar ingresos fijos y variables
  - Categorías predefinidas:
    - Salario Fijo
    - Servicios Audiovisuales
    - Servicios Musicales
    - Otros Ingresos
  - Historial completo de ingresos

- **Gestión de Egresos**
  - Registrar gastos fijos y variables
  - Múltiples categorías de gastos
  - Seguimiento detallado

- **Gestión de Deudas**
  - Registrar deudas con acreedores
  - Fechas de vencimiento
  - Marcar deudas como pagadas
  - Eliminar deudas

## Tecnologías

- React 19
- React Router DOM
- Vite
- CSS personalizado
- LocalStorage para persistencia de datos

## Instalación

```bash
cd finanzas-app
npm install
```

## Desarrollo

```bash
npm run dev
```

## Construcción para Producción

```bash
npm run build
```

## Uso

1. Abre la aplicación en tu navegador
2. Navega por las diferentes secciones usando el menú superior
3. Registra tus ingresos, egresos y deudas
4. Visualiza tu estado financiero en el Dashboard

Los datos se guardan automáticamente en el navegador usando LocalStorage.

## Estructura del Proyecto

```
finanzas-app/
├── src/
│   ├── components/
│   ├── context/
│   │   └── FinanzasContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Ingresos.jsx
│   │   ├── Egresos.jsx
│   │   └── Deudas.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

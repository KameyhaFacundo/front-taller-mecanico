# Front Taller Automóvil

Frontend de la aplicación de gestión para un taller automotriz: clientes, vehículos, turnos, órdenes de trabajo, repuestos/stock, compras, proveedores, usuarios y caja.

- **Stack:** React 19 + Vite 8, Material UI v9, React Router 7, Axios.
- **Backend:** API REST (ver repositorio del backend). Las rutas se configuran por variable de entorno.

## Requisitos

- Node.js 20 o superior.

## Configuración

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

| Variable           | Descripción                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `VITE_API_URL`     | URL base de la API (ej. `http://localhost:8000`).                            |
| `VITE_WA_TALLER`   | WhatsApp del taller para el botón "Pedir turno por WhatsApp" (solo dígitos, con código de país, ej. `5491122334455`). Si queda vacío, el botón se deshabilita. |

## Scripts

```bash
npm run dev        # desarrollo con HMR
npm run build      # build de producción (Vite/Rolldown)
npm run preview    # servir el build localmente
npm run lint       # oxlint
npm run test       # vitest (tests unitarios de src/utils)
```

## Estructura

```
src/
  auth/          Contexto y proveedor de autenticación
  components/    Componentes UI reutilizables
  context/       Contextos globales (notificaciones, color mode)
  hooks/         Hooks propios (datos paginados, async data, auth)
  layout/        Layout de la app
  pages/         Vistas: Login, Dashboard, Clientes, Vehículos, Turnos, Órdenes, Repuestos, Compras, Proveedores, Caja, Usuarios
  services/      Clientes HTTP por dominio (axios)
  theme/         Tema de Material UI
  utils/         Helpers (format, excel, meta, catalog, wa) + sus tests
```

## Notas de implementación

- **Importación de `xlsx` dinámica:** el módulo (~420 KB) se carga solo al exportar/importar Excel, no en el bundle inicial.
- **Fuentes:** solo se incluyen los subsets `latin` de Inter.
- **Reloj 24 h:** el formateo de horas fuerza `hourCycle: 'h23'` y `fmtMoney` normaliza el espacio del símbolo para que el resultado no dependa del ICU del entorno (Node vs navegador).
- **Autenticación:** el token se guarda en `localStorage`. Para endurecerlo (cookies `httpOnly`), se requiere soporte del backend.
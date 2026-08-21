import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ProtectedLayout from './layout/ProtectedLayout'
import RequireAdmin from './auth/RequireAdmin'
import RequireSuperadmin from './auth/RequireSuperadmin'
import Login from './pages/Login/Login'
import Forbidden from './pages/Forbidden/Forbidden'
import Registro from './pages/Registro/Registro'
import SeleccionarTaller from './pages/SeleccionarTaller/SeleccionarTaller'

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Landing = lazy(() => import('./pages/Landing/Landing'))
const AgendarTurno = lazy(() => import('./pages/AgendarTurno/AgendarTurno'))
const TallerLanding = lazy(() => import('./pages/TallerLanding/TallerLanding'))
const Users = lazy(() => import('./pages/Users/Users'))
const Clientes = lazy(() => import('./pages/Clientes/Clientes'))
const Turnos = lazy(() => import('./pages/Turnos/Turnos'))
const Ordenes = lazy(() => import('./pages/Ordenes/Ordenes'))
const Presupuestos = lazy(() => import('./pages/Presupuestos/Presupuestos'))
const Caja = lazy(() => import('./pages/Caja/Caja'))
const Repuestos = lazy(() => import('./pages/Repuestos/Repuestos'))
const Compras = lazy(() => import('./pages/Compras/Compras'))
const Vehiculos = lazy(() => import('./pages/Vehiculos/Vehiculos'))
const Proveedores = lazy(() => import('./pages/Proveedores/Proveedores'))
const Servicios = lazy(() => import('./pages/Servicios/Servicios'))
const Configuracion = lazy(() => import('./pages/Configuracion/Configuracion'))
const SuperadminTalleres = lazy(() => import('./pages/Superadmin/SuperadminTalleres'))
const Bienvenida = lazy(() => import('./pages/Bienvenida/Bienvenida'))

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/taller/:tallerSlug" element={<TallerLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/seleccionar-taller" element={<SeleccionarTaller />} />
        <Route path="/agendar" element={<AgendarTurno />} />
        <Route path="/agendar/:tallerSlug" element={<AgendarTurno />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route path="/panel" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/presupuestos" element={<Presupuestos />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/productos" element={<Repuestos />} />
          <Route path="/stock" element={<Navigate to="/productos" replace />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route element={<RequireAdmin />}>
            <Route path="/users" element={<Users />} />
          </Route>
          <Route element={<RequireSuperadmin />}>
            <Route path="/superadmin/talleres" element={<SuperadminTalleres />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

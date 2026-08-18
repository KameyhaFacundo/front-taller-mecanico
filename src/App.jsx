import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ProtectedLayout from './layout/ProtectedLayout'
import RequireAdmin from './auth/RequireAdmin'
import Login from './pages/Login/Login'
import Forbidden from './pages/Forbidden/Forbidden'

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const AgendarTurno = lazy(() => import('./pages/AgendarTurno/AgendarTurno'))
const Users = lazy(() => import('./pages/Users/Users'))
const Clientes = lazy(() => import('./pages/Clientes/Clientes'))
const Turnos = lazy(() => import('./pages/Turnos/Turnos'))
const Ordenes = lazy(() => import('./pages/Ordenes/Ordenes'))
const Caja = lazy(() => import('./pages/Caja/Caja'))
const Repuestos = lazy(() => import('./pages/Repuestos/Repuestos'))
const Compras = lazy(() => import('./pages/Compras/Compras'))
const Vehiculos = lazy(() => import('./pages/Vehiculos/Vehiculos'))
const Proveedores = lazy(() => import('./pages/Proveedores/Proveedores'))
const Servicios = lazy(() => import('./pages/Servicios/Servicios'))

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
        <Route path="/login" element={<Login />} />
        <Route path="/agendar" element={<AgendarTurno />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/productos" element={<Repuestos />} />
          <Route path="/stock" element={<Navigate to="/productos" replace />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route element={<RequireAdmin />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

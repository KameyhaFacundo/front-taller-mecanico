import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LogoutIcon from '@mui/icons-material/Logout'
import SpeedIcon from '@mui/icons-material/Speed'
import PeopleIcon from '@mui/icons-material/People'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import PaymentsIcon from '@mui/icons-material/Payments'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import BuildIcon from '@mui/icons-material/Build'
import SettingsIcon from '@mui/icons-material/Settings'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import StorefrontIcon from '@mui/icons-material/Storefront'
import WavingHandIcon from '@mui/icons-material/WavingHand'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useAuth } from '../hooks/useAuth'
import { useColorMode } from '../context/useColorMode'
import { useTokenExpirationCheck } from '../hooks/useTokenExpirationCheck'
import HelpDialog from '../components/HelpDialog'
import BrandMark from '../components/BrandMark'
import TallerSuspendidoView from '../components/TallerSuspendidoView'
import { initials } from '../utils/format'
import { SAFETY, SAFETY_DEEP, FONT_MONO, pegboard, getWorkshopTheme } from '../theme/workshopBrand'

const DRAWER_WIDTH = 228
const RAIL_WIDTH = 84
const SIDEBAR_STORAGE_KEY = 'sidebarOpen'

const sections = [
  { key: 'panel', icon: SpeedIcon, label: 'Panel', path: '/panel', end: true },
  {
    key: 'agenda',
    icon: CalendarMonthIcon,
    label: 'Agenda',
    children: [
      { icon: CalendarMonthIcon, label: 'Turnos', path: '/turnos' },
      { icon: AssignmentIcon, label: 'Órdenes', path: '/ordenes' },
      { icon: RequestQuoteIcon, label: 'Presupuestos', path: '/presupuestos' },
    ],
  },
  { key: 'caja', icon: PaymentsIcon, label: 'Caja', path: '/caja' },
  {
    key: 'inventario',
    icon: Inventory2Icon,
    label: 'Inventario',
    children: [
      { icon: Inventory2Icon, label: 'Productos', path: '/productos' },
      { icon: ShoppingCartIcon, label: 'Compras', path: '/compras' },
      { icon: LocalShippingIcon, label: 'Proveedores', path: '/proveedores' },
    ],
  },
  {
    key: 'configuracion',
    icon: SettingsIcon,
    label: 'Configuración',
    children: [
      { icon: PeopleIcon, label: 'Clientes', path: '/clientes' },
      { icon: DirectionsCarIcon, label: 'Vehículos', path: '/vehiculos' },
      { icon: BuildIcon, label: 'Servicios', path: '/servicios' },
    ],
  },
]

export default function ProtectedLayout() {
  const { token, loading, user, role, memberships, activeTaller, activeTallerId, isSuperadmin, logout } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const workshopTheme = getWorkshopTheme(mode)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false')
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  useTokenExpirationCheck()

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(desktopOpen))
  }, [desktopOpen])

  const allSections = useMemo(() => {
    let result = sections
    if (role === 'admin') {
      result = result.map((section) =>
        section.key === 'configuracion'
          ? { ...section, children: [...section.children, { icon: AdminPanelSettingsIcon, label: 'Usuarios', path: '/users' }] }
          : section
      )
    }
    if (isSuperadmin) {
      result = [...result, { key: 'superadmin', icon: StorefrontIcon, label: 'Talleres', path: '/superadmin/talleres' }]
    }
    return result
  }, [role, isSuperadmin])

  const isPathActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  const isSectionActive = (section) =>
    section.children ? section.children.some((c) => isPathActive(c.path)) : section.end ? location.pathname === section.path : isPathActive(section.path)

  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  if (!activeTallerId) return <Navigate to="/seleccionar-taller" replace />

  const tallerSuspendido = activeTaller?.activo === false
  if (tallerSuspendido) {
    const tieneOtrosActivos = memberships.some((m) => m.taller_id !== activeTallerId && m.activo !== false)
    return (
      <TallerSuspendidoView
        mode={mode}
        onVolverInicio="/"
        actions={
          <>
            {tieneOtrosActivos && (
              <Button
                variant="contained"
                onClick={() => navigate('/seleccionar-taller', { replace: true })}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Cambiar de taller
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => logout()}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cerrar sesión
            </Button>
          </>
        }
      />
    )
  }

  const renderSidebar = (onClose, onNavigate = () => {}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: (t) => t.custom.sidebar, color: (t) => t.custom.sidebarText, ...pegboard('rgba(243,237,224,0.035)') }}>
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 56 }}>
        <BrandMark color="#f3ede0" size={14} iconSize={28} />
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Colapsar menú">
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Colapsar menú"
            sx={{ color: 'inherit', opacity: 0.7, '&:hover': { opacity: 1, bgcolor: (t) => t.custom.sidebarHover } }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ borderColor: (t) => t.custom.sidebarBorder }} />
      <List sx={{ flexGrow: 1, minHeight: 0, px: 1.25, py: 1.25, overflowY: 'auto' }}>
        {allSections.map((section) =>
          section.children ? (
            <Box key={section.key} sx={{ mb: 1 }}>
              <Typography sx={{ px: 1.5, pt: 1, pb: 0.5, display: 'block', opacity: 0.55, fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {section.label}
              </Typography>
              {section.children.map((child) => (
                <NavItem key={child.path} link={child} active={isPathActive(child.path)} onNavigate={onNavigate} />
              ))}
            </Box>
          ) : (
            <NavItem key={section.key} link={section} active={isSectionActive(section)} onNavigate={onNavigate} />
          )
        )}
        <HelpDialog variant="menuItem" />
      </List>

      <Divider sx={{ borderColor: (t) => t.custom.sidebarBorder }} />
      <Box sx={{ px: 1.25, pt: 1.25, pb: 1.25 }}>
        <Box
          onClick={(event) => setUserMenuAnchor(event.currentTarget)}
          sx={{
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            bgcolor: (t) => t.custom.sidebarSurface,
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: (t) => t.custom.sidebarHover },
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: SAFETY, fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials(user?.name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" noWrap sx={{ color: '#f3ede0', fontWeight: 700, lineHeight: 1.25, fontSize: 13 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" noWrap sx={{ opacity: 0.6, fontSize: 11 }}>
              {role === 'admin' ? 'Admin' : 'Empleado'} · {activeTaller?.nombre}
            </Typography>
          </Box>
          <MoreVertIcon fontSize="small" sx={{ opacity: 0.5, flexShrink: 0 }} />
        </Box>
      </Box>
    </Box>
  )

  const rail = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', bgcolor: (t) => t.custom.sidebar, color: (t) => t.custom.sidebarText, ...pegboard('rgba(243,237,224,0.035)') }}>
      <Box sx={{ pl: 0.5, pr: 0.25, py: 1.5, minHeight: 56, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%' }}>
        <BrandMark iconOnly iconSize={28} />
        <Tooltip title="Abrir menú" placement="right">
          <IconButton
            size="small"
            onClick={() => setDesktopOpen(true)}
            sx={{
              width: 16,
              height: 16,
              flexShrink: 0,
              color: 'inherit',
              opacity: 0.7,
              '&:hover': { opacity: 1, bgcolor: (t) => t.custom.sidebarHover },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 11, transform: 'rotate(180deg)' }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ borderColor: (t) => t.custom.sidebarBorder, width: '100%' }} />
      <List sx={{ flexGrow: 1, minHeight: 0, py: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, width: '100%' }}>
        {allSections.map((section, index) => (
          <Box key={section.key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%' }}>
            {index > 0 && <Divider sx={{ borderColor: (t) => t.custom.sidebarBorder, width: 28, mb: 0.25 }} />}
            {section.children ? (
              section.children.map((child) => <RailNavItem key={child.path} link={child} active={isPathActive(child.path)} />)
            ) : (
              <RailNavItem link={section} active={isSectionActive(section)} />
            )}
          </Box>
        ))}
      </List>
      <Divider sx={{ borderColor: (t) => t.custom.sidebarBorder, width: '100%' }} />
      <Box sx={{ py: 1.25, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Tooltip title={user?.name || 'Cuenta'} placement="right">
          <Avatar
            onClick={(event) => setUserMenuAnchor(event.currentTarget)}
            sx={{ width: 32, height: 32, bgcolor: SAFETY, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
          >
            {initials(user?.name)}
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <ThemeProvider theme={workshopTheme}>
    <Box sx={{ display: 'flex', height: '100svh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: '#18140f',
          color: '#f3ede0',
          borderBottom: '1px solid',
          borderColor: 'rgba(243,237,224,0.10)',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((v) => !v)} aria-label="Abrir menú">
            <MenuIcon />
          </IconButton>

          <BrandMark color="#f3ede0" size={16} iconSize={28} />
        </Toolbar>
      </AppBar>

      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null)
            navigate('/configuracion')
          }}
        >
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null)
            navigate('/bienvenida')
          }}
        >
          <ListItemIcon>
            <WavingHandIcon fontSize="small" />
          </ListItemIcon>
          Guía de bienvenida
        </MenuItem>
        {memberships.length > 1 && (
          <MenuItem
            onClick={() => {
              setUserMenuAnchor(null)
              navigate('/seleccionar-taller')
            }}
          >
            <ListItemIcon>
              <StorefrontIcon fontSize="small" />
            </ListItemIcon>
            Cambiar taller
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            toggleColorMode()
            setUserMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </ListItemIcon>
          {mode === 'light' ? 'Modo oscuro' : 'Modo claro'}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null)
            logout()
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' } }}
      >
        {renderSidebar(() => setMobileOpen(false))}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: { md: desktopOpen ? DRAWER_WIDTH : RAIL_WIDTH },
          flexShrink: 0,
          transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.shorter }),
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: desktopOpen ? DRAWER_WIDTH : RAIL_WIDTH,
            border: 'none',
            borderRight: '1px solid',
            borderColor: (t) => t.custom.sidebarBorder,
            overflowX: 'hidden',
            height: '100%',
            transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.shorter }),
          },
        }}
      >
        {desktopOpen ? renderSidebar(() => setDesktopOpen(false)) : rail}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          p: { xs: 2, md: 3 },
          mt: { xs: 8, md: 0 },
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  )
}

function NavItem({ link, active, onNavigate }) {
  const Icon = link.icon
  return (
    <ListItemButton component={NavLink} to={link.path} end={link.end} onClick={onNavigate} selected={active} sx={{ borderRadius: 2, mb: 0.5, minHeight: 44, color: active ? '#fff' : 'inherit', '&.Mui-selected': { background: `linear-gradient(135deg, ${SAFETY}, ${SAFETY_DEEP})`, color: '#fff' }, '&:hover:not(.Mui-selected)': { backgroundColor: (t) => t.custom.sidebarHover } }}>
      <ListItemIcon sx={{ minWidth: 0, mr: 1.25, color: 'inherit' }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }} />
    </ListItemButton>
  )
}

function RailNavItem({ link, active }) {
  const Icon = link.icon
  return (
    <Tooltip title={link.label} placement="right">
      <ListItemButton
        component={NavLink}
        to={link.path}
        end={link.end}
        selected={active}
        sx={{
          borderRadius: 2,
          width: 44,
          height: 44,
          minHeight: 44,
          flexShrink: 0,
          justifyContent: 'center',
          color: active ? '#fff' : 'inherit',
          '&.Mui-selected': { background: `linear-gradient(135deg, ${SAFETY}, ${SAFETY_DEEP})`, color: '#fff' },
          '&:hover:not(.Mui-selected)': { backgroundColor: (t) => t.custom.sidebarHover },
        }}
      >
        <Icon fontSize="small" />
      </ListItemButton>
    </Tooltip>
  )
}

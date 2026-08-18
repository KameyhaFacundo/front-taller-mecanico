import { useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
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
import LogoutIcon from '@mui/icons-material/Logout'
import SpeedIcon from '@mui/icons-material/Speed'
import PeopleIcon from '@mui/icons-material/People'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import BuildIcon from '@mui/icons-material/Build'
import SettingsIcon from '@mui/icons-material/Settings'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useAuth } from '../hooks/useAuth'
import { useColorMode } from '../context/useColorMode'
import { useTokenExpirationCheck } from '../hooks/useTokenExpirationCheck'
import HelpDialog from '../components/HelpDialog'
import { initials } from '../utils/format'

// No sidebar — navigation lives in a horizontal bar up top, so the page
// content gets the full width of the screen. `children` groups (Inventario)
// open as a dropdown instead of eating more horizontal space.
const sections = [
  { key: 'panel', icon: SpeedIcon, label: 'Panel', path: '/', end: true },
  {
    key: 'agenda',
    icon: CalendarMonthIcon,
    label: 'Agenda',
    children: [
      { icon: CalendarMonthIcon, label: 'Turnos', path: '/turnos' },
      { icon: AssignmentIcon, label: 'Órdenes', path: '/ordenes' },
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
  const { token, loading, user, role, logout } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [menuAnchors, setMenuAnchors] = useState({})
  useTokenExpirationCheck()

  const allSections = useMemo(() => {
    if (role !== 'admin') return sections
    return sections.map((section) =>
      section.key === 'configuracion'
        ? { ...section, children: [...section.children, { icon: AdminPanelSettingsIcon, label: 'Usuarios', path: '/users' }] }
        : section
    )
  }, [role])

  const isPathActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  const isSectionActive = (section) =>
    section.children ? section.children.some((c) => isPathActive(c.path)) : section.end ? location.pathname === section.path : isPathActive(section.path)

  if (loading) return null
  if (!token) return <Navigate to="/login" replace />

  const navButtonSx = (active) => ({
    borderRadius: 2,
    px: 1.5,
    minHeight: 38,
    color: active ? 'primary.main' : 'text.secondary',
    bgcolor: active ? 'action.selected' : 'transparent',
    fontWeight: active ? 700 : 500,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    '&:hover': { bgcolor: 'action.hover' },
  })

  const desktopNav = (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, overflow: 'hidden' }}>
      {allSections.map((section) => {
        const Icon = section.icon
        const active = isSectionActive(section)

        if (section.children) {
          const open = Boolean(menuAnchors[section.key])
          return (
            <Box key={section.key}>
              <Button
                startIcon={<Icon fontSize="small" />}
                endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                onClick={(e) => setMenuAnchors((prev) => ({ ...prev, [section.key]: e.currentTarget }))}
                sx={navButtonSx(active)}
              >
                {section.label}
              </Button>
              <Menu
                anchorEl={menuAnchors[section.key]}
                open={open}
                onClose={() => setMenuAnchors((prev) => ({ ...prev, [section.key]: null }))}
              >
                {section.children.map((child) => {
                  const ChildIcon = child.icon
                  return (
                    <MenuItem
                      key={child.path}
                      component={NavLink}
                      to={child.path}
                      selected={isPathActive(child.path)}
                      onClick={() => setMenuAnchors((prev) => ({ ...prev, [section.key]: null }))}
                    >
                      <ListItemIcon>
                        <ChildIcon fontSize="small" />
                      </ListItemIcon>
                      {child.label}
                    </MenuItem>
                  )
                })}
              </Menu>
            </Box>
          )
        }

        return (
          <Button key={section.key} component={NavLink} to={section.path} end={section.end} startIcon={<Icon fontSize="small" />} sx={navButtonSx(active)}>
            {section.label}
          </Button>
        )
      })}
    </Box>
  )

  const mobileNavContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'custom.sidebar', color: 'custom.sidebarText' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`, color: '#fff' }}>
          <SpeedIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.1 }}>
            Exe-Mecanica
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            Panel de gestión
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ flexGrow: 1, px: 1.25, py: 1.25, overflow: 'auto' }}>
        {allSections.map((section) =>
          section.children ? (
            <Box key={section.key} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ px: 1.5, pt: 1, pb: 0.5, display: 'block', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {section.label}
              </Typography>
              {section.children.map((child) => (
                <MobileNavItem key={child.path} link={child} active={isPathActive(child.path)} onNavigate={() => setMobileOpen(false)} />
              ))}
            </Box>
          ) : (
            <MobileNavItem key={section.key} link={section} active={isSectionActive(section)} onNavigate={() => setMobileOpen(false)} />
          )
        )}
      </List>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100svh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: (t) => t.custom.appbar,
          backdropFilter: 'blur(12px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((v) => !v)} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`, color: '#fff' }}>
              <SpeedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', display: { xs: 'none', sm: 'block' } }}>
              Exe-Mecanica
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>{desktopNav}</Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }} />

          <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <HelpDialog />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5, flexShrink: 0 }}>
            <Tooltip title={`${user?.name} · ${role === 'admin' ? 'Admin' : 'Empleado'}`}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 700, color: '#fff' }}>{initials(user?.name)}</Avatar>
            </Tooltip>
            <IconButton size="small" onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label="Opciones de usuario">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)}>
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
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260, border: 'none' } }}
      >
        {mobileNavContent}
      </Drawer>

      <Box component="main" sx={{ p: { xs: 2, md: 3 }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

function MobileNavItem({ link, active, onNavigate }) {
  const Icon = link.icon
  return (
    <ListItemButton component={NavLink} to={link.path} end={link.end} onClick={onNavigate} selected={active} sx={{ borderRadius: 2, mb: 0.5, minHeight: 44, color: active ? '#fff' : 'inherit', '&.Mui-selected': { background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`, color: '#fff' }, '&:hover:not(.Mui-selected)': { backgroundColor: 'rgba(255,255,255,0.06)' } }}>
      <ListItemIcon sx={{ minWidth: 0, mr: 1.25, color: 'inherit' }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }} />
    </ListItemButton>
  )
}

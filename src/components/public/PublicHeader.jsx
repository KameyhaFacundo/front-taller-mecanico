import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AppBar, Box, Button, Container, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import { useColorMode } from '../../context/useColorMode'

const scrollToId = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function PublicHeader({ links = [] }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const [menuAnchor, setMenuAnchor] = useState(null)

  const closeMenu = () => setMenuAnchor(null)

  const cta = (
    <Button
      component={RouterLink}
      to="/agendar"
      variant="contained"
      size="small"
      startIcon={<CalendarMonthIcon />}
      sx={{ background: (t) => t.custom.brandGradient, '&:hover': { opacity: 0.9 }, whiteSpace: 'nowrap' }}
    >
      Reservar turno
    </Button>
  )

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: dark ? 'rgba(11,21,19,0.92)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: dark ? 'rgba(255,255,255,0.08)' : 'divider',
        color: dark ? '#fff' : 'text.primary',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: '0 !important', minHeight: 64, gap: 1 }}>
          <Stack component={RouterLink} to="/" direction="row" spacing={1.5} sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit', flex: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
              <SpeedIcon fontSize="small" />
            </Box>
            <Box sx={{ lineHeight: 1.05 }}>
              <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Exe-Mecanica</Typography>
              <Typography sx={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>Motos con garantía</Typography>
            </Box>
          </Stack>

          {isDesktop && links.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              {links.map((link) => (
                <Button
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={scrollToId(link.id)}
                  color="inherit"
                  size="small"
                  sx={{ color: dark ? 'rgba(255,255,255,0.72)' : 'text.secondary', '&:hover': { color: dark ? '#fff' : 'text.primary' }, whiteSpace: 'nowrap' }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          )}

          {isDesktop && (
            <>
              <IconButton
                onClick={toggleColorMode}
                size="small"
                aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                sx={{ color: dark ? 'rgba(255,255,255,0.8)' : 'text.secondary', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'divider' }}
              >
                {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
              {cta}
            </>
          )}

          {!isDesktop && (
            <>
              <IconButton
                onClick={toggleColorMode}
                size="small"
                aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                sx={{ color: dark ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
              >
                {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                size="small"
                aria-label="Abrir menú"
                sx={{ color: dark ? 'rgba(255,255,255,0.8)' : 'text.secondary', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'divider' }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {links.map((link) => (
                  <MenuItem
                    key={link.id}
                    onClick={(e) => {
                      scrollToId(link.id)(e)
                      closeMenu()
                    }}
                  >
                    <ListItemText>{link.label}</ListItemText>
                  </MenuItem>
                ))}
                <MenuItem component={RouterLink} to="/agendar" onClick={closeMenu} sx={{ fontWeight: 700, color: 'primary.main' }}>
                  <ListItemIcon>
                    <CalendarMonthIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Reservar turno</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
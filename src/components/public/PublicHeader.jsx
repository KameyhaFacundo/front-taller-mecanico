import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AppBar, Box, Button, Container, Drawer, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { useColorMode } from '../../context/useColorMode'
import { INK, CONCRETE, SAFETY, SAFETY_DEEP, FONT_DISPLAY, FONT_MONO, btnSx } from '../../theme/workshopBrand'

const scrollToId = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function PublicHeader({ links = [], nombre = 'el taller', tagline, agendarTo = '/agendar', ctaLabel = 'Reservar turno', workshop = false }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuAnchor(null)

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const pageBg = dark ? INK : CONCRETE

  const scrollToIdAndClose = (id) => (e) => {
    scrollToId(id)(e)
    closeMenu()
  }

  if (!workshop) {
    const cta = (
      <Button
        component={RouterLink}
        to={agendarTo}
        variant="contained"
        size="small"
        startIcon={<CalendarMonthIcon />}
        sx={{ background: (t) => t.custom.brandGradient, '&:hover': { opacity: 0.9 }, whiteSpace: 'nowrap' }}
      >
        {ctaLabel}
      </Button>
    )

    return (
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: dark ? 'rgba(7,12,23,0.92)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: dark ? 'rgba(255,255,255,0.08)' : 'divider',
          color: dark ? '#fff' : 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: '0 !important', minHeight: 72, gap: 2, justifyContent: 'space-between' }}>
            <Stack component={RouterLink} to="/" direction="row" spacing={1.25} sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit', flexShrink: 0, minWidth: 0 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff', flexShrink: 0 }}>
                <BuildIcon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.15, color: dark ? '#fff' : 'text.primary' }}>
                  {nombre}
                </Typography>
                {tagline && (
                  <Typography noWrap sx={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.6)' : 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                    {tagline}
                  </Typography>
                )}
              </Box>
            </Stack>

            {isDesktop && links.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                {links.map((link) => (
                  <Button key={link.id} href={`#${link.id}`} onClick={scrollToId(link.id)} color="inherit" size="small" sx={{ px: 1.5, color: dark ? 'rgba(255,255,255,0.72)' : 'text.secondary', '&:hover': { color: dark ? '#fff' : 'text.primary' }, whiteSpace: 'nowrap' }}>
                    {link.label}
                  </Button>
                ))}
              </Stack>
            )}

            {isDesktop && (
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                <IconButton onClick={toggleColorMode} size="small" aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} sx={{ color: dark ? 'rgba(255,255,255,0.8)' : 'text.secondary', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'divider' }}>
                  {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
                {cta}
              </Stack>
            )}

            {!isDesktop && (
              <>
                <IconButton onClick={toggleColorMode} size="small" aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} sx={{ color: dark ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                  {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small" aria-label="Abrir menú" sx={{ color: dark ? 'rgba(255,255,255,0.8)' : 'text.secondary', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'divider' }}>
                  <MenuIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                  {links.map((link) => (
                    <MenuItem key={link.id} onClick={(e) => { scrollToId(link.id)(e); closeMenu() }}>
                      <ListItemText>{link.label}</ListItemText>
                    </MenuItem>
                  ))}
                  <MenuItem component={RouterLink} to={agendarTo} onClick={closeMenu} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    <ListItemIcon>
                      <CalendarMonthIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{ctaLabel}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    )
  }

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: dark ? 'rgba(24,20,15,0.88)' : 'rgba(233,228,216,0.88)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor,
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 1.6 }}>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none', color: 'inherit', flexShrink: 0, minWidth: 0 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', flexShrink: 0, transform: 'rotate(-4deg)', boxShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
              <BuildIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 18, letterSpacing: '0.01em', textTransform: 'uppercase', color: textPrimary, lineHeight: 1.15 }}>
                {nombre}
              </Typography>
              {tagline && (
                <Typography noWrap sx={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: textSecondary, display: { xs: 'none', sm: 'block' } }}>
                  {tagline}
                </Typography>
              )}
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, ml: 3, flexGrow: 1 }}>
            {links.map((link) => (
              <Button key={link.id} href={`#${link.id}`} onClick={scrollToId(link.id)} size="small" sx={{ px: 1.5, borderRadius: 1, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, color: textSecondary, '&:hover': { color: textPrimary, bgcolor: 'transparent' } }}>
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

          <IconButton size="small" onClick={toggleColorMode} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} sx={{ borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}>
            {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <Button component={RouterLink} to={agendarTo} variant="contained" size="small" startIcon={<CalendarMonthIcon fontSize="small" />} sx={{ ...btnSx, display: { xs: 'none', sm: 'inline-flex' }, bgcolor: SAFETY, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 3px 0 ' + SAFETY_DEEP, '&:hover': { bgcolor: SAFETY_DEEP, boxShadow: '0 3px 0 ' + SAFETY_DEEP } }}>
            {ctaLabel}
          </Button>

          <IconButton size="small" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" sx={{ display: { xs: 'inline-flex', md: 'none' }, borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Container>

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 260, p: 2.5, height: '100%', bgcolor: pageBg, color: textPrimary }}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
            <IconButton size="small" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" sx={{ color: textPrimary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={0.5}>
            {links.map((link) => (
              <Button key={link.id} href={`#${link.id}`} onClick={scrollToIdAndClose(link.id)} sx={{ ...btnSx, justifyContent: 'flex-start', color: textPrimary, px: 1.5 }}>
                {link.label}
              </Button>
            ))}
            <Button component={RouterLink} to={agendarTo} variant="contained" sx={{ ...btnSx, justifyContent: 'flex-start', bgcolor: SAFETY, color: '#fff', mt: 1, boxShadow: '0 3px 0 ' + SAFETY_DEEP }} onClick={() => setMenuOpen(false)}>
              {ctaLabel}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  )
}

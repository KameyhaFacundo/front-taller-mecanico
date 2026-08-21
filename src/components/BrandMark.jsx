import { Link as RouterLink } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import { SAFETY, FONT_DISPLAY } from '../theme/workshopBrand'

export default function BrandMark({ color, size = 20, iconSize = 34, to = '/', iconOnly = false }) {
  const mark = (
    <Box
      sx={{
        width: iconSize,
        height: iconSize,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: SAFETY,
        color: '#fff',
        flexShrink: 0,
        transform: 'rotate(-4deg)',
        boxShadow: '0 3px 0 rgba(0,0,0,0.15)',
      }}
    >
      <BuildIcon fontSize="small" />
    </Box>
  )

  if (iconOnly) {
    return (
      <Box component={RouterLink} to={to} sx={{ display: 'inline-flex', width: 'fit-content' }}>
        {mark}
      </Box>
    )
  }

  return (
    <Stack
      component={RouterLink}
      to={to}
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', textDecoration: 'none', width: 'fit-content' }}
    >
      {mark}
      <Typography
        noWrap
        sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: size, letterSpacing: '0.01em', textTransform: 'uppercase', color }}
      >
        Gestión de Talleres
      </Typography>
    </Stack>
  )
}

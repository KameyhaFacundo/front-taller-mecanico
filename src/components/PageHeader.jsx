import { Box, Breadcrumbs, Stack, Typography, Link as MuiLink } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { FONT_DISPLAY } from '../theme/workshopBrand'

export default function PageHeader({ title, subtitle, crumbs = [], actions }) {
  return (
    <Box sx={{ mb: 3 }}>
      {crumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }} aria-label="breadcrumb">
          {crumbs.map((crumb, index) =>
            crumb.to && index < crumbs.length - 1 ? (
              <MuiLink key={crumb.label} component={RouterLink} to={crumb.to} underline="hover" color="inherit" sx={{ fontSize: 13, fontWeight: 500 }}>
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={crumb.label} color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h5" noWrap sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" sx={{ gap: 1, ml: { sm: 'auto' }, flexShrink: 0, flexWrap: 'wrap' }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

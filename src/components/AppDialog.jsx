import { Box, Dialog, DialogContent, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

/**
 * Dialog estándar de la app: encabezado con icono + título + subtítulo +
 * botón de cierre, contenido y acciones. Reemplaza a DialogTitle/DialogActions
 * sueltos para mantener un diseño consistente en todos los modales.
 */
export default function AppDialog({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = 'primary.main',
  maxWidth = 'sm',
  fullWidth = true,
  children,
  actions,
  actionsSx,
  ...rest
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} {...rest}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'background.default'),
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: iconBg,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Cerrar" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 2.5 }}>{children}</DialogContent>
      {actions && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
            px: 3,
            pb: 2.5,
            pt: 0,
            ...actionsSx,
          }}
        >
          {actions}
        </Box>
      )}
    </Dialog>
  )
}
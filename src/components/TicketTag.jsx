import { Box } from '@mui/material'
import { FONT_MONO } from '../theme/workshopBrand'

export default function TicketTag({ children, ink, sx }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.1,
        py: 0.5,
        border: '1.5px dashed',
        borderColor: ink ? 'rgba(24,20,15,0.35)' : 'rgba(243,237,224,0.35)',
        borderRadius: 1,
        fontFamily: FONT_MONO,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: ink ? '#57534a' : 'rgba(243,237,224,0.75)',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

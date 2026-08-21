import { Box } from '@mui/material'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { waLink } from '../../utils/wa'

export default function WhatsAppFloat({ telefono, mensaje = 'Hola 👋, quiero consultar por el taller.' }) {
  const url = waLink(telefono, mensaje)
  if (!url) return null

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      sx={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 1300,
        width: 56,
        height: 56,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: '#25D366',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        transition: 'transform 0.15s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'scale(1.08)', boxShadow: '0 8px 26px rgba(0,0,0,0.45)' },
      }}
    >
      <WhatsAppIcon sx={{ fontSize: 30 }} />
    </Box>
  )
}

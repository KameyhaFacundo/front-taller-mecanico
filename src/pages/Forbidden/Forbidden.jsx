import { Box, Button, Paper, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', maxWidth: 440, borderRadius: 4 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.main', color: '#fff', mx: 'auto', mb: 2 }}>
          <LockIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Acceso restringido
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No tenés permisos para ver esta página. Contactá al administrador si creés que es un error.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Volver al panel
        </Button>
      </Paper>
    </Box>
  )
}

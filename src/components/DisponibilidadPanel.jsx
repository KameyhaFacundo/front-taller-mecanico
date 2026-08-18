import { Box, Chip, Stack, Typography } from '@mui/material'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { fmtDate } from '../utils/format'

export default function DisponibilidadPanel({ fecha, huecos = [], onElegir, loading = false }) {
  return (
    <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: loading || huecos.length === 0 ? 'center' : 'flex-start' }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <ScheduleIcon sx={{ fontSize: 17 }} />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: loading || huecos.length === 0 ? 0 : 0.75 }}>
            Disponibilidad · {fmtDate(fecha)}
          </Typography>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Calculando…
            </Typography>
          ) : huecos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Sin horarios libres este día.
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
              {huecos.map((h) => (
                <Chip
                  key={h}
                  size="small"
                  label={h}
                  variant="outlined"
                  color="primary"
                  onClick={() => onElegir(`${fecha}T${h}:00`)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
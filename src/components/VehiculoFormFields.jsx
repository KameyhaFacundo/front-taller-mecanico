import { Box, Chip, Stack, TextField, Typography } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import MarcaAutocomplete from './MarcaAutocomplete'
import ModeloAutocomplete from './ModeloAutocomplete'
import AnioSelect from './AnioSelect'
import { fmtNum } from '../utils/format'

const paleta = ['#0e7c66', '#0f766e', '#7c2d12', '#3b0764', '#14532d', '#581c87']

const colorVehiculo = (marca, modelo, patente) => {
  const seed = ((marca ?? 'auto').length + (modelo ?? '').length + (patente ?? '').length) % paleta.length
  return [paleta[seed], paleta[(seed + 3) % paleta.length]]
}

// Campos de vehículo reutilizables para todos los diálogos de crear/editar,
// con una vista previa en vivo del auto que se está configurando.
export default function VehiculoFormFields({ form, setForm, marcasVersion = 0, modelosVersion = 0, showImagen = false, autoFocus = false }) {
  const [c1, c2] = colorVehiculo(form.marca, form.modelo, form.patente)
  const set = (campo) => (valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          height: 130,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DirectionsCarIcon sx={{ fontSize: 68, color: 'rgba(255,255,255,0.92)' }} />
        {form.patente ? (
          <Chip
            size="small"
            label={form.patente}
            sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontWeight: 800, letterSpacing: 0.5 }}
          />
        ) : (
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 12, left: 12, color: 'rgba(255,255,255,0.7)' }}>
            Sin patente
          </Typography>
        )}
        <Box sx={{ position: 'absolute', bottom: 8, right: 12, textAlign: 'right', color: '#fff' }}>
          <Typography sx={{ fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}>
            {form.marca || 'Marca'} {form.modelo}
          </Typography>
          <Typography variant="caption" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
            {form.anio ? `${form.anio} · ` : ''}
            {form.kilometros ? `${fmtNum(Number(form.kilometros))} km` : 'sin km'}
          </Typography>
        </Box>
      </Box>

      <Stack direction="column" spacing={2}>
        <MarcaAutocomplete value={form.marca} onChange={set('marca')} required fullWidth refreshSignal={marcasVersion} autoFocus={autoFocus} />
        <ModeloAutocomplete marca={form.marca} value={form.modelo} onChange={set('modelo')} required fullWidth refreshSignal={modelosVersion} />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Patente"
          value={form.patente}
          onChange={(e) => set('patente')(e.target.value.toUpperCase())}
          required
          fullWidth
          placeholder="AB123CD"
        />
        <AnioSelect value={form.anio} onChange={set('anio')} fullWidth />
        <TextField
          label="Kilómetros"
          type="number"
          value={form.kilometros}
          onChange={(e) => set('kilometros')(e.target.value)}
          fullWidth
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Stack>

      {showImagen && (
        <TextField
          label="URL de imagen (opcional)"
          value={form.imagen_url ?? ''}
          onChange={(e) => set('imagen_url')(e.target.value)}
          fullWidth
          placeholder="https://…"
        />
      )}
    </Stack>
  )
}
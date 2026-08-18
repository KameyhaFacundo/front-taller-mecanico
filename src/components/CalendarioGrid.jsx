import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import { turnoEstadoMeta } from '../utils/meta'
import { fmtVehiculo, fmtWeekdayShort } from '../utils/format'

const pad = (n) => String(n).padStart(2, '0')

const MAX_VISIBLES = { mes: 3, semana: 6, dia: Infinity }
const MIN_ALTURA = { mes: 128, semana: 260, dia: 420 }

/**
 * Calendario de celdas (tipo Google Calendar) — el mismo componente sirve
 * para Día (1 celda grande), Semana (7 celdas medianas) o Mes (5-6 filas de
 * 7 celdas chicas). La densidad de cada turno-pastilla se adapta según
 * cuántas celdas entran en pantalla.
 */
export default function CalendarioGrid({ celdas, turnos, modo, onAbrirTurno, onCrearTurno }) {
  const theme = useTheme()
  const columnas = modo === 'dia' ? 1 : 7
  const maxVisibles = MAX_VISIBLES[modo]
  const minAltura = MIN_ALTURA[modo]

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      {columnas === 7 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid', borderColor: 'divider' }}>
          {celdas.slice(0, 7).map((c) => (
            <Typography
              key={c.fecha}
              variant="caption"
              sx={{ textAlign: 'center', py: 1, fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary', borderLeft: '1px solid', borderColor: 'divider', '&:first-of-type': { borderLeft: 'none' } }}
            >
              {fmtWeekdayShort(c.date)}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {celdas.map((c) => {
          const turnosDia = turnos
            .filter((t) => String(t.fecha_hora).startsWith(c.fecha))
            .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
          const visibles = turnosDia.slice(0, maxVisibles === Infinity ? undefined : maxVisibles)
          const restantes = turnosDia.length - visibles.length

          return (
            <Box
              key={c.fecha}
              role="gridcell"
              tabIndex={c.cerrado ? undefined : 0}
              aria-label={c.cerrado ? `${fmtWeekdayShort(c.date)} ${c.date.getDate()} (cerrado)` : `${fmtWeekdayShort(c.date)} ${c.date.getDate()} · agregar turno`}
              onClick={(e) => {
                if (e.target === e.currentTarget || e.currentTarget.contains(e.target)) {
                  const yaEsUnaPastilla = e.target.closest('[data-pastilla]')
                  if (!yaEsUnaPastilla && !c.cerrado) onCrearTurno(`${c.fecha}T09:00`)
                }
              }}
              onKeyDown={(e) => {
                if (!c.cerrado && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onCrearTurno(`${c.fecha}T09:00`)
                }
              }}
              sx={{
                minHeight: minAltura,
                p: modo === 'mes' ? 0.75 : 1.25,
                borderLeft: '1px solid',
                borderTop: columnas === 1 ? 'none' : '1px solid',
                borderColor: 'divider',
                bgcolor: c.esHoy ? (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.14 : 0.06) : c.cerrado ? 'action.hover' : 'transparent',
                opacity: c.delMes ? 1 : 0.4,
                cursor: c.cerrado ? 'default' : 'pointer',
                '&:hover': c.cerrado ? undefined : { bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.1 : 0.04) },
                '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
                '&:first-of-type': { borderLeft: 'none' },
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Box
                  sx={{
                    width: modo === 'mes' ? 22 : 26,
                    height: modo === 'mes' ? 22 : 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: c.esHoy ? 'primary.main' : 'transparent',
                    color: c.esHoy ? 'primary.contrastText' : 'text.primary',
                    fontWeight: 800,
                    fontSize: modo === 'mes' ? 12 : 14,
                  }}
                >
                  {c.date.getDate()}
                </Box>
                {modo !== 'mes' && c.cerrado && (
                  <Typography variant="caption" color="text.secondary">
                    Cerrado
                  </Typography>
                )}
              </Stack>

              <Stack spacing={0.5}>
                {visibles.filter((t) => t.fecha_hora).map((t) => {
                  const meta = turnoEstadoMeta[t.estado] ?? { label: t.estado, color: 'default' }
                  const paletteColor = theme.palette[meta.color] ?? theme.palette.grey
                  const d = new Date(t.fecha_hora)
                  const fin = new Date(d.getTime() + (t.duracionMin ?? 60) * 60000)
                  const vehLinea = fmtVehiculo(t.vehiculo)
                  return (
                    <Box
                      key={t.id}
                      data-pastilla
                      role="button"
                      tabIndex={0}
                      aria-label={`Turno ${t.vehiculo?.cliente?.nombre ?? 'sin cliente'} · ${pad(d.getHours())}:${pad(d.getMinutes())}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAbrirTurno(t)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation()
                          e.preventDefault()
                          onAbrirTurno(t)
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        borderLeft: `3px solid ${paletteColor.main}`,
                        bgcolor: alpha(paletteColor.main, theme.palette.mode === 'dark' ? 0.18 : 0.09),
                        px: 0.75,
                        py: modo === 'mes' ? 0.25 : 0.5,
                        opacity: t.estado === 'cancelado' ? 0.55 : 1,
                        transition: 'transform 0.12s ease',
                        '&:hover': { transform: 'translateX(2px)' },
                        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: modo === 'mes' ? 10.5 : 12 }} noWrap>
                        {pad(d.getHours())}:{pad(d.getMinutes())}–{pad(fin.getHours())}:{pad(fin.getMinutes())} · {t.vehiculo?.cliente?.nombre ?? 'Sin cliente'}
                      </Typography>
                      {modo !== 'mes' && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {t.serviciosNombres ?? t.servicio?.nombre ?? 'Turno'}
                        </Typography>
                      )}
                      {modo !== 'mes' && vehLinea && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {vehLinea}
                        </Typography>
                      )}
                      {modo === 'mes' && vehLinea && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: 9.5 }}>
                          {vehLinea}
                        </Typography>
                      )}
                      {modo === 'dia' && (
                        <Chip size="small" label={meta.label} color={meta.color} sx={{ height: 18, fontSize: 10, mt: 0.4, '& .MuiChip-label': { px: 0.75 } }} />
                      )}
                      {t.orden_trabajo && (
                        <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 700, color: 'success.main', fontSize: modo === 'mes' ? 9 : 10.5, lineHeight: 1.3 }}>
                          ✓ Orden #{t.orden_trabajo.id}
                        </Typography>
                      )}
                    </Box>
                  )
                })}
                {restantes > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, pl: 0.5 }}>
                    +{restantes} más
                  </Typography>
                )}
                {turnosDia.length === 0 && !c.cerrado && modo === 'dia' && (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', mt: 1 }}>
                    <AddIcon sx={{ fontSize: 15 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Tocá para agregar un turno
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

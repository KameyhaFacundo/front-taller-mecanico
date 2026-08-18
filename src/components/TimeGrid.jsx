import { useMemo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { turnoEstadoMeta } from '../utils/meta'
import { fmtWeekdayShort } from '../utils/format'

// Coincide con DisponibilidadService::HORA_INICIO/HORA_FIN en el backend —
// única fuente de horario del taller, compartida también por el bot de WA.
const HORA_INICIO = 8
const HORA_FIN = 20
const ALTURA_HORA = 64
const TOTAL_HORAS = HORA_FIN - HORA_INICIO
const ALTURA_TOTAL = TOTAL_HORAS * ALTURA_HORA

const pad = (n) => String(n).padStart(2, '0')
const horas = Array.from({ length: TOTAL_HORAS }, (_, i) => HORA_INICIO + i)

/**
 * Grilla horaria tipo Google Calendar (Día = 1 columna, Semana = 7) — horas
 * en el eje izquierdo, turnos como bloques posicionados/altos según su
 * horario y duración real.
 */
export default function TimeGrid({ dias, turnos, onCrearTurno, onAbrirTurno }) {
  const theme = useTheme()

  const turnosPorDia = useMemo(() => {
    const map = {}
    for (const d of dias) map[d.fecha] = []
    for (const t of turnos) {
      const fecha = String(t.fecha_hora).slice(0, 10)
      if (map[fecha]) map[fecha].push(t)
    }
    return map
  }, [dias, turnos])

  const handleColClick = (fecha, e) => {
    if (e.target.closest('[data-evento]')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const horaClickeada = HORA_INICIO + y / ALTURA_HORA
    const redondeada = Math.round(horaClickeada * 2) / 2
    const hh = Math.min(HORA_FIN - 1, Math.max(HORA_INICIO, Math.floor(redondeada)))
    const mm = redondeada % 1 === 0.5 ? 30 : 0
    onCrearTurno(`${fecha}T${pad(hh)}:${pad(mm)}`)
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 56, flexShrink: 0 }} />
        {dias.map((d) => (
          <Box key={d.fecha} sx={{ flex: 1, textAlign: 'center', py: 1.25, borderLeft: '1px solid', borderColor: 'divider', '&:first-of-type': { borderLeft: 'none' } }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary', display: 'block' }}>
              {fmtWeekdayShort(d.date)}
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                mx: 'auto',
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: d.esHoy ? 'primary.main' : 'transparent',
                color: d.esHoy ? 'primary.contrastText' : 'text.primary',
                fontWeight: 500,
                fontSize: 24,
              }}
            >
              {d.date.getDate()}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', maxHeight: 620, overflowY: 'auto', pt: 1 }}>
        <Box sx={{ width: 56, flexShrink: 0 }}>
          {horas.map((h) => (
            <Box key={h} sx={{ height: ALTURA_HORA, position: 'relative' }}>
              <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 0, right: 8, transform: 'translateY(-50%)', fontSize: 11, bgcolor: 'background.paper', px: 0.25 }}>
                {pad(h)}:00
              </Typography>
            </Box>
          ))}
        </Box>

        {dias.map((d) => {
          const turnosDia = (turnosPorDia[d.fecha] ?? []).sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
          return (
            <Box
              key={d.fecha}
              role="gridcell"
              tabIndex={d.cerrado ? undefined : 0}
              aria-label={d.cerrado ? `${fmtWeekdayShort(d.date)} ${d.date.getDate()} (cerrado)` : `${fmtWeekdayShort(d.date)} ${d.date.getDate()} · agregar turno`}
              onClick={(e) => !d.cerrado && handleColClick(d.fecha, e)}
              onKeyDown={(e) => {
                if (!d.cerrado && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onCrearTurno(`${d.fecha}T09:00`)
                }
              }}
              sx={{
                flex: 1,
                position: 'relative',
                borderLeft: '1px solid',
                borderColor: 'divider',
                cursor: d.cerrado ? 'default' : 'pointer',
                bgcolor: d.esHoy ? (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.06 : 0.03) : d.cerrado ? 'action.hover' : 'transparent',
                '&:first-of-type': { borderLeft: 'none' },
                '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
              }}
            >
              {horas.map((h) => (
                <Box key={h} sx={{ height: ALTURA_HORA, borderTop: '1px solid', borderColor: 'divider' }} />
              ))}

              {turnosDia.filter((t) => t.fecha_hora).map((t) => {
                const meta = turnoEstadoMeta[t.estado] ?? { label: t.estado, color: 'default' }
                const paletteColor = theme.palette[meta.color] ?? theme.palette.grey
                const inicio = new Date(t.fecha_hora)
                const horaInicio = inicio.getHours() + inicio.getMinutes() / 60
                const duracionH = (t.duracionMin ?? 60) / 60

                let top = ((horaInicio - HORA_INICIO) / TOTAL_HORAS) * ALTURA_TOTAL
                let height = (duracionH / TOTAL_HORAS) * ALTURA_TOTAL - 2
                if (top < 0) {
                  height += top
                  top = 0
                }
                if (top + height > ALTURA_TOTAL) height = ALTURA_TOTAL - top
                height = Math.max(18, height)

                return (
                  <Box
                    key={t.id}
                    data-evento
                    role="button"
                    tabIndex={0}
                    aria-label={`Turno ${t.vehiculo?.cliente?.nombre ?? 'sin cliente'} · ${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`}
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
                      position: 'absolute',
                      top,
                      left: 4,
                      right: 4,
                      height,
                      borderRadius: 1,
                      borderLeft: `3px solid ${paletteColor.main}`,
                      bgcolor: alpha(paletteColor.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                      px: 0.75,
                      py: 0.25,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      zIndex: 2,
                      opacity: t.estado === 'cancelado' ? 0.55 : 1,
                      transition: 'transform 0.12s ease',
                      '&:hover': { transform: 'scale(1.01)' },
                      '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: 11.5, lineHeight: 1.25 }} noWrap>
                      {pad(inicio.getHours())}:{pad(inicio.getMinutes())} · {t.vehiculo?.cliente?.nombre ?? 'Sin cliente'}
                    </Typography>
                    {height > 34 && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: 10.5, lineHeight: 1.2 }}>
                        {t.serviciosNombres ?? t.servicio?.nombre ?? 'Turno'}
                      </Typography>
                    )}
                    {t.orden_trabajo && (
                      <Typography variant="caption" noWrap sx={{ display: 'block', fontSize: 10, lineHeight: 1.2, fontWeight: 700, color: 'success.main' }}>
                        ✓ Orden #{t.orden_trabajo.id}
                      </Typography>
                    )}
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

import { Box, Skeleton, Typography, useTheme } from '@mui/material'
import { pagoMetodoMeta } from '../utils/meta'
import { fmtMoney, fmtMoneyShort } from '../utils/format'

// Redondea hacia arriba a un número "lindo" (1/2/5 × 10^n) para que el eje Y
// del gráfico de barras no muestre valores como "$83.417".
function niceCeil(value) {
  if (value <= 0) return 1
  const exp = Math.floor(Math.log10(value))
  const base = 10 ** exp
  const norm = value / base
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return niceNorm * base
}

function labelFor(key, monthly) {
  if (monthly) {
    const [y, m] = key.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
  }
  const day = key.split('-')[2]
  return String(Number(day))
}

const colorOf = (theme, muiColor) => (muiColor === 'default' ? theme.palette.grey[500] : theme.palette[muiColor]?.main ?? theme.palette.primary.main)

// Gráfico de barras (ingresos vs. egresos) por día o por mes, según el rango
// activo. SVG a mano: la app no trae ninguna librería de gráficos y esto
// evita sumar una dependencia solo para un par de vistas.
export function FlujoChart({ data, loading, monthly }) {
  const theme = useTheme()
  const width = 720
  const height = 220
  const padLeft = 50
  const padBottom = 26
  const padTop = 12
  const chartW = width - padLeft - 14
  const chartH = height - padTop - padBottom

  if (loading) return <Skeleton variant="rounded" height={height} />
  if (data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sin movimientos en el período.
        </Typography>
      </Box>
    )
  }

  const maxVal = Math.max(1, ...data.flatMap((d) => [d.ingresos, d.egresos]))
  const niceMax = niceCeil(maxVal)
  const groupW = chartW / data.length
  const barW = Math.min(20, groupW * 0.32)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f))
  const labelEvery = Math.max(1, Math.ceil(data.length / 14))

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Ingresos y egresos por período">
        {yTicks.map((t) => {
          const y = padTop + chartH - (t / niceMax) * chartH
          return (
            <g key={t}>
              <line x1={padLeft} x2={width - 14} y1={y} y2={y} stroke={theme.palette.divider} strokeWidth={1} />
              <text x={padLeft - 8} y={y + 3} textAnchor="end" fontSize={10} fill={theme.palette.text.secondary}>
                {fmtMoneyShort(t)}
              </text>
            </g>
          )
        })}
        {data.map((d, i) => {
          const groupX = padLeft + i * groupW
          const hIngreso = (d.ingresos / niceMax) * chartH
          const hEgreso = (d.egresos / niceMax) * chartH
          const xIngreso = groupX + groupW / 2 - barW - 2
          const xEgreso = groupX + groupW / 2 + 2
          const label = labelFor(d.key, monthly)
          return (
            <g key={d.key}>
              <rect x={xIngreso} y={padTop + chartH - hIngreso} width={barW} height={Math.max(hIngreso, d.ingresos > 0 ? 2 : 0)} rx={2} fill={theme.palette.success.main}>
                <title>{`${label} · Ingresos: ${fmtMoney(d.ingresos)}`}</title>
              </rect>
              <rect x={xEgreso} y={padTop + chartH - hEgreso} width={barW} height={Math.max(hEgreso, d.egresos > 0 ? 2 : 0)} rx={2} fill={theme.palette.error.main}>
                <title>{`${label} · Egresos: ${fmtMoney(d.egresos)}`}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={groupX + groupW / 2} y={height - 8} textAnchor="middle" fontSize={10} fill={theme.palette.text.secondary}>
                  {label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

// Dona de proporción de ingresos por método de pago, con el total en el centro.
export function MetodoDonut({ data }) {
  const theme = useTheme()
  const total = data.reduce((acc, m) => acc + Number(m.total), 0)
  const size = 132
  const strokeW = 20
  const r = (size - strokeW) / 2
  const circumference = 2 * Math.PI * r

  if (total <= 0) return null

  let offsetAcc = 0
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Proporción de ingresos por método de pago">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.action.hover} strokeWidth={strokeW} />
        {data.map((m) => {
          const frac = Number(m.total) / total
          const dash = frac * circumference
          const segment = (
            <circle
              key={m.metodo}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={colorOf(theme, pagoMetodoMeta[m.metodo]?.color)}
              strokeWidth={strokeW}
              strokeDasharray={`${Math.max(dash - 1.5, 0)} ${circumference}`}
              strokeDashoffset={-offsetAcc}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            >
              <title>{`${pagoMetodoMeta[m.metodo]?.label ?? m.metodo}: ${fmtMoney(m.total)} (${Math.round(frac * 100)}%)`}</title>
            </circle>
          )
          offsetAcc += dash
          return segment
        })}
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Total
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {fmtMoneyShort(total)}
        </Typography>
      </Box>
    </Box>
  )
}

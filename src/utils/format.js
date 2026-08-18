// El patrón de moneda en es-AR difiere entre ICU (Node: "$ 1.234,50") y
// navegador ("$1.234,50"). Se normaliza el espacio tras el símbolo para que el
// resultado sea idéntico en todos los entornos.
const normArs = (s) => s.replace(/^\$\u00A0/, '$').replace(/^\$\s/, '$')

export const fmtMoney = (n) =>
  n == null || Number.isNaN(Number(n))
    ? '—'
    : normArs(Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }))

export const fmtMoneyShort = (n) => {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const value = Number(n)
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}k`
  return `${sign}$${abs.toLocaleString('es-AR')}`
}

export const fmtNum = (n) => (n == null || Number.isNaN(Number(n)) ? '—' : Number(n).toLocaleString('es-AR'))

// Pluraliza sustantivos en español para mensajes: "1 vehículo" / "3 vehículos".
// Vocales → +s, consonantes → +es (proveedor → proveedores, fila → filas).
export const plural = (n, singular) => {
  const pluralForm = /[aeiouáéíóú]$/.test(singular) ? `${singular}s` : `${singular}es`
  return `${n} ${n === 1 ? singular : pluralForm}`
}

// Convierte a número aceptando formatos locales (coma o punto decimal y
// separadores de miles) y símbolos de moneda: "AR$ 1.234,50", "$1.234,50",
// "1.234,50" o "1234.5" dan 1234.5. Devuelve NaN si no se puede interpretar.
export const parseNumero = (value) => {
  if (value == null || value === '') return NaN
  if (typeof value === 'number') return value
  const s = String(value).trim().replace(/[^0-9.,-]/g, '')
  if (!s) return NaN
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  const decSep = lastComma > lastDot ? ',' : '.'
  const thousandsSep = decSep === ',' ? '.' : ','
  const normalized = s.split(thousandsSep).join('').replace(decSep, '.')
  const n = Number(normalized)
  return Number.isNaN(n) ? NaN : n
}

// 'YYYY-MM-DD' is parsed by JS as UTC midnight, which in timezones behind UTC
// (e.g. Argentina) shows the previous day. Parse date-only strings at local
// noon so dates render as written.
const parseFecha = (date) => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return new Date(date + 'T12:00:00')
  return new Date(date)
}

export const fmtDate = (date) => {
  if (!date) return '—'
  const d = parseFecha(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const fmtDateTime = (date) => {
  if (!date) return '—'
  const d = parseFecha(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}

export const fmtTime = (date) => {
  if (!date) return '—'
  const d = parseFecha(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

// Formato compacto para tarjetas/tablas: "16 ago 21:28". Se arma manualmente
// para que no dependa del patrón de ICU (Node vs navegador) ni del año.
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const fmtDateTimeShort = (date) => {
  if (!date) return '—'
  const d = parseFecha(date)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${dd} ${MESES_CORTOS[d.getMonth()]} ${hh}:${mm}`
}

export const fmtVehiculo = (v) => {
  if (!v) return ''
  return [`${v.marca ?? ''} ${v.modelo ?? ''}`.trim(), v.anio ? String(v.anio) : null, v.patente, v.kilometros != null ? `${Number(v.kilometros).toLocaleString('es-AR')} km` : null]
    .filter(Boolean)
    .join(' · ')
}

// 'short' weekday via toLocaleDateString comes back as "lun." in es-AR (with
// a trailing period) — this gives the clean 3-letter Google Calendar style.
const DIAS_CORTOS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
export const fmtWeekdayShort = (date) => DIAS_CORTOS[date.getDay()]

export const fmtDayName = (date) => {
  if (!date) return '—'
  const d = parseFecha(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const toISODate = (date) => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

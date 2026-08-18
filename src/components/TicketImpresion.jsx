import { Box, Divider, Typography } from '@mui/material'

// Recibo/ticket imprimible y reutilizable. Los datos llegan ya formateados:
//   titulo   → "Orden de trabajo", "Movimiento de Caja", "Compra", ...
//   numero   → id del documento
//   fecha    → texto formateado
//   meta     → [{ label, value }] campos de cabecera (cliente, vehículo, ...)
//   items    → [{ descripcion, detalle, subtotal }]
//   totales  → [{ label, value }]
//   notas    → [string] líneas al pie (pagos registrados, estado, ...)
export default function TicketImpresion({ titulo, numero, fecha, meta = [], items = [], totales = [], notas = [] }) {
  return (
    <Box id="ticket-print" sx={{ bgcolor: '#fff', color: '#111', fontFamily: 'Inter, sans-serif' }}>
      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Exe-Mecanica
        </Typography>
        <Typography variant="caption" sx={{ color: '#555' }}>
          Gestión integral del taller
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#ccc' }} />

      <Box sx={{ py: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {titulo} {numero != null ? `#${numero}` : ''}
          </Typography>
          {fecha && (
            <Typography variant="caption" sx={{ color: '#555' }}>
              {fecha}
            </Typography>
          )}
        </Box>
        {meta.map((fila) => (
          <Typography key={fila.label} variant="body2" sx={{ lineHeight: 1.7 }}>
            {fila.label}: <strong>{fila.value}</strong>
          </Typography>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#ccc' }} />

      <Box sx={{ py: 1.5 }}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.descripcion}
              </Typography>
              {item.detalle && (
                <Typography variant="caption" sx={{ color: '#555' }}>
                  {item.detalle}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {item.subtotal}
            </Typography>
          </Box>
        ))}
        {items.length === 0 && (
          <Typography variant="body2" sx={{ color: '#555' }}>
            Sin items
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: '#ccc' }} />

      <Box sx={{ py: 1.5 }}>
        {totales.map((total) => (
          <Box key={total.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.2 }}>
            <Typography variant="body2">{total.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {total.value}
            </Typography>
          </Box>
        ))}
        {notas.map((nota, i) => (
          <Typography key={i} variant="caption" sx={{ display: 'block', color: '#555', mt: 0.5 }}>
            {nota}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#ccc' }} />

      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#555', mt: 2 }}>
        ¡Gracias por elegirnos!
      </Typography>
    </Box>
  )
}
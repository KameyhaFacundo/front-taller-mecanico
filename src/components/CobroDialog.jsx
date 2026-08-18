import { Box, Button, List, ListItem, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AppDialog from './AppDialog'
import { fmtDateTime, fmtMoney } from '../utils/format'
import { pagoMetodoMeta } from '../utils/meta'

export default function CobroDialog({ open, onClose, title, subtitle, orden, ordenes = [], ordenesOnChange, form, setForm, saving = false, onConfirm }) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<ReceiptIcon />}
      iconBg="success.main"
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} variant="contained" color="success" disabled={saving}>
            {saving ? 'Registrando…' : 'Registrar cobro'}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        {ordenes.length > 1 && (
          <TextField
            select
            label="Orden a cobrar"
            value={orden?.id ?? ''}
            onChange={(e) => ordenesOnChange?.(Number(e.target.value))}
            fullWidth
          >
            {ordenes.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                #{o.id} · {o.vehiculo ? `${o.vehiculo.marca} ${o.vehiculo.modelo} ${o.vehiculo.patente}` : ''} · Saldo {fmtMoney(o.saldo_pendiente)}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {[
            { label: 'Total', value: fmtMoney(orden?.total), color: 'text.primary' },
            { label: 'Pagado', value: fmtMoney(orden?.total_pagado), color: 'success.main' },
            { label: 'Saldo', value: fmtMoney(orden?.saldo_pendiente), color: 'error.main' },
          ].map((cell) => (
            <Box key={cell.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {cell.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: cell.color }}>
                {cell.value}
              </Typography>
            </Box>
          ))}
        </Box>
        <TextField label="Monto" name="monto" type="number" value={form.monto} onChange={(e) => setForm((prev) => ({ ...prev, monto: e.target.value }))} fullWidth slotProps={{ htmlInput: { min: 0 } }} autoFocus />
        <TextField select label="Método" name="metodo" value={form.metodo} onChange={(e) => setForm((prev) => ({ ...prev, metodo: e.target.value }))} fullWidth>
          {Object.entries(pagoMetodoMeta).map(([metodo, meta]) => (
            <MenuItem key={metodo} value={metodo}>
              {meta.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Referencia (opcional)" name="referencia" value={form.referencia} onChange={(e) => setForm((prev) => ({ ...prev, referencia: e.target.value }))} fullWidth />
        {(orden?.pagos?.length ?? 0) > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Pagos previos
            </Typography>
            <List dense disablePadding>
              {(orden?.pagos ?? []).map((pago) => (
                <ListItem key={pago.id} disableGutters>
                  <ListItemText primary={`${pagoMetodoMeta[pago.metodo]?.label ?? pago.metodo} — ${fmtMoney(pago.monto)}`} secondary={pago.referencia || fmtDateTime(pago.fecha)} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Stack>
    </AppDialog>
  )
}
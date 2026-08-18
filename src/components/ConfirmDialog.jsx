import { Button, Typography } from '@mui/material'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import { useNotify } from '../context/useNotify'
import AppDialog from './AppDialog'

export default function ConfirmDialog({ open, title = 'Confirmar', message, confirmLabel = 'Eliminar', danger = true, busy = false, onConfirm, onClose }) {
  const notify = useNotify()

  const handleConfirm = async () => {
    try {
      await onConfirm?.()
    } catch {
      notify.error('No se pudo completar la operación.')
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      subtitle="Confirmá la acción para continuar."
      icon={<ReportProblemIcon />}
      iconBg={danger ? 'error.main' : 'primary.main'}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onClose} disabled={busy} autoFocus>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color={danger ? 'error' : 'primary'} variant="contained" disabled={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </AppDialog>
  )
}
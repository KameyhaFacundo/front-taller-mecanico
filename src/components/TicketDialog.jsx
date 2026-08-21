import { Button } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import AppDialog from './AppDialog'
import TicketImpresion from './TicketImpresion'
import { useAuth } from '../hooks/useAuth'

// Modal que muestra un ticket imprimible. Recibe las mismas props que
// TicketImpresion (titulo, numero, fecha, meta, items, totales, notas).
export default function TicketDialog({ open, onClose, ...ticket }) {
  const { activeTaller } = useAuth()
  const nombreTaller = ticket.nombreTaller ?? activeTaller?.nombre ?? 'Taller'
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Ticket"
      icon={<PrintIcon />}
      iconBg="primary.main"
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onClose}>Cerrar</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Imprimir
          </Button>
        </>
      }
    >
      <TicketImpresion {...ticket} nombreTaller={nombreTaller} />
    </AppDialog>
  )
}
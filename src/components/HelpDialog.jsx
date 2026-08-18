import { Fragment, useState } from 'react'
import { Box, Button, Chip, Divider, IconButton, Stack, Typography } from '@mui/material'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BuildIcon from '@mui/icons-material/Build'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AssessmentIcon from '@mui/icons-material/Assessment'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AppDialog from './AppDialog'
import { turnoEstadoMeta, ordenEstadoMeta } from '../utils/meta'

// Guía del flujo completo del sistema. Se abre desde el botón "Ayuda" de la
// barra superior y está disponible en todas las páginas del panel.
export default function HelpDialog() {
  const [open, setOpen] = useState(false)

  const Flujo = ({ pasos, meta }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
      {pasos.map((p, i) => (
        <Fragment key={p}>
          <Chip size="small" label={meta[p]?.label ?? p} color={meta[p]?.color ?? 'default'} sx={{ fontWeight: 700 }} />
          {i < pasos.length - 1 && <ArrowForwardIcon fontSize="small" color="disabled" />}
        </Fragment>
      ))}
    </Box>
  )

  const Seccion = ({ icon, titulo, children }) => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {titulo}
        </Typography>
      </Stack>
      <Box>{children}</Box>
    </Box>
  )

  const Linea = ({ children }) => (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, display: 'flex', gap: 1 }}>
      <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>
        •
      </Box>
      <Box component="span">{children}</Box>
    </Typography>
  )

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label="Ayuda"
        title="Ayuda"
        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        <HelpOutlineOutlinedIcon fontSize="small" />
      </IconButton>

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Ayuda · Cómo funciona el sistema"
        subtitle="Guía del flujo completo: desde que el cliente pide el turno hasta que sale del taller."
        icon={<HelpOutlineOutlinedIcon />}
        iconBg="primary.main"
        maxWidth="md"
        actions={
          <Button onClick={() => setOpen(false)} variant="contained">
            Entendido
          </Button>
        }
      >
        <Box sx={{ maxHeight: '60svh', overflowY: 'auto', pr: 0.5 }}>
          <Seccion icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />} titulo="1 · El circuito del turno">
            <Flujo pasos={['pendiente_asignar', 'confirmado', 'completado']} meta={turnoEstadoMeta} />
            <Linea>
              El cliente pide el turno solo desde la página pública (<strong>/agendar</strong>), por WhatsApp o por teléfono. Queda en{' '}
              <strong>{turnoEstadoMeta.pendiente_asignar.label}</strong>.
            </Linea>
            <Linea>
              El taller llama al cliente y lo confirma → <strong>{turnoEstadoMeta.confirmado.label}</strong>. Si no va, se marca{' '}
              <strong>{turnoEstadoMeta.cancelado.label}</strong>.
            </Linea>
            <Linea>
              Cuando el vehículo entra al taller se genera la <strong>orden de trabajo</strong> desde el turno; el turno pasa solo a{' '}
              <strong>{turnoEstadoMeta.completado.label}</strong>.
            </Linea>
            <Linea>
              El {turnoEstadoMeta.completado.label} directo queda como atajo para trabajos rápidos que no necesitan orden.
            </Linea>
            <Linea>
              Un turno puede incluir <strong>varios servicios</strong>: se suman las duraciones y el horario de salida se calcula solo.
            </Linea>
          </Seccion>

          <Seccion icon={<AssignmentIcon sx={{ fontSize: 18 }} />} titulo="2 · Órdenes de trabajo">
            <Flujo pasos={['pendiente', 'en_ejecucion', 'terminado', 'entregado']} meta={ordenEstadoMeta} />
            <Linea>La orden es el trabajo real del auto adentro del taller: se le cargan productos y mano de obra.</Linea>
            <Linea>Cada ítem se puede marcar como hecho; el estado avanza de a un paso hasta <strong>Entregado</strong>.</Linea>
            <Linea>Al entregar se cobra desde la orden (efectivo, transferencia, tarjeta, etc.) y el cobro queda registrado en Caja.</Linea>
          </Seccion>

          <Seccion icon={<PaymentsIcon sx={{ fontSize: 18 }} />} titulo="3 · Caja">
            <Linea>Movimientos de <strong>ingresos</strong> (cobros de órdenes) y <strong>egresos</strong> (gastos del taller).</Linea>
            <Linea>El <strong>resumen</strong> muestra la caja del día con lo ingresado y lo gastado.</Linea>
          </Seccion>

          <Seccion icon={<Inventory2Icon sx={{ fontSize: 18 }} />} titulo="4 · Inventario">
            <Linea>
              <strong>Productos</strong>: los productos/insumos que se venden o se usan en las órdenes.
            </Linea>
            <Linea>
              <strong>Compras</strong>: cuando se repone stock a un proveedor; el stock se actualiza y el gasto va a Caja.
            </Linea>
            <Linea>El stock bajo se avisa en el Panel y en Productos para no quedarse sin insumos.</Linea>
          </Seccion>

          <Seccion icon={<BuildIcon sx={{ fontSize: 18 }} />} titulo="5 · Servicios (Configuración)">
            <Linea>Catálogo de trabajos con <strong>duración</strong> y <strong>precio base</strong> (se precarga al crear la orden).</Linea>
            <Linea>El toggle <strong>"autogestionable"</strong> hace que el servicio aparezca en la página pública de turnos.</Linea>
            <Linea>Si el cliente pide un servicio que no está cargado, se crea solo y lo ves acá para ajustarlo.</Linea>
          </Seccion>

          <Seccion icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />} titulo="6 · Clientes, Vehículos, Marcas y Modelos">
            <Linea>Los <strong>clientes</strong> se deduplican por teléfono y sus <strong>vehículos</strong> por patente.</Linea>
            <Linea>
              Al cargar un vehículo, <strong>marca</strong> y <strong>modelo</strong> se eligen de la base o se escriben nuevos (opción "Usar/Crear").
            </Linea>
          </Seccion>

          <Seccion icon={<AssessmentIcon sx={{ fontSize: 18 }} />} titulo="7 · Panel (inicio)">
            <Linea>Financiero del mes, saldo por cobrar, servicios más pedidos, stock bajo y agenda de hoy, con tendencia de facturación.</Linea>
            <Linea>Las <strong>tarjetas y alertas son clickeables</strong>: llevan directo a la sección correspondiente (p.ej. el saldo por cobrar abre la orden lista para cobrar).</Linea>
          </Seccion>

          <Seccion icon={<FileDownloadIcon sx={{ fontSize: 18 }} />} titulo="8 · Importar / Exportar">
            <Linea>Cada listado tiene botones para <strong>exportar a Excel</strong> y <strong>importar</strong> desde Excel.</Linea>
            <Linea>Al importar se muestra una <strong>vista previa</strong> antes de confirmar, y se avisa cuántas filas fallaron y por qué.</Linea>
          </Seccion>

          <Seccion icon={<AdminPanelSettingsIcon sx={{ fontSize: 18 }} />} titulo="9 · Usuarios (solo administrador)">
            <Linea>Alta de empleados con rol <strong>admin</strong> (todo el sistema) o <strong>empleado</strong> (gestión diaria).</Linea>
          </Seccion>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Página pública de turnos: <strong>/agendar</strong> — el cliente se agenda solo.
          </Typography>
        </Box>
      </AppDialog>
    </>
  )
}
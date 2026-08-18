export const ordenEstadoMeta = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  en_ejecucion: { label: 'En ejecución', color: 'primary' },
  terminado: { label: 'Terminado', color: 'success' },
  entregado: { label: 'Entregado', color: 'info' },
}

export const ordenNextEstados = {
  pendiente: ['en_ejecucion'],
  en_ejecucion: ['terminado'],
  terminado: ['entregado'],
  entregado: [],
}

export const turnoEstadoMeta = {
  pendiente_asignar: { label: 'A confirmar', color: 'warning' },
  confirmado: { label: 'Confirmado', color: 'info' },
  completado: { label: 'Completado', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
}

export const turnoNextEstados = {
  pendiente_asignar: ['confirmado', 'cancelado'],
  confirmado: ['completado', 'cancelado'],
  completado: [],
  cancelado: [],
}

export const turnoOrigenMeta = {
  web: { label: 'Web (autoagendado)', color: 'info' },
  whatsapp: { label: 'WhatsApp', color: 'success' },
  manual: { label: 'Taller', color: 'default' },
  auto: { label: 'Autogestionado', color: 'secondary' },
}

export const pagoMetodoMeta = {
  efectivo: { label: 'Efectivo', color: 'success' },
  transferencia: { label: 'Transferencia', color: 'info' },
  tarjeta: { label: 'Tarjeta', color: 'warning' },
  mercadopago: { label: 'Mercado Pago', color: 'secondary' },
  otro: { label: 'Otro', color: 'default' },
}

export const compraEstadoMeta = {
  pagado: { label: 'Pagado', color: 'success' },
  pendiente: { label: 'Pendiente', color: 'warning' },
}

import { ordenEstadoMeta } from './meta.js'
import { fmtMoney } from './format.js'

// Número del taller para WhatsApp. Configurable por entorno:
// .env -> VITE_WA_TALLER=5491122334455 (solo dígitos, con código de país).
// Sin configurar queda vacío y el link se desactiva (nunca mandar mensajes a
// un número hardcodeado por defecto).
export const WA_TALLER = import.meta.env.VITE_WA_TALLER || ''

export function waLink(telefono, mensaje) {
  const digits = String(telefono ?? '').replace(/\D/g, '')
  if (!digits) return null
  const url = `https://wa.me/${digits}`
  if (mensaje) return `${url}?text=${encodeURIComponent(mensaje)}`
  return url
}

export function waLinkTaller(mensaje) {
  return waLink(WA_TALLER, mensaje)
}

export function waMensajeTurno(nombre) {
  return `Hola 👋, soy ${nombre}. Quiero solicitar un turno en el taller.`
}

// Cuerpo del mensaje según el estado de la orden: cada etapa tiene su propio
// texto (no solo el label pegado), para que el mensaje se lea natural.
const ordenEstadoTexto = {
  pendiente: 'tu vehículo ya está en el taller, pendiente de que empecemos a trabajarlo. Te avisamos apenas arranquemos.',
  en_ejecucion: 'estamos trabajando en tu vehículo en este momento.',
  terminado: 'tu vehículo ya está listo. Podés pasar a retirarlo cuando quieras.',
  entregado: 'tu vehículo fue entregado. ¡Gracias por confiar en nosotros!',
}

// Mensaje para notificar al cliente el estado de su vehículo en una orden de
// trabajo (ej: "En ejecución", "Terminado"). El texto cambia según el estado.
export function waMensajeOrden(orden, vehiculo) {
  const cliente = vehiculo?.cliente?.nombre
  const vehDescripcion = [vehiculo?.marca, vehiculo?.modelo, vehiculo?.patente].filter(Boolean).join(' ')
  const saludo = cliente ? `Hola ${cliente} 👋, ` : 'Hola 👋, '
  const cuerpo = ordenEstadoTexto[orden.estado] ?? `tu vehículo está en estado *${ordenEstadoMeta[orden.estado]?.label ?? orden.estado}*.`
  return `${saludo}te escribimos del taller para contarte que ${cuerpo}${vehDescripcion ? `\n\nVehículo: ${vehDescripcion}` : ''}\nOrden #${orden.id}`
}

// Mensaje para enviarle al cliente el detalle de un presupuesto. `itemsTexto`
// es un array de líneas ya armadas (una por item) para no acoplar este
// util al modelo de repuestos/mano de obra de la página que lo llama.
export function waMensajePresupuesto(presupuesto, vehiculo, itemsTexto = []) {
  const cliente = vehiculo?.cliente?.nombre
  const vehDescripcion = [vehiculo?.marca, vehiculo?.modelo, vehiculo?.patente].filter(Boolean).join(' ')
  const saludo = cliente ? `Hola ${cliente} 👋, ` : 'Hola 👋, '
  const items = itemsTexto.length ? `\n\n${itemsTexto.join('\n')}` : ''
  const validez = presupuesto.validez_dias ? `\n\nVálido por ${presupuesto.validez_dias} día${presupuesto.validez_dias === 1 ? '' : 's'}.` : ''
  return `${saludo}te escribimos del taller con el presupuesto #${presupuesto.id}${vehDescripcion ? ` para tu vehículo (${vehDescripcion})` : ''}:${items}\n\n*Total: ${fmtMoney(presupuesto.total)}*${validez}`
}
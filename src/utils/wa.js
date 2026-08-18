import { ordenEstadoMeta } from './meta.js'

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

// Mensaje para notificar al cliente el estado de su vehículo en una orden de
// trabajo (ej: "En ejecución", "Terminado").
export function waMensajeOrden(orden, vehiculo) {
  const estado = ordenEstadoMeta[orden.estado]?.label ?? orden.estado
  const cliente = vehiculo?.cliente?.nombre
  const vehDescripcion = [vehiculo?.marca, vehiculo?.modelo, vehiculo?.patente].filter(Boolean).join(' ')
  const saludo = cliente ? `Hola ${cliente} 👋, ` : ''
  return `${saludo}te escribimos del taller para informarte el estado de tu vehículo${vehDescripcion ? ` (${vehDescripcion})` : ''} en la orden #${orden.id}:\n\n*${estado}*.`
}
import { describe, expect, it } from 'vitest'
import { WA_TALLER, waLink, waLinkTaller, waMensajeOrden, waMensajeTurno } from './wa.js'

describe('waLink', () => {
  it('construye el link wa.me solo con dígitos', () => {
    expect(waLink('+54 9 11 5555 5555', null)).toBe('https://wa.me/5491155555555')
  })

  it('codifica el mensaje como query param', () => {
    expect(waLink('5491155555555', 'Hola Juan')).toBe('https://wa.me/5491155555555?text=Hola%20Juan')
  })

  it('devuelve null sin teléfono', () => {
    expect(waLink('', 'Hola')).toBeNull()
    expect(waLink(null, 'Hola')).toBeNull()
  })
})

describe('waLinkTaller', () => {
  it('usa el número del taller configurado', () => {
    expect(waLinkTaller('Hola')).toBe(WA_TALLER ? `https://wa.me/${WA_TALLER}?text=Hola` : null)
  })
})

describe('waMensajeTurno', () => {
  it('arma el mensaje de solicitud de turno', () => {
    expect(waMensajeTurno('Juan')).toContain('Juan')
    expect(waMensajeTurno('Juan')).toContain('turno')
  })
})

describe('waMensajeOrden', () => {
  it('detalla el estado del vehículo en la orden', () => {
    const msg = waMensajeOrden({ id: 7, estado: 'en_ejecucion' }, { marca: 'Fiat', modelo: 'Argo', patente: 'AB123CD', cliente: { nombre: 'Ana' } })
    expect(msg).toContain('Ana')
    expect(msg).toContain('Fiat Argo AB123CD')
    expect(msg).toContain('#7')
    expect(msg).toContain('En ejecución')
  })

  it('tolera ordenes sin vehículo cargado', () => {
    expect(waMensajeOrden({ id: 1, estado: 'pendiente' }, null)).toContain('#1')
  })
})
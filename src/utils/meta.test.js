import { describe, expect, it } from 'vitest'
import { compraEstadoMeta, ordenEstadoMeta, ordenNextEstados, pagoMetodoMeta, turnoEstadoMeta, turnoNextEstados } from './meta.js'

describe('ordenEstadoMeta', () => {
  it('define los 4 estados del flujo de órdenes', () => {
    expect(Object.keys(ordenEstadoMeta)).toEqual(['pendiente', 'en_ejecucion', 'terminado', 'entregado'])
    expect(ordenEstadoMeta.en_ejecucion.label).toBe('En ejecución')
  })

  it('tiene transiciones lineales pendiente → entregado', () => {
    expect(ordenNextEstados.pendiente).toEqual(['en_ejecucion'])
    expect(ordenNextEstados.en_ejecucion).toEqual(['terminado'])
    expect(ordenNextEstados.terminado).toEqual(['entregado'])
    expect(ordenNextEstados.entregado).toEqual([])
  })
})

describe('turnoEstadoMeta', () => {
  it('define los estados de turnos', () => {
    expect(turnoEstadoMeta.completado.label).toBe('Completado')
    expect(turnoNextEstados.confirmado).toContain('completado')
  })
})

describe('pagoMetodoMeta', () => {
  it('define los métodos de pago', () => {
    expect(pagoMetodoMeta.efectivo.label).toBe('Efectivo')
    expect(pagoMetodoMeta.transferencia.color).toBe('info')
  })
})

describe('compraEstadoMeta', () => {
  it('define los estados de compra', () => {
    expect(compraEstadoMeta.pagado.label).toBe('Pagado')
    expect(compraEstadoMeta.pendiente.label).toBe('Pendiente')
  })
})
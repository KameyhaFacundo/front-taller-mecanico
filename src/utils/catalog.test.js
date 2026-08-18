import { describe, expect, it } from 'vitest'
import { MARCAS_MODELOS, modelosDeMarca } from './catalog.js'

describe('modelosDeMarca', () => {
  it('devuelve los modelos de una marca conocida', () => {
    expect(modelosDeMarca('Fiat')).toContain('Argo')
    expect(modelosDeMarca('Toyota')).toContain('Hilux')
  })

  it('devuelve un array vacío para marcas desconocidas', () => {
    expect(modelosDeMarca('Marca Inexistente')).toEqual([])
  })

  it('soporta marcas con caracteres especiales', () => {
    expect(MARCAS_MODELOS['Citroën']).toContain('C4 Cactus')
  })
})
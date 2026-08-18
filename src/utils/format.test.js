import { describe, expect, it } from 'vitest'
import { fmtDate, fmtDateTime, fmtDateTimeShort, fmtMoney, fmtMoneyShort, fmtNum, fmtTime, fmtVehiculo, fmtWeekdayShort, initials, parseNumero, toISODate } from './format.js'

describe('fmtMoney', () => {
  it('formatea en pesos argentinos', () => {
    expect(fmtMoney(1234.5)).toBe('$1.234,50')
  })

  it('devuelve em dash para valores inválidos', () => {
    expect(fmtMoney(null)).toBe('—')
    expect(fmtMoney(undefined)).toBe('—')
    expect(fmtMoney('abc')).toBe('—')
  })
})

describe('fmtMoneyShort', () => {
  it('abrevia millones y miles', () => {
    expect(fmtMoneyShort(1500000)).toBe('$1,5M')
    expect(fmtMoneyShort(2500)).toBe('$2,5k')
    expect(fmtMoneyShort(999)).toBe('$999')
  })

  it('respeta el signo negativo', () => {
    expect(fmtMoneyShort(-2000000)).toBe('-$2M')
  })
})

describe('fmtNum', () => {
  it('agrega separador de miles', () => {
    expect(fmtNum(1234567)).toBe('1.234.567')
  })

  it('devuelve em dash para inválidos', () => {
    expect(fmtNum(null)).toBe('—')
  })
})

describe('fmtDate / fmtTime / fmtDateTime', () => {
  // El patrón del mes corto en es-AR puede variar entre ICU (Node) y navegador
  // ("17 ago. 2026" vs "17 de ago de 2026"), así que se valida por regex.
  it('parsea fechas YYYY-MM-DD en hora local', () => {
    expect(fmtDate('2026-08-17')).toMatch(/^17 .*ago/i)
    expect(fmtDate('2026-08-17')).toContain('2026')
  })

  it('formatea hora en formato 24h', () => {
    expect(fmtTime('2026-08-17T09:30:00')).toBe('09:30')
    expect(fmtTime('2026-08-17T21:45:00')).toBe('21:45')
  })

  it('combina fecha y hora', () => {
    expect(fmtDateTime('2026-08-17T09:30:00')).toMatch(/17/i)
    expect(fmtDateTime('2026-08-17T09:30:00')).toContain('2026')
    expect(fmtDateTime('2026-08-17T09:30:00')).toContain('09:30')
  })

  it('devuelve em dash para vacíos o inválidos', () => {
    expect(fmtDate(null)).toBe('—')
    expect(fmtTime('')).toBe('—')
    expect(fmtDate('no-es-fecha')).toBe('—')
  })
})

describe('fmtDateTimeShort', () => {
  it('usa formato compacto día + mes + hora 24h', () => {
    expect(fmtDateTimeShort('2026-08-17T09:30:00')).toBe('17 ago 09:30')
    expect(fmtDateTimeShort('2026-12-05T21:45:00')).toBe('05 dic 21:45')
  })

  it('devuelve em dash para vacíos o inválidos', () => {
    expect(fmtDateTimeShort(null)).toBe('—')
    expect(fmtDateTimeShort('no-es-fecha')).toBe('—')
  })
})

describe('toISODate', () => {
  it('devuelve solo el día en formato YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-08-17T12:00:00'))).toBe('2026-08-17')
  })

  it('devuelve vacío para fechas inválidas', () => {
    expect(toISODate(new Date('invalido'))).toBe('')
  })
})

describe('fmtWeekdayShort', () => {
  it('usa etiquetas cortas sin punto, estilo Google Calendar', () => {
    expect(fmtWeekdayShort(new Date('2026-08-17T12:00:00'))).toBe('LUN')
    expect(fmtWeekdayShort(new Date('2026-08-23T12:00:00'))).toBe('DOM')
  })
})

describe('fmtVehiculo', () => {
  it('combina marca, modelo, año, patente y km', () => {
    expect(fmtVehiculo({ marca: 'Fiat', modelo: 'Argo', anio: 2020, patente: 'AB123CD', kilometros: 50000 })).toBe('Fiat Argo · 2020 · AB123CD · 50.000 km')
  })

  it('omite campos faltantes', () => {
    expect(fmtVehiculo({ marca: 'Ford', modelo: 'Ka' })).toBe('Ford Ka')
    expect(fmtVehiculo(null)).toBe('')
  })
})

describe('parseNumero', () => {
  it('acepta decimales con coma o punto', () => {
    expect(parseNumero('1.234,50')).toBe(1234.5)
    expect(parseNumero('1234,5')).toBe(1234.5)
    expect(parseNumero('1234.5')).toBe(1234.5)
    expect(parseNumero(1234.5)).toBe(1234.5)
  })

  it('devuelve NaN para vacíos o inválidos', () => {
    expect(Number.isNaN(parseNumero(''))).toBe(true)
    expect(Number.isNaN(parseNumero(null))).toBe(true)
    expect(Number.isNaN(parseNumero('abc'))).toBe(true)
  })
})

describe('initials', () => {
  it('toma las iniciales de las dos primeras palabras', () => {
    expect(initials('Juan Pérez')).toBe('JP')
    expect(initials('maría del carmen gómez')).toBe('MD')
  })

  it('maneja nombres vacíos', () => {
    expect(initials('')).toBe('')
    expect(initials(undefined)).toBe('')
  })
})
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { parseExcelFile } from './excel.js'

function buildFile(sheetRows) {
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  return new File([buffer], 'datos.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

describe('parseExcelFile', () => {
  it('normaliza headers legibles a claves snake_case', async () => {
    const file = buildFile([
      ['Stock actual', 'Teléfonos', 'Código artículo'],
      [10, '1122334455', 'AA-01'],
    ])
    const rows = await parseExcelFile(file)
    expect(rows).toEqual([{ stock_actual: 10, telefonos: '1122334455', codigo_articulo: 'AA-01' }])
  })

  it('rellena celdas vacías con string vacío', async () => {
    const file = buildFile([
      ['Marca', 'Modelo'],
      ['Fiat', ''],
    ])
    const rows = await parseExcelFile(file)
    expect(rows).toEqual([{ marca: 'Fiat', modelo: '' }])
  })
})
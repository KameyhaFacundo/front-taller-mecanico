// Los exports usan headers legibles ("Stock actual", "Teléfonos") pero los
// importadores leen claves snake_case ("stock_actual", "telefonos"). Este
// normalizador hace el round-trip export→import consistente: minúsculas, sin
// acentos, y espacios/símbolos → "_".
const normalizeKey = (key) =>
  String(key)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

// xlsx (~420 KB) se importa dinámicamente acá para que no se arrastre en el
// chunk compartido de las páginas con botones de exportar/importar: solo se
// descarga cuando el usuario realmente exporta o importa un archivo.
const loadXlsx = () => import('xlsx')

export async function exportToExcel({ filename, sheetName = 'Datos', columns, rows }) {
  const XLSX = await loadXlsx()
  const header = columns.map((column) => column.header)
  const data = rows.map((row) => columns.map((column) => column.render ? column.render(row) : row[column.key] ?? ''))
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...data])
  worksheet['!cols'] = columns.map((column) => ({ wch: Math.max(column.header.length + 2, 14) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export async function parseExcelFile(file) {
  const XLSX = await loadXlsx()
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [normalizeKey(k), v])))
}
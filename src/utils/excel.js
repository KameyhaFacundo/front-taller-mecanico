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

export async function parseExcelFile(file) {
  const XLSX = await loadXlsx()
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [normalizeKey(k), v])))
}
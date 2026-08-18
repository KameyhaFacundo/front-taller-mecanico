import { useState } from 'react'
import { Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { exportToExcel } from '../utils/excel'
import { useNotify } from '../context/useNotify'

/**
 * Pass `rows` for a static, already-in-memory list (small/unpaginated data),
 * or `rowsFetcher` (an async function returning the full array) for paginated
 * tables — exporting should cover every matching record, not just the page
 * currently on screen.
 */
export default function ExportExcelButton({ filename, sheetName, columns, rows, rowsFetcher, label = 'Exportar Excel', size = 'small', disabled, sx }) {
  const [exporting, setExporting] = useState(false)
  const notify = useNotify()

  const handleClick = async () => {
    try {
      if (rowsFetcher) {
        setExporting(true)
        const data = await rowsFetcher()
        if (!data?.length) {
          notify.error('No hay datos para exportar.')
          return
        }
        await exportToExcel({ filename, sheetName, columns, rows: data })
        return
      }
      await exportToExcel({ filename, sheetName, columns, rows })
    } catch {
      notify.error('No se pudo exportar.')
    } finally {
      setExporting(false)
    }
  }

  const isDisabled = disabled || exporting || (rows && rows.length === 0)

  return (
    <Button size={size} variant="outlined" startIcon={<FileDownloadIcon />} disabled={isDisabled} onClick={handleClick} sx={sx}>
      {exporting ? 'Exportando…' : label}
    </Button>
  )
}
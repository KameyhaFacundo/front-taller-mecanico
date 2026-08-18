import { useMemo, useRef, useState } from 'react'
import { Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { parseExcelFile } from '../utils/excel'
import { plural } from '../utils/format'
import { useNotify } from '../context/useNotify'
import AppDialog from './AppDialog'

const prettifyKey = (key) =>
  String(key)
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const MAX_PREVIEW_ROWS = 200

export default function ImportExcelButton({ onImport, label = 'Importar Excel', size = 'small', disabled }) {
  const notify = useNotify()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)

  const columns = useMemo(() => {
    if (!preview) return []
    const keys = []
    for (const row of preview.rows) {
      for (const key of Object.keys(row)) {
        if (!keys.includes(key)) keys.push(key)
      }
    }
    return keys
  }, [preview])

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const rows = await parseExcelFile(file)
      if (rows.length === 0) {
        notify.warning('El archivo no contiene filas con datos.')
        return
      }
      setPreview({ fileName: file.name, rows })
    } catch {
      notify.error('No se pudo leer el archivo. Usá un .xlsx válido.')
    }
  }

  const confirmar = async () => {
    if (!preview) return
    setBusy(true)
    try {
      await onImport(preview.rows)
      setPreview(null)
    } catch {
      // Los handlers de importación notifican internamente; acá solo se evita
      // que el modal se cierre si el import falló.
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button size={size} variant="outlined" startIcon={<FileUploadIcon />} disabled={disabled} onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" hidden onChange={handleFile} />

      <AppDialog
        open={Boolean(preview)}
        onClose={() => !busy && setPreview(null)}
        title="Vista previa de la importación"
        subtitle={preview ? `${preview.fileName} · ${plural(preview.rows.length, 'fila')} · ${plural(columns.length, 'columna')}` : ''}
        icon={<FileUploadIcon />}
        iconBg="primary.main"
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setPreview(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={confirmar} disabled={busy} startIcon={busy ? <CircularProgress size={14} /> : null}>
              {busy ? 'Importando…' : 'Confirmar importar'}
            </Button>
          </>
        }
      >
        {preview && (
          <>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {prettifyKey(column)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.rows.slice(0, MAX_PREVIEW_ROWS).map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column}>{row[column] ?? ''}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {preview.rows.length > MAX_PREVIEW_ROWS && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Mostrando las primeras {MAX_PREVIEW_ROWS} filas. Se importarán todas.
              </Typography>
            )}
          </>
        )}
      </AppDialog>
    </>
  )
}
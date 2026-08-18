import { useMemo } from 'react'
import { Box, IconButton, MenuItem, Select, Stack, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import LastPageIcon from '@mui/icons-material/LastPage'

// Windowed page list around the current page, e.g. [1, '…', 4, 5, 6, '…', 20].
const buildPageList = (current, total) => {
  const delta = 1
  const range = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i)
  }
  const withEllipsis = []
  let prev = 0
  for (const n of range) {
    if (prev && n - prev > 1) withEllipsis.push(`e${n}`)
    withEllipsis.push(n)
    prev = n
  }
  return withEllipsis
}

/**
 * Drop-in replacement for MUI's TablePagination — same prop names/call
 * signatures (`onPageChange(event, newPage)`, `onRowsPerPageChange(event)`)
 * so it wires straight into usePaginatedData, but centered with numbered
 * page pills instead of the default left/right-split bar.
 */
export default function Pagination({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange, rowsPerPageOptions = [10, 25, 50, 100], sx }) {
  const theme = useTheme()
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage))
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = Math.min(count, (page + 1) * rowsPerPage)
  const pageList = useMemo(() => buildPageList(page + 1, totalPages), [page, totalPages])

  if (count === 0) return null

  const goTo = (newPage) => onPageChange(null, Math.min(Math.max(newPage, 0), totalPages - 1))

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ alignItems: 'center', justifyContent: 'center', gap: { xs: 1.5, sm: 3 }, py: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', ...sx }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ order: { xs: 3, sm: 1 }, minWidth: 90, textAlign: { xs: 'center', sm: 'left' } }}>
        {totalPages === 1 ? `${count} ${count === 1 ? 'registro' : 'registros'}` : `${from}–${to} de ${count}`}
      </Typography>

      <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', order: 2 }}>
        <IconButton size="small" disabled={page === 0} onClick={() => goTo(0)} aria-label="Primera página">
          <FirstPageIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" disabled={page === 0} onClick={() => goTo(page - 1)} aria-label="Página anterior">
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        {pageList.map((n) =>
          typeof n === 'string' ? (
            <Typography key={n} variant="body2" color="text.secondary" sx={{ px: 0.5, userSelect: 'none' }}>
              …
            </Typography>
          ) : (
            <Box
              key={n}
              role="button"
              tabIndex={0}
              aria-label={`Ir a la página ${n}`}
              aria-current={n - 1 === page ? 'page' : undefined}
              onClick={() => goTo(n - 1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goTo(n - 1)
                }
              }}
              sx={{
                minWidth: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                bgcolor: n - 1 === page ? 'primary.main' : 'transparent',
                color: n - 1 === page ? 'primary.contrastText' : 'text.primary',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: n - 1 === page ? 'primary.main' : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08) },
                '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
              }}
            >
              {n}
            </Box>
          )
        )}
        <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => goTo(page + 1)} aria-label="Página siguiente">
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => goTo(totalPages - 1)} aria-label="Última página">
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', order: { xs: 1, sm: 3 } }}>
        <Typography variant="caption" color="text.secondary">
          Por página
        </Typography>
        <Select
          size="small"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange({ target: { value: String(e.target.value) } })}
          sx={{ minWidth: 68, '& .MuiSelect-select': { py: 0.5, fontSize: 13 } }}
        >
          {rowsPerPageOptions.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Stack>
    </Stack>
  )
}

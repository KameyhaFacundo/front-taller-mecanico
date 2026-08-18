import { InputAdornment, OutlinedInput } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import IconButton from '@mui/material/IconButton'

export default function SearchInput({ value, onChange, placeholder = 'Buscar…', width = 260, ...props }) {
  return (
    <OutlinedInput
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      sx={{ width, borderRadius: 10 }}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon fontSize="small" />
        </InputAdornment>
      }
      endAdornment={
        value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null
      }
      {...props}
    />
  )
}

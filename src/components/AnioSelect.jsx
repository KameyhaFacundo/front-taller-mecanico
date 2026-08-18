import { MenuItem, TextField } from '@mui/material'

const anioActual = new Date().getFullYear()
const anios = Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i)

export default function AnioSelect({ value, onChange, ...props }) {
  return (
    <TextField select label="Año" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props}>
      <MenuItem value="">
        <em>Sin año</em>
      </MenuItem>
      {anios.map((a) => (
        <MenuItem key={a} value={a}>
          {a}
        </MenuItem>
      ))}
    </TextField>
  )
}
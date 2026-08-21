import { Box, Typography } from '@mui/material'
import { FONT_DISPLAY } from '../../theme/workshopBrand'

export default function LegalSection({ titulo, children }) {
  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '1.15rem', mb: 1.25 }}>
        {titulo}
      </Typography>
      <Typography variant="body1" component="div" sx={{ color: 'text.secondary', lineHeight: 1.7, '& p': { mb: 1.25 }, '& p:last-child': { mb: 0 }, '& ul': { pl: 3, m: 0, mb: 1.25 }, '& li': { mb: 0.5 } }}>
        {children}
      </Typography>
    </Box>
  )
}

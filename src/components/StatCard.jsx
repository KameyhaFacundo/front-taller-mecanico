import { Box, Card, CardContent, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

export default function StatCard({ label, value, icon: Icon, color = 'primary', trend, trendLabel, onClick }) {
  const trendUp = trend != null && trend >= 0
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        ...(onClick && {
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: (theme) => theme.custom.shadowHover },
        }),
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 3,
          background: (theme) => {
            const palette = theme.palette[color] ?? theme.palette.primary
            return `linear-gradient(90deg, ${palette.main}, ${palette.light})`
          },
        }}
      />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, overflowWrap: 'break-word' }}>
              {value}
            </Typography>
            {trend != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                {trendUp ? (
                  <TrendingUpIcon fontSize="inherit" sx={{ fontSize: 14, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon fontSize="inherit" sx={{ fontSize: 14, color: 'error.main' }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 700, color: trendUp ? 'success.main' : 'error.main' }}>
                  {trend > 0 ? '+' : ''}
                  {trend}
                </Typography>
                {trendLabel && (
                  <Typography variant="caption" color="text.secondary">
                    {trendLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: (theme) => alpha(theme.palette[color]?.main ?? theme.palette.primary.main, 0.12),
                color: `${color}.main`,
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

import { Box, Button, Stack, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/InboxOutlined'

export default function EmptyState({ icon: Icon = InboxIcon, title = 'Sin datos', description, actionLabel, onAction }) {
  return (
    <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
      <Stack spacing={1.5} sx={{ alignItems: 'center', maxWidth: 380, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.custom.shadow,
          }}
        >
          <Icon sx={{ fontSize: 30, color: 'text.secondary' }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actionLabel && onAction && (
          <Button variant="contained" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  )
}

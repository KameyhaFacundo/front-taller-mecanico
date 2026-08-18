import { useState } from 'react'
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

export default function RowActionsMenu({ items }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const close = () => setAnchorEl(null)

  return (
    <Box sx={{ display: 'inline-block' }}>
      <Tooltip title="Acciones">
        <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Acciones" aria-haspopup="true">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={close} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} slotProps={{ paper: { sx: { minWidth: 200 } } }}>
        {items.map((item, index) =>
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : (
            <MenuItem
              key={`item-${index}`}
              onClick={() => {
                close()
                item.onClick?.()
              }}
              disabled={item.disabled}
              sx={{
                py: 0.75,
                color: item.color === 'error' ? 'error.main' : undefined,
                '& .MuiListItemIcon-root': { color: item.color === 'error' ? 'error.main' : 'inherit' },
              }}
            >
              {item.icon && <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2', fontWeight: 600 } }} />
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  )
}
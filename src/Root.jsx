import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useColorMode } from './context/useColorMode'
import { getTheme } from './theme'
import { AuthProvider } from './auth/AuthContext.jsx'
import { NotifyProvider } from './context/NotifyContext.jsx'
import App from './App.jsx'

export default function Root() {
  const { mode } = useColorMode()
  const theme = getTheme(mode)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotifyProvider>
          <App />
        </NotifyProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
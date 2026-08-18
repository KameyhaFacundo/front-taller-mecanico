import { useEffect, useMemo, useState } from 'react'
import { ColorModeContext } from './colorModeContext.js'

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('color_mode') || 'light')

  useEffect(() => {
    localStorage.setItem('color_mode', mode)
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  )

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}

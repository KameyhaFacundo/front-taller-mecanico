import { useContext } from 'react'
import { ColorModeContext } from './colorModeContext.js'

export function useColorMode() {
  return useContext(ColorModeContext)
}
import { useContext } from 'react'
import { NotifyContext } from './notifyContext.js'

export function useNotify() {
  const context = useContext(NotifyContext)
  if (!context) throw new Error('useNotify must be used within NotifyProvider')
  return context
}
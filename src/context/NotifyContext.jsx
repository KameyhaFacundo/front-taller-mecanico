import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Slide, Snackbar } from '@mui/material'
import { NotifyContext } from './notifyContext.js'

export function NotifyProvider({ children }) {
  const [queue, setQueue] = useState([])
  const timersRef = useRef(new Map())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((id) => clearTimeout(id))
      timers.clear()
    }
  }, [])

  const notify = useCallback((message, options = {}) => {
    const { severity = 'success', duration = 4000 } = options
    const id = Date.now() + Math.random()
    setQueue((prev) => [...prev, { id, message, severity, duration }])
    const timerId = setTimeout(() => {
      timersRef.current.delete(id)
      setQueue((prev) => prev.filter((item) => item.id !== id))
    }, duration + 600)
    timersRef.current.set(id, timerId)
  }, [])

  const dismiss = useCallback((id) => {
    const timerId = timersRef.current.get(id)
    if (timerId) {
      clearTimeout(timerId)
      timersRef.current.delete(id)
    }
    setQueue((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      notify,
      success: (message, opts) => notify(message, { ...opts, severity: 'success' }),
      error: (message, opts) => notify(message, { ...opts, severity: 'error' }),
      info: (message, opts) => notify(message, { ...opts, severity: 'info' }),
      warning: (message, opts) => notify(message, { ...opts, severity: 'warning' }),
    }),
    [notify]
  )

  return (
    <NotifyContext.Provider value={value}>
      {children}
      {queue.slice(-1).map((item) => (
        <Snackbar
          key={item.id}
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={item.duration}
          slots={{ transition: Slide }}
          onClose={() => dismiss(item.id)}
        >
          <Alert severity={item.severity} variant="filled" onClose={() => dismiss(item.id)} sx={{ width: '100%', boxShadow: 6 }}>
            {item.message}
          </Alert>
        </Snackbar>
      ))}
    </NotifyContext.Provider>
  )
}

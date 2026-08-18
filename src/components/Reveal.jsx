import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'

const transforms = {
  up: 'translateY(28px)',
  down: 'translateY(-28px)',
  left: 'translateX(28px)',
  right: 'translateX(-28px)',
  none: 'none',
}

export default function Reveal({ children, delay = 0, direction = 'up', sx, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      sx={{
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : transforms[direction],
        willChange: 'opacity, transform',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
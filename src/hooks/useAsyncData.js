import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotify } from '../context/useNotify'

// Caché simple en memoria para los fetch "estáticos" (listas de opciones para
// selects/pickers: clientes, vehículos, repuestos, proveedores, servicios,
// usuarios). Evita volver a traer la misma lista completa cada vez que se
// navega a una página que la necesita — la de Órdenes pedía 4 listas enteras
// por cada visita.
const cacheStore = new Map()

export function useAsyncData(fetcher, { errorMessage = 'No se pudieron cargar los datos.', cacheKey, ttlMs = 60_000 } = {}) {
  const cacheHit = cacheKey ? cacheStore.get(cacheKey) : undefined
  const cachedFresh = Boolean(cacheHit && cacheHit.expires > Date.now())
  const [data, setData] = useState(cachedFresh ? cacheHit.data : null)
  const [loading, setLoading] = useState(!cachedFresh)
  const notify = useNotify()
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  // Refs estables para el callback: notify/errorMessage viven en contexto y no
  // deben recrear `reload` (si no, el efecto de montaje refetchearía a cada
  // render). Mismo patrón que fetcherRef.
  const notifyRef = useRef(notify)
  notifyRef.current = notify
  const errorMessageRef = useRef(errorMessage)
  errorMessageRef.current = errorMessage

  // Guard de secuencia + cleanup al desmontar: respuestas que llegan fuera de
  // orden (p.ej. por el auto-refresh de Turnos) se descartan, y nunca se hace
  // setState después del unmount.
  const mountedRef = useRef(true)
  const seqRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reload = useCallback(
    async (params, { bypassCache = false } = {}) => {
      // Caché fresca y sin pedido de refresco forzado: se sirve sin red.
      if (cacheKey && !bypassCache) {
        const hit = cacheStore.get(cacheKey)
        if (hit && hit.expires > Date.now()) {
          setData(hit.data)
          setLoading(false)
          return hit.data
        }
      }
      const seq = ++seqRef.current
      setLoading(true)
      try {
        const result = await fetcherRef.current(params)
        if (seq !== seqRef.current || !mountedRef.current) return null
        if (cacheKey) cacheStore.set(cacheKey, { data: result, expires: Date.now() + ttlMs })
        setData(result)
        return result
      } catch {
        if (seq !== seqRef.current || !mountedRef.current) return null
        notifyRef.current.error(errorMessageRef.current)
        return null
      } finally {
        if (seq === seqRef.current && mountedRef.current) setLoading(false)
      }
    },
    [cacheKey, ttlMs]
  )

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload])

  // refresh() siempre ignora la caché: se usa después de crear/editar/borrar
  // para que la lista quede al día.
  const refresh = useCallback(() => reload(undefined, { bypassCache: true }), [reload])

  return { data, setData, loading, reload, refresh }
}
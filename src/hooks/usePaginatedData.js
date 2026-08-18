import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotify } from '../context/useNotify'

const DEBOUNCE_MS = 350

/**
 * Server-side pagination + debounced search, mirroring Laravel's paginator
 * shape ({ data, total, current_page, per_page }). Lists no longer load an
 * entire table client-side — the search box now drives a `q` query param
 * instead of filtering an in-memory array.
 */
export function usePaginatedData(fetcher, { errorMessage = 'No se pudieron cargar los datos.', perPage: initialPerPage = 25, extraParams } = {}) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [loading, setLoading] = useState(true)
  const notify = useNotify()
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  // Cambiar un filtro (extraParams) también vuelve a la página 0, igual que al
  // buscar: si no, estando en la página 3 un filtro nuevo devolvía filas vacías.
  const extraKey = JSON.stringify(extraParams)
  const prevExtraRef = useRef(extraKey)
  useEffect(() => {
    if (prevExtraRef.current !== extraKey) {
      prevExtraRef.current = extraKey
      setPage(0)
    }
  }, [extraKey])

  // Guard de secuencia: descarta respuestas que lleguen fuera de orden (p.ej.
  // una request con la página vieja que resuelve después que la página 0).
  const seqRef = useRef(0)
  // Evita setState después de desmontar el componente que usa el hook.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const load = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    try {
      const result = await fetcherRef.current({
        page: page + 1,
        per_page: perPage,
        q: debouncedQ || undefined,
        ...extraParams,
      })
      if (seq !== seqRef.current || !mountedRef.current) return null
      setRows(result?.data ?? [])
      setTotal(result?.total ?? 0)
      // Si la página quedó vacía (p.ej. se borró el último registro de la
      // última página), retrocedé una página en vez de mostrar un listado
      // vacío con una paginación "rota".
      if (result && Array.isArray(result.data) && result.data.length === 0 && page > 0) {
        setPage(page - 1)
      }
      return result
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } catch {
      if (seq !== seqRef.current || !mountedRef.current) return null
      notify.error(errorMessage)
      return null
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, debouncedQ, extraKey])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  return {
    rows,
    total,
    page,
    perPage,
    q,
    setQ,
    loading,
    reload: load,
    onPageChange: (_event, newPage) => setPage(newPage),
    onPerPageChange: (event) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
  }
}

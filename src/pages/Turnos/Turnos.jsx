import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import EventIcon from '@mui/icons-material/Event'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SearchIcon from '@mui/icons-material/Search'
import TodayIcon from '@mui/icons-material/Today'
import { agregarVehiculoCliente, createCliente, listClientesOptions, listVehiculosOptions } from '../../services/clientesApi'
import { cambiarEstadoTurno, createTurno, crearOrdenDesdeTurno, deleteTurno, importTurnos, listDisponibilidad, listTurnos, updateTurno } from '../../services/turnosApi'
import { createServicio, listServiciosOptions } from '../../services/serviciosApi'
import { listUsuariosOpciones } from '../../services/usersApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useNotify } from '../../context/useNotify'
import AppDialog from '../../components/AppDialog'
import PageHeader from '../../components/PageHeader'
import ConfirmDialog from '../../components/ConfirmDialog'
import ImportExcelButton from '../../components/ImportExcelButton'
import VehiculoPicker from '../../components/VehiculoPicker'
import VehiculoFormFields from '../../components/VehiculoFormFields'
import CalendarioGrid from '../../components/CalendarioGrid'
import TimeGrid from '../../components/TimeGrid'
import DisponibilidadPanel from '../../components/DisponibilidadPanel'
import { turnoEstadoMeta, turnoNextEstados, turnoOrigenMeta } from '../../utils/meta'
import { fmtDate, fmtDateTime, fmtTime, plural, toISODate } from '../../utils/format'

const emptyForm = { id: null, cliente_id: '', vehiculo_id: '', servicio_id: '', servicios: [], fecha_hora: '' }

const VISTA_LABEL = { dia: 'Día', semana: 'Semana', mes: 'Mes' }

const emptyVehiculoNuevo = { marca: '', modelo: '', anio: '', patente: '', kilometros: '' }

const normNombre = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const pad = (n) => String(n).padStart(2, '0')

// Fecha de hoy en hora LOCAL. toISODate(new Date()) usa UTC y tras las 21:00
// (Argentina, UTC-3) ya cae en el día siguiente, corriendo "hoy" un día.
const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const inicioSemana = (fecha) => {
  const d = new Date(fecha + 'T12:00:00')
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d
}

const esCerrado = (d) => d.getDay() === 0 || d.getDay() === 6

const semanaCompleta = (fecha) => {
  const lunes = inicioSemana(fecha)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    const f = toISODate(d)
    return { date: d, fecha: f, esHoy: f === hoyISO(), delMes: true, cerrado: esCerrado(d) }
  })
}

// Grilla mensual tipo Google Calendar: siempre semanas completas (lunes a
// domingo), incluyendo días del mes anterior/siguiente para rellenar.
const mesGrilla = (fecha) => {
  const ref = new Date(fecha + 'T12:00:00')
  const mesObjetivo = ref.getMonth()
  const primerDia = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const ultimoDia = new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
  const inicio = inicioSemana(toISODate(primerDia))
  const finSemana = inicioSemana(toISODate(ultimoDia))
  const fin = new Date(finSemana)
  fin.setDate(fin.getDate() + 6)

  const dias = []
  const cursor = new Date(inicio)
  while (cursor <= fin) {
    const f = toISODate(cursor)
    dias.push({
      date: new Date(cursor),
      fecha: f,
      esHoy: f === hoyISO(),
      delMes: cursor.getMonth() === mesObjetivo,
      cerrado: esCerrado(cursor),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

const diaUnico = (fecha) => {
  const d = new Date(fecha + 'T12:00:00')
  return [{ date: d, fecha, esHoy: fecha === hoyISO(), delMes: true, cerrado: esCerrado(d) }]
}

const aLocalInput = (fechaHora) => {
  const d = new Date(fechaHora)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Día inicial efectivo: hoy; sábado/domingo (cerrado) pasa al lunes siguiente.
const diaInicial = () => {
  const hoy = new Date()
  const day = hoy.getDay()
  if (day === 6) hoy.setDate(hoy.getDate() + 2)
  if (day === 0) hoy.setDate(hoy.getDate() + 1)
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`
}

export default function Turnos() {
  const notify = useNotify()
  const navigate = useNavigate()
  const location = useLocation()
  const [dia, setDia] = useState(diaInicial)
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [ordenTarget, setOrdenTarget] = useState(null)
  const [ordenCreada, setOrdenCreada] = useState(null)
  const [ordenBusy, setOrdenBusy] = useState(false)
  const [asignadoOrden, setAsignadoOrden] = useState('')
  const [vehNuevoEnTurno, setVehNuevoEnTurno] = useState(false)
  const [accionesTarget, setAccionesTarget] = useState(null)
  const [huecos, setHuecos] = useState([])
  const [dispLoading, setDispLoading] = useState(false)
  const [ultimoSync, setUltimoSync] = useState(() => fmtTime(new Date()))
  const [modoCliente, setModoCliente] = useState('existente')
  const [clienteNuevo, setClienteNuevo] = useState({ nombre: '', telefono: '' })
  const [vehiculoNuevo, setVehiculoNuevo] = useState(emptyVehiculoNuevo)
  const [conVehiculo, setConVehiculo] = useState(true)
  const [clientesExtra, setClientesExtra] = useState([])
  const [creandoCliente, setCreandoCliente] = useState(false)
  const [servicioNuevoOpen, setServicioNuevoOpen] = useState(false)
  const [servicioNuevo, setServicioNuevo] = useState({ nombre: '', duracion_min: 60, precio_base: '' })
  const [creandoServicio, setCreandoServicio] = useState(false)
  const [vista, setVista] = useState('dia')
  const [vistaMenuAnchor, setVistaMenuAnchor] = useState(null)
  const [overlapError, setOverlapError] = useState('')

  const clientes = useAsyncData(listClientesOptions, { errorMessage: 'No se pudieron cargar los clientes.', cacheKey: 'clientes' })
  const vehiculos = useAsyncData(listVehiculosOptions, { errorMessage: 'No se pudieron cargar los vehículos.', cacheKey: 'vehiculos' })
  const servicios = useAsyncData(listServiciosOptions, { errorMessage: 'No se pudieron cargar los servicios.', cacheKey: 'servicios' })
  const tecnicos = useAsyncData(listUsuariosOpciones, { errorMessage: 'No se pudieron cargar los usuarios.', cacheKey: 'tecnicos' })

  const celdas = useMemo(() => {
    if (vista === 'mes') return mesGrilla(dia)
    if (vista === 'semana') return semanaCompleta(dia)
    return diaUnico(dia)
  }, [vista, dia])

  const celdasPara = (v, fecha) => (v === 'mes' ? mesGrilla(fecha) : v === 'semana' ? semanaCompleta(fecha) : diaUnico(fecha))

  const turnos = useAsyncData((params) => listTurnos(params ?? { fecha_desde: celdas[0].fecha, fecha_hasta: celdas[celdas.length - 1].fecha }), {
    errorMessage: 'No se pudieron cargar los turnos.',
  })

  const vehById = useMemo(() => Object.fromEntries((vehiculos.data ?? []).map((v) => [v.id, v])), [vehiculos.data])
  const servById = useMemo(() => Object.fromEntries((servicios.data ?? []).map((s) => [s.id, s])), [servicios.data])

  // Hora de salida estimada = entrada elegida + suma de duraciones de los
  // servicios elegidos. El turno solo pide el horario de entrada; esto le
  // muestra al operador cuándo queda libre el box.
  const salidaEstimada = useMemo(() => {
    if (!form.fecha_hora) return null
    const ids = (form.servicios?.length ? form.servicios : form.servicio_id ? [form.servicio_id] : [])
      .map((id) => servById[id])
      .filter((s) => s?.duracion_min)
    if (!ids.length) return null
    const inicio = new Date(form.fecha_hora)
    if (Number.isNaN(inicio.getTime())) return null
    inicio.setMinutes(inicio.getMinutes() + ids.reduce((acc, s) => acc + Number(s.duracion_min), 0))
    return inicio
  }, [form.servicios, form.servicio_id, form.fecha_hora, servById])
  const todosClientes = useMemo(() => [...(clientes.data ?? []), ...clientesExtra], [clientes.data, clientesExtra])

  const clienteExistente = useMemo(() => {
    if (modoCliente !== 'nuevo' || !clienteNuevo.nombre.trim()) return null
    const q = normNombre(clienteNuevo.nombre)
    return todosClientes.find((c) => normNombre(c.nombre) === q) ?? null
  }, [modoCliente, clienteNuevo.nombre, todosClientes])

  const turnosAgenda = useMemo(
    () =>
      (turnos.data ?? []).map((t) => {
        const servs = t.servicios?.length
          ? t.servicios
          : t.servicio_id
            ? [servById[t.servicio_id]].filter(Boolean)
            : []
        const duracionMin = servs.reduce((acc, s) => acc + Number(s.duracion_min ?? 0), 0) || 60
        return {
          ...t,
          duracionMin,
          serviciosNombres: servs.map((s) => s.nombre).filter(Boolean).join(' + ') || null,
        }
      }),
    [turnos.data, servById]
  )

  // Guard de secuencia: si se navega de día rápido, se descarta la respuesta
  // del día anterior y no se pisan los huecos del día actual (mismo patrón
  // que useAsyncData).
  const huecosSeqRef = useRef(0)
  const cargarHuecos = useCallback(async (fecha) => {
    const seq = ++huecosSeqRef.current
    setDispLoading(true)
    try {
      const res = await listDisponibilidad({ fecha })
      if (seq !== huecosSeqRef.current) return
      setHuecos(res?.huecos ?? [])
    } catch {
      if (seq !== huecosSeqRef.current) return
      setHuecos([])
    } finally {
      if (seq === huecosSeqRef.current) setDispLoading(false)
    }
  }, [])

  // "nuevoTurno" llega desde Clientes (clientes sin turno): abre el formulario
  // de nuevo turno con ese cliente y vehículo ya elegidos.
  useEffect(() => {
    if (location.state?.nuevoTurno) {
      const { cliente_id, vehiculo_id } = location.state.nuevoTurno
      navigate(location.pathname, { replace: true, state: {} })
      setOverlapError('')
      setVehNuevoEnTurno(false)
      setForm((prev) => ({ ...prev, cliente_id: cliente_id ?? '', vehiculo_id: vehiculo_id ?? '' }))
      setModoCliente('existente')
      setClienteNuevo({ nombre: '', telefono: '' })
      setVehiculoNuevo(emptyVehiculoNuevo)
      setConVehiculo(true)
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    cargarHuecos(dia)
  }, [dia, cargarHuecos])

  const syncAll = useCallback(() => {
    turnos.reload({ fecha_desde: celdas[0].fecha, fecha_hasta: celdas[celdas.length - 1].fecha })
    cargarHuecos(dia)
    setUltimoSync(fmtTime(new Date()))
  }, [celdas, dia, turnos, cargarHuecos])

  const syncAllRef = useRef(syncAll)
  useEffect(() => {
    syncAllRef.current = syncAll
  }, [syncAll])

  // Intervalo único y estable: siempre llama a la última versión de syncAll
  // sin recrear el timer en cada render (antes cualquier render lo resetiaba).
  // Con la pestaña oculta no se hace polling en segundo plano; al volver a
  // estar visible se sincroniza al instante.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') syncAllRef.current()
    }, 25000)
    const handleVisible = () => {
      if (document.visibilityState === 'visible') syncAllRef.current()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [])

  const cambiarVentana = (offset) => {
    const d = new Date(dia + 'T12:00:00')
    if (vista === 'mes') {
      // Primero al día 1 del mes: si el día ancla es 29/30/31, setMonth desborda
      // al mes siguiente (31 ago +1 → 1 oct) y saltea un mes entero.
      d.setDate(1)
      d.setMonth(d.getMonth() + offset)
    } else if (vista === 'semana') d.setDate(d.getDate() + offset * 7)
    else d.setDate(d.getDate() + offset)
    const nuevo = toISODate(d)
    setDia(nuevo)
    const nuevasCeldas = celdasPara(vista, nuevo)
    turnos.reload({ fecha_desde: nuevasCeldas[0].fecha, fecha_hasta: nuevasCeldas[nuevasCeldas.length - 1].fecha })
    setUltimoSync(fmtTime(new Date()))
  }

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista)
    const nuevasCeldas = celdasPara(nuevaVista, dia)
    turnos.reload({ fecha_desde: nuevasCeldas[0].fecha, fecha_hasta: nuevasCeldas[nuevasCeldas.length - 1].fecha })
  }

  const irHoy = () => {
    const hoy = diaInicial()
    setDia(hoy)
    const nuevasCeldas = celdasPara(vista, hoy)
    turnos.reload({ fecha_desde: nuevasCeldas[0].fecha, fecha_hasta: nuevasCeldas[nuevasCeldas.length - 1].fecha })
    cargarHuecos(hoy)
    setUltimoSync(fmtTime(new Date()))
  }

  const reload = () => {
    syncAll()
    vehiculos.refresh()
    servicios.refresh()
  }

  const openForm = (turno) => {
    setOverlapError('')
    setVehNuevoEnTurno(false)
    setForm(turno
      ? {
          id: turno.id,
          cliente_id: turno.cliente_id ?? (turno.vehiculo_id ? (vehById[turno.vehiculo_id]?.cliente_id ?? '') : ''),
          vehiculo_id: turno.vehiculo_id,
          servicio_id: turno.servicio_id,
          servicios: (turno.servicios?.length ? turno.servicios : [{ id: turno.servicio_id }]).map((s) => String(s.id)),
          fecha_hora: aLocalInput(turno.fecha_hora),
        }
      : emptyForm)
    setModoCliente('existente')
    setClienteNuevo({ nombre: '', telefono: '' })
    setVehiculoNuevo(emptyVehiculoNuevo)
    setConVehiculo(true)
    setOpen(true)
  }

  const abrirNuevoEn = (fechaHora) => {
    setOverlapError('')
    setVehNuevoEnTurno(false)
    setForm({ ...emptyForm, fecha_hora: fechaHora })
    setModoCliente('existente')
    setClienteNuevo({ nombre: '', telefono: '' })
    setVehiculoNuevo(emptyVehiculoNuevo)
    setConVehiculo(true)
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (modoCliente === 'nuevo' && !form.cliente_id) {
      notify.error('Completá primero los datos del cliente nuevo (botón “Crear cliente”).')
      return
    }
    // Vehículo nuevo para un cliente existente: se crea acá mismo, sin salir
    // del modal, y el turno se guarda con el vehículo recién creado.
    if (modoCliente === 'existente' && vehNuevoEnTurno) {
      if (!form.cliente_id) {
        notify.error('Primero elegí el cliente al que se vincula el vehículo.')
        return
      }
      const marca = vehiculoNuevo.marca.trim()
      const modelo = vehiculoNuevo.modelo.trim()
      const patente = vehiculoNuevo.patente.trim().toUpperCase()
      if (!marca || !modelo || !patente) {
        notify.error('Completá marca, modelo y patente del vehículo nuevo.')
        return
      }
      const payload = { marca, modelo, patente, cliente_id: form.cliente_id }
      if (vehiculoNuevo.anio) payload.anio = Number(vehiculoNuevo.anio)
      if (vehiculoNuevo.kilometros) payload.kilometros = Number(vehiculoNuevo.kilometros)
      try {
        const vehiculo = await agregarVehiculoCliente(form.cliente_id, payload)
        setForm((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))
        vehiculos.refresh()
      } catch (err) {
        notify.error(err.response?.data?.message || 'No se pudo crear el vehículo.')
        return
      }
    }
    if (!form.vehiculo_id) {
      notify.error('Falta elegir el vehículo. Buscá un cliente existente con su auto o usá “Cliente nuevo” para registrarlo.')
      return
    }
    const serviciosElegidos = form.servicios?.length ? form.servicios : form.servicio_id ? [form.servicio_id] : []
    if (!serviciosElegidos.length) {
      notify.error('Falta elegir al menos un servicio.')
      return
    }
    if (!form.fecha_hora) {
      notify.error('Falta la fecha y hora del turno.')
      return
    }

    // Turno nuevo: el panel de disponibilidad muestra slots de 30 min, pero un
    // servicio que dura más bloquea sus horas siguientes. Se re-chequea con la
    // duración total de los servicios elegidos antes de crear.
    if (!form.id) {
      const fecha = form.fecha_hora.slice(0, 10)
      const hora = form.fecha_hora.slice(11, 16)
      const duracionTotal = serviciosElegidos.reduce((acc, id) => acc + Number(servById[id]?.duracion_min ?? 0), 0)
      try {
        const disp = await listDisponibilidad({ fecha, servicios: serviciosElegidos })
        if (!(disp?.huecos ?? []).includes(hora)) {
          notify.error(`Ese horario ya no está libre (los servicios elegidos duran ${duracionTotal} min en total). Elegí otro horario disponible.`)
          return
        }
      } catch {
        // Si el chequeo local falla, lo decide el backend (que valida igual).
      }
    }

    try {
      if (form.id) {
        await updateTurno(form.id, form)
        notify.success('Turno actualizado.')
      } else {
        await createTurno(form)
        notify.success('Turno creado.')
      }
      setOverlapError('')
      setOpen(false)
      setVehNuevoEnTurno(false)
      setVehiculoNuevo(emptyVehiculoNuevo)
      reload()
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (err.response?.status === 422 && /ocupado|disponible/i.test(msg)) {
        setOverlapError(msg)
      }
      notify.error(msg || 'No se pudo guardar el turno.')
    }
  }

  const handleEstado = async (turno, estado) => {
    try {
      await cambiarEstadoTurno(turno.id, estado)
      notify.success('Estado actualizado.')
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo actualizar el turno.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteTurno(deleteTarget.id)
      notify.success('Turno eliminado.')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el turno.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleCrearOrden = async () => {
    setOrdenBusy(true)
    try {
      const orden = await crearOrdenDesdeTurno(ordenTarget.id, { asignado_a: asignadoOrden || null })
      notify.success(`Orden de trabajo #${orden.id} creada.`)
      setOrdenCreada(orden)
      setAsignadoOrden('')
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo crear la orden.')
      setOrdenTarget(null)
    } finally {
      setOrdenBusy(false)
    }
  }

  const cerrarOrden = () => {
    setOrdenTarget(null)
    setOrdenCreada(null)
  }

  const crearClienteNuevo = async (event) => {
    event.preventDefault()
    if (!clienteNuevo.nombre.trim()) return
    setCreandoCliente(true)

    let cliente = null
    try {
      cliente = await createCliente({ nombre: clienteNuevo.nombre.trim(), telefonos: clienteNuevo.telefono ? [clienteNuevo.telefono.trim()] : [] })
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo crear el cliente.')
      setCreandoCliente(false)
      return
    }

    setClientesExtra((prev) => [...prev, cliente])
    setForm((prev) => ({ ...prev, cliente_id: cliente.id }))

    let vehiculo = null
    if (conVehiculo && vehiculoNuevo.patente.trim()) {
      const payload = {
        marca: vehiculoNuevo.marca.trim(),
        modelo: vehiculoNuevo.modelo.trim(),
        patente: vehiculoNuevo.patente.trim().toUpperCase(),
        cliente_id: cliente.id,
      }
      if (vehiculoNuevo.anio) payload.anio = Number(vehiculoNuevo.anio)
      if (vehiculoNuevo.kilometros) payload.kilometros = Number(vehiculoNuevo.kilometros)
      try {
        vehiculo = await agregarVehiculoCliente(cliente.id, payload)
      } catch (err) {
        notify.warning(`Cliente creado, pero no se pudo vincular el vehículo: ${err.response?.data?.message || 'intentá de nuevo'}.`)
      }
    }

    if (vehiculo) {
      setForm((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))
      vehiculos.refresh()
    }

    setModoCliente('existente')
    setClienteNuevo({ nombre: '', telefono: '' })
    setVehiculoNuevo(emptyVehiculoNuevo)
    setConVehiculo(true)
    notify.success(vehiculo ? 'Cliente y vehículo listos.' : `Cliente ${cliente.nombre} creado.`)
    setCreandoCliente(false)
  }

  const crearServicioNuevo = async (event) => {
    event.preventDefault()
    const nombre = servicioNuevo.nombre.trim()
    const duracion = Number(servicioNuevo.duracion_min)
    if (!nombre) {
      notify.error('Ingresá el nombre del servicio.')
      return
    }
    if (!Number.isInteger(duracion) || duracion <= 0) {
      notify.error('La duración debe ser un número mayor a 0.')
      return
    }
    setCreandoServicio(true)
    try {
      const payload = { nombre, duracion_min: duracion }
      if (servicioNuevo.precio_base !== '' && servicioNuevo.precio_base != null) payload.precio_base = Number(servicioNuevo.precio_base)
      const creado = await createServicio(payload)
      servicios.refresh()
      setForm((prev) => ({ ...prev, servicios: [...(prev.servicios ?? []), String(creado.id)] }))
      setServicioNuevoOpen(false)
      setServicioNuevo({ nombre: '', duracion_min: 60, precio_base: '' })
      notify.success(`Servicio ${creado.nombre} creado.`)
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo crear el servicio.')
    } finally {
      setCreandoServicio(false)
    }
  }

  const handleImport = async (rows) => {
    const fallos = []
    const payload = []
    const servPorNombre = Object.fromEntries((servicios.data ?? []).map((s) => [s.nombre.trim().toLowerCase(), s]))
    for (const row of rows) {
      const patente = String(row.Patente ?? row.patente ?? '').trim().toUpperCase()
      const servNombre = String(row.Servicio ?? row.servicio ?? '').trim()
      const fechaRaw = row.Fecha ?? row.fecha_hora ?? row['Fecha y hora'] ?? ''
      if (!patente || !servNombre || !fechaRaw) {
        fallos.push('fila incompleta')
        continue
      }
      const vehiculo = (vehiculos.data ?? []).find((v) => v.patente?.trim().toUpperCase() === patente)
      const servicio = servPorNombre[servNombre.trim().toLowerCase()]
      if (!vehiculo) {
        fallos.push(`patente ${patente} no encontrada`)
        continue
      }
      if (!servicio) {
        fallos.push(`servicio "${servNombre}" no encontrado`)
        continue
      }
      payload.push({ vehiculo_id: vehiculo.id, servicio_id: servicio.id, fecha_hora: String(fechaRaw).trim().replace(/T/g, ' ') })
    }
    try {
      const result = payload.length ? await importTurnos(payload) : { creados: 0, fallos: 0, errores: [] }
      const totalFallos = fallos.length + result.fallos
      if (result.creados) notify.success(`Turnos creados: ${result.creados}.`)
      if (totalFallos) {
        const detalle = [...fallos, ...(Array.isArray(result.errores) ? result.errores : [])]
        notify.warning(`${plural(totalFallos, 'fila')} no importadas (${detalle.slice(0, 3).join(', ')}…).`)
      }
      reload()
    } catch {
      notify.error('No se pudieron importar los turnos. Verificá el archivo e intentá de nuevo.')
    }
  }


  const accionesTurno = accionesTarget
  const nextEstados = accionesTarget ? (turnoNextEstados[accionesTarget.estado] ?? []) : []

  const headerLabel = useMemo(() => {
    if (vista === 'semana') return `${fmtDate(celdas[0]?.fecha)} – ${fmtDate(celdas[celdas.length - 1]?.fecha)}`
    if (vista === 'mes') {
      const d = new Date(dia + 'T12:00:00')
      const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      return label.charAt(0).toUpperCase() + label.slice(1)
    }
    return fmtDate(dia)
  }, [vista, dia, celdas])

  return (
    <Box>
      <PageHeader
        title="Turnos"
        subtitle="Agenda del taller en tiempo real."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ImportExcelButton onImport={handleImport} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nuevo turno
            </Button>
          </Stack>
        }
      />

      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Button variant="outlined" size="small" startIcon={<TodayIcon />} onClick={irHoy} sx={{ borderRadius: 5 }}>
          Hoy
        </Button>
        <IconButton size="small" onClick={() => cambiarVentana(-1)} aria-label="Anterior">
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => cambiarVentana(1)} aria-label="Siguiente">
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 500, textTransform: 'capitalize', ml: 0.5 }}>
          {headerLabel}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Chip size="small" icon={<FiberManualRecordIcon sx={{ color: 'success.main', fontSize: 14 }} />} label={`En vivo · ${ultimoSync}`} variant="outlined" sx={{ '& .MuiChip-icon': { animation: 'pulse 2s infinite' } }} />
        <Button
          variant="outlined"
          size="small"
          endIcon={<KeyboardArrowDownIcon fontSize="small" />}
          onClick={(e) => setVistaMenuAnchor(e.currentTarget)}
          sx={{ borderRadius: 5, minWidth: 100 }}
        >
          {VISTA_LABEL[vista]}
        </Button>
        <Menu anchorEl={vistaMenuAnchor} open={Boolean(vistaMenuAnchor)} onClose={() => setVistaMenuAnchor(null)}>
          {Object.entries(VISTA_LABEL).map(([v, label]) => (
            <MenuItem
              key={v}
              selected={v === vista}
              onClick={() => {
                cambiarVista(v)
                setVistaMenuAnchor(null)
              }}
            >
              {label}
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {vista === 'dia' && <DisponibilidadPanel fecha={dia} huecos={huecos} loading={dispLoading} onElegir={abrirNuevoEn} />}

        {turnos.loading && turnos.data == null ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
            Cargando agenda…
          </Paper>
        ) : vista === 'mes' ? (
          <CalendarioGrid celdas={celdas} turnos={turnosAgenda} modo="mes" onCrearTurno={abrirNuevoEn} onAbrirTurno={setAccionesTarget} />
        ) : (
          <TimeGrid dias={celdas} turnos={turnosAgenda} onCrearTurno={abrirNuevoEn} onAbrirTurno={setAccionesTarget} />
        )}
      </Stack>

      <AppDialog
        open={open}
        onClose={() => { setOpen(false); setOverlapError('') }}
        title={form.id ? 'Editar turno' : 'Nuevo turno'}
        subtitle="Programá el turno del cliente en el taller."
        icon={<EventIcon />}
        iconBg="primary.main"
        maxWidth="sm"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="turno-form" variant="contained" disabled={modoCliente === 'nuevo' && !form.cliente_id}>
              {form.id ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <Box component="form" id="turno-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              {!form.cliente_id && !form.id && (
                <Box>
                  <ToggleButtonGroup value={modoCliente} exclusive size="small" onChange={(_, v) => v && setModoCliente(v)} sx={{ display: 'flex', width: '100%' }}>
                    <ToggleButton value="existente" sx={{ flexGrow: 1 }} disabled={creandoCliente}>
                      <SearchIcon fontSize="small" sx={{ mr: 0.75 }} /> Buscar existente
                    </ToggleButton>
                    <ToggleButton value="nuevo" sx={{ flexGrow: 1 }} disabled={creandoCliente}>
                      <PersonAddIcon fontSize="small" sx={{ mr: 0.75 }} /> Cliente nuevo
                    </ToggleButton>
                  </ToggleButtonGroup>
                  {modoCliente === 'nuevo' && (
                    <Box sx={{ mt: 1.5, p: 1.5, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <PersonAddIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Cliente nuevo
                        </Typography>
                      </Stack>
                      {clienteExistente && (
                        <Box sx={{ mt: 1, mb: 1.5, p: 1, borderRadius: 1, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="body2">
                              Ya existe <strong>{clienteExistente.nombre}</strong>. ¿Querés usarlo?
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setForm((prev) => ({ ...prev, cliente_id: clienteExistente.id, vehiculo_id: '' }))
                                setModoCliente('existente')
                              }}
                            >
                              Usar existente
                            </Button>
                          </Stack>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        Completá los datos del cliente. Para agendar un turno hace falta un vehículo.
                      </Typography>
                      <Stack spacing={1.5}>
                        <TextField label="Nombre y apellido" value={clienteNuevo.nombre} onChange={(e) => setClienteNuevo((p) => ({ ...p, nombre: e.target.value }))} required fullWidth autoFocus />
                        <TextField label="Teléfono / WhatsApp" value={clienteNuevo.telefono} onChange={(e) => setClienteNuevo((p) => ({ ...p, telefono: e.target.value }))} fullWidth placeholder="+54 9 11 0000 0000" />
                      </Stack>
                      <FormControlLabel
                        control={<Checkbox checked={conVehiculo} onChange={(e) => setConVehiculo(e.target.checked)} />}
                        label={
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                            <DirectionsCarIcon fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Registrar vehículo
                            </Typography>
                          </Stack>
                        }
                        sx={{ mt: 1, ml: 0 }}
                      />
                      {conVehiculo && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Si la patente ya existe, se vincula automáticamente al cliente.
                          </Typography>
                          <VehiculoFormFields form={vehiculoNuevo} setForm={setVehiculoNuevo} />
                        </Box>
                      )}
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={crearClienteNuevo} disabled={creandoCliente} startIcon={<PersonAddIcon />}>
                          {creandoCliente ? 'Creando…' : conVehiculo ? 'Crear cliente y vehículo' : 'Crear cliente'}
                        </Button>
                        <Button onClick={() => setModoCliente('existente')}>Cancelar</Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}
              {modoCliente === 'existente' && (
                <>
                  <VehiculoPicker
                    clientes={todosClientes}
                    vehiculos={vehiculos.data ?? []}
                    vehiculoId={form.vehiculo_id}
                    clienteId={form.cliente_id}
                    onVehiculoChange={(id) => setForm((prev) => ({ ...prev, vehiculo_id: id }))}
                    onClienteChange={(id) => setForm((prev) => ({ ...prev, cliente_id: id, vehiculo_id: '' }))}
                    onCreateVehiculo={() => { setVehiculoNuevo(emptyVehiculoNuevo); setVehNuevoEnTurno(true) }}
                    required
                    autoFocus
                  />
                  {!form.cliente_id && (
                    <Typography variant="caption" color="text.secondary">
                      Buscá por nombre de cliente o por patente del vehículo. ¿No lo encontrás? Tocá “Cliente nuevo”.
                    </Typography>
                  )}
                  {vehNuevoEnTurno && (
                    <Box sx={{ mt: 0.5 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                        <DirectionsCarIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                          Registrar vehículo nuevo
                        </Typography>
                        <Button size="small" onClick={() => { setVehNuevoEnTurno(false); setVehiculoNuevo(emptyVehiculoNuevo) }}>
                          Quitar
                        </Button>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Si la patente ya existe, se vincula automáticamente al cliente.
                      </Typography>
                      <VehiculoFormFields form={vehiculoNuevo} setForm={setVehiculoNuevo} />
                    </Box>
                  )}
                </>
              )}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                  select
                  label="Servicios"
                  name="servicios"
                  value={form.servicios ?? []}
                  onChange={(e) => { setForm((prev) => ({ ...prev, servicios: e.target.value })); setOverlapError('') }}
                  required
                  sx={{ flexGrow: 1 }}
                  slotProps={{
                    select: {
                      multiple: true,
                      renderValue: (sel) =>
                        sel.length ? sel.map((id) => servById[id]?.nombre ?? `#${id}`).join(' + ') : 'Elegí uno o más servicios…',
                    },
                  }}
                >
                  {(servicios.data ?? []).map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      <Checkbox checked={(form.servicios ?? []).includes(String(s.id))} />
                      {s.nombre} · {s.duracion_min} min
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton onClick={() => setServicioNuevoOpen(true)} aria-label="Agregar servicio" title="Agregar servicio">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
              <TextField
                label="Fecha y hora"
                name="fecha_hora"
                type="datetime-local"
                value={form.fecha_hora}
                onChange={(e) => { setForm((prev) => ({ ...prev, fecha_hora: e.target.value })); setOverlapError('') }}
                required
                error={Boolean(overlapError)}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText={
                  overlapError || (salidaEstimada
                    ? `Entrada ${fmtTime(form.fecha_hora)} · Salida estimada ${fmtTime(salidaEstimada)}`
                    : 'El turno pide el horario de entrada; la salida se calcula con la duración del servicio.')
                }
              />
            </Stack>
          </Box>
      </AppDialog>

      <AppDialog
        open={servicioNuevoOpen}
        onClose={() => setServicioNuevoOpen(false)}
        title="Nuevo servicio"
        subtitle="Se agrega a la lista y queda seleccionado en el turno."
        icon={<EventIcon />}
        iconBg="primary.main"
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setServicioNuevoOpen(false)}>Cancelar</Button>
            <Button type="submit" form="servicio-nuevo-form" variant="contained" disabled={creandoServicio}>
              {creandoServicio ? 'Creando…' : 'Crear'}
            </Button>
          </>
        }
      >
        <Box component="form" id="servicio-nuevo-form" onSubmit={crearServicioNuevo}>
          <Stack spacing={2}>
            <TextField label="Nombre" value={servicioNuevo.nombre} onChange={(e) => setServicioNuevo((prev) => ({ ...prev, nombre: e.target.value }))} required autoFocus />
            <TextField
              label="Duración (minutos)"
              type="number"
              value={servicioNuevo.duracion_min}
              onChange={(e) => setServicioNuevo((prev) => ({ ...prev, duracion_min: e.target.value }))}
              required
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              label="Precio base (opcional)"
              type="number"
              value={servicioNuevo.precio_base}
              onChange={(e) => setServicioNuevo((prev) => ({ ...prev, precio_base: e.target.value }))}
              helperText="Se usa para pre-cargar el precio al crear una orden desde un turno."
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Stack>
        </Box>
      </AppDialog>

      <AppDialog
        open={Boolean(accionesTurno)}
        onClose={() => setAccionesTarget(null)}
        title={`Turno · ${fmtTime(accionesTurno?.fecha_hora)}`}
        subtitle="Detalle del turno y acciones disponibles."
        icon={<EventIcon />}
        iconBg="primary.main"
        maxWidth="xs"
        actionsSx={{ flexDirection: 'column', alignItems: 'stretch' }}
        actions={
          <>
            {accionesTurno && !accionesTurno.orden_trabajo && ['pendiente_asignar', 'confirmado'].includes(accionesTurno.estado) && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<AssignmentIcon />}
                onClick={() => {
                  setOrdenTarget(accionesTarget)
                  setAsignadoOrden('')
                  setAccionesTarget(null)
                }}
              >
                Crear orden de trabajo
              </Button>
            )}
            {nextEstados.map((estado) => (
              <Button
                key={estado}
                variant="outlined"
                size="small"
                onClick={() => {
                  handleEstado(accionesTarget, estado)
                  setAccionesTarget(null)
                }}
              >
                Marcar {turnoEstadoMeta[estado].label}
              </Button>
            ))}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={() => {
                  openForm(accionesTarget)
                  setAccionesTarget(null)
                }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                fullWidth
                onClick={() => {
                  setDeleteTarget(accionesTarget)
                  setAccionesTarget(null)
                }}
              >
                Eliminar
              </Button>
            </Stack>
          </>
        }
      >
        <Stack spacing={0.75}>
          <Chip size="small" label={turnoEstadoMeta[accionesTurno?.estado]?.label} color={turnoEstadoMeta[accionesTurno?.estado]?.color} sx={{ alignSelf: 'flex-start' }} />
            <Typography variant="body2">
              <strong>Cliente:</strong> {accionesTurno?.cliente?.nombre ?? vehById[accionesTurno?.vehiculo_id]?.cliente?.nombre ?? '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Teléfono:</strong> {accionesTurno?.cliente?.telefonos?.[0]?.telefono ?? vehById[accionesTurno?.vehiculo_id]?.cliente?.telefonos?.[0]?.telefono ?? '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Vehículo:</strong>{' '}
              {(() => {
                const v = vehById[accionesTurno?.vehiculo_id]
                return v ? `${v.marca} ${v.modelo} · ${v.patente}` : '—'
              })()}
            </Typography>
            <Typography variant="body2">
              <strong>Servicio:</strong> {accionesTurno?.servicios?.length
                ? accionesTurno.servicios.map((s) => s.nombre).join(' + ')
                : (servById[accionesTurno?.servicio_id]?.nombre ?? `#${accionesTurno?.servicio_id}`)}
            </Typography>
            <Typography variant="body2">
              <strong>Fecha:</strong> {fmtDateTime(accionesTurno?.fecha_hora)}
            </Typography>
            <Typography variant="body2">
              <strong>Agendado por:</strong> {turnoOrigenMeta[accionesTurno?.origen]?.label ?? 'Taller'}
            </Typography>
            {accionesTurno?.orden_trabajo && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AssignmentIcon fontSize="small" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Orden de trabajo #{accionesTurno.orden_trabajo.id} generada
                  </Typography>
                  <Typography variant="caption">
                    Este turno ya se convirtió en una orden. No lo convertís de nuevo.
                  </Typography>
                </Box>
                <Button component={RouterLink} to="/ordenes" size="small" variant="contained" color="success">
                  Ver
                </Button>
              </Box>
            )}
            {accionesTurno && !accionesTurno.orden_trabajo && ['pendiente_asignar', 'confirmado'].includes(accionesTurno.estado) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Cuando el vehículo entró al taller, generá la orden de trabajo para cargarle productos y mano de obra. El turno queda marcado como completado automáticamente.
              </Typography>
            )}
          </Stack>
      </AppDialog>

      <AppDialog
        open={Boolean(ordenTarget)}
        onClose={cerrarOrden}
        title={ordenCreada ? 'Orden creada' : 'Crear orden de trabajo'}
        subtitle={ordenCreada ? `La orden #${ordenCreada.id} quedó Pendiente en el menú Órdenes.` : 'Convertí el turno en una orden.'}
        icon={<AssignmentIcon />}
        iconBg={ordenCreada ? 'success.main' : 'primary.main'}
        maxWidth="sm"
        actions={
          ordenCreada ? (
            <>
              <Button onClick={cerrarOrden}>Cerrar</Button>
              <Button variant="contained" onClick={() => { cerrarOrden(); navigate('/ordenes') }}>
                Ver orden
              </Button>
            </>
          ) : (
            <>
              <Button onClick={cerrarOrden}>Cancelar</Button>
              <Button onClick={handleCrearOrden} variant="contained" disabled={ordenBusy}>
                Crear orden
              </Button>
            </>
          )
        }
      >
        {ordenCreada ? (
          <Typography variant="body2" color="text.secondary">
            El turno pasó a <strong>Completado</strong>. La orden #<strong>{ordenCreada.id}</strong> quedó cargada en{' '}
            <strong>Órdenes</strong> como <strong>Pendiente</strong>: desde ahí vas a poder cargarle productos y mano de obra.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Se convertirá el turno del {fmtDateTime(ordenTarget?.fecha_hora)} en una orden de trabajo Pendiente. Después vas a poder cargarle productos y mano de obra desde el menú Órdenes.
            </Typography>
            <TextField select label="Responsable (opcional)" value={asignadoOrden} onChange={(e) => setAsignadoOrden(e.target.value)} fullWidth>
              <MenuItem value="">
                <em>Sin responsable</em>
              </MenuItem>
              {(tecnicos.data ?? []).map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
      </AppDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar turno"
        message="¿Eliminar este turno?"
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

    </Box>
  )
}
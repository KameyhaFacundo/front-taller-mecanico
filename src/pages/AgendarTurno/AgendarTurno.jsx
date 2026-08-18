import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import SpeedIcon from '@mui/icons-material/Speed'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { crearTurnoPublico, listDisponibilidadPublica, listServiciosPublicos } from '../../services/publicoApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import MarcaAutocomplete from '../../components/MarcaAutocomplete'
import ModeloAutocomplete from '../../components/ModeloAutocomplete'
import { fmtDate, fmtMoney, fmtTime, fmtWeekdayShort } from '../../utils/format'
import { waLink, waLinkTaller, waMensajeTurno } from '../../utils/wa'

const PASOS = ['Tus datos', 'Tu vehículo', 'Servicio y horario', 'Confirmación']

const emptyForm = { nombre: '', telefono: '', marca: '', modelo: '', patente: '', servicios: [], fecha: '', hora: '', otroActivo: false, otroServicio: '' }

const pad = (n) => String(n).padStart(2, '0')
const aISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function AgendarTurno() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [turno, setTurno] = useState(null)
  const [huecos, setHuecos] = useState([])
  const [huecosLoading, setHuecosLoading] = useState(false)

  const servicios = useAsyncData(listServiciosPublicos, { errorMessage: 'No se pudieron cargar los servicios.' })

  // Próximos 14 días hábiles (lunes a viernes) para elegir el día.
  const fechas = useMemo(() => {
    const out = []
    const base = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      const dow = d.getDay()
      if (dow === 0 || dow === 6) continue
      out.push(d)
    }
    return out
  }, [])

  // Solo se muestran horarios que quedan libres para la duración total de los
  // servicios elegidos (misma regla que usa el taller). Guard de secuencia para
  // no pisar la respuesta anterior si se cambia de día rápido.
  const huecosSeqRef = useRef(0)
  const cargarHuecos = useCallback(async (fecha, params) => {
    const seq = ++huecosSeqRef.current
    setHuecosLoading(true)
    setHuecos([])
    try {
      const res = await listDisponibilidadPublica({ fecha, ...params })
      if (seq !== huecosSeqRef.current) return
      const min = Date.now() + 60 * 60 * 1000
      setHuecos((res?.huecos ?? []).filter((h) => new Date(`${fecha}T${h}:00`).getTime() >= min))
    } catch {
      if (seq !== huecosSeqRef.current) return
      setHuecos([])
    } finally {
      if (seq === huecosSeqRef.current) setHuecosLoading(false)
    }
  }, [])

  const tieneServicio = form.otroActivo ? form.otroServicio.trim() !== '' : form.servicios.length > 0

  useEffect(() => {
    if (!form.fecha) {
      setHuecos([])
      return
    }
    if (form.otroActivo) {
      // "Otro servicio": sin duración conocida se estiman huecos de 60 min.
      if (form.otroServicio.trim()) cargarHuecos(form.fecha, { duracion_min: 60 })
      else setHuecos([])
      return
    }
    if (form.servicios.length) cargarHuecos(form.fecha, { servicios: form.servicios })
    else setHuecos([])
  }, [form.fecha, form.servicios, form.otroActivo, form.otroServicio, cargarHuecos])

  const resumen = useMemo(() => {
    if (form.otroActivo) {
      return { seleccionados: [], otro: true, duracionTotal: 60, precioTotal: 0 }
    }
    const seleccionados = (servicios.data ?? []).filter((s) => form.servicios.includes(String(s.id)))
    return {
      seleccionados,
      otro: false,
      duracionTotal: seleccionados.reduce((acc, s) => acc + Number(s.duracion_min ?? 0), 0),
      precioTotal: seleccionados.reduce((acc, s) => acc + Number(s.precio_base ?? 0), 0),
    }
  }, [form.servicios, form.otroActivo, servicios.data])

  const finEstimado = useMemo(() => {
    if (!form.hora || !resumen.duracionTotal) return null
    const [h, m] = form.hora.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m + resumen.duracionTotal, 0, 0)
    return d
  }, [form.hora, resumen.duracionTotal])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const toggleServicio = (id) => {
    setForm((prev) => {
      const tiene = prev.servicios.includes(String(id))
      return { ...prev, otroActivo: false, otroServicio: '', servicios: tiene ? prev.servicios.filter((s) => s !== String(id)) : [...prev.servicios, String(id)], hora: '' }
    })
    setError('')
  }

  const toggleOtro = () => {
    setForm((prev) => {
      if (!prev.otroActivo) return { ...prev, otroActivo: true, servicios: [], hora: '' }
      return { ...prev, otroActivo: false, otroServicio: '', hora: '' }
    })
    setError('')
  }

  const elegirFecha = (iso) => {
    setForm((prev) => ({ ...prev, fecha: iso, hora: '' }))
    setError('')
  }

  const errorPaso = () => {
    if (step === 0) {
      if (!form.nombre.trim()) return 'Ingresá tu nombre y apellido.'
      if (!form.telefono.trim()) return 'Ingresá un teléfono de contacto.'
      if (form.telefono.replace(/\D/g, '').length < 7) return 'El teléfono debe tener al menos 7 dígitos.'
    }
    if (step === 1) {
      if (!form.marca.trim()) return 'Ingresá la marca del vehículo.'
      if (!form.modelo.trim()) return 'Ingresá el modelo del vehículo.'
      if (!form.patente.trim()) return 'Ingresá la patente del vehículo.'
    }
    if (step === 2) {
      if (!tieneServicio) return 'Elegí al menos un servicio.'
      if (!form.fecha) return 'Elegí un día de la semana.'
      if (!form.hora) return 'Elegí un horario disponible.'
    }
    return null
  }

  const siguiente = () => {
    const err = errorPaso()
    if (err) return setError(err)
    setError('')
    setStep((s) => Math.min(s + 1, PASOS.length - 1))
  }

  const atras = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      patente: form.patente.trim().toUpperCase(),
      fecha_hora: `${form.fecha}T${form.hora}:00`,
      ...(form.otroActivo ? { servicio_libre: form.otroServicio.trim() } : { servicios: form.servicios }),
    }
    setSubmitting(true)
    try {
      const creado = await crearTurnoPublico(payload)
      setTurno(creado)
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo registrar el turno. Verificá los datos e intentá de nuevo.'
      setError(msg)
      // Si el horario quedó ocupado (otra persona lo pidió primero), se recarga
      // la lista para que el cliente elija otro en el momento.
      if (/disponible|ocupado|horario/i.test(msg) && form.fecha) {
        if (form.otroActivo) cargarHuecos(form.fecha, { duracion_min: 60 })
        else if (form.servicios.length) cargarHuecos(form.fecha, { servicios: form.servicios })
        setForm((prev) => ({ ...prev, hora: '' }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setTurno(null)
    setForm(emptyForm)
    setStep(0)
    setError('')
  }

  const nombresTurno = (t) => (t?.servicios?.length ? t.servicios.map((s) => s.nombre).join(' + ') : t?.servicio?.nombre ?? '—')

  const etiquetaDia = (d) => {
    const esHoy = d.toDateString() === new Date().toDateString()
    return `${esHoy ? 'Hoy' : fmtWeekdayShort(d)} ${d.getDate()}/${d.getMonth() + 1}`
  }

  const filaResumen = (label, valor) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {valor}
      </Typography>
    </Box>
  )

  const botonWhatsApp = (() => {
    const url = waLinkTaller(waMensajeTurno(form.nombre.trim() || 'quiero'))
    return (
      <Button
        component="a"
        href={url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        color="success"
        size="large"
        fullWidth
        startIcon={<WhatsAppIcon />}
        disabled={!url}
      >
        Pedir turno por WhatsApp
      </Button>
    )
  })()

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box
        sx={{
          width: '100%',
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff' }}>
            <SpeedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Exe-Mecanica
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              Gestión integral del taller
            </Typography>
          </Box>
        </Stack>
        <Button component={RouterLink} to="/login" variant="text" color="primary" size="small" sx={{ textTransform: 'none' }}>
          Ingreso del taller
        </Button>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', p: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>
        <Box sx={{ width: '100%', maxWidth: 640 }}>
          {turno ? (
            <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.main', color: '#fff' }}>
                  <CheckCircleIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  ¡Turno solicitado!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tu solicitud quedó registrada como <strong>pendiente</strong>. Te vamos a contactar por teléfono o WhatsApp para confirmarla.
                </Typography>
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Stack spacing={1.5}>
                {filaResumen('Servicio', nombresTurno(turno))}
                {filaResumen('Fecha y hora', `${fmtDate(turno.fecha_hora)} · ${fmtTime(turno.fecha_hora)}`)}
                {filaResumen('Vehículo', `${turno.vehiculo?.marca} ${turno.vehiculo?.modelo} · ${turno.vehiculo?.patente}`)}
                {filaResumen('Nombre', turno.vehiculo?.cliente?.nombre)}
              </Stack>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                {(() => {
                  const wa = waLink(
                    turno.vehiculo?.cliente?.telefonos?.[0]?.telefono,
                    `Hola, quiero confirmar mi turno en Exe-Mecanica para ${fmtDate(turno.fecha_hora)} a las ${fmtTime(turno.fecha_hora)} (${nombresTurno(turno)}).`
                  )
                  return wa ? (
                    <Button component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="contained" color="success" startIcon={<WhatsAppIcon />} fullWidth>
                      Confirmar por WhatsApp
                    </Button>
                  ) : (
                    <Button disabled variant="contained" color="success" startIcon={<WhatsAppIcon />} fullWidth>
                      Sin teléfono registrado
                    </Button>
                  )
                })()}
                <Button onClick={reset} variant="outlined" fullWidth>
                  Solicitar otro turno
                </Button>
              </Stack>
            </Paper>
          ) : (
            <>
              <Stack spacing={0.5} sx={{ mb: 2.5, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Pedí tu turno online
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Elegí el servicio, el día y el horario. Te mostramos solo las horas que quedan libres.
                </Typography>
              </Stack>

              <Stepper activeStep={step} sx={{ mb: 3, overflowX: 'auto' }}>
                {PASOS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  {step === 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                        Tus datos
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          label="Nombre y apellido"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          required
                          fullWidth
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                        <TextField
                          label="Teléfono / WhatsApp"
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          required
                          fullWidth
                          placeholder="+54 9 11 0000 0000"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Solo lo usamos para confirmar tu turno. Nunca lo compartimos.
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          o
                        </Typography>
                      </Divider>
                      {botonWhatsApp}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        Preferís agendar hablando con alguien? El asistente de WhatsApp te ayuda.
                      </Typography>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                        Tu vehículo
                      </Typography>
                      <Stack spacing={2}>
                        <MarcaAutocomplete
                          value={form.marca}
                          onChange={(v) => setForm((prev) => ({ ...prev, marca: v }))}
                          required
                          fullWidth
                          publico
                        />
                        <ModeloAutocomplete
                          marca={form.marca}
                          value={form.modelo}
                          onChange={(v) => setForm((prev) => ({ ...prev, modelo: v }))}
                          required
                          fullWidth
                          publico
                        />
                        <TextField
                          label="Patente"
                          name="patente"
                          value={form.patente}
                          onChange={(e) => setForm((prev) => ({ ...prev, patente: e.target.value.toUpperCase() }))}
                          required
                          fullWidth
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DirectionsCarIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Stack>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                        Servicios
                      </Typography>
                      {servicios.loading ? (
                        <LinearProgress />
                      ) : (
                        <>
                          {(servicios.data ?? []).length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Todavía no hay servicios cargados para reservar online. Elegí "Otro servicio" y escribí el tuyo, o escribinos por WhatsApp y lo coordinamos.
                            </Typography>
                          )}
                          <Stack spacing={1} sx={{ mb: 2.5 }}>
                            {(servicios.data ?? []).map((s) => {
                              const activo = form.servicios.includes(String(s.id))
                              return (
                                <Paper
                                  key={s.id}
                                  variant="outlined"
                                  onClick={() => toggleServicio(s.id)}
                                  sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    borderColor: activo ? 'primary.main' : 'divider',
                                    borderWidth: activo ? 2 : 1,
                                    bgcolor: activo ? 'action.selected' : 'transparent',
                                  }}
                                >
                                  <Checkbox checked={activo} size="small" tabIndex={-1} />
                                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      {s.nombre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {s.duracion_min} min{s.precio_base != null ? ` · ${fmtMoney(s.precio_base)}` : ''}
                                    </Typography>
                                  </Box>
                                  <BuildIcon fontSize="small" color={activo ? 'primary' : 'disabled'} />
                                </Paper>
                              )
                            })}
                            <Paper
                              variant="outlined"
                              onClick={toggleOtro}
                              sx={{
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                borderRadius: 2,
                                borderColor: form.otroActivo ? 'primary.main' : 'divider',
                                borderWidth: form.otroActivo ? 2 : 1,
                                bgcolor: form.otroActivo ? 'action.selected' : 'transparent',
                              }}
                            >
                              <Checkbox checked={form.otroActivo} size="small" tabIndex={-1} />
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  Otro servicio
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ¿No encontrás el tuyo? Escribí qué necesitás.
                                </Typography>
                              </Box>
                              <BuildIcon fontSize="small" color={form.otroActivo ? 'primary' : 'disabled'} />
                            </Paper>
                            {form.otroActivo && (
                              <TextField
                                label="¿Qué servicio necesitás?"
                                value={form.otroServicio}
                                onChange={(e) => { setForm((prev) => ({ ...prev, otroServicio: e.target.value })); setError('') }}
                                fullWidth
                                placeholder="Ej: reparación de frenos, cambio de cubiertas…"
                                autoFocus
                              />
                            )}
                          </Stack>

                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                            Elegí el día
                          </Typography>
                          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mb: 2.5 }} useFlexGap>
                            {fechas.map((d) => {
                              const iso = aISO(d)
                              return (
                                <Chip
                                  key={iso}
                                  label={etiquetaDia(d)}
                                  color={form.fecha === iso ? 'primary' : 'default'}
                                  variant={form.fecha === iso ? 'filled' : 'outlined'}
                                  onClick={() => elegirFecha(iso)}
                                  sx={{ fontWeight: 700 }}
                                />
                              )
                            })}
                          </Stack>

                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                            Horarios disponibles
                          </Typography>
                          {!tieneServicio || !form.fecha ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Elegí un servicio y un día para ver los horarios libres.
                            </Typography>
                          ) : huecosLoading ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Buscando horarios…
                            </Typography>
                          ) : huecos.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              No quedan horarios libres ese día para los servicios elegidos. Probá con otro día.
                            </Typography>
                          ) : (
                            <>
                              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mb: 1 }} useFlexGap>
                                {huecos.map((h) => (
                                  <Chip
                                    key={h}
                                    label={h}
                                    color={form.hora === h ? 'primary' : 'default'}
                                    variant={form.hora === h ? 'filled' : 'outlined'}
                                    onClick={() => { setForm((prev) => ({ ...prev, hora: h })); setError('') }}
                                    sx={{ fontWeight: 700 }}
                                  />
                                ))}
                              </Stack>
                              {form.hora && finEstimado && !resumen.otro && (
                                <Typography variant="caption" color="text.secondary">
                                  El vehículo entra a las {form.hora} y queda listo aproximadamente a las {fmtTime(finEstimado)}.
                                </Typography>
                              )}
                            </>
                          )}
                    </>
                  )}
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                        Revisá y confirmá
                      </Typography>
                      <Stack spacing={1.5} sx={{ mb: 3 }}>
                        {filaResumen('Nombre', form.nombre.trim())}
                        {filaResumen('Teléfono', form.telefono.trim())}
                        {filaResumen('Vehículo', `${form.marca.trim()} ${form.modelo.trim()} · ${form.patente.trim().toUpperCase()}`)}
                        {filaResumen('Servicio', resumen.otro ? `Otro: ${form.otroServicio.trim()}` : resumen.seleccionados.map((s) => s.nombre).join(' + '))}
                        {resumen.otro
                          ? filaResumen('Duración total', 'A coordinar')
                          : filaResumen('Duración total', `${resumen.duracionTotal} min`)}
                        {!resumen.otro && resumen.precioTotal > 0 && filaResumen('Precio estimado', fmtMoney(resumen.precioTotal))}
                        {filaResumen('Día y hora', `${fmtDate(form.fecha)} · ${form.hora}`)}
                        {!resumen.otro && finEstimado && filaResumen('Entrega estimada', fmtTime(finEstimado))}
                      </Stack>
                    </>
                  )}

                  {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mt: 1 }}>
                      {error}
                    </Alert>
                  )}

                  <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                    {step > 0 && (
                      <Button onClick={atras} variant="outlined" size="large" sx={{ minWidth: 110 }} disabled={submitting}>
                        Atrás
                      </Button>
                    )}
                    {step < PASOS.length - 1 ? (
                      <Button onClick={siguiente} variant="contained" size="large" fullWidth disabled={submitting}>
                        Continuar
                      </Button>
                    ) : (
                      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} startIcon={<ScheduleIcon />}>
                        {submitting ? 'Registrando…' : 'Confirmar turno'}
                      </Button>
                    )}
                  </Stack>
                  {submitting && <LinearProgress sx={{ mt: 2 }} />}

                  {step === PASOS.length - 1 && (
                    <>
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          o
                        </Typography>
                      </Divider>
                      {botonWhatsApp}
                    </>
                  )}
                </Box>
              </Paper>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', mt: 3 }}>
                <BuildIcon fontSize="small" color="text.secondary" />
                <Typography variant="caption" color="text.secondary">
                  Exe-Mecanica · Si necesitás ayuda, llamanos o escribinos por WhatsApp.
                </Typography>
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
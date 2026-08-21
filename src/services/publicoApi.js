import axiosClient from './axiosClient'

export async function getPerfilPublico(tallerSlug) {
  const response = await axiosClient.get('/publico/perfil', { params: tallerSlug ? { taller: tallerSlug } : {} })
  return response.data
}

export async function listServiciosPublicos(tallerSlug) {
  const response = await axiosClient.get('/publico/servicios', { params: tallerSlug ? { taller: tallerSlug } : {} })
  return response.data
}

export async function listMarcasPublicas(tallerSlug) {
  const response = await axiosClient.get('/publico/marcas', { params: tallerSlug ? { taller: tallerSlug } : {} })
  return response.data
}

export async function listModelosPublicos(marcaId = null, tallerSlug) {
  const response = await axiosClient.get('/publico/modelos', {
    params: { ...(marcaId ? { marca_id: marcaId } : {}), ...(tallerSlug ? { taller: tallerSlug } : {}) },
  })
  return response.data
}

export async function listDisponibilidadPublica({ fecha, tallerSlug, ...rest }) {
  const response = await axiosClient.get('/publico/turnos/disponibilidad', {
    params: { fecha, ...rest, ...(tallerSlug ? { taller: tallerSlug } : {}) },
  })
  return response.data
}

export async function crearTurnoPublico(payload, tallerSlug) {
  const response = await axiosClient.post('/publico/turnos', payload, {
    params: tallerSlug ? { taller: tallerSlug } : {},
  })
  return response.data
}

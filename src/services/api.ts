const BASE = '/api'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('escalada_token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function handleErrorResponse(res: Response, fallbackMessage: string) {
  if (res.status === 401) {
    localStorage.removeItem('escalada_user')
    localStorage.removeItem('escalada_token')
    throw new Error('Sesion expirada, inicia sesion nuevamente')
  }
  try {
    const err = await res.json()
    throw new Error(err.error || fallbackMessage)
  } catch {
    throw new Error(fallbackMessage)
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Credenciales inválidas')
  return res.json()
}

export async function getEquipos() {
  const res = await fetch(`${BASE}/api/equipos`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error fetching equipos')
  return res.json()
}

export async function reservarEquipo(equipo_id: number, fecha: string, email: string) {
  const res = await fetch(`${BASE}/api/reservas/equipo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ equipo_id, fecha, email }),
  })
  if (!res.ok) {
    await handleErrorResponse(res, 'Error al reservar')
  }
  return res.json()
}

export async function getMisReservasEquipo() {
  const res = await fetch(`${BASE}/api/reservas/equipo`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error fetching reservas de equipo')
  return res.json()
}

export async function cancelarReservaEquipo(id: number) {
  const res = await fetch(`${BASE}/api/reservas/equipo?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    await handleErrorResponse(res, 'Error al cancelar reserva')
  }
  return res.json()
}

export async function getHorariosOcupados(fecha: string) {
  const res = await fetch(`${BASE}/api/reservas/horario?fecha=${fecha}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error fetching horarios')
  return res.json()
}

export async function getMisReservasHorario() {
  const res = await fetch(`${BASE}/api/reservas/horario`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error fetching horarios')
  return res.json()
}

export async function reservarHorario(fecha: string, hora: string, email: string) {
  const res = await fetch(`${BASE}/api/reservas/horario`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fecha, hora, email }),
  })
  if (!res.ok) {
    await handleErrorResponse(res, 'Error al reservar')
  }
  return res.json()
}

export async function cancelarReservaHorario(id: number) {
  const res = await fetch(`${BASE}/api/reservas/horario?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    await handleErrorResponse(res, 'Error al cancelar horario')
  }
  return res.json()
}

const BASE = 'http://localhost:8080'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('escalada_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
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

export async function reservarEquipo(equipo_id: number, fecha: string) {
  const res = await fetch(`${BASE}/api/reservas/equipo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ equipo_id, fecha }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al reservar')
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
    const err = await res.json()
    throw new Error(err.error || 'Error al cancelar reserva')
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

export async function reservarHorario(fecha: string, hora: string) {
  const res = await fetch(`${BASE}/api/reservas/horario`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fecha, hora }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al reservar')
  }
  return res.json()
}

export async function cancelarReservaHorario(id: number) {
  const res = await fetch(`${BASE}/api/reservas/horario?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al cancelar horario')
  }
  return res.json()
}

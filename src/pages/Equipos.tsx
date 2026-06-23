import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'
import arnesImg from '../assets/Arnes-Singing-Rock-Dome-1-tiny.jpg'
import cascoImg from '../assets/Casco-Escalada.jpg'
import chalkBagImg from '../assets/Chalk-Bag.jpg'
import cuerdaImg from '../assets/Cuerda.jpg'
import mosquetonesImg from '../assets/Mosquetones.jpg'
import zapatillasImg from '../assets/pies-de-gato-escalada-first-klimb-gris-jaspeado.jpg'
import fallbackImg from '../assets/hero.png'

interface Equipo {
  id: number
  nombre: string
  descripcion: string
  imagen_url: string
  disponible: boolean
}

interface ReservaEquipo {
  id: number
  equipo_id: number
  equipo_nombre: string
  fecha: string
  estado: string
}

function resolveEquipoImage(nombre: string): string {
  const n = nombre.toLowerCase()
  if (n.includes('arn')) return arnesImg
  if (n.includes('casco')) return cascoImg
  if (n.includes('zapat')) return zapatillasImg
  if (n.includes('cuerda')) return cuerdaImg
  if (n.includes('chalk')) return chalkBagImg
  if (n.includes('mosquet')) return mosquetonesImg
  return fallbackImg
}

export default function Equipos() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingEquipos, setPendingEquipos] = useState<Equipo[]>([])
  const [fecha, setFecha] = useState('')
  const [email, setEmail] = useState('')
  const [reservando, setReservando] = useState(false)
  const [misReservas, setMisReservas] = useState<ReservaEquipo[]>([])
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    Promise.all([api.getEquipos(), api.getMisReservasEquipo()])
      .then(([eq, reservas]) => {
        setEquipos(eq)
        setMisReservas(reservas)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes('Sesion expirada')) {
          logout();
          navigate('/login')
        } else {
          showToast(err instanceof Error ? err.message : 'Error cargando equipos', false)
        }
      })
      .finally(() => setLoading(false))
  }, [logout, navigate])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAgregarEquipo = (equipo: Equipo) => {
    setPendingEquipos(current => {
      if (current.some(item => item.id === equipo.id)) {
        showToast('Ese equipo ya está agregado', false)
        return current
      }
      showToast(`${equipo.nombre} agregado a la reserva`, true)
      return [...current, equipo]
    })
  }

  const handleQuitarEquipo = (equipoId: number) => {
    setPendingEquipos(current => current.filter(item => item.id !== equipoId))
  }

  const handleConfirmarReservas = async () => {
    if (pendingEquipos.length === 0 || !fecha || !email) return
    setReservando(true)
    try {
      for (const equipo of pendingEquipos) {
        await api.reservarEquipo(equipo.id, fecha, email)
      }
      showToast(`Reservas confirmadas: ${pendingEquipos.length} equipo(s) — ${fecha}`, true)
      const reservas = await api.getMisReservasEquipo()
      setMisReservas(reservas)
      setPendingEquipos([])
      setFecha('')
      setEmail('')
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Sesion expirada')) {
        logout()
        navigate('/login')
        return
      }
      showToast(err instanceof Error ? err.message : 'Error al reservar', false)
    } finally {
      setReservando(false)
    }
  }

  const handleCancelar = async (id: number) => {
    setCancelandoId(id)
    try {
      await api.cancelarReservaEquipo(id)
      const reservas = await api.getMisReservasEquipo()
      setMisReservas(reservas)
      showToast('Reserva cancelada', true)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Sesion expirada')) {
        logout()
        navigate('/login')
        return
      }
      showToast(err instanceof Error ? err.message : 'Error al cancelar', false)
    } finally {
      setCancelandoId(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#111827', color: '#f9fafb',
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: '#1f2937',
        borderBottom: '1px solid #374151', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/bienvenida')} style={outlineBtn}>← Inicio</button>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#e5e7eb' }}>Equipo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>{user?.nombre}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={outlineBtn}>Salir</button>
        </div>
      </header>

      <main style={{ padding: '28px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', marginTop: 0 }}>
          Equipamiento disponible
        </h2>

        {loading ? (
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {equipos.map(e => (
              <div key={e.id} style={{
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#111827' }}>
                  <img
                    src={resolveEquipoImage(e.nombre)}
                    alt={e.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={ev => {
                      const t = ev.target as HTMLImageElement
                      t.src = fallbackImg
                    }}
                  />
                </div>
                <div style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', marginTop: 0, color: '#f9fafb' }}>
                    {e.nombre}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px', marginTop: 0, lineHeight: 1.6 }}>
                    {e.descripcion}
                  </p>
                  <button onClick={() => handleAgregarEquipo(e)} style={{
                    width: '100%', padding: '9px',
                    background: '#f97316', border: 'none', borderRadius: '7px',
                    color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                  }}>
                    Agregar a reserva
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <section style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', marginTop: 0 }}>
            Reserva pendiente
          </h3>

          <div style={{
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '10px',
            padding: '20px',
          }}>
            {pendingEquipos.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0 }}>
                Todavía no has agregado equipos. Usa “Agregar a reserva” en las tarjetas.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
                {pendingEquipos.map(equipo => (
                  <div key={equipo.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '10px', padding: '10px 12px',
                    border: '1px solid #374151', borderRadius: '8px', background: '#111827',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: 600 }}>{equipo.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{equipo.descripcion}</div>
                    </div>
                    <button onClick={() => handleQuitarEquipo(equipo.id)} style={{
                      padding: '6px 10px', borderRadius: '6px', border: '1px solid #374151',
                      background: 'transparent', color: '#fca5a5', fontSize: '12px', cursor: 'pointer',
                    }}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={labelStyle}>Fecha de reserva</label>
                <input
                  type="date"
                  value={fecha}
                  min={today}
                  onChange={e => setFecha(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={handleConfirmarReservas}
              disabled={pendingEquipos.length === 0 || !fecha || !email || reservando}
              style={{
                width: '100%', padding: '10px',
                background: pendingEquipos.length > 0 && fecha && email && !reservando ? '#f97316' : '#374151',
                border: 'none', borderRadius: '7px',
                color: '#fff', fontWeight: 600,
                cursor: pendingEquipos.length > 0 && fecha && email && !reservando ? 'pointer' : 'not-allowed',
                fontSize: '13px',
              }}
            >
              {reservando ? 'Confirmando reservas...' : `Confirmar ${pendingEquipos.length} reserva(s)`}
            </button>
          </div>
        </section>

        <section style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', marginTop: 0 }}>Mis reservas de equipo</h3>
          {misReservas.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>No tienes reservas activas.</p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {misReservas.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '10px', padding: '10px 12px',
                  border: '1px solid #374151', borderRadius: '8px', background: '#1f2937',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: 600 }}>{r.equipo_nombre}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{r.fecha}</div>
                  </div>
                  <button onClick={() => handleCancelar(r.id)} disabled={cancelandoId === r.id} style={{
                    padding: '6px 10px', borderRadius: '6px', border: '1px solid #7f1d1d',
                    background: '#450a0a', color: '#fca5a5', fontSize: '12px',
                    cursor: cancelandoId === r.id ? 'not-allowed' : 'pointer',
                  }}>
                    {cancelandoId === r.id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: toast.ok ? '#16a34a' : '#dc2626',
          color: '#fff', padding: '12px 20px', borderRadius: '8px',
          fontWeight: 600, fontSize: '13px', zIndex: 200,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

const outlineBtn: React.CSSProperties = {
  padding: '7px 14px', background: 'transparent',
  border: '1px solid #374151', borderRadius: '6px',
  color: '#9ca3af', cursor: 'pointer', fontSize: '13px',
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '6px',
  fontSize: '13px', color: '#d1d5db', fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: '#111827', border: '1px solid #374151',
  borderRadius: '7px', color: '#f9fafb', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box',
}

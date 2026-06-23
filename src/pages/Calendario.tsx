import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
]
const DAYS_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface ReservaHorario {
  id: number
  fecha: string
  hora: string
  estado: string
  mine: boolean
}

interface PendingReservaHorario {
  fecha: string
  hora: string
}

export default function Calendario() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [reservas, setReservas] = useState<ReservaHorario[]>([])
  const [misReservas, setMisReservas] = useState<ReservaHorario[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [reservando, setReservando] = useState<string | null>(null)
  const [pendingReserva, setPendingReserva] = useState<PendingReservaHorario | null>(null)
  const [email, setEmail] = useState('')
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  useEffect(() => {
    api.getMisReservasHorario()
      .then(setMisReservas)
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes('Sesion expirada')) {
          logout()
          navigate('/login')
        } else {
          showToast(err instanceof Error ? err.message : 'Error cargando horarios', false)
        }
      })
  }, [logout, navigate])

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      api.getHorariosOcupados(selectedDate).then(setReservas).finally(() => setLoadingSlots(false))
    }
  }, [selectedDate])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isBusinessDay = (day: number) => {
    const weekday = new Date(year, month, day).getDay()
    return weekday >= 1 && weekday <= 5
  }

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const handleOpenConfirm = (hora: string) => {
    if (!selectedDate) return
    setPendingReserva({ fecha: selectedDate, hora })
  }

  const handleConfirmarReserva = async () => {
    if (!pendingReserva || !email) return
    setReservando(pendingReserva.hora)
    try {
      await api.reservarHorario(pendingReserva.fecha, pendingReserva.hora, email)
      showToast(`Horario ${pendingReserva.hora} reservado para ${pendingReserva.fecha}`, true)
      const [updated, mis] = await Promise.all([
        api.getHorariosOcupados(pendingReserva.fecha),
        api.getMisReservasHorario(),
      ])
      setReservas(updated)
      setMisReservas(mis)
      setPendingReserva(null)
      setEmail('')
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Sesion expirada')) {
        logout()
        navigate('/login')
        return
      }
      showToast(err instanceof Error ? err.message : 'Error al reservar', false)
    } finally {
      setReservando(null)
    }
  }

  const handleCancelarHorario = async (id: number) => {
    setCancelandoId(id)
    try {
      await api.cancelarReservaHorario(id)
      showToast('Reserva de horario cancelada', true)
      const mis = await api.getMisReservasHorario()
      setMisReservas(mis)
      if (selectedDate) {
        const updated = await api.getHorariosOcupados(selectedDate)
        setReservas(updated)
      }
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
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: '#1f2937',
        borderBottom: '1px solid #374151', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/bienvenida')} style={outlineBtn}>← Inicio</button>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#e5e7eb' }}>Horarios</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>{user?.nombre}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={outlineBtn}>Salir</button>
        </div>
      </header>

      <main style={{
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
      }}>
        {/* Calendario */}
        <div>
          <div style={{
            background: '#1f2937', border: '1px solid #374151', borderRadius: '8px',
            padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#d1d5db',
          }}>
            Servicio activo hasta las 10:00 pm. Reservas solo en dias habiles (lunes a viernes).
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={navBtn}>‹</button>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={navBtn}>›</button>
          </div>

          {/* Cabecera días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#4b5563', padding: '6px 0', fontWeight: 600 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const ds = dateStr(day)
              const isSelected = selectedDate === ds
              const isToday = ds === todayStr
              const isPast = ds < todayStr
              const isBusiness = isBusinessDay(day)
              const hasMiReserva = misReservas.some(r => r.fecha === ds)

              return (
                <div
                  key={day}
                  onClick={() => !isPast && isBusiness && setSelectedDate(ds)}
                  style={{
                    padding: '9px 0', textAlign: 'center', borderRadius: '6px',
                    cursor: isPast || !isBusiness ? 'default' : 'pointer',
                    background: isSelected ? '#f97316'
                      : hasMiReserva ? '#14532d'
                      : !isBusiness ? '#111827'
                      : isToday ? '#1c3a52'
                      : '#1f2937',
                    color: isPast || !isBusiness ? '#374151' : '#f9fafb',
                    fontWeight: isSelected || isToday ? 700 : 400,
                    border: isToday && !isSelected ? '1px solid #f97316' : '1px solid transparent',
                    fontSize: '13px',
                    transition: 'background 0.1s',
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '12px', color: '#4b5563' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#14532d', display: 'inline-block' }} />
              Con reserva
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f97316', display: 'inline-block' }} />
              Seleccionado
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#111827', border: '1px solid #374151', display: 'inline-block' }} />
              No habil
            </span>
          </div>
        </div>

        {/* Panel horarios */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', marginTop: 0, marginBottom: '12px' }}>
            {selectedDate ? `Horarios — ${selectedDate}` : 'Selecciona un día'}
          </h3>

          {!selectedDate ? (
            <div style={{
              background: '#1f2937', border: '1px dashed #374151',
              borderRadius: '8px', padding: '32px 16px',
              textAlign: 'center', color: '#4b5563', fontSize: '13px',
            }}>
              Haz clic en un día del calendario para ver los horarios disponibles
            </div>
          ) : loadingSlots ? (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>Cargando horarios...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {HOURS.map(hora => {
                const r = reservas.find(x => x.hora === hora)
                const ocupado = !!r
                const mio = r?.mine

                return (
                  <div key={hora} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 13px', borderRadius: '7px',
                    background: mio ? '#14532d' : ocupado ? '#1f2937' : '#1f2937',
                    border: mio ? '1px solid #16a34a' : ocupado ? '1px solid #374151' : '1px solid #374151',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: ocupado && !mio ? '#4b5563' : '#f9fafb' }}>
                      {hora}
                    </span>
                    {mio ? (
                      <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700 }}>✓ Mía</span>
                    ) : ocupado ? (
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>Ocupado</span>
                    ) : (
                      <button
                        onClick={() => handleOpenConfirm(hora)}
                        disabled={reservando === hora}
                        style={{
                          padding: '4px 12px', background: '#f97316',
                          border: 'none', borderRadius: '5px',
                          color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px',
                        }}
                      >
                        {reservando === hora ? '...' : 'Reservar'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: '14px' }}>
            <h4 style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px' }}>Mis reservas</h4>
            {misReservas.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '12px' }}>Sin reservas registradas.</p>
            ) : (
              <div style={{ display: 'grid', gap: '6px' }}>
                {misReservas.slice(0, 8).map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '8px', padding: '8px 10px',
                    border: '1px solid #374151', borderRadius: '6px', background: '#1f2937',
                  }}>
                    <span style={{ fontSize: '12px', color: '#d1d5db' }}>{r.fecha} {r.hora}</span>
                    <button onClick={() => handleCancelarHorario(r.id)} disabled={cancelandoId === r.id} style={{
                      padding: '4px 8px', borderRadius: '5px',
                      border: '1px solid #7f1d1d', background: '#450a0a',
                      color: '#fca5a5', fontSize: '11px',
                      cursor: cancelandoId === r.id ? 'not-allowed' : 'pointer',
                    }}>
                      {cancelandoId === r.id ? '...' : 'Cancelar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            marginTop: '14px',
            border: '1px solid #374151',
            background: '#1f2937',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <h4 style={{ fontSize: '13px', color: '#e5e7eb', margin: '0 0 8px' }}>Recomendaciones para la llegada</h4>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#9ca3af', fontSize: '12px', lineHeight: 1.5 }}>
              <li>Llega 15 minutos antes de tu turno para registro y calentamiento.</li>
              <li>Trae documento de identidad y ropa deportiva comoda.</li>
              <li>Si reservas equipo, pasa por recepcion antes de entrar al muro.</li>
              <li>Evita comer pesado 1 hora antes de la sesion.</li>
            </ul>
          </div>
        </div>
      </main>

      {pendingReserva && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 120, padding: '16px',
        }}>
          <div style={{
            background: '#1f2937', border: '1px solid #374151',
            borderRadius: '10px', padding: '28px',
            width: '100%', maxWidth: '380px',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '4px', fontSize: '17px', fontWeight: 700 }}>
              Confirmar reserva
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>
              Revisa la información antes de guardar y enviar el correo.
            </p>
            <div style={{ marginBottom: '18px', padding: '10px 12px', borderRadius: '8px', background: '#111827', border: '1px solid #374151', color: '#cbd5e1', fontSize: '12px', lineHeight: 1.5 }}>
              <div><strong style={{ color: '#f9fafb' }}>Fecha:</strong> {pendingReserva.fecha}</div>
              <div><strong style={{ color: '#f9fafb' }}>Hora:</strong> {pendingReserva.hora}</div>
              <div><strong style={{ color: '#f9fafb' }}>Usuario:</strong> {user?.nombre}</div>
            </div>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              style={{
                ...inputStyle,
                marginBottom: '18px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setPendingReserva(null); setEmail('') }}
                style={{
                  flex: 1, padding: '10px',
                  background: 'transparent', border: '1px solid #374151',
                  borderRadius: '7px', color: '#9ca3af', cursor: 'pointer', fontSize: '13px',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarReserva}
                disabled={!!reservando || !email}
                style={{
                  flex: 1, padding: '10px',
                  background: reservando ? '#374151' : '#f97316', border: 'none',
                  borderRadius: '7px', color: '#fff', fontWeight: 600,
                  cursor: reservando || !email ? 'not-allowed' : 'pointer', fontSize: '13px',
                }}
              >
                {reservando ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

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

const navBtn: React.CSSProperties = {
  padding: '5px 12px', background: '#1f2937',
  border: '1px solid #374151', borderRadius: '6px',
  color: '#f9fafb', cursor: 'pointer', fontSize: '18px', lineHeight: 1,
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

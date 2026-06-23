import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import reservarEquipoImg from '../assets/Reservar-Equipo.jpg'
import reservarHorarioImg from '../assets/Reservar-Horario.jpg'

export default function Welcome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(circle at top, #1f2937 0%, #111827 55%, #0f172a 100%)',
      color: '#f9fafb',
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: '#1f2937',
        borderBottom: '1px solid #374151', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/images/ui/brand.svg"
            alt="Escalada"
            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontWeight: 700, fontSize: '17px' }}>EscaLab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>{user?.nombre}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={outlineBtn}>Salir</button>
        </div>
      </header>

      <main style={{ padding: '36px 24px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ color: '#f97316', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Bienvenido
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px', color: '#f9fafb', lineHeight: 1.1 }}>
            Hola, {user?.nombre && !/administrador/i.test(user.nombre) ? user.nombre : 'Usuario'}
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: 0, fontSize: '14px', marginTop: 0, lineHeight: 1.6 }}>
            Selecciona una opción para continuar con tus reservas de equipo o calendario.
          </p>
        </div>

        <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', marginTop: 0 }}>
          Accesos rápidos
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          <div onClick={() => navigate('/equipos')} style={cardStyle}>
            <img
              src={reservarEquipoImg}
              alt="Equipo de escalada"
              style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }}
            />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f9fafb', marginBottom: '8px', marginTop: 0 }}>
              Reservar Equipo
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', marginTop: 0 }}>
              Arneses, cascos, cuerdas, zapatillas y equipamiento técnico de escalada
            </p>
            <span style={tagStyle}>Ver equipo →</span>
          </div>

          <div onClick={() => navigate('/calendario')} style={cardStyle}>
            <img
              src={reservarHorarioImg}
              alt="Agenda de horarios"
              style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }}
            />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f9fafb', marginBottom: '8px', marginTop: 0 }}>
              Reservar Horario
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', marginTop: 0 }}>
              Elige el día y la hora para tu sesión de escalada en el muro deportivo
            </p>
            <span style={tagStyle}>Ver calendario →</span>
          </div>
        </div>
      </main>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#1f2937', border: '1px solid #374151',
  borderRadius: '10px', padding: '28px 24px',
  cursor: 'pointer',
}

const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#f97316', color: '#fff',
  padding: '6px 16px', borderRadius: '6px',
  fontSize: '13px', fontWeight: 600,
}

const outlineBtn: React.CSSProperties = {
  padding: '7px 14px', background: 'transparent',
  border: '1px solid #374151', borderRadius: '6px',
  color: '#9ca3af', cursor: 'pointer', fontSize: '13px',
}

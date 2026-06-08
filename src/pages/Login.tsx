import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(username, password)
      login(data.user, data.token)
      navigate('/bienvenida')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
      padding: '16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <img
            src="/images/ui/brand.svg"
            alt="Escalada"
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <h1 style={{ color: '#f9fafb', fontSize: '24px', margin: 0, fontWeight: 700 }}>EscaLab</h1>
        </div>
        <p style={{ color: '#9ca3af', marginBottom: '28px', fontSize: '14px', marginTop: '4px' }}>
          Reservas de escalada deportiva
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Usuario</label>
          <input
            type="text"
            placeholder="Ej: admin"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
          <label style={labelStyle}>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, marginBottom: '20px' }}
          />
          {error && (
            <div style={{
              background: '#7f1d1d', border: '1px solid #991b1b',
              borderRadius: '6px', padding: '10px 14px',
              color: '#fca5a5', fontSize: '13px', marginBottom: '16px',
            }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: loading ? '#374151' : '#f97316',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: 600, fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ color: '#4b5563', marginTop: '24px', fontSize: '12px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
          Credenciales demo: <span style={{ color: '#6b7280' }}>admin</span> / admin123
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '6px',
  fontSize: '13px', color: '#d1d5db', fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: '14px',
  background: '#111827',
  border: '1px solid #374151',
  borderRadius: '7px',
  color: '#f9fafb',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

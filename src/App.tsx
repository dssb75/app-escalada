import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import Equipos from './pages/Equipos'
import Calendario from './pages/Calendario'

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/bienvenida" element={<PrivateRoute><Welcome /></PrivateRoute>} />
          <Route path="/equipos" element={<PrivateRoute><Equipos /></PrivateRoute>} />
          <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

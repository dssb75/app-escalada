import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: number
  username: string
  nombre: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('escalada_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('escalada_token'))

  const login = (u: User, t: string) => {
    setUser(u)
    setToken(t)
    localStorage.setItem('escalada_user', JSON.stringify(u))
    localStorage.setItem('escalada_token', t)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('escalada_user')
    localStorage.removeItem('escalada_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

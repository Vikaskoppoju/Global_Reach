'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Admin User', email: 'admin@globalreach.org', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Priya Nair', email: 'priya@email.com', password: 'scholar123', role: 'applicant' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gr_user')
      if (stored) setUser(JSON.parse(stored))
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 700))
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (!found) return { ok: false, error: 'Invalid email or password.' }
    const { password: _pw, ...u } = found
    setUser(u); localStorage.setItem('gr_user', JSON.stringify(u))
    return { ok: true }
  }

  const signup = async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 900))
    if (DEMO_USERS.some(u => u.email === email))
      return { ok: false, error: 'An account with this email already exists.' }
    const newUser: User = { id: Date.now().toString(), name, email, role: 'applicant' }
    setUser(newUser); localStorage.setItem('gr_user', JSON.stringify(newUser))
    return { ok: true }
  }

  const logout = () => { setUser(null); localStorage.removeItem('gr_user') }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

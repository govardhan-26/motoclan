import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, fetchMe } from '../api/auth'
import type { UserProfile, RegisterRequest, LoginRequest } from '../api/types'

const DEMO_TOKEN = 'demo_mock_token'

const DEMO_USER: UserProfile = {
  user_id: 'demo-001',
  username: 'demo_rider',
  full_name: 'Demo Rider',
  bio: 'Just exploring Moto Clan!',
  location: 'Austin, TX',
  profile_image_url: null,
  motorcycle_details: 'Harley-Davidson Road King 2022',
  riding_experience_years: 5,
  followers_count: 42,
  following_count: 18,
  posts_count: 7,
}

interface AuthContextValue {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  loginAsDemo: () => void
  logout: () => void
  fetchCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    const token = sessionStorage.getItem('access_token')
    // Demo mode: skip the real API call
    if (token === DEMO_TOKEN) {
      setUser(DEMO_USER)
      return
    }
    try {
      const profile = await fetchMe()
      setUser(profile)
    } catch {
      setUser(null)
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
    }
  }, [])

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      fetchCurrentUser().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchCurrentUser])

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin({ email, password })
    await fetchCurrentUser()
  }, [fetchCurrentUser])

  const register = useCallback(async (data: RegisterRequest) => {
    await apiRegister(data)
    const credentials: LoginRequest = { email: data.email, password: data.password }
    await apiLogin(credentials)
    await fetchCurrentUser()
  }, [fetchCurrentUser])

  const loginAsDemo = useCallback(() => {
    sessionStorage.setItem('access_token', DEMO_TOKEN)
    setUser(DEMO_USER)
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
    window.location.href = '/login'
  }, [])

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginAsDemo,
    logout,
    fetchCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { authApi } from "@/lib/api"
import type { User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Do not block local logout when server session is already gone.
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

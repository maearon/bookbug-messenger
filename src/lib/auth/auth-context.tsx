"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../auth"
// import { authClient } from "@/lib/auth-client";

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // const { data: sessionClient, isPending } = authClient.useSession();
  // const userClient = sessionClient?.user ?? null;

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken")
    const storedRefreshToken = localStorage.getItem("refreshToken")

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken)
      fetchCurrentUser(storedAccessToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch current user
  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`/api/v1/users/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token might be expired, try to refresh
        await refreshAccessToken()
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()
    setUser(data.user)
    setAccessToken(data.token.access.token)
    localStorage.setItem("accessToken", data.token.access.token)
    localStorage.setItem("refreshToken", data.token.refresh.token)
  }

  // Register function
  const register = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()
    setUser(data.user)
    setAccessToken(data.token.access.token)
    localStorage.setItem("accessToken", data.token.access.token)
    localStorage.setItem("refreshToken", data.token.refresh.token)
  }

  // Logout function
  const logout = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  // Refresh access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken")

    if (!refreshToken) {
      logout()
      return
    }

    try {
      const response = await fetch("/api/v1/auth/refresh-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        setAccessToken(data.token.access.token)
        localStorage.setItem("accessToken", data.token.access.token)
        await fetchCurrentUser(data.token.refresh.token)
      } else {
        logout()
      }
    } catch (error) {
      console.error("[v0] Failed to refresh token:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout, refreshAccessToken }}>
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

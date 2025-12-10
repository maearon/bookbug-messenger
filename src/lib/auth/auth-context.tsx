"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken,  clearTokens } from "@/lib/token"
import { authService } from "@/api/services/authService"

export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
  refreshAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken())
  const [refreshToken, setRefreshTokenState] = useState<string | null>(getRefreshToken())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = getAccessToken()
    if (storedToken) {
      setAccessTokenState(storedToken)
    }
    const storedRefreshToken = getRefreshToken()
    if (storedRefreshToken) {
      setRefreshTokenState(storedRefreshToken)
    }
    setIsLoading(false)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    try {
      // Call Java backend to refresh token
      const response = await authService.refresh?.(refreshToken || "")
      if (response?.token) {
        setAccessToken(response.tokens.access.token)
        setAccessTokenState(response.tokens.access.token)
        setRefreshToken(response.tokens.refresh.token)
        setRefreshTokenState(response.tokens.refresh.token)
        return response.token
      }
    } catch (err) {
      console.error("[auth] Token refresh failed:", err)
      clearTokens()
      setAccessTokenState(null)
      setUser(null)
    }
    return null
  }, [])

  // ------------ LOGIN --------------
  const login = async (email: string, password: string) => {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();

    const access = data.tokens.access.token;
    const refresh = data.tokens.refresh.token;

    // setTokens(access, refresh, true);
    setAccessToken(access)
    setAccessTokenState(access)
    setRefreshToken(refresh)
    setRefreshTokenState(refresh)
    setUser(data.user);
  };

  // const login = useCallback(async (email: string, password: string) => {
  //   setIsLoading(true)
  //   setError(null)

  //   try {
  //     const response = await authService.signIn(email, password)
  //     if (!response) {
  //       throw new Error("Login failed")
  //     }

  //     if (response.accessToken) {
  //       setAccessToken(response.accessToken)
  //       setAccessTokenState(response.accessToken)
  //       setRefreshToken(response.refreshToken)
  //       setRefreshTokenState(response.refreshToken)
  //     }
  //     if (response.user) {
  //       setUser(response.user)
  //     }
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : "Login failed"
  //     setError(message)
  //     throw err
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [])

  // ------------ REGISTER --------------
  const register = async (email: string, password: string, name: string) => {
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) throw new Error("Register failed");

    const data = await res.json();

    const access = data.tokens.access.token;
    const refresh = data.tokens.refresh.token;

    // setTokens(access, refresh, true);
    setAccessToken(access)
    setAccessTokenState(access)
    setRefreshToken(refresh)
    setRefreshTokenState(refresh)
    setUser(data.user);
  };

  // const register = useCallback(async (email: string, password: string, name: string) => {
  //   setIsLoading(true)
  //   setError(null)

  //   try {
  //     const response = await authService.signUp(email.split("@")[0], email, password, name, "")
  //     if (!response || response.error) {
  //       throw new Error(response?.error || "Registration failed")
  //     }

  //     if (response.tokens) {
  //       setAccessToken(response.tokens.access.token)
  //       setAccessTokenState(response.tokens.access.token)
  //       setRefreshToken(response.tokens.refresh.token)
  //       setRefreshTokenState(response.tokens.refresh.token)
  //     }
  //     if (response.user) {
  //       setUser(response.user)
  //     }
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : "Registration failed"
  //     setError(message)
  //     throw err
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [])

  // ------------ LOGOUT --------------
  // const logout = async () => {
  //   try {
  //     await fetch("/api/v1/auth/logout", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ refreshToken: getRefreshToken() }),
  //     });
  //   } catch {
  //     /* ignore */
  //   }

  //   clearTokens();
  //   setUser(null);
  // };

  const logout = useCallback(() => {
    setError(null)
    clearTokens()
    setAccessTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        register,
        logout,
        isLoading,
        error,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, isAuthenticated, logout as pbLogout, refreshAuth, type AuthUser } from "@/lib/auth"
import pb from "@/lib/pocketbase"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      if (isAuthenticated()) {
        // Try to refresh the token
        const refreshed = await refreshAuth()
        if (refreshed) {
          setUser(getCurrentUser())
        } else {
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for auth state changes
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(getCurrentUser())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const logout = () => {
    pbLogout()
    setUser(null)
    router.push("/auth/login")
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}

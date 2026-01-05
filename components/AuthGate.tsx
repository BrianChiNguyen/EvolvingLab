"use client"

import { useState, useEffect } from "react"
import { AuthPage } from "@/components/AuthPage"

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedUser = localStorage.getItem("active_user")
    if (storedUser) {
        setUser(storedUser)
    }
  }, [])

  const login = (username: string) => {
    localStorage.setItem("active_user", username)
    setUser(username)
  }

  // Prevent hydration mismatch by waiting for mount
  if (!mounted) return null

  // If no user, show the Lock Screen
  if (!user) {
    return <AuthPage onLogin={login} />
  }

  // If user exists, show the App
  return <>{children}</>
}
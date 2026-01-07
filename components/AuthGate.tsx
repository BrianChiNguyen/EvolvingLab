"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { AuthPage } from "@/components/AuthPage"
import { Session } from "@supabase/supabase-js"

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Listen for changes (Logout/Login)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono text-xs animate-pulse">ESTABLISHING LINK...</div>
  }

  if (!session) {
    return <AuthPage onLogin={(s) => setSession(s)} />
  }

  return <>{children}</>
}
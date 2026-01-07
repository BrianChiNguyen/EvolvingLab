"use client"

import { useState } from "react"
import { supabase } from "@/utils/supabase" // Import the bridge
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Lock, Mail, ShieldCheck, Cpu, ArrowRight } from "lucide-react"

interface AuthPageProps {
  onLogin: (session: any) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAuth = async () => {
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
        if (isRegistering) {
            // --- SIGN UP ---
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            // Supabase sometimes requires email confirmation. 
            // If auto-confirm is on (default), they might log in immediately, 
            // otherwise tell them to check email.
            if (data.user && !data.session) {
                setMessage("Uplink established. Check your email to verify identity.")
            } else if (data.session) {
                onLogin(data.session)
            }
        } else {
            // --- LOGIN ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            onLogin(data.session)
        }
    } catch (err: any) {
        setError(err.message || "Authentication failed")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black bg-[url('/grid-pattern.svg')] relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse" />
      
      <Card className="w-[400px] bg-slate-950/80 border-slate-800 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.1)] relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle className="text-2xl font-bold tracking-widest text-white">
                    {isRegistering ? "INITIALIZE ID" : "SYSTEM ACCESS"}
                </CardTitle>
                <CardDescription className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    Supabase Secure Uplink
                </CardDescription>
            </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500">Email Identity</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@evolve.net" 
                        className="pl-9 bg-slate-900 border-slate-800 text-slate-200 font-mono tracking-wider focus:border-primary/50" 
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500">Secure Passkey</Label>
                <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="pl-9 bg-slate-900 border-slate-800 text-slate-200 font-mono tracking-wider focus:border-primary/50" 
                        onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                    />
                </div>
            </div>

            {error && (
                <div className="text-[10px] font-bold text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20 text-center animate-in fade-in slide-in-from-top-1">
                    ⚠ {error}
                </div>
            )}
            
            {message && (
                <div className="text-[10px] font-bold text-green-500 bg-green-500/10 p-2 rounded border border-green-500/20 text-center animate-in fade-in slide-in-from-top-1">
                    ✓ {message}
                </div>
            )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
            <Button 
                onClick={handleAuth} 
                className="w-full bg-primary text-black font-bold tracking-widest hover:bg-cyan-400 h-11"
                disabled={isLoading}
            >
                {isLoading ? <Cpu className="h-4 w-4 animate-spin" /> : (isRegistering ? "CREATE CLOUD ID" : "AUTHENTICATE")}
            </Button>
            
            <div className="text-center">
                <button 
                    onClick={() => { setIsRegistering(!isRegistering); setError(""); setMessage(""); }}
                    className="text-xs text-slate-500 hover:text-primary transition-colors uppercase tracking-wider flex items-center justify-center gap-2 mx-auto"
                >
                    {isRegistering ? "Access Existing ID" : "Create New Cloud ID"}
                    <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}
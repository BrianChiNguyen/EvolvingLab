"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Fingerprint, Lock, Mail, ArrowRight, ShieldCheck, Cpu, Smartphone } from "lucide-react"

interface AuthPageProps {
  onLogin: (identifier: string) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  
  // New Credentials State
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAuth = () => {
    setError("")
    setIsLoading(true)

    // Simulate System Processing
    setTimeout(() => {
        // 1. Basic Validation
        if (!email || !password) {
            setError("MISSING CORE PARAMETERS")
            setIsLoading(false)
            return
        }

        // Phone is required only for new Evolve IDs
        if (isRegistering && !phone) {
            setError("CONTACT UPLINK REQUIRED")
            setIsLoading(false)
            return
        }

        const storedUsers = localStorage.getItem("system_users")
        const users = storedUsers ? JSON.parse(storedUsers) : {}

        if (isRegistering) {
            // --- REGISTRATION FLOW ---
            if (users[email]) {
                setError("EVOLVE ID ALREADY EXISTS")
            } else {
                // Save complex object: Email -> { Phone, Password }
                users[email] = { password, phone }
                localStorage.setItem("system_users", JSON.stringify(users))
                
                // Auto-login
                onLogin(email)
            }
        } else {
            // --- LOGIN FLOW ---
            // Check if user exists AND password matches
            // Note: users[email] is now an object, so we check users[email].password
            if (users[email] && users[email].password === password) {
                onLogin(email)
            } else {
                setError("ACCESS DENIED: INVALID CREDENTIALS")
            }
        }
        setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black bg-[url('/grid-pattern.svg')] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse" />
      
      <Card className="w-[400px] bg-slate-950/80 border-slate-800 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.1)] relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                {isRegistering ? <Fingerprint className="h-8 w-8 text-primary animate-pulse" /> : <Lock className="h-8 w-8 text-primary" />}
            </div>
            <div>
                <CardTitle className="text-2xl font-bold tracking-widest text-white">
                    {isRegistering ? "NEW EVOLVE ID" : "SYSTEM ACCESS"}
                </CardTitle>
                <CardDescription className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    {isRegistering ? "Establish Biometric Identity" : "Verify Digital Signature"}
                </CardDescription>
            </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6">
            
            {/* INPUT: EMAIL */}
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

            {/* INPUT: PHONE (Register Only) */}
            {isRegistering && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[10px] uppercase tracking-widest text-slate-500">Mobile Uplink</Label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000" 
                            className="pl-9 bg-slate-900 border-slate-800 text-slate-200 font-mono tracking-wider focus:border-primary/50" 
                        />
                    </div>
                </div>
            )}

            {/* INPUT: PASSWORD */}
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

            {/* ERROR DISPLAY */}
            {error && (
                <div className="text-[10px] font-bold text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20 text-center animate-in fade-in slide-in-from-top-1">
                    ⚠ {error}
                </div>
            )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
            <Button 
                onClick={handleAuth} 
                className="w-full bg-primary text-black font-bold tracking-widest hover:bg-cyan-400 h-11"
                disabled={isLoading}
            >
                {isLoading ? <Cpu className="h-4 w-4 animate-spin" /> : (isRegistering ? "GENERATE ID" : "AUTHENTICATE")}
            </Button>
            
            <div className="text-center">
                <button 
                    onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                    className="text-xs text-slate-500 hover:text-primary transition-colors uppercase tracking-wider flex items-center justify-center gap-2 mx-auto"
                >
                    {isRegistering ? "Access Existing ID" : "Create New Evolve ID"}
                    <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </CardFooter>
      </Card>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em]">
        Secure Connection • Evolving Lab OS v1.1
      </div>
    </div>
  )
}
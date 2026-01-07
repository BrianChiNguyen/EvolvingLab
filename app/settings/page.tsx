"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trash2, Database, ShieldAlert, UserX, Smartphone, Mail, Lock, Activity, HardDrive, Key, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'

// 🔒 SECURITY CONFIG
const ADMIN_EMAIL = "congtrangunsw@gmail.com"

export default function SettingsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState("")
  const [loading, setLoading] = useState(true)

  // Password Update State
  const [newPassword, setNewPassword] = useState("")
  const [isUpdatingPass, setIsUpdatingPass] = useState(false)

  // Load Data & Check Authorization
  useEffect(() => {
    const checkSecurity = async () => {
        // 1. GET REAL CLOUD USER
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            router.push("/")
            return
        }

        setCurrentUserEmail(user.email || "")
        
        // 2. MOCK USER LIST (Only show active session)
        setUsers([
            { 
                id: user.id, 
                email: user.email, 
                role: user.email === ADMIN_EMAIL ? "ROOT_ADMIN" : "OPERATIVE", 
                last_active: new Date().toISOString() 
            }
        ])
        
        setLoading(false)
    }

    checkSecurity()
  }, [router])

  // --- HANDLER: UPDATE PASSWORD ---
  const handleUpdatePassword = async () => {
    if (!newPassword) return alert("Enter a new password first.")
    setIsUpdatingPass(true)

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (error) {
        alert("Update Failed: " + error.message)
    } else {
        alert("✓ Credentials Rotated Successfully")
        setNewPassword("")
    }
    setIsUpdatingPass(false)
  }

  // --- HANDLER: LOGOUT ---
  const handleLogout = async () => {
    if (!confirm("Terminate Session?")) return
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // --- VISUALS ---
  const trafficData = [
    { time: '00:00', users: 120, load: 20 },
    { time: '04:00', users: 80, load: 15 },
    { time: '08:00', users: 450, load: 65 },
    { time: '12:00', users: 980, load: 92 },
    { time: '16:00', users: 850, load: 78 },
    { time: '20:00', users: 340, load: 45 },
    { time: '23:59', users: 190, load: 25 },
  ]

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono text-xs animate-pulse">ESTABLISHING SECURE CONNECTION...</div>

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
            <Link href="/" className="text-xs font-mono text-slate-500 mb-2 tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-3 w-3" /> RETURN TO GRID
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <Lock className="h-8 w-8 text-primary" /> SYSTEM CONFIG
            </h1>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded text-xs text-primary font-bold uppercase tracking-widest animate-pulse">
            Secure Uplink Active
        </div>
      </div>

      <div className="grid gap-6">

        {/* --- SECTION 1: SYSTEM TELEMETRY --- */}
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-950/40 border-slate-800 md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Neural Network Traffic
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData}>
                            <defs>
                                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }} />
                            <Area type="monotone" dataKey="load" stroke="#06b6d4" fillOpacity={1} fill="url(#colorLoad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-slate-950/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <HardDrive className="h-4 w-4" /> Cloud Storage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-200 mb-2">0.05% <span className="text-xs text-slate-500 font-normal">USED</span></div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `5%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-950/40 border-slate-800 flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Clearance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-white tracking-tighter truncate">{currentUserEmail}</div>
                        <p className="text-[10px] text-green-500 mt-1 uppercase tracking-wider">Verified Identity</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* --- SECTION 2: SECURITY PROTOCOLS (CHANGE PASSWORD) --- */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <Key className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Security Protocol</span>
                </div>
                <CardTitle className="text-xl text-slate-200">Rotate Credentials</CardTitle>
                <CardDescription>Update your access passkey. Required after recovery sequence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4 max-w-md">
                    <div className="flex-1 space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">New Passkey</Label>
                        <Input 
                            type="password" 
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-slate-900 border-slate-800"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={handleUpdatePassword} 
                            disabled={isUpdatingPass}
                            className="bg-primary text-black font-bold hover:bg-cyan-400"
                        >
                            {isUpdatingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : "UPDATE"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* --- SECTION 3: DANGER ZONE --- */}
        <Card className="bg-red-950/10 border-red-900/30 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-red-500 mb-2">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Hazard Zone</span>
                </div>
                <CardTitle className="text-xl text-slate-200">Terminate Uplink</CardTitle>
                <CardDescription className="text-red-400/70">Close secure connection on this terminal.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    onClick={handleLogout}
                    variant="destructive" 
                    className="bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/50 w-full sm:w-auto"
                >
                    <UserX className="mr-2 h-4 w-4" />
                    LOGOUT
                </Button>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Database, ShieldAlert, UserX, Smartphone, Mail, Lock, Activity, HardDrive } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase" // <--- CONNECT TO CLOUD
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts'

// 🔒 SECURITY CONFIG
const ADMIN_EMAIL = "congtrangunsw@gmail.com"

export default function SettingsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load Data & Check Authorization
  useEffect(() => {
    const checkSecurity = async () => {
        // 1. GET REAL CLOUD USER
        const { data: { user } } = await supabase.auth.getUser()
        
        // 🛑 SECURITY CHECK
        if (!user || user.email !== ADMIN_EMAIL) {
            router.push("/")
            return
        }

        setIsAuthorized(true)
        setCurrentUserEmail(user.email)
        
        // 2. SIMULATE DATABASE USERS
        // (Note: Supabase client cannot list all users for security reasons without an Admin API)
        // We will show the Active Admin Session here.
        setUsers([
            { 
                id: user.id, 
                email: user.email, 
                role: "ROOT_ADMIN", 
                last_active: new Date().toISOString() 
            }
        ])
        
        setLoading(false)
    }

    checkSecurity()
  }, [router])

  // --- MOCK DATA FOR CHARTS (Visuals) ---
  const trafficData = [
    { time: '00:00', users: 120, load: 20 },
    { time: '04:00', users: 80, load: 15 },
    { time: '08:00', users: 450, load: 65 },
    { time: '12:00', users: 980, load: 92 },
    { time: '16:00', users: 850, load: 78 },
    { time: '20:00', users: 340, load: 45 },
    { time: '23:59', users: 190, load: 25 },
  ]

  // Sign Out Logic
  const handleLogout = async () => {
    if (!confirm("Terminate Admin Session?")) return
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono text-xs animate-pulse">VERIFYING BIOMETRICS...</div>
  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-red-900/20 pb-6">
        <div>
            <Link href="/" className="text-xs font-mono text-slate-500 mb-2 tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-3 w-3" /> RETURN TO GRID
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-red-500 flex items-center gap-3">
              <Lock className="h-8 w-8" /> ADMIN CONFIGURATION
            </h1>
        </div>
        <div className="bg-red-950/30 border border-red-900/50 px-4 py-2 rounded text-xs text-red-400 font-bold uppercase tracking-widest animate-pulse">
            Root Access Granted
        </div>
      </div>

      <div className="grid gap-6">

        {/* --- SECTION 1: SYSTEM TELEMETRY (ANALYTICS) --- */}
        <div className="grid md:grid-cols-3 gap-6">
            
            {/* CHART 1: NETWORK TRAFFIC */}
            <Card className="bg-slate-950/40 border-slate-800 md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Global Network Traffic
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData}>
                            <defs>
                                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }} />
                            <Area type="monotone" dataKey="load" stroke="#ef4444" fillOpacity={1} fill="url(#colorLoad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* CHART 2: STORAGE & USERS */}
            <div className="space-y-6">
                {/* Storage Meter */}
                <Card className="bg-slate-950/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <HardDrive className="h-4 w-4" /> Cloud Database
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-200 mb-2">0.04% <span className="text-xs text-slate-500 font-normal">USED</span></div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `5%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">Maximum capacity: 500MB (Supabase Tier)</p>
                    </CardContent>
                </Card>

                {/* User Count */}
                <Card className="bg-slate-950/40 border-slate-800 flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin Nodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white tracking-tighter">1</div>
                        <p className="text-[10px] text-green-500 mt-1 uppercase tracking-wider">System Secure</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* --- SECTION 2: USER DATABASE --- */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <Database className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Active Sessions</span>
                </div>
                <CardTitle className="text-xl text-slate-200">Registered Evolve IDs</CardTitle>
                <CardDescription>Manage system access privileges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {users.map((user) => (
                        <div key={user.id} className={`flex items-center justify-between p-4 rounded border ${user.email === currentUserEmail ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-950 border-slate-800'}`}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-slate-500" />
                                    <span className={`font-bold ${user.email === currentUserEmail ? 'text-red-500' : 'text-slate-200'}`}>
                                        {user.email} {user.email === currentUserEmail && "(ADMIN)"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Smartphone className="h-3 w-3" />
                                    <span>Encrypted Uplink</span>
                                </div>
                            </div>
                        </div>
                    ))}
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
                <CardTitle className="text-xl text-slate-200">System Logout</CardTitle>
                <CardDescription className="text-red-400/70">Terminate secure connection on this device.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    onClick={handleLogout}
                    variant="destructive" 
                    className="bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/50 w-full sm:w-auto"
                >
                    <UserX className="mr-2 h-4 w-4" />
                    Terminate Session
                </Button>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, Shield, LogOut, CreditCard, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const getProfile = async () => {
            // 1. Get Current Cloud User
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/") // Redirect only if actually logged out
                return
            }

            setProfile({
                email: user.email,
                id: user.id,
                joined: new Date(user.created_at).toLocaleDateString(),
                lastSignIn: new Date(user.last_sign_in_at || "").toLocaleDateString()
            })
            setLoading(false)
        }
        getProfile()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = "/"
    }

    if (loading) return <div className="p-8 font-mono text-xs text-slate-500 animate-pulse">DECRYPTING IDENTITY...</div>

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-mono space-y-6 max-w-4xl mx-auto pb-24">

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">OPERATIVE PROFILE</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Identity Verified • Level 1 Access</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* IDENTITY CARD */}
                <Card className="bg-slate-950/40 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Credentials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Email Uplink</label>
                            <div className="flex items-center gap-2 text-slate-200">
                                <Mail className="h-3 w-3 text-primary" /> {profile?.email}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Neural ID</label>
                            <div className="font-mono text-xs text-slate-600 bg-black/50 p-2 rounded border border-white/5 truncate">
                                {profile?.id}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* STATUS CARD */}
                <Card className="bg-slate-950/40 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Service Record
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-xs text-slate-400">Activated</span>
                            <span className="text-sm font-bold text-white">{profile?.joined}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-xs text-slate-400">Last Synced</span>
                            <span className="text-sm font-bold text-primary">{profile?.lastSignIn}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-slate-400">Subscription</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 font-bold uppercase">
                                Free Tier
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* DANGER ZONE */}
            <div className="pt-8">
                <Button onClick={handleLogout} variant="destructive" className="w-full md:w-auto bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50">
                    <LogOut className="h-4 w-4 mr-2" /> TERMINATE SESSION
                </Button>
            </div>

        </div>
    )
}
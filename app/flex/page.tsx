"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Star, Target, Zap, Crown } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"

export default function FlexPage() {
    const [stats, setStats] = useState({ completed: 0, total: 0, streak: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 2. Count Completed Tasks
            const { count: completedCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'complete')
                .eq('user_id', user.id)

            // 3. Count Total Tasks
            const { count: totalCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            setStats({
                completed: completedCount || 0,
                total: totalCount || 0,
                streak: 0 // We can build a real streak calc later
            })
            setLoading(false)
        }
        loadStats()
    }, [])

    // Helper to determine rank
    const getRank = (completed: number) => {
        if (completed > 100) return { title: "NEURAL GOD", color: "text-yellow-400" }
        if (completed > 50) return { title: "CYBER WARLORD", color: "text-purple-400" }
        if (completed > 10) return { title: "OPERATIVE", color: "text-primary" }
        return { title: "INITIATE", color: "text-slate-400" }
    }

    const rank = getRank(stats.completed)

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-mono space-y-8 max-w-5xl mx-auto pb-24">

            {/* HEADER */}
            <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-600 uppercase">
                    Hall of Glory
                </h1>
                <p className="text-xs text-slate-500 mt-2 tracking-widest uppercase">
                    Achievements & Ranks
                </p>
            </div>

            {/* MAIN RANK CARD */}
            <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-black border-slate-800 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Crown className="h-64 w-64 text-white rotate-12" />
                </div>
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className={`h-32 w-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${rank.color.replace('text-', 'border-')}`}>
                        <Trophy className={`h-16 w-16 ${rank.color}`} />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="text-sm text-slate-500 uppercase tracking-widest">Current Rank</div>
                        <div className={`text-5xl font-black uppercase tracking-tight ${rank.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                            {rank.title}
                        </div>
                        <div className="text-xs text-slate-400">
                            {stats.completed} missions completed successfully.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.completed}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Wins</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.streak}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Streak</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <Medal className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{(stats.completed * 50)}</div>
                    <div className="text-[10px] text-slate-500 uppercase">XP</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <Star className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">Top 1%</div>
                    <div className="text-[10px] text-slate-500 uppercase">Percentile</div>
                </div>
            </div>
        </div>
    )
}
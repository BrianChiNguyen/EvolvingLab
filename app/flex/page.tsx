"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trophy, Medal, Crown, Send, User, MessageSquare, Clock, GraduationCap, Briefcase } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

// --- TYPES ---
interface Post {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: {
        username: string
        avatar_url: string
    }
}

interface RankedUser {
    id: string
    username: string
    avatar_url: string
    score: number // Completed Tasks
}

export default function FlexPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [ranking, setRanking] = useState<RankedUser[]>([])
    const [newPost, setNewPost] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Profile Viewer State
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    // --- 1. LOAD DATA ---
    const loadData = async () => {
        // A. Get Current User
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // B. Fetch Posts (Newest First)
        const { data: postData } = await supabase
            .from('posts')
            .select(`
            id, content, created_at, user_id,
            profiles (username, avatar_url)
        `)
            .order('created_at', { ascending: false })

        if (postData) setPosts(postData as any)

        // C. Calculate Leaderboard (Heavy Logic)
        // We fetch all profiles, then count their completed tasks
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url')
        const { data: tasks } = await supabase.from('tasks').select('user_id, status')

        if (profiles && tasks) {
            const scores: Record<string, number> = {}

            // Count completed tasks per user
            tasks.forEach((t: any) => {
                if (t.status === 'complete') {
                    scores[t.user_id] = (scores[t.user_id] || 0) + 1
                }
            })

            // Map to RankedUser array
            const leaderboard = profiles.map((p: any) => ({
                id: p.id,
                username: p.username || "Unknown Operative",
                avatar_url: p.avatar_url,
                score: scores[p.id] || 0
            })).sort((a, b) => b.score - a.score) // Sort High to Low

            setRanking(leaderboard)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    // --- 2. ACTIONS ---
    const handlePost = async () => {
        if (!newPost.trim() || !currentUser) return
        setSubmitting(true)

        const { error } = await supabase.from('posts').insert({
            content: newPost,
            user_id: currentUser.id
        })

        if (!error) {
            setNewPost("")
            loadData() // Refresh feed
        }
        setSubmitting(false)
    }

    const handleUserClick = async (userId: string) => {
        // Fetch full profile details for the clicked user
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (data) {
            setSelectedUser(data)
            setIsProfileOpen(true)
        }
    }

    // --- UI HELPERS ---
    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />
        if (index === 1) return <Medal className="h-5 w-5 text-slate-300" />
        if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />
        return <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-mono max-w-7xl mx-auto pb-24">

            {/* HEADER */}
            <div className="mb-8 border-b border-white/10 pb-6">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-primary" />
                    GLOBAL NEXUS
                </h1>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
                    Live Feed • Operative Rankings
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- LEFT COL: LEADERBOARD --- */}
                <div className="space-y-6">
                    <Card className="bg-slate-950/40 border-slate-800 sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <Crown className="h-4 w-4" /> Top Operatives
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {loading ? (
                                <div className="text-xs text-slate-500 animate-pulse">CALCULATING SCORES...</div>
                            ) : (
                                ranking.map((user, index) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)}
                                        className="flex items-center justify-between p-3 rounded hover:bg-white/5 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 flex justify-center">{getRankIcon(index)}</div>

                                            <div className="h-8 w-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User className="p-1.5 text-slate-500" />}
                                            </div>

                                            <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-500' : 'text-slate-200'} group-hover:text-primary transition-colors`}>
                                                {user.username}
                                            </span>
                                        </div>
                                        <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                                            {user.score} PTS
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* --- RIGHT COL: NEWS FEED --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* NEW POST INPUT */}
                    <Card className="bg-slate-950 border-slate-800">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <Textarea
                                        placeholder="Share your latest achievement..."
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        className="bg-transparent border-0 focus-visible:ring-0 p-0 text-slate-200 text-lg resize-none min-h-[60px]"
                                    />
                                    <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">TEXT ONLY • SECURE CHANNEL</span>
                                        <Button
                                            onClick={handlePost}
                                            disabled={submitting || !newPost.trim()}
                                            size="sm"
                                            className="bg-primary text-black font-bold hover:bg-cyan-400"
                                        >
                                            <Send className="h-3 w-3 mr-2" /> TRANSMIT
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FEED LIST */}
                    <div className="space-y-4">
                        {posts.map(post => (
                            <Card key={post.id} className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
                                <CardContent className="pt-6">
                                    <div className="flex gap-3 mb-3">
                                        {/* AVATAR (Clickable) */}
                                        <div
                                            onClick={() => handlePostUserClick(post)}
                                            className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer hover:border-primary transition-colors"
                                        >
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><User className="h-5 w-5 text-slate-500" /></div>
                                            )}
                                        </div>

                                        {/* META */}
                                        <div>
                                            <div
                                                onClick={() => handlePostUserClick(post)}
                                                className="font-bold text-slate-200 hover:text-primary cursor-pointer transition-colors"
                                            >
                                                {post.profiles?.username || "Unknown Agent"}
                                            </div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>

            {/* --- MODAL: PUBLIC PROFILE VIEWER --- */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-primary tracking-widest uppercase flex items-center gap-2">
                            <User className="h-4 w-4" /> Operative Dossier
                        </DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            {/* AVATAR & NAME */}
                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-slate-900 border-2 border-primary/20 overflow-hidden mb-4 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><User className="h-10 w-10 text-slate-500" /></div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{selectedUser.username || "Unknown"}</h2>
                                <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Verified Identity</span>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                        <GraduationCap className="h-3 w-3" /> Background
                                    </div>
                                    <p className="text-sm text-slate-300 line-clamp-2">
                                        {selectedUser.academic_background || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                        <Briefcase className="h-3 w-3" /> Experience
                                    </div>
                                    <p className="text-sm text-slate-300 line-clamp-2">
                                        {selectedUser.experience || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )

    // Helper to handle clicking a user in the feed (deals with potential nulls)
    function handlePostUserClick(post: Post) {
        if (post.user_id) handleUserClick(post.user_id)
    }
}
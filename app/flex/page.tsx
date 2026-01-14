"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Medal, Crown, Send, User, Clock, GraduationCap, Briefcase, Heart, MessageSquare, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

// --- TYPES ---
interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: {
        username: string
        avatar_url: string
    }
}

interface Post {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: {
        username: string
        avatar_url: string
    }
    // New fields for interactions
    kudos_count: number
    comments_count: number
    user_has_liked: boolean
}

interface RankedUser {
    id: string
    username: string
    avatar_url: string
    score: number
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

    // Comment State
    const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({})
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
    const [newCommentText, setNewCommentText] = useState<Record<string, string>>({})
    const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())

    // --- 1. LOAD DATA ---
    const loadData = async () => {
        // A. Get Current User
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        if (!user) return

        // B. Fetch Posts + Counts + My Like Status
        const { data: postData, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (username, avatar_url),
                post_kudos (user_id),
                post_comments (count)
            `)
            .order('created_at', { ascending: false })

        if (postData) {
            const formattedPosts: Post[] = postData.map((p: any) => ({
                id: p.id,
                content: p.content,
                created_at: p.created_at,
                user_id: p.user_id,
                profiles: p.profiles,
                kudos_count: p.post_kudos ? p.post_kudos.length : 0,
                comments_count: p.post_comments && p.post_comments[0] ? p.post_comments[0].count : 0,
                user_has_liked: p.post_kudos ? p.post_kudos.some((k: any) => k.user_id === user.id) : false
            }))
            setPosts(formattedPosts)
        }

        // C. Calculate Leaderboard
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url')
        const { data: tasks } = await supabase.from('tasks').select('user_id, status')

        if (profiles && tasks) {
            const scores: Record<string, number> = {}
            tasks.forEach((t: any) => {
                if (t.status === 'complete') scores[t.user_id] = (scores[t.user_id] || 0) + 1
            })

            const leaderboard = profiles.map((p: any) => ({
                id: p.id,
                username: p.username || "Unknown Operative",
                avatar_url: p.avatar_url,
                score: scores[p.id] || 0
            })).sort((a, b) => b.score - a.score)

            setRanking(leaderboard)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    // --- 2. INTERACTION HANDLERS ---

    const handlePost = async () => {
        if (!newPost.trim()) return
        if (!currentUser) return alert("Secure Uplink Lost. Please log in again.")

        setSubmitting(true)

        try {
            // 1. Insert the post
            const { error: insertError } = await supabase.from('posts').insert({
                content: newPost,
                user_id: currentUser.id
            })

            if (insertError) throw insertError

            // 2. Success
            setNewPost("")
            await loadData()

        } catch (error: any) {
            console.error("Transmission Failed:", error)
            alert(`Transmission Failed: ${error.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleKudo = async (post: Post) => {
        if (!currentUser) return

        // Optimistic Update
        const isLiking = !post.user_has_liked
        const updatedPosts = posts.map(p =>
            p.id === post.id
                ? { ...p, user_has_liked: isLiking, kudos_count: isLiking ? p.kudos_count + 1 : p.kudos_count - 1 }
                : p
        )
        setPosts(updatedPosts)

        // DB Update
        if (isLiking) {
            await supabase.from('post_kudos').insert({ post_id: post.id, user_id: currentUser.id })
        } else {
            await supabase.from('post_kudos').delete().match({ post_id: post.id, user_id: currentUser.id })
        }
    }

    const toggleComments = async (postId: string) => {
        const newSet = new Set(expandedPosts)

        if (newSet.has(postId)) {
            newSet.delete(postId)
        } else {
            newSet.add(postId)
            if (!commentsMap[postId]) {
                setLoadingComments(prev => new Set(prev).add(postId))
                const { data } = await supabase
                    .from('post_comments')
                    .select(`*, profiles(username, avatar_url)`)
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true })

                if (data) {
                    setCommentsMap(prev => ({ ...prev, [postId]: data as any }))
                }
                setLoadingComments(prev => {
                    const next = new Set(prev)
                    next.delete(postId)
                    return next
                })
            }
        }
        setExpandedPosts(newSet)
    }

    const handleSubmitComment = async (postId: string) => {
        const text = newCommentText[postId]
        if (!text?.trim() || !currentUser) return

        const { data, error } = await supabase
            .from('post_comments')
            .insert({ post_id: postId, user_id: currentUser.id, content: text })
            .select(`*, profiles(username, avatar_url)`)
            .single()

        if (data) {
            setCommentsMap(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), data as any]
            }))
            setNewCommentText(prev => ({ ...prev, [postId]: "" }))
            setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
        }
    }

    const handleUserClick = async (userId: string) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
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
                    FLEXING ROOM
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
                                <CardContent className="pt-6 pb-2">
                                    <div className="flex gap-3 mb-3">
                                        {/* AVATAR */}
                                        <div
                                            onClick={() => handleUserClick(post.user_id)}
                                            className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer hover:border-primary transition-colors"
                                        >
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><User className="h-5 w-5 text-slate-500" /></div>
                                            )}
                                        </div>

                                        {/* HEADER */}
                                        <div>
                                            <div
                                                onClick={() => handleUserClick(post.user_id)}
                                                className="font-bold text-slate-200 hover:text-primary cursor-pointer transition-colors"
                                            >
                                                {post.profiles?.username || "Unknown Agent"}
                                            </div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">
                                        {post.content}
                                    </p>

                                    {/* ACTION BAR */}
                                    <div className="flex items-center gap-4 border-t border-white/5 pt-2">
                                        <button
                                            onClick={() => handleKudo(post)}
                                            className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.user_has_liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                                        >
                                            <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                                            {post.kudos_count} KUDOS
                                        </button>

                                        <button
                                            onClick={() => toggleComments(post.id)}
                                            className={`flex items-center gap-2 text-xs font-bold transition-colors ${expandedPosts.has(post.id) ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            {post.comments_count} COMMENTS
                                        </button>
                                    </div>

                                    {/* COMMENTS SECTION */}
                                    {expandedPosts.has(post.id) && (
                                        <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">

                                            {/* LOADING */}
                                            {loadingComments.has(post.id) && (
                                                <div className="text-center py-4 text-xs text-slate-500 flex justify-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> LOADING DATA...
                                                </div>
                                            )}

                                            {/* COMMENT LIST */}
                                            <div className="space-y-4 mb-4 pl-4 border-l border-white/10">
                                                {commentsMap[post.id]?.map(comment => (
                                                    <div key={comment.id} className="text-sm">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-slate-400 text-xs">{comment.profiles?.username}</span>
                                                            <span className="text-[10px] text-slate-600">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-slate-300 text-xs">{comment.content}</p>
                                                    </div>
                                                ))}
                                                {commentsMap[post.id]?.length === 0 && !loadingComments.has(post.id) && (
                                                    <div className="text-[10px] text-slate-600 italic">No comments intercepted yet.</div>
                                                )}
                                            </div>

                                            {/* ADD COMMENT */}
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newCommentText[post.id] || ""}
                                                    onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    placeholder="Inject commentary..."
                                                    className="bg-slate-900 border-slate-800 text-xs h-8"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSubmitComment(post.id)}
                                                    className="h-8 bg-slate-800 hover:bg-slate-700 text-slate-200"
                                                >
                                                    <Send className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
}
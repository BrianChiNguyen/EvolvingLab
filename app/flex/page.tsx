"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, MessageSquare, Share2, Send, User, Sparkles, Pencil, X, Check, MoreHorizontal, Zap, Clock, Trophy } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// --- TYPES ---
interface Comment {
  id: number
  author: string
  authorEmail: string
  avatar: string
  text: string
  timestamp: string
}

interface Post {
  id: number
  authorName: string
  authorEmail: string
  authorAvatar: string
  content: string
  timestamp: string
  kudos: number
  likedByMe: boolean
  comments: Comment[]
  tags?: string[]
}

interface RunnerStats {
  id: string
  name: string
  email: string
  efficiency: number
  hours: number
  avatar: string
}

// --- MOCK DATA ---
const generateInitialPosts = (): Post[] => [
  {
    id: 1,
    authorName: "System Admin",
    authorEmail: "admin@evolve.net",
    authorAvatar: "",
    content: "PROTOCOL UPDATE v2.4: Efficiency metrics across the grid have spiked by 15%. Excellent work, runners. 🚀 \n\nRemember: Consistency is the algorithm of success.",
    timestamp: "2h ago",
    kudos: 842,
    likedByMe: false,
    comments: [
        { id: 101, author: "Dev_01", authorEmail: "dev1@evolve.net", avatar: "", text: "Systems optimal.", timestamp: "1h ago" }
    ],
    tags: ["#SystemUpdate", "#Efficiency"]
  },
  {
    id: 2,
    authorName: "Sarah Connor",
    authorEmail: "sarah@future.net",
    authorAvatar: "",
    content: "Just crushed a 4-hour Deep Work block. The new Lofi Uplink is a game changer. Who else is grinding on the 'Project Skynet' directive?",
    timestamp: "5h ago",
    kudos: 128,
    likedByMe: true,
    comments: [],
    tags: ["#DeepWork", "#GrindSet"]
  }
]

// Generate fake runners for the leaderboard
const generateLeaderboard = (currentUserEmail: string, currentUserName: string): RunnerStats[] => {
  const runners = [
    { id: "1", name: "Neo", email: "neo@matrix.net", efficiency: 98, hours: 142, avatar: "" },
    { id: "2", name: "Trinity", email: "trin@matrix.net", efficiency: 96, hours: 135, avatar: "" },
    { id: "3", name: "Morpheus", email: "morph@matrix.net", efficiency: 89, hours: 210, avatar: "" },
    { id: "4", name: "Cipher", email: "cipher@matrix.net", efficiency: 74, hours: 45, avatar: "" },
    // Add current user with mock stats if they aren't in the list
    { id: "99", name: currentUserName || "You", email: currentUserEmail, efficiency: 92, hours: 88, avatar: "" }
  ]
  return runners
}

export default function FlexPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // LEADERBOARD STATE
  const [runners, setRunners] = useState<RunnerStats[]>([])

  // EDIT STATES
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editPostText, setEditPostText] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState("")

  // 1. LOAD DATA
  useEffect(() => {
    const email = localStorage.getItem("active_user")
    if (!email) { router.push("/"); return }

    const storedUsers = localStorage.getItem("system_users")
    let userData = { name: "User", email, avatar: "" }
    if (storedUsers) {
        const users = JSON.parse(storedUsers)
        if (users[email]) {
            userData = { email, ...users[email] }
        }
    }
    setCurrentUser(userData)

    // Load Posts
    const storedPosts = localStorage.getItem("flex_posts")
    if (storedPosts) {
        setPosts(JSON.parse(storedPosts))
    } else {
        const initial = generateInitialPosts()
        setPosts(initial)
        localStorage.setItem("flex_posts", JSON.stringify(initial))
    }

    // Load Leaderboard
    setRunners(generateLeaderboard(email, userData.name))

  }, [router])

  // --- ACTIONS: POSTS ---
  const handlePost = () => {
    if (!newPostContent.trim()) return

    const newPost: Post = {
        id: Date.now(),
        authorName: currentUser?.name || "Unknown",
        authorEmail: currentUser?.email,
        authorAvatar: currentUser?.avatar || "",
        content: newPostContent,
        timestamp: "Just now",
        kudos: 0,
        likedByMe: false,
        comments: [],
        tags: ["#Update"]
    }

    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    setNewPostContent("")
    localStorage.setItem("flex_posts", JSON.stringify(updatedPosts))
  }

  const handleStartEditPost = (post: Post) => {
    setEditingPostId(post.id)
    setEditPostText(post.content)
  }

  const handleSaveEditPost = () => {
    if (!editPostText.trim()) return
    const updatedPosts = posts.map(p => p.id === editingPostId ? { ...p, content: editPostText } : p)
    setPosts(updatedPosts)
    localStorage.setItem("flex_posts", JSON.stringify(updatedPosts))
    setEditingPostId(null)
    setEditPostText("")
  }

  const handleCancelEditPost = () => {
    setEditingPostId(null)
    setEditPostText("")
  }

  // --- ACTIONS: COMMENTS ---
  const handleComment = (postId: number) => {
    const text = commentInputs[postId]
    if (!text?.trim()) return

    const newComment: Comment = {
        id: Date.now(),
        author: currentUser?.name || "Me",
        authorEmail: currentUser?.email,
        avatar: currentUser?.avatar || "",
        text: text,
        timestamp: "Just now"
    }

    const updatedPosts = posts.map(post => {
        if (post.id === postId) {
            return { ...post, comments: [...post.comments, newComment] }
        }
        return post
    })

    setPosts(updatedPosts)
    setCommentInputs(prev => ({ ...prev, [postId]: "" }))
    localStorage.setItem("flex_posts", JSON.stringify(updatedPosts))
  }

  // Function to Edit User's Comments on ANY post
  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.text)
  }

  const handleSaveEditComment = (postId: number, commentId: number) => {
    if (!editCommentText.trim()) return

    const updatedPosts = posts.map(post => {
        if (post.id === postId) {
            const updatedComments = post.comments.map(c => 
                c.id === commentId ? { ...c, text: editCommentText } : c
            )
            return { ...post, comments: updatedComments }
        }
        return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("flex_posts", JSON.stringify(updatedPosts))
    setEditingCommentId(null)
    setEditCommentText("")
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  const handleKudos = (postId: number) => {
    const updatedPosts = posts.map(post => {
        if (post.id === postId) {
            return {
                ...post,
                kudos: post.likedByMe ? post.kudos - 1 : post.kudos + 1,
                likedByMe: !post.likedByMe
            }
        }
        return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("flex_posts", JSON.stringify(updatedPosts))
  }

  const handleShare = (content: string) => {
    navigator.clipboard.writeText(content)
    alert("TRANSMISSION COPIED TO BUFFER")
  }

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
            <Link href="/" className="text-xs font-mono text-slate-500 mb-2 tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-3 w-3" /> RETURN TO GRID
            </Link>
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 flex items-center gap-3 italic">
              FLEX ZONE <span className="text-primary not-italic not-sr-only"><Zap className="h-10 w-10 fill-current" /></span>
            </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT COLUMN: LEADERBOARDS --- */}
        <div className="space-y-6 lg:sticky lg:top-8">
            
            {/* RANKING 1: EFFICIENCY */}
            <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-green-500 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Efficiency Matrix
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {runners
                        .sort((a, b) => b.efficiency - a.efficiency)
                        .slice(0, 5)
                        .map((runner, index) => {
                            const isMe = runner.email === currentUser?.email
                            return (
                                <div key={runner.id} className={`flex items-center justify-between p-2 rounded ${isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`text-xs font-bold w-4 text-center ${index === 0 ? "text-yellow-500" : "text-slate-500"}`}>
                                            {index + 1}
                                        </div>
                                        <div className={`text-sm ${isMe ? "text-primary font-bold" : "text-slate-300"}`}>
                                            {runner.name} {isMe && "(YOU)"}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono font-bold text-green-400">
                                        {runner.efficiency}%
                                    </div>
                                </div>
                            )
                        })}
                </CardContent>
            </Card>

            {/* RANKING 2: HOURS */}
            <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Neural Endurance
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {runners
                        .sort((a, b) => b.hours - a.hours)
                        .slice(0, 5)
                        .map((runner, index) => {
                            const isMe = runner.email === currentUser?.email
                            return (
                                <div key={runner.id} className={`flex items-center justify-between p-2 rounded ${isMe ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-white/5"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`text-xs font-bold w-4 text-center ${index === 0 ? "text-yellow-500" : "text-slate-500"}`}>
                                            {index + 1}
                                        </div>
                                        <div className={`text-sm ${isMe ? "text-blue-400 font-bold" : "text-slate-300"}`}>
                                            {runner.name} {isMe && "(YOU)"}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono font-bold text-slate-400">
                                        {runner.hours}h
                                    </div>
                                </div>
                            )
                        })}
                </CardContent>
            </Card>

        </div>

        {/* --- CENTER COLUMN: FEED --- */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* INPUT DECK */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-xl opacity-30 group-hover:opacity-75 blur transition duration-1000"></div>
                <Card className="relative bg-slate-950 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                {currentUser?.avatar ? <img src={currentUser.avatar} className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-slate-500" />}
                            </div>
                            <div className="flex-1 space-y-4">
                                <Textarea 
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Broadcast your status to the network..." 
                                    className="bg-slate-900/50 border-slate-800 min-h-[100px] text-slate-200 focus:border-primary/50 transition-all placeholder:text-slate-600"
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2 text-slate-500">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Sparkles className="h-4 w-4" /></Button>
                                    </div>
                                    <Button onClick={handlePost} className="bg-primary text-black font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                                        TRANSMIT <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* POST STREAM */}
            <div className="space-y-6">
                {posts.map((post, index) => (
                    <Card key={post.id} className="bg-slate-950/60 border-slate-800/60 backdrop-blur-md hover:border-primary/30 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden p-0.5">
                                    <div className="h-full w-full rounded-full overflow-hidden">
                                        {post.authorAvatar ? <img src={post.authorAvatar} className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-slate-500" />}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 flex items-center gap-2">
                                        {post.authorName}
                                        {post.authorEmail === "admin@evolve.net" && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 font-bold tracking-wider">OP</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                        {post.timestamp}
                                        <span className="text-slate-700">•</span>
                                        <span className="text-slate-500">Global</span>
                                    </div>
                                </div>
                            </div>

                            {/* EDIT POST BUTTON (Author Only) */}
                            {currentUser?.email === post.authorEmail && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleStartEditPost(post)}
                                    className="text-slate-600 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            
                            {/* POST CONTENT / EDIT MODE */}
                            {editingPostId === post.id ? (
                                <div className="space-y-3 animate-in fade-in">
                                    <Textarea 
                                        value={editPostText}
                                        onChange={(e) => setEditPostText(e.target.value)}
                                        className="bg-slate-900/50 border-primary/50 text-slate-200 min-h-[100px]"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="ghost" onClick={handleCancelEditPost} className="text-slate-400 hover:text-white">
                                            <X className="h-4 w-4 mr-1" /> Cancel
                                        </Button>
                                        <Button size="sm" onClick={handleSaveEditPost} className="bg-primary text-black hover:bg-cyan-400">
                                            <Check className="h-4 w-4 mr-1" /> Save Update
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                                    {post.content}
                                </p>
                            )}
                            
                            {/* ACTIONS BAR */}
                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <Button 
                                    onClick={() => handleKudos(post.id)}
                                    variant="ghost"
                                    className={`flex items-center gap-2 hover:bg-red-500/10 ${post.likedByMe ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
                                >
                                    <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current scale-110" : ""}`} />
                                    <span className="font-mono text-xs">{post.kudos}</span>
                                </Button>

                                <Button variant="ghost" className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="font-mono text-xs">{post.comments.length}</span>
                                </Button>

                                <div className="flex-1" />
                                <Button onClick={() => handleShare(post.content)} variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* COMMENTS SECTION */}
                            {post.comments.length > 0 && (
                                <div className="bg-black/40 rounded-xl p-4 space-y-4 border border-white/5 mt-2">
                                    {post.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3 text-sm group/comment relative">
                                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 border border-white/10">
                                                {comment.avatar ? <img src={comment.avatar} className="h-full w-full object-cover" /> : <User className="h-3 w-3 text-slate-500" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-slate-400 text-xs">{comment.author}</span>
                                                    <span className="text-[10px] text-slate-600">{comment.timestamp}</span>
                                                </div>

                                                {/* COMMENT EDIT MODE */}
                                                {editingCommentId === comment.id ? (
                                                    <div className="mt-2 space-y-2 animate-in fade-in">
                                                        <Input 
                                                            value={editCommentText}
                                                            onChange={(e) => setEditCommentText(e.target.value)}
                                                            className="h-8 bg-slate-900 border-primary/30 text-xs"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="ghost" onClick={handleCancelEditComment} className="h-6 px-2 text-[10px] text-slate-400">Cancel</Button>
                                                            <Button size="sm" onClick={() => handleSaveEditComment(post.id, comment.id)} className="h-6 px-2 text-[10px] bg-primary text-black hover:bg-cyan-400">Save</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative pr-6">
                                                        <p className="text-slate-300 mt-0.5">{comment.text}</p>
                                                        
                                                        {/* EDIT ICON (Visible to Author Only) */}
                                                        {currentUser?.email === comment.authorEmail && (
                                                            <button 
                                                                onClick={() => handleStartEditComment(comment)}
                                                                className="absolute top-0 right-0 opacity-0 group-hover/comment:opacity-100 text-slate-500 hover:text-primary transition-all p-1"
                                                                title="Edit Comment"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Comment Input */}
                            <div className="flex gap-3 items-center mt-2">
                                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 opacity-50">
                                     {currentUser?.avatar ? <img src={currentUser.avatar} className="h-full w-full object-cover" /> : <User className="h-3 w-3 text-slate-500" />}
                                </div>
                                <Input 
                                    value={commentInputs[post.id] || ""}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    placeholder="Add a comment..." 
                                    className="h-9 bg-slate-900/50 border-white/10 text-xs focus:bg-slate-900 focus:border-primary/30 transition-all rounded-full px-4"
                                    onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
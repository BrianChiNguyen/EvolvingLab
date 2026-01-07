"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, BookOpen, Edit2, Trash2, Calendar, Tag, User, Loader2 } from "lucide-react" // Added Loader2
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase" // Cloud Connection

// --- TYPES ---
interface Story {
  id: string
  title: string
  category: string
  image: string
  excerpt: string
  content: string
  date: string
  author: string
  readTime: string // Maps to 'read_time' in DB
}

// --- CONFIG ---
const ADMIN_EMAIL = "congtrangunsw@gmail.com"

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog States
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  
  // Form State
  const [formData, setFormData] = useState<Partial<Story>>({
      title: "", category: "Methodology", image: "", excerpt: "", content: "", readTime: "5 min"
  })
  const [isSaving, setIsSaving] = useState(false)

  // 1. LOAD DATA & CHECK ADMIN
  const fetchStories = async () => {
    setIsLoading(true)
    
    // A. Check Admin Status (Cloud)
    const { data: { user } } = await supabase.auth.getUser()
    setIsAdmin(user?.email === ADMIN_EMAIL)

    // B. Fetch Stories (Cloud)
    const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('date', { ascending: false })

    if (error) {
        console.error("Error loading archives:", error)
    }

    if (data) {
        // Map Database (snake_case) -> App (camelCase)
        const formattedStories: Story[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            image: item.image,
            excerpt: item.excerpt,
            content: item.content,
            date: item.date,
            author: "Admin", 
            readTime: item.read_time || "5 min" 
        }))
        setStories(formattedStories)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchStories()
  }, [])

  // 2. HANDLERS
  const handleEditClick = (story: Story) => {
    setFormData(story)
    setIsEditorOpen(true)
  }

  const handleCreateClick = () => {
    // Reset form for new entry
    setFormData({ title: "", category: "Methodology", image: "", excerpt: "", content: "", readTime: "5 min" })
    setIsEditorOpen(true)
  }

  const handleReadClick = (story: Story) => {
    setCurrentStory(story)
    setIsReaderOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.content) return alert("Title and Content required")
    
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        alert("Secure Uplink Lost. Please log in again.")
        setIsSaving(false)
        return
    }

    // Construct Payload for DB (snake_case keys)
    const payload = {
        title: formData.title,
        category: formData.category,
        image: formData.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80",
        excerpt: formData.excerpt,
        content: formData.content,
        read_time: formData.readTime, // Mapping here
        user_id: user.id
    }

    if (formData.id) {
        // --- UPDATE EXISTING ---
        const { error } = await supabase
            .from('stories')
            .update(payload)
            .eq('id', formData.id)

        if (error) console.error("Update failed:", error)
    } else {
        // --- CREATE NEW (Insert) ---
        const { error } = await supabase
            .from('stories')
            .insert([payload])

        if (error) console.error("Creation failed:", error)
    }

    // Refresh & Close
    await fetchStories()
    setIsSaving(false)
    setIsEditorOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Delete this archive entry permanently from the cloud?")) {
        const { error } = await supabase
            .from('stories')
            .delete()
            .eq('id', id)
        
        if (error) {
            alert("Delete failed")
        } else {
            setIsReaderOpen(false) 
            fetchStories()
        }
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
            <Link href="/" className="text-xs font-mono text-slate-500 mb-2 tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-3 w-3" /> RETURN TO GRID
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white/90">
              KNOWLEDGE ARCHIVES
            </h1>
        </div>
        
        {/* ADMIN ONLY BUTTON */}
        {isAdmin && (
            <Button onClick={handleCreateClick} className="bg-primary text-black font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                <Plus className="h-4 w-4 mr-2" /> NEW PROTOCOL
            </Button>
        )}
      </div>

      {/* LOADING STATE */}
      {isLoading && stories.length === 0 && (
          <div className="text-center py-20 text-slate-500 animate-pulse">
              ESTABLISHING UPLINK TO ARCHIVES...
          </div>
      )}

      {/* EDITOR DIALOG (ADMIN ONLY) */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-4xl">
            <DialogHeader>
                <DialogTitle className="text-primary tracking-widest uppercase">
                    {formData.id ? "Edit Protocol" : "Initialize New Protocol"}
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                            <SelectTrigger className="bg-slate-900 border-slate-800"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                                <SelectItem value="Methodology">Methodology</SelectItem>
                                <SelectItem value="Experience">Experience</SelectItem>
                                <SelectItem value="Biohacking">Biohacking</SelectItem>
                                <SelectItem value="Tech">Tech Stack</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Cover Image URL</Label>
                    <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="bg-slate-900 border-slate-800 font-mono text-xs text-primary" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <Label>Short Excerpt</Label>
                    <Textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="bg-slate-900 border-slate-800 h-20" />
                </div>
                <div className="space-y-2">
                    <Label>Full Content (Markdown supported)</Label>
                    <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-slate-900 border-slate-800 min-h-[300px] font-mono" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-black hover:bg-cyan-400">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Data"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* READER MODAL */}
      <Dialog open={isReaderOpen} onOpenChange={setIsReaderOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-5xl max-h-[90vh] overflow-y-auto">
            
            <DialogTitle className="sr-only">
                {currentStory?.title || "Story Reader"}
            </DialogTitle>

            {currentStory && (
                <>
                    <div className="relative h-96 w-full mb-6 rounded-lg overflow-hidden border border-white/10">
                        <img src={currentStory.image} className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <span className="px-3 py-1.5 bg-primary text-black text-xs font-bold uppercase rounded mb-3 inline-block">
                                {currentStory.category}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{currentStory.title}</h2>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
                        <div className="flex gap-6">
                            <span className="flex items-center gap-2"><User className="h-4 w-4" /> {currentStory.author}</span>
                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {currentStory.date}</span>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-3">
                                <button onClick={() => { setIsReaderOpen(false); handleEditClick(currentStory); }} className="hover:text-primary transition-colors flex items-center gap-2 font-bold"><Edit2 className="h-4 w-4" /> EDIT</button>
                                <button onClick={() => handleDelete(currentStory.id)} className="hover:text-red-500 transition-colors flex items-center gap-2 font-bold"><Trash2 className="h-4 w-4" /> DELETE</button>
                            </div>
                        )}
                    </div>

                    <div className="prose prose-invert prose-lg prose-p:text-slate-300 prose-headings:text-white max-w-none px-4">
                        {currentStory.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-6 leading-relaxed">{paragraph}</p>
                        ))}
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map(story => (
            <Card key={story.id} className="group bg-slate-950/40 border-slate-800 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full" onClick={() => handleReadClick(story)}>
                <div className="relative h-48 overflow-hidden border-b border-slate-800">
                    <img src={story.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                         <span className="px-2 py-1 bg-black/60 backdrop-blur border border-white/10 text-[10px] text-white uppercase font-bold rounded">
                             {story.category}
                         </span>
                    </div>
                </div>
                <CardHeader>
                    <CardTitle className="text-xl text-slate-100 group-hover:text-primary transition-colors">{story.title}</CardTitle>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                        <Calendar className="h-3 w-3" /> {story.date}
                        <span>•</span>
                        <span>{story.readTime} read</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {story.excerpt}
                    </p>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-4">
                    <div className="text-xs text-primary font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        ACCESS FILE <ArrowLeft className="h-3 w-3 rotate-180" />
                    </div>
                </CardFooter>
            </Card>
        ))}
        
        {/* EMPTY STATE HELPER */}
        {!isLoading && stories.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-xl bg-slate-900/20">
                <p className="text-slate-500 mb-4">NO ARCHIVES FOUND IN NEURAL CLOUD</p>
                {isAdmin && (
                    <Button onClick={handleCreateClick} variant="outline" className="border-primary text-primary">Initialize First Protocol</Button>
                )}
            </div>
        )}
      </div>

    </div>
  )
}
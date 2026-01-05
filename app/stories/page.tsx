"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, BookOpen, Edit2, Trash2, Calendar, Tag, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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
  readTime: string
}

// --- INITIAL DATA ---
const INITIAL_STORIES: Story[] = [
    {
        id: "1",
        title: "The Feynman Protocol",
        category: "Methodology",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop",
        excerpt: "To truly understand a concept, you must be able to explain it to a 5-year-old.",
        content: "The Feynman Technique is a mental model named after Nobel Prize-winning physicist Richard Feynman. It involves four key steps: \n\n1. Choose a concept you want to learn about.\n2. Explain it to a 12-year-old.\n3. Reflect, Refine, and Simplify.\n4. Organize and Review.\n\nBy simplifying the language, you force your brain to deconstruct the complexity.",
        date: "2025-10-12",
        author: "Admin",
        readTime: "5 min"
    },
    {
        id: "2",
        title: "Tokyo Cyber-Cafe Study Tour",
        category: "Experience",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1974&auto=format&fit=crop",
        excerpt: "A field report on the high-focus environments of Shinjuku's neon cafes.",
        content: "Studying in Tokyo offers a unique blend of isolation and connectivity. The 'Cyber Cafes' here aren't just for gaming; they are individual pods of silence. \n\nI spent 3 weeks working from a booth in Shinjuku. The ambient noise level is strictly controlled. It changed my perspective on 'Open Office' plans—privacy is the ultimate productivity tool.",
        date: "2025-11-05",
        author: "Admin",
        readTime: "8 min"
    }
]

const ADMIN_EMAIL = "evolvinglab_admin_cong@gmail.com"

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Dialog States
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  
  // Form State
  const [formData, setFormData] = useState<Partial<Story>>({
      title: "", category: "Methodology", image: "", excerpt: "", content: "", readTime: "5 min"
  })

  // 1. LOAD DATA & CHECK ADMIN
  useEffect(() => {
    const user = localStorage.getItem("active_user")
    setIsAdmin(user === ADMIN_EMAIL)

    const savedStories = localStorage.getItem("study_stories")
    if (savedStories) {
        setStories(JSON.parse(savedStories))
    } else {
        setStories(INITIAL_STORIES)
        localStorage.setItem("study_stories", JSON.stringify(INITIAL_STORIES))
    }
  }, [])

  // 2. HANDLERS
  const handleEditClick = (story: Story) => {
    setFormData(story)
    setIsEditorOpen(true)
  }

  const handleCreateClick = () => {
    setFormData({ title: "", category: "Methodology", image: "", excerpt: "", content: "", readTime: "5 min" })
    setIsEditorOpen(true)
  }

  const handleReadClick = (story: Story) => {
    setCurrentStory(story)
    setIsReaderOpen(true)
  }

  const handleSave = () => {
    let updatedStories = [...stories]
    
    if (formData.id) {
        // Update existing
        updatedStories = updatedStories.map(s => s.id === formData.id ? { ...s, ...formData } as Story : s)
    } else {
        // Create new
        const newStory: Story = {
            id: Date.now().toString(),
            title: formData.title || "Untitled",
            category: formData.category || "General",
            image: formData.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80",
            excerpt: formData.excerpt || "",
            content: formData.content || "",
            date: new Date().toISOString().split('T')[0],
            author: "Admin",
            readTime: formData.readTime || "3 min"
        }
        updatedStories = [newStory, ...updatedStories]
    }

    setStories(updatedStories)
    localStorage.setItem("study_stories", JSON.stringify(updatedStories))
    setIsEditorOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this archive entry permanently?")) {
        const updated = stories.filter(s => s.id !== id)
        setStories(updated)
        localStorage.setItem("study_stories", JSON.stringify(updated))
        setIsReaderOpen(false) // Close reader if open
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

      {/* EDITOR DIALOG (ADMIN ONLY) */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        {/* CHANGED: max-w-2xl -> max-w-4xl */}
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
                <Button onClick={handleSave} className="bg-primary text-black hover:bg-cyan-400">Save Data</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* READER MODAL */}
      <Dialog open={isReaderOpen} onOpenChange={setIsReaderOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-5xl max-h-[90vh] overflow-y-auto">
            
            {/* --- FIX: ACCESSIBLE TITLE (HIDDEN) --- */}
            {/* This satisfies the accessibility requirement without changing your design */}
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
      </div>

    </div>
  )
}
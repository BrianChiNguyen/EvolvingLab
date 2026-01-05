"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, Briefcase, Cpu, Save, KeyRound, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "", // Stores the URL
    password: "",
    dob: "",
    institutions: "",
    jobs: "",
    background: "",
    skills: "",
    techInterests: "",
    researchInterests: ""
  })

  useEffect(() => {
    const email = localStorage.getItem("active_user")
    if (!email) {
      router.push("/")
      return
    }
    setCurrentUserEmail(email)

    const storedUsers = localStorage.getItem("system_users")
    if (storedUsers) {
        const users = JSON.parse(storedUsers)
        const userData = users[email]
        
        if (userData) {
            setFormData(prev => ({
                ...prev,
                password: userData.password || "",
                name: userData.name || "",
                bio: userData.bio || "",
                dob: userData.dob || "",
                institutions: userData.institutions || "",
                jobs: userData.jobs || "",
                background: userData.background || "",
                skills: userData.skills || "",
                techInterests: userData.techInterests || "",
                researchInterests: userData.researchInterests || "",
                avatar: userData.avatar || ""
            }))
        }
    }
  }, [router])

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
        const storedUsers = localStorage.getItem("system_users")
        if (storedUsers) {
            const users = JSON.parse(storedUsers)
            users[currentUserEmail] = { ...users[currentUserEmail], ...formData }
            localStorage.setItem("system_users", JSON.stringify(users))
        }
        setLoading(false)
        alert("PROFILE UPDATED SUCCESSFULLY")
    }, 800)
  }

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
            <Link href="/" className="text-xs font-mono text-slate-500 mb-2 tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-3 w-3" /> RETURN TO GRID
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white/90">
              EVOLVING PROFILE
            </h1>
        </div>
      </div>

      <div className="grid gap-8">
        
        {/* SECTION 1: IDENTITY */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <User className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Core Identity</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* --- NEW AVATAR SECTION --- */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-6 border-b border-white/5">
                    {/* Visual Preview */}
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-10 w-10 text-slate-700" />
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500" />
                    </div>
                    
                    {/* URL Input */}
                    <div className="flex-1 space-y-2 w-full">
                        <Label className="text-[10px] uppercase text-slate-500 flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" /> Holotag Source (Image URL)
                        </Label>
                        <Input 
                            value={formData.avatar} 
                            onChange={e => setFormData({...formData, avatar: e.target.value})} 
                            className="bg-slate-900 border-slate-800 font-mono text-xs text-primary" 
                            placeholder="https://i.imgur.com/..." 
                        />
                        <p className="text-[10px] text-slate-600">
                            Paste a direct link to an image (JPG/PNG). Recommended size: 200x200px.
                        </p>
                    </div>
                </div>

                {/* Standard Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-slate-500">Full Name</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-slate-500">Date of Birth</Label>
                        <Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                </div>
                <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-slate-500">Bio / Manifesto</Label>
                     <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="bg-slate-900 border-slate-800 min-h-[80px]" />
                </div>
            </CardContent>
        </Card>

        {/* SECTION 2: SECURITY */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <KeyRound className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Security Protocol</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-slate-500">Update Passkey</Label>
                    <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-slate-900 border-slate-800 max-w-md" />
                </div>
            </CardContent>
        </Card>

        {/* SECTION 3: PROFESSIONAL */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <Briefcase className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Professional Matrix</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-slate-500">Current Affiliation</Label>
                        <Input value={formData.jobs} onChange={e => setFormData({...formData, jobs: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-slate-500">Institutions</Label>
                        <Input value={formData.institutions} onChange={e => setFormData({...formData, institutions: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                </div>
                <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-slate-500">Background Summary</Label>
                     <Textarea value={formData.background} onChange={e => setFormData({...formData, background: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
            </CardContent>
        </Card>

        {/* SECTION 4: RESEARCH */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <Cpu className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-slate-500">Skillset</Label>
                    <Input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-slate-500">Technical Interests</Label>
                        <Textarea value={formData.techInterests} onChange={e => setFormData({...formData, techInterests: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-slate-500">Research Interests</Label>
                        <Textarea value={formData.researchInterests} onChange={e => setFormData({...formData, researchInterests: e.target.value})} className="bg-slate-900 border-slate-800" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="bg-primary text-black font-bold h-12 px-8 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                {loading ? "UPLOADING..." : "SAVE CONFIGURATION"} <Save className="ml-2 h-4 w-4" />
            </Button>
        </div>

      </div>
    </div>
  )
}
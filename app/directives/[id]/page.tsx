"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bot, BrainCircuit, CheckCircle2, Terminal, Trophy, Settings, Plus, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation" // Import useRouter
import { useState, useEffect } from "react"
import { initialDirectives } from "@/lib/data"
import { EditDirectiveDialog } from "@/components/EditDirectiveDialog" // Import Edit Dialog

export default function DirectiveDetail() {
  const params = useParams()
  const router = useRouter() // Initialize Router
  const id = params.id as string
  const [directive, setDirective] = useState<any>(null)
  
  // Edit Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  // Quick Add State (for the list bottom)
  const [quickAddLabel, setQuickAddLabel] = useState("")

  useEffect(() => {
    const savedData = localStorage.getItem("directives")
    let found = null
    if (savedData) {
        const allDirectives = JSON.parse(savedData)
        found = allDirectives.find((d: any) => d.id === id)
    }
    if (!found) found = initialDirectives.find(d => d.id === id)
    
    if (found) {
        setDirective(found)
    } else {
        // Handle "Not Found" properly? For now, placeholder.
        setDirective({ id: id, title: "Unknown", milestones: [] })
    }
  }, [id])

  if (!directive) return <div className="p-8 text-slate-500">Accessing Neural Archive...</div>

  // --- ACTIONS ---

  // 1. TERMINATE GOAL
  const handleTerminate = () => {
    if(!confirm("Are you sure you want to terminate this directive? This cannot be undone.")) return;

    const savedData = localStorage.getItem("directives")
    if (savedData) {
        const allDirectives = JSON.parse(savedData)
        const updatedList = allDirectives.filter((d: any) => d.id !== id)
        localStorage.setItem("directives", JSON.stringify(updatedList))
    }
    // Redirect to Dashboard
    router.push('/')
  }

  // 2. SAVE EDITS (From Modal) - With Color Recalculation
  const handleEditSave = (updatedDirective: any) => {
    
    // Recalculate colors based on priority
    let borderColor = "hover:border-primary/50"
    let barColor = "bg-gradient-to-r from-cyan-500 to-blue-600"
    let textColor = "text-primary"

    if (updatedDirective.priority === "critical") {
        borderColor = "border-red-500/50 hover:border-red-500"
        barColor = "bg-gradient-to-r from-red-500 to-orange-600"
        textColor = "text-red-500"
    } else if (updatedDirective.priority === "high") {
        borderColor = "border-orange-500/50 hover:border-orange-500"
        barColor = "bg-gradient-to-r from-orange-500 to-yellow-500"
        textColor = "text-orange-500"
    }

    // Merge the new colors into the directive object
    const finalDirective = {
        ...updatedDirective,
        color: textColor,
        borderColor: borderColor,
        barColor: barColor
    }

    setDirective(finalDirective)
    updateLocalStorage(finalDirective)
  }

  // 3. TOGGLE MILESTONE
  const toggleMilestone = (milestoneId: number) => {
    const updatedMilestones = directive.milestones.map((m: any) => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    const updated = { ...directive, milestones: updatedMilestones }
    setDirective(updated)
    updateLocalStorage(updated)
  }

  // 4. QUICK ADD MILESTONE (Directly on page)
  const handleQuickAdd = () => {
    if (!quickAddLabel.trim()) return
    const newMilestone = {
        id: Date.now(),
        label: quickAddLabel,
        description: "",
        priority: "normal",
        completed: false
    }
    const updated = { ...directive, milestones: [...directive.milestones, newMilestone] }
    setDirective(updated)
    updateLocalStorage(updated)
    setQuickAddLabel("")
  }
  
  // 5. DELETE MILESTONE (Directly on page)
  const handleDeleteMilestone = (e: React.MouseEvent, mId: number) => {
    e.stopPropagation() // Prevent toggling completion
    const updated = { ...directive, milestones: directive.milestones.filter((m:any) => m.id !== mId) }
    setDirective(updated)
    updateLocalStorage(updated)
  }

  // Helper to save to local storage
  const updateLocalStorage = (data: any) => {
    const savedData = localStorage.getItem("directives")
    if (savedData) {
        const allDirectives = JSON.parse(savedData)
        const newGlobalList = allDirectives.map((d: any) => d.id === data.id ? data : d)
        localStorage.setItem("directives", JSON.stringify(newGlobalList))
    }
  }

  const progress = directive.milestones.length > 0 
    ? Math.round((directive.milestones.filter((m: any) => m.completed).length / directive.milestones.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-5xl mx-auto">
      
      {/* Edit Dialog Component */}
      <EditDirectiveDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        initialData={directive}
        onSave={handleEditSave}
      />

      {/* NAV */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center text-slate-400 hover:text-primary transition-colors gap-2 text-sm uppercase tracking-wider group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
        </Link>
        
        <div className="flex gap-3">
             <Button onClick={() => setIsEditOpen(true)} variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300 gap-2">
                <Settings className="h-4 w-4" /> Configure
             </Button>
             <Button onClick={handleTerminate} variant="destructive" className="bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50">
                Terminate Goal
            </Button>
        </div>
      </div>

      {/* HEADER */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
             <Badge variant="outline" className="text-primary border-primary/50 px-3 py-1 bg-primary/10 uppercase">{directive.category}</Badge>
             <span className="text-slate-500 text-xs">Target: {directive.date}</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-100 tracking-tight text-glow">
          {directive.title}
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">{directive.desc}</p>
      </div>

      <Card className="bg-slate-950 border-slate-800">
        <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-mono uppercase text-slate-500 tracking-widest">Progress Matrix</CardTitle>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
        </CardHeader>
        <CardContent>
            <Progress value={progress} className="h-4 bg-slate-900" indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600" />
        </CardContent>
      </Card>

      {/* MILESTONES */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-primary h-5 w-5" />
                <h2 className="text-xl font-bold text-slate-200">Operational Milestones</h2>
            </div>

            <div className="space-y-3">
                {directive.milestones.length === 0 && (
                    <div className="text-slate-600 italic text-sm">No milestones defined.</div>
                )}
                
                {directive.milestones.map((milestone: any) => (
                    <div 
                        key={milestone.id} 
                        onClick={() => toggleMilestone(milestone.id)}
                        className={`relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all group ${milestone.completed ? 'bg-primary/5 border-primary/30' : 'bg-slate-900/50 border-slate-800 hover:border-slate-500'}`}
                    >
                        <div className={`mt-1 h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${milestone.completed ? 'border-primary bg-primary text-black' : 'border-slate-600'}`}>
                            {milestone.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                                <span className={`font-semibold ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{milestone.label}</span>
                                {milestone.priority && (
                                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono tracking-wide ${milestone.priority === 'critical' ? 'border-red-500 text-red-500' : milestone.priority === 'high' ? 'border-orange-500 text-orange-500' : 'border-slate-600 text-slate-500'}`}>{milestone.priority}</span>
                                )}
                            </div>
                            {milestone.description && <p className={`text-xs ${milestone.completed ? 'text-slate-700' : 'text-slate-400'}`}>{milestone.description}</p>}
                        </div>

                        {/* DELETE MILESTONE BUTTON */}
                        <button onClick={(e) => handleDeleteMilestone(e, milestone.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-opacity">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {/* QUICK ADD INPUT */}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/50">
                    <input 
                        type="text" 
                        value={quickAddLabel}
                        onChange={(e) => setQuickAddLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                        placeholder="Add new task..."
                        className="flex-1 bg-transparent border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary placeholder:text-slate-600"
                    />
                    <Button onClick={handleQuickAdd} size="sm" className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        {/* NEURAL ASSISTANT (No changes) */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Bot className="text-purple-400 h-5 w-5" />
                <h2 className="text-xl font-bold text-slate-200">Neural Assistant</h2>
            </div>
            <Card className="bg-slate-950/50 border-slate-800 h-full min-h-[300px] flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
                    <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <BrainCircuit className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">AI-Driven Micro-Tasks</h3>
                        <p className="text-xs text-slate-500">Break your goal into "micro-tasks" designed to maximize dopamine response.</p>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <Terminal className="mr-2 h-4 w-4" />
                        Run Brainstorming Protocol
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
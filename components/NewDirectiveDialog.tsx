"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Target, AlertCircle, Layers } from "lucide-react"
import { useState } from "react"

// Updated Interface to include milestone details
interface Milestone {
  id: number
  label: string
  description: string
  priority: string
  completed: boolean
}

interface DirectiveData {
  title: string
  category: string
  date: string
  description: string
  priority: string
  milestones: Milestone[]
}

interface Props {
  onSave: (data: DirectiveData) => void
}

export function NewDirectiveDialog({ onSave }: Props) {
  const [open, setOpen] = useState(false)
  
  // Directive State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    description: "",
    priority: "normal"
  })

  // Milestone Builder State
  const [msLabel, setMsLabel] = useState("")
  const [msDesc, setMsDesc] = useState("")
  const [msPriority, setMsPriority] = useState("normal")
  const [milestones, setMilestones] = useState<Milestone[]>([])

  const addMilestone = () => {
    if (!msLabel.trim()) return
    
    const newMilestone: Milestone = {
      id: Date.now(),
      label: msLabel,
      description: msDesc,
      priority: msPriority,
      completed: false
    }
    
    setMilestones([...milestones, newMilestone])
    
    // Reset Milestone Inputs
    setMsLabel("")
    setMsDesc("")
    setMsPriority("normal")
  }

  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  const handleSubmit = () => {
    onSave({
      ...formData,
      milestones: milestones
    })
    // Reset Form
    setFormData({ title: "", category: "", date: "", description: "", priority: "normal" })
    setMilestones([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group relative h-full min-h-[220px] w-full rounded-xl border-2 border-dashed border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-left">
          <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
             <Plus className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
             <span className="block font-semibold text-slate-200 text-lg">Initiate New Directive</span>
             <span className="text-xs text-slate-500 font-mono">Define scope and milestones</span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono tracking-wide text-primary flex items-center gap-2">
            <Target className="h-5 w-5" /> NEW DIRECTIVE PARAMETERS
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          
          {/* --- SECTION 1: DIRECTIVE DETAILS --- */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 grid gap-2">
                    <Label className="text-xs font-mono text-slate-400 uppercase">Goal Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-slate-900 border-slate-800 text-slate-200" placeholder="e.g. Protocol Omega" />
                </div>
                <div className="col-span-1 grid gap-2">
                    <Label className="text-xs font-mono text-slate-400 uppercase">Priority</Label>
                    <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                        <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-mono text-slate-400 uppercase">Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-slate-900 border-slate-800 text-slate-200" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-mono text-slate-400 uppercase">Target Deadline</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="bg-slate-900 border-slate-800 text-slate-200" />
                </div>
            </div>
            <div className="grid gap-2">
                 <Label className="text-xs font-mono text-slate-400 uppercase">Operational Description</Label>
                 <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-slate-900 border-slate-800 text-slate-200" placeholder="High-level objective summary..." />
            </div>
          </div>

          {/* --- SECTION 2: MILESTONE BUILDER --- */}
          <div className="space-y-3">
            <Label className="text-xs font-mono text-primary uppercase flex items-center gap-2">
                <Layers className="h-3 w-3" /> Operational Milestones
            </Label>
            
            {/* The Input Grid */}
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-900/30 space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1 grid gap-1">
                        <Label className="text-[10px] text-slate-500 uppercase">Task Name</Label>
                        <Input value={msLabel} onChange={(e) => setMsLabel(e.target.value)} placeholder="e.g. Design Database Schema" className="h-8 bg-slate-950 border-slate-700 text-slate-200" />
                    </div>
                    <div className="w-[120px] grid gap-1">
                        <Label className="text-[10px] text-slate-500 uppercase">Priority</Label>
                        <Select value={msPriority} onValueChange={setMsPriority}>
                            <SelectTrigger className="h-8 bg-slate-950 border-slate-700 text-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="grid gap-1">
                     <Label className="text-[10px] text-slate-500 uppercase">Task Description</Label>
                     <div className="flex gap-2">
                        <Input value={msDesc} onChange={(e) => setMsDesc(e.target.value)} placeholder="Specifics..." className="h-8 bg-slate-950 border-slate-700 text-slate-200" />
                        <Button onClick={addMilestone} size="sm" className="h-8 bg-primary text-black hover:bg-cyan-400 font-bold">Add</Button>
                     </div>
                </div>
            </div>

            {/* The List of Added Milestones */}
            <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto pr-2">
                {milestones.length === 0 && <span className="text-xs text-slate-600 italic pl-1">No milestones defined.</span>}
                {milestones.map((m) => (
                    <div key={m.id} className="group flex flex-col gap-1 bg-slate-950 p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-200">{m.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                                    m.priority === 'critical' ? 'border-red-500 text-red-500 bg-red-500/10' : 
                                    m.priority === 'high' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 
                                    'border-cyan-500 text-cyan-500 bg-cyan-500/10'
                                }`}>{m.priority}</span>
                            </div>
                            <X onClick={() => removeMilestone(m.id)} className="h-3 w-3 cursor-pointer text-slate-500 hover:text-red-500" />
                        </div>
                        {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                    </div>
                ))}
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-primary text-slate-950 hover:bg-primary/80 font-bold">Initiate Directive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
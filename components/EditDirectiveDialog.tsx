"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Settings, Layers, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface Milestone {
  id: number
  label: string
  description: string
  priority: string
  completed: boolean
}

interface DirectiveData {
  id: string
  title: string
  category: string
  date: string
  description: string
  priority?: string
  milestones: Milestone[]
  // These might be present in the data, but we don't edit them directly here
  color?: string
  borderColor?: string
  barColor?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: DirectiveData
  onSave: (data: DirectiveData) => void
}

export function EditDirectiveDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [formData, setFormData] = useState<DirectiveData>({
    ...initialData,
    title: initialData?.title || "",
    category: initialData?.category || "",
    date: initialData?.date || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "normal", // Ensure priority is captured
    milestones: initialData?.milestones || []
  })
  
  // Milestone Input State
  const [msLabel, setMsLabel] = useState("")
  const [msDesc, setMsDesc] = useState("")
  const [msPriority, setMsPriority] = useState("normal")

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        title: initialData.title || "",
        category: initialData.category || "",
        date: initialData.date || "",
        description: initialData.description || "",
        priority: initialData.priority || "normal",
        milestones: initialData.milestones || []
      })
    }
  }, [initialData])

  const addMilestone = () => {
    if (!msLabel.trim()) return
    const newMilestone: Milestone = {
      id: Date.now(),
      label: msLabel,
      description: msDesc,
      priority: msPriority,
      completed: false
    }
    setFormData({ ...formData, milestones: [...formData.milestones, newMilestone] })
    setMsLabel("")
    setMsDesc("")
    setMsPriority("normal")
  }

  const removeMilestone = (id: number) => {
    setFormData({ ...formData, milestones: formData.milestones.filter(m => m.id !== id) })
  }

  const handleSubmit = () => {
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono tracking-wide text-primary flex items-center gap-2">
            <Settings className="h-5 w-5" /> CONFIGURE DIRECTIVE
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          
          {/* CORE DETAILS */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 grid gap-2">
                    <Label className="text-xs font-mono text-slate-400 uppercase">Goal Title</Label>
                    <Input 
                        value={formData.title || ""} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        className="bg-slate-900 border-slate-800 text-slate-200" 
                    />
                </div>
                {/* PRIORITY SELECTOR (Re-added) */}
                <div className="col-span-1 grid gap-2">
                    <Label className="text-xs font-mono text-slate-400 uppercase">Priority</Label>
                    <Select 
                        value={formData.priority} 
                        onValueChange={(val) => setFormData({...formData, priority: val})}
                    >
                        <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectValue />
                        </SelectTrigger>
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
                  <Input 
                    value={formData.category || ""} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="bg-slate-900 border-slate-800 text-slate-200" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-mono text-slate-400 uppercase">Target Deadline</Label>
                  <Input 
                    type="date" 
                    value={formData.date || ""} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    className="bg-slate-900 border-slate-800 text-slate-200" 
                  />
                </div>
            </div>
            <div className="grid gap-2">
                 <Label className="text-xs font-mono text-slate-400 uppercase">Operational Description</Label>
                 <Input 
                    value={formData.description || ""} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="bg-slate-900 border-slate-800 text-slate-200" 
                />
            </div>
          </div>

          {/* MILESTONE EDITOR */}
          <div className="space-y-3">
            <Label className="text-xs font-mono text-primary uppercase flex items-center gap-2">
                <Layers className="h-3 w-3" /> Edit Milestones
            </Label>
            
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-900/30 space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1 grid gap-1">
                        <Label className="text-[10px] text-slate-500 uppercase">Task Name</Label>
                        <Input value={msLabel} onChange={(e) => setMsLabel(e.target.value)} className="h-8 bg-slate-950 border-slate-700 text-slate-200" />
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
                <div className="flex gap-2">
                     <Input value={msDesc} onChange={(e) => setMsDesc(e.target.value)} placeholder="Description..." className="h-8 bg-slate-950 border-slate-700 text-slate-200 flex-1" />
                     <Button onClick={addMilestone} size="sm" className="h-8 bg-primary text-black font-bold"><Plus className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto">
                {formData.milestones?.map((m) => (
                    <div key={m.id} className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded border border-slate-800">
                        <span className="text-sm text-slate-200">{m.label}</span>
                        <X onClick={() => removeMilestone(m.id)} className="h-4 w-4 cursor-pointer text-slate-500 hover:text-red-500" />
                    </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="ghost" className="text-slate-400">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-primary text-slate-950 hover:bg-primary/80 font-bold">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
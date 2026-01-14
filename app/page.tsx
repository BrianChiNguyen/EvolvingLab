"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react"
import { supabase } from "@/utils/supabase" // <--- CLOUD CONNECTION

// --- TYPES ---
interface Task {
  id: string
  text: string
  status: 'todo' | 'active' | 'complete'
  created_at: string
}

export default function GridPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  // 1. LOAD TASKS FROM CLOUD (Fixed Logic)
  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // If no user, stop loading but don't crash
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      if (data) setTasks(data as Task[])

    } catch (error) {
      console.error("Error loading grid:", error)
    } finally {
      // Ensure loading ALWAYS stops so the UI appears
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // 2. ADD TASK
  const addTask = async () => {
    if (!newTask.trim()) return

    // Optimistic Update
    const tempId = Math.random().toString()
    const tempTask: Task = { id: tempId, text: newTask, status: 'todo', created_at: new Date().toISOString() }
    setTasks([...tasks, tempTask])
    setNewTask("")

    // Cloud Update
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('tasks')
        .insert({ text: tempTask.text, user_id: user.id, status: 'todo' })
        .select()
        .single()

      if (data) {
        setTasks(prev => prev.map(t => t.id === tempId ? data : t))
      }
    }
  }

  // 3. TOGGLE STATUS
  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'complete' ? 'todo' : 'complete'
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
  }

  // 4. DELETE TASK
  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  // 5. EDIT TASK
  const startEditing = (task: Task) => {
    setEditingId(task.id)
    setEditText(task.text)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setTasks(tasks.map(t => t.id === editingId ? { ...t, text: editText } : t))
    await supabase.from('tasks').update({ text: editText }).eq('id', editingId)
    setEditingId(null)
    setEditText("")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-mono max-w-4xl mx-auto pb-24">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          OPERATIONAL GRID
        </h1>
        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
          {tasks.filter(t => t.status === 'complete').length} OBJECTIVES CLEARED
        </p>
      </div>

      {/* INPUT AREA */}
      <div className="flex gap-4 mb-8">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Initialize new directive..."
          className="bg-slate-950/50 border-slate-800 h-12 text-lg focus-visible:ring-primary/50"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <Button onClick={addTask} className="h-12 w-12 bg-primary text-black hover:bg-cyan-400">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin" />
            SYNCING NEURAL CLOUD...
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <p className="text-slate-500">NO ACTIVE DIRECTIVES</p>
          </div>
        )}

        {tasks.map(task => (
          <Card key={task.id} className={`transition-all duration-300 ${task.status === 'complete' ? 'bg-slate-950/30 border-slate-900 opacity-60' : 'bg-slate-950/60 border-slate-800'}`}>
            <CardContent className="p-4 flex items-center gap-4">

              {/* CHECKBOX */}
              <Checkbox
                checked={task.status === 'complete'}
                onCheckedChange={() => toggleTask(task.id, task.status)}
                className="h-6 w-6 border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-black data-[state=checked]:border-primary"
              />

              {/* TEXT CONTENT */}
              <div className="flex-1">
                {editingId === task.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="h-8 bg-black border-primary/50 text-sm"
                      autoFocus
                    />
                    <Button size="sm" onClick={saveEdit} className="h-8 bg-primary text-black hover:bg-cyan-400"><Save className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-slate-500"><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <span
                    className={`text-lg transition-all cursor-pointer ${task.status === 'complete' ? 'text-slate-600 line-through decoration-slate-700' : 'text-slate-200'}`}
                    onClick={() => toggleTask(task.id, task.status)}
                  >
                    {task.text}
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => startEditing(task)} className="text-slate-500 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
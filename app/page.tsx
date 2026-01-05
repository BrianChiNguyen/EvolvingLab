"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, ListTodo, CheckCircle2, Zap, Check } from "lucide-react";
import Link from "next/link";
import { NewDirectiveDialog } from "@/components/NewDirectiveDialog";
import { useState, useEffect, useCallback } from "react";
import { initialDirectives } from "@/lib/data";

export default function Dashboard() {
  const [directives, setDirectives] = useState<any[]>([])
  const [stats, setStats] = useState({
    activeCount: 0,
    dailyMilestones: 0
  })

  // --- SORTING LOGIC ---
  const sortDirectives = useCallback((list: any[]) => {
    const priorityWeight: Record<string, number> = { critical: 3, high: 2, normal: 1 }
    
    return [...list].sort((a, b) => {
        // 1. Completion Status: Completed items (100%) go to the bottom
        const aCompleted = a.progress === 100
        const bCompleted = b.progress === 100
        
        if (aCompleted && !bCompleted) return 1 // A goes down
        if (!aCompleted && bCompleted) return -1 // B goes down
        
        // 2. Priority Sorting: Critical > High > Normal
        const weightA = priorityWeight[a.priority?.toLowerCase()] || 1
        const weightB = priorityWeight[b.priority?.toLowerCase()] || 1
        
        return weightB - weightA // Higher weight first
    })
  }, [])

  // --- DATA LOADING (With Auto-Fix for 0%) ---
  const loadData = useCallback(() => {
    // A. Load Directives
    const savedData = localStorage.getItem("directives")
    let loadedDirectives = []
    if (savedData) {
      loadedDirectives = JSON.parse(savedData)
    } else {
      loadedDirectives = initialDirectives
    }

    // --- FIX: RECALCULATE PROGRESS AUTOMATICALLY ---
    // This loops through every directive, counts the true milestones, and fixes the %
    loadedDirectives = loadedDirectives.map((d: any) => {
        if (!d.milestones || d.milestones.length === 0) return { ...d, progress: 0 };
        
        const completedCount = d.milestones.filter((m: any) => m.completed).length;
        const correctProgress = Math.round((completedCount / d.milestones.length) * 100);
        
        return { ...d, progress: correctProgress };
    });

    // Save the fixed data back to storage immediately
    localStorage.setItem("directives", JSON.stringify(loadedDirectives));

    // B. Sort Data
    const sorted = sortDirectives(loadedDirectives)
    setDirectives(sorted)

    // C. Calculate Daily Stats
    const savedLogs = localStorage.getItem("focusLogs")
    let todayCount = 0
    if (savedLogs) {
        const logs = JSON.parse(savedLogs)
        const today = new Date().toLocaleDateString()
        todayCount = logs.filter((log: any) => {
            const logDate = new Date(log.timestamp).toLocaleDateString()
            return logDate === today
        }).length
    }

    // Update Stats
    setStats({
        activeCount: loadedDirectives.filter((d: any) => d.progress < 100).length,
        dailyMilestones: todayCount
    })
  }, [sortDirectives])

  // 1. INITIAL LOAD & SYNC
  useEffect(() => {
    loadData()
    // Force reload when window regains focus to ensure sync
    window.addEventListener("focus", loadData)
    return () => window.removeEventListener("focus", loadData)
  }, [loadData])


  // 2. SAVE NEW DATA
  const handleAddDirective = (newData: any) => {
    // Define Styles based on Priority
    let borderColor = "border-slate-800 hover:border-primary/50" 
    let barColor = "bg-primary"
    let textColor = "text-primary"
    const p = newData.priority?.toLowerCase() || "normal"

    if (p === "critical") {
        borderColor = "border-red-900/50 hover:border-red-500"
        barColor = "bg-red-500"
        textColor = "text-red-500"
    } else if (p === "high") {
        borderColor = "border-orange-900/50 hover:border-orange-500"
        barColor = "bg-orange-500"
        textColor = "text-orange-500"
    }

    const newDirective = {
      id: Date.now().toString(),
      title: newData.title,
      category: newData.category,
      desc: newData.description,
      date: newData.date,
      priority: p, 
      progress: 0,
      color: textColor, 
      borderColor: borderColor,
      barColor: barColor,
      milestones: newData.milestones
    }
    
    // Add and Re-sort
    const updatedList = sortDirectives([...directives, newDirective])
    
    setDirectives(updatedList)
    setStats(prev => ({ ...prev, activeCount: prev.activeCount + 1 }))
    localStorage.setItem("directives", JSON.stringify(updatedList))
  }

  // 3. DELETE FUNCTION
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault() 
    e.stopPropagation() 

    const updatedList = directives.filter(item => item.id !== id)
    setDirectives(updatedList)
    setStats(prev => ({ ...prev, activeCount: updatedList.filter(d => d.progress < 100).length }))
    localStorage.setItem("directives", JSON.stringify(updatedList))
  }

  return (
    <div className="min-h-screen bg-background p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-6">
        <div>
            <div className="text-xs font-mono text-primary/80 mb-2 tracking-widest uppercase">Evolving Lab</div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white/90">
              OPERATIONAL OVERVIEW
            </h1>
        </div>
        
        {/* STATS HUD */}
        <div className="flex gap-4">
            <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-lg backdrop-blur-sm min-w-[160px]">
                <div className="p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <ListTodo className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pending</div>
                    <div className="text-xl font-bold text-white font-mono leading-none">{stats.activeCount} <span className="text-xs text-slate-600 font-normal">goals</span></div>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-lg backdrop-blur-sm min-w-[160px]">
                <div className="p-2 bg-green-500/10 rounded-md border border-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Today's Velocity</div>
                    <div className="text-xl font-bold text-white font-mono leading-none">{stats.dailyMilestones} <span className="text-xs text-slate-600 font-normal">cleared</span></div>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <NewDirectiveDialog onSave={handleAddDirective} />

        {directives.map((item) => {
            const isCompleted = item.progress === 100;
            
            // Dynamic Styles for Completed vs Active
            const cardBorder = isCompleted ? "border-green-800 hover:border-green-500" : (item.borderColor || 'border-slate-800 hover:border-primary/50');
            const cardBg = isCompleted ? "bg-green-950/10" : "bg-slate-950/40";
            const categoryColor = isCompleted ? "text-green-500" : (item.color || 'text-primary');
            const titleColor = isCompleted ? "text-green-100 line-through decoration-green-500/50" : "text-slate-100";
            const barColor = isCompleted ? "bg-green-500" : (item.barColor || 'bg-primary');
            
            return (
              <Link href={`/directives/${item.id}`} key={item.id} className="block h-full relative group">
                
                <Card className={`h-full ${cardBg} ${cardBorder} backdrop-blur-sm relative overflow-hidden transition-all cursor-pointer group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] border`}>
                  
                  {/* DELETE BUTTON */}
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full text-slate-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    title="Terminate Directive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
    
                  <CardHeader className="pb-2">
                      <div className="flex justify-between items-center mb-1">
                          <div className={`text-[10px] font-mono ${categoryColor} uppercase tracking-widest border-l-2 pl-2`} style={{borderColor: 'currentColor'}}>
                              {item.category}
                          </div>
                          {/* Priority Badge / Completed Icon */}
                          {isCompleted ? (
                              <Check className="h-4 w-4 text-green-500" />
                          ) : (
                              item.priority === 'critical' && <Zap className="h-3 w-3 text-red-500 animate-pulse" />
                          )}
                      </div>
                      <CardTitle className={`text-xl font-bold pr-6 ${titleColor}`}>{item.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                      <p className={`text-sm leading-relaxed min-h-[60px] line-clamp-3 ${isCompleted ? 'text-green-200/50' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                      
                      <div className="space-y-2 font-mono">
                          <div className={`flex justify-between text-xs font-medium ${isCompleted ? 'text-green-500' : 'text-slate-500'}`}>
                              <span>Target: {item.date}</span>
                              <span className={categoryColor}>{item.progress}%</span>
                          </div>
                          
                          <Progress 
                            value={item.progress} 
                            className="h-1 bg-slate-900" 
                            indicatorClassName={barColor} 
                          />
                      </div>
                  </CardContent>
                </Card>
              </Link>
            )
        })}

      </div>
    </div>
  );
}
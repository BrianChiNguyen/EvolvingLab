"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, ListTodo, CheckCircle2, Zap, Check, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { NewDirectiveDialog } from "@/components/NewDirectiveDialog";
import { useState, useEffect, useCallback } from "react";
import { initialDirectives } from "@/lib/data";

export default function Dashboard() {
  const [directives, setDirectives] = useState<any[]>([])
  const [stats, setStats] = useState({
    activeCount: 0,
    dailyMilestones: 0,
    totalScore: 0, // New Score State
    level: "Rookie" // Dynamic Rank
  })

  // --- 1. SCORING ALGORITHM ---
  const calculateScore = (list: any[]) => {
    let score = 0;

    // Weight Multipliers
    const weights: Record<string, number> = { critical: 3, high: 2, normal: 1 };

    list.forEach(d => {
      const p = d.priority?.toLowerCase() || 'normal';
      const multiplier = weights[p] || 1;

      // A. Points for every completed milestone (10 pts * Multiplier)
      const completedMilestones = d.milestones?.filter((m: any) => m.completed).length || 0;
      score += (completedMilestones * 10 * multiplier);

      // B. Bonus for completing the entire directive (100 pts * Multiplier)
      if (d.progress === 100) {
        score += (100 * multiplier);
      }
    });

    return score;
  };

  const getRank = (score: number) => {
    if (score > 2000) return "Legend";
    if (score > 1000) return "Elite";
    if (score > 500) return "Veteran";
    if (score > 200) return "Agent";
    return "Rookie";
  };

  // --- 2. SORTING LOGIC ---
  const sortDirectives = useCallback((list: any[]) => {
    const priorityWeight: Record<string, number> = { critical: 3, high: 2, normal: 1 }

    return [...list].sort((a, b) => {
      // Completed items go to bottom
      const aCompleted = a.progress === 100
      const bCompleted = b.progress === 100
      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1

      // Priority Sorting
      const weightA = priorityWeight[a.priority?.toLowerCase()] || 1
      const weightB = priorityWeight[b.priority?.toLowerCase()] || 1
      return weightB - weightA
    })
  }, [])

  // --- 3. DATA LOADING ---
  const loadData = useCallback(() => {
    // A. Load
    const savedData = localStorage.getItem("directives")
    let loadedDirectives = savedData ? JSON.parse(savedData) : initialDirectives

    // B. Fix Progress Calculation
    loadedDirectives = loadedDirectives.map((d: any) => {
      if (!d.milestones || d.milestones.length === 0) return { ...d, progress: 0 };
      const completedCount = d.milestones.filter((m: any) => m.completed).length;
      const correctProgress = Math.round((completedCount / d.milestones.length) * 100);
      return { ...d, progress: correctProgress };
    });

    // C. Save Fix
    localStorage.setItem("directives", JSON.stringify(loadedDirectives));

    // D. Sort & Set
    const sorted = sortDirectives(loadedDirectives)
    setDirectives(sorted)

    // E. Calculate Stats & Score
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

    const currentScore = calculateScore(loadedDirectives);

    setStats({
      activeCount: loadedDirectives.filter((d: any) => d.progress < 100).length,
      dailyMilestones: todayCount,
      totalScore: currentScore,
      level: getRank(currentScore)
    })
  }, [sortDirectives])

  // INITIAL LOAD
  useEffect(() => {
    loadData()
    window.addEventListener("focus", loadData)
    return () => window.removeEventListener("focus", loadData)
  }, [loadData])

  // HANDLE ADD
  const handleAddDirective = (newData: any) => {
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

    const updatedList = [...directives, newDirective]
    // We rely on loadData logic implicitly, but let's just re-sort and save here
    // Ideally, we'd wrap the logic to avoid duplication, but this works for now:
    const sorted = sortDirectives(updatedList)
    setDirectives(sorted)
    localStorage.setItem("directives", JSON.stringify(sorted))

    // Quick Stat update (full calc happens on reload/focus usually, but let's trigger it)
    loadData()
  }

  // HANDLE DELETE
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const updatedList = directives.filter(item => item.id !== id)
    setDirectives(updatedList)
    localStorage.setItem("directives", JSON.stringify(updatedList))
    loadData() // Recalculate score immediately
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
        <div className="flex flex-wrap gap-4">

          {/* 1. SCORE CARD (NEW) */}
          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-lg backdrop-blur-sm min-w-[160px]">
            <div className="p-2 bg-yellow-500/10 rounded-md border border-yellow-500/20">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Operative Score</div>
              <div className="text-xl font-bold text-white font-mono leading-none">
                {stats.totalScore}
                <span className="text-[10px] text-yellow-500 ml-2 uppercase tracking-wide border border-yellow-500/30 px-1 rounded bg-yellow-500/10">
                  {stats.level}
                </span>
              </div>
            </div>
          </div>

          {/* 2. PENDING CARD */}
          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-lg backdrop-blur-sm min-w-[160px]">
            <div className="p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
              <ListTodo className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pending</div>
              <div className="text-xl font-bold text-white font-mono leading-none">{stats.activeCount} <span className="text-xs text-slate-600 font-normal">goals</span></div>
            </div>
          </div>

          {/* 3. VELOCITY CARD */}
          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-lg backdrop-blur-sm min-w-[160px]">
            <div className="p-2 bg-green-500/10 rounded-md border border-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-500" />
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
                    <div className={`text-[10px] font-mono ${categoryColor} uppercase tracking-widest border-l-2 pl-2`} style={{ borderColor: 'currentColor' }}>
                      {item.category}
                    </div>
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
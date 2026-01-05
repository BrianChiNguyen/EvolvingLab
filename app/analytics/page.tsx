"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { initialDirectives } from "@/lib/data"

export default function AnalyticsPage() {
  // Initial empty state for charts
  const [chartData, setChartData] = useState({
    pie: [] as any[],
    monthly: [] as any[],
    priority: [] as any[],
    subjects: [] as any[],
    categories: [] as string[] // To track which lines to draw
  })
  
  const [efficiency, setEfficiency] = useState(0)

  // --- THE DATA PROCESSING ENGINE ---
  useEffect(() => {
    // 1. Fetch Real Data
    const savedData = localStorage.getItem("directives")
    const directives = savedData ? JSON.parse(savedData) : initialDirectives

    // --- METRIC 1: EFFICIENCY & PIE CHART ---
    let totalMilestones = 0
    let completedMilestones = 0

    directives.forEach((d: any) => {
        if (d.milestones) {
            totalMilestones += d.milestones.length
            completedMilestones += d.milestones.filter((m:any) => m.completed).length
        }
    })

    const globalProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
    setEfficiency(globalProgress)

    const pieData = [
        { name: 'Pending', value: totalMilestones - completedMilestones },
        { name: 'Done', value: completedMilestones },
    ]

    // --- METRIC 2: MONTHLY COMPLETION (Based on Target Date) ---
    const monthlyMap = new Map()
    // Initialize next 6 months to ensure chart isn't empty
    for (let i = 0; i < 5; i++) {
        const d = new Date()
        d.setMonth(d.getMonth() + i)
        const key = d.toLocaleString('default', { month: 'short' })
        monthlyMap.set(key, 0)
    }

    directives.forEach((d: any) => {
        // Only count if progress is 100%
        const mTotal = d.milestones?.length || 0
        const mDone = d.milestones?.filter((m:any) => m.completed).length || 0
        
        if (mTotal > 0 && mDone === mTotal) {
            const month = new Date(d.date).toLocaleString('default', { month: 'short' })
            const current = monthlyMap.get(month) || 0
            monthlyMap.set(month, current + 1)
        }
    })
    
    const monthlyData = Array.from(monthlyMap).map(([name, completed]) => ({ name, completed }))

    // --- METRIC 3: MILESTONE PRIORITY DISTRIBUTION ---
    const priorityCounts = { Critical: 0, High: 0, Normal: 0 }
    directives.forEach((d: any) => {
        d.milestones?.forEach((m: any) => {
            // Normalize string case
            const p = m.priority ? m.priority.charAt(0).toUpperCase() + m.priority.slice(1) : 'Normal'
            if (p === 'Critical') priorityCounts.Critical++
            else if (p === 'High') priorityCounts.High++
            else priorityCounts.Normal++
        })
    })

    const priorityData = [
        { name: 'Critical', tasks: priorityCounts.Critical, fill: '#ef4444' }, // Red
        { name: 'High', tasks: priorityCounts.High, fill: '#f97316' },     // Orange
        { name: 'Normal', tasks: priorityCounts.Normal, fill: '#00f0ff' }  // Cyan
    ]

    // --- METRIC 4: SUBJECT TRENDS (Line Chart) ---
    // We group directives by date and plot their progress
    // Format: { date: '11/15', Engineering: 50, Biohacking: null }
    
    // 1. Find all unique categories
    const categories = Array.from(new Set(directives.map((d: any) => d.category || 'General'))) as string[]
    
    // 2. Sort directives by date
    const sortedDirectives = [...directives].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 3. Build data points
    const subjectData = sortedDirectives.map((d: any) => {
        const mTotal = d.milestones?.length || 0
        const mDone = d.milestones?.filter((m:any) => m.completed).length || 0
        const prog = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0
        
        // Return object with date and the specific category's score
        return {
            name: new Date(d.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric'}),
            [d.category || 'General']: prog
        }
    })

    setChartData({
        pie: pieData,
        monthly: monthlyData,
        priority: priorityData,
        subjects: subjectData,
        categories: categories
    })

  }, [])

  // Colors for the Subject Line Chart
  const categoryColors: Record<string, string> = {
    'Biohacking': '#00f0ff', // Cyan
    'Engineering': '#8b5cf6', // Purple
    'Finance': '#22c55e',     // Green
    'General': '#94a3b8'      // Slate
  }

  const PIE_COLORS = ['#1e293b', '#00f0ff'];

  return (
    <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
            <Link href="/" className="text-xs font-mono text-slate-500 mb-2 tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-3 w-3" /> RETURN TO GRID
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white/90">
              PERFORMANCE ANALYTICS
            </h1>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. PIE CHART: Completion Ratio */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-sm font-mono uppercase text-slate-400">System Load (Milestones)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData.pie}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.pie.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-200 text-2xl font-bold">
                            {efficiency}%
                        </text>
                        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-xs uppercase tracking-widest">
                            Efficiency
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* 2. BAR CHART: Completed Directives (Monthly) */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-sm font-mono uppercase text-slate-400">Projected Completions</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.monthly}>
                        <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                             cursor={{fill: 'rgba(255,255,255,0.05)'}}
                             contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                        />
                        <Bar dataKey="completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* 3. BAR CHART: Priority Distribution */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-sm font-mono uppercase text-slate-400">Workload by Priority</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.priority} layout="vertical">
                        <XAxis type="number" allowDecimals={false} stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} width={60} />
                        <Tooltip 
                             cursor={{fill: 'rgba(255,255,255,0.05)'}}
                             contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                        />
                        {/* We use a custom Cell to color each bar individually */}
                        <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.priority.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* 4. LINE CHART: Subject Trends */}
        <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-sm font-mono uppercase text-slate-400">Category Progress (By Deadline)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.subjects}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                             contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                        />
                        <Legend />
                        
                        {/* Dynamically generate a line for each category found in your data */}
                        {chartData.categories.map((cat, index) => (
                            <Line 
                                key={cat}
                                type="monotone" 
                                connectNulls={true} // Connects dots even if data is missing for a date
                                dataKey={cat} 
                                stroke={categoryColors[cat] || '#ffffff'} 
                                strokeWidth={2} 
                                dot={{r: 4, fill:'#020617', strokeWidth:2}} 
                                activeDot={{r: 6}} 
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}
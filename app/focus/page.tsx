"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Play, Pause, RotateCcw, Zap, CheckCircle2, Settings, Target, History, Terminal, Music, Volume2, SkipBack, SkipForward, Coffee } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useFocus } from "@/context/FocusContext"
import { initialDirectives } from "@/lib/data"

interface SessionLog {
    id: number
    timestamp: string
    directiveTitle: string
    milestoneLabel: string
    duration: number
    completionPercent: number
}

export default function FocusPage() {
    const {
        mode, timeLeft, isActive, config,
        isMusicEnabled, musicGenre, currentTrack,
        selectedDirectiveId, selectedMilestoneId,
        toggleTimer, resetTimer, setMode, setConfig,
        setIsMusicEnabled, setMusicGenre, nextTrack, prevTrack,
        setSelectedDirectiveId, setSelectedMilestoneId,
        formatTime
    } = useFocus()

    const [directives, setDirectives] = useState<any[]>([])
    const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([])
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isCompleteOpen, setIsCompleteOpen] = useState(false)
    const [completionPercent, setCompletionPercent] = useState(100)

    useEffect(() => {
        const savedData = localStorage.getItem("directives")
        if (savedData) setDirectives(JSON.parse(savedData))
        else setDirectives(initialDirectives)

        const savedLogs = localStorage.getItem("focusLogs")
        if (savedLogs) setSessionLogs(JSON.parse(savedLogs))
    }, [])

    useEffect(() => {
        if (timeLeft === 0 && mode === 'focus' && !isActive) {
            setIsCompleteOpen(true)
        } else if (timeLeft === 0 && mode === 'break') {
            setMode('focus')
            alert("Break over. Ready to focus?")
        }
    }, [timeLeft, mode, isActive, setMode])

    const handleCompletionSubmit = () => {
        const elapsedSeconds = (config.focusTime * 60) - timeLeft
        const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60))

        const newStats = {
            ...config,
            sessions: config.sessions + 1,
            totalMinutes: config.totalMinutes + elapsedMinutes
        }
        setConfig(newStats)
        localStorage.setItem("focusStats", JSON.stringify({ sessions: newStats.sessions, totalMinutes: newStats.totalMinutes }))

        let dTitle = "Unknown Directive"
        let mLabel = "General Focus"

        if (selectedDirectiveId) {
            const d = directives.find(d => d.id === selectedDirectiveId)
            if (d) {
                dTitle = d.title
                if (selectedMilestoneId) {
                    const m = d.milestones.find((m: any) => m.id.toString() === selectedMilestoneId)
                    if (m) mLabel = m.label
                }
            }
        }

        const newLog: SessionLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            directiveTitle: dTitle,
            milestoneLabel: mLabel,
            duration: elapsedMinutes,
            completionPercent: completionPercent
        }

        const updatedLogs = [newLog, ...sessionLogs]
        setSessionLogs(updatedLogs)
        localStorage.setItem("focusLogs", JSON.stringify(updatedLogs))

        setIsCompleteOpen(false)
        setMode('break')
    }

    const activeDirective = directives.find(d => d.id === selectedDirectiveId)
    const availableMilestones = activeDirective?.milestones?.filter((m: any) => !m.completed) || []

    const totalTime = mode === 'focus' ? config.focusTime * 60 : config.breakTime * 60
    const progress = ((totalTime - timeLeft) / totalTime) * 100
    const radius = 120
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <div className="min-h-screen bg-background p-8 font-mono space-y-8 max-w-5xl mx-auto flex flex-col">

            {/* --- DIALOGS --- */}
            <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <CheckCircle2 /> SESSION COMPLETE
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Deep work cycle ended. Log your progress before recharging.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Milestone Completion</span>
                                <span className="text-primary font-bold">{completionPercent}%</span>
                            </div>
                            <Slider defaultValue={[100]} max={100} step={25} value={[completionPercent]} onValueChange={(val) => setCompletionPercent(val[0])} className="py-2" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCompletionSubmit} className="bg-primary text-black font-bold hover:bg-cyan-400">
                            Log & Switch to Break
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <Settings className="h-5 w-5" /> SYSTEM CONFIGURATION
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Focus Duration (min)</Label><Input type="number" value={config.focusTime} onChange={(e) => setConfig({ ...config, focusTime: Number(e.target.value) })} className="bg-slate-900 border-slate-800" /></div>
                            <div className="space-y-2"><Label>Break Duration (min)</Label><Input type="number" value={config.breakTime} onChange={(e) => setConfig({ ...config, breakTime: Number(e.target.value) })} className="bg-slate-900 border-slate-800" /></div>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={() => { setIsSettingsOpen(false); resetTimer(); }} className="bg-slate-800 text-white hover:bg-slate-700">Apply Changes</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- HEADER --- */}
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="group p-2 rounded-full border border-slate-800 hover:border-primary/50 transition-colors">
                        <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white/90 flex items-center gap-2">
                        <Zap className="text-yellow-500 fill-yellow-500/20" /> FOCUS ROOM
                    </h1>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button onClick={() => setMode('focus')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${mode === 'focus' ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>Deep Work</button>
                    <button onClick={() => setMode('break')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${mode === 'break' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>Recharge</button>
                </div>
            </div>

            {/* --- 1. TOP SECTION: FUEL THE SYSTEM (Enlarged & Centered) --- */}
            <div className="flex justify-center mb-8">
                <div className="w-full max-w-2xl bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-8 text-center backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:shadow-[0_0_60px_rgba(6,182,212,0.25)] transition-all duration-500 flex flex-col md:flex-row items-center gap-8 justify-between">

                    {/* QR Code Area */}
                    <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] shrink-0">
                        <img
                            src="/QR_code.jpeg"
                            alt="Bank QR Code"
                            className="h-40 w-40 mix-blend-multiply"
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 text-left space-y-4">
                        <div className="flex items-center gap-3 text-lg font-black uppercase tracking-widest text-primary animate-pulse">
                            <Coffee className="h-6 w-6 text-yellow-500" /> BUY ME A COFFEE
                        </div>

                        <p className="text-sm font-bold text-slate-300 leading-relaxed max-w-md">
                            Support the Evolving Lab. Your contribution keeps the servers running and the dopamine flowing. Don't forget to subcribe Brian's School on YouTube to learn more! Thank you!
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <span className="px-4 py-2 rounded bg-slate-900 border border-slate-700 text-sm font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer">1$ (25k)</span>
                            <span className="px-4 py-2 rounded bg-cyan-950/30 border border-primary/50 text-sm font-bold text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer hover:bg-cyan-900/50">2$ (50k)</span>
                            <span className="px-4 py-2 rounded bg-slate-900 border border-slate-700 text-sm font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer">5$ (100k)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. MAIN GRID: CONTROLS & TIMER --- */}
            <div className="grid md:grid-cols-2 gap-12 items-center">

                {/* LEFT COLUMN: CONTROLS (Moved Down) */}
                <div className="space-y-8">
                    <Card className="bg-slate-950/30 border-slate-800">
                        <CardContent className="p-6 space-y-6">
                            {/* DIRECTIVE & MILESTONE */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target className="h-3 w-3" /> Select Protocol</label>
                                    <Select value={selectedDirectiveId} onValueChange={setSelectedDirectiveId}>
                                        <SelectTrigger className="h-10 bg-slate-950 border-slate-800 text-slate-200"><SelectValue placeholder="Select a directive..." /></SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">{directives.map(d => (<SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                {selectedDirectiveId && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Select Target Milestone</label>
                                        <Select value={selectedMilestoneId} onValueChange={setSelectedMilestoneId}>
                                            <SelectTrigger className="h-10 bg-slate-950 border-slate-800 text-slate-200"><SelectValue placeholder="Choose a milestone..." /></SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">{availableMilestones.length === 0 && <SelectItem value="none" disabled>No active milestones</SelectItem>}{availableMilestones.map((m: any) => (<SelectItem key={m.id} value={m.id.toString()}>{m.label}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* AUDIO CONTROLS */}
                            <div className="pt-4 border-t border-slate-800/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Music className="h-3 w-3" /> Sonic Uplink
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${isMusicEnabled ? 'text-primary' : 'text-slate-600'}`}>{isMusicEnabled ? 'ON' : 'OFF'}</span>
                                        <Switch checked={isMusicEnabled} onCheckedChange={setIsMusicEnabled} />
                                    </div>
                                </div>

                                {isMusicEnabled && (
                                    <div className="animate-in fade-in slide-in-from-top-1 space-y-3">
                                        <Select value={musicGenre} onValueChange={setMusicGenre}>
                                            <SelectTrigger className="h-9 bg-slate-900 border-slate-800 text-xs uppercase tracking-wide text-primary">
                                                <div className="flex items-center gap-2"><Volume2 className="h-3 w-3" /> <SelectValue /></div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                                                <SelectItem value="synthwave">Synthwave (High Energy)</SelectItem>
                                                <SelectItem value="lofi">Lo-Fi (Deep Focus)</SelectItem>
                                                <SelectItem value="ambient">Ambient (Void State)</SelectItem>
                                                <SelectItem value="classical">Classical (Logic)</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* PLAYER CONTROLS */}
                                        <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-slate-800">
                                            <button onClick={prevTrack} className="p-1 hover:text-primary transition-colors text-slate-400"><SkipBack className="h-4 w-4" /></button>
                                            <div className="flex-1 text-center overflow-hidden">
                                                <div className="text-[10px] text-primary truncate font-mono">{currentTrack.title}</div>
                                            </div>
                                            <button onClick={nextTrack} className="p-1 hover:text-primary transition-colors text-slate-400"><SkipForward className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button onClick={toggleTimer} disabled={mode === 'focus' && (!selectedDirectiveId || !selectedMilestoneId)} className={`h-14 flex-1 text-lg font-bold tracking-widest border-0 transition-all ${isActive ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500/20' : 'bg-primary text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]'}`}>
                            {isActive ? <span className="flex items-center gap-2"><Pause className="fill-current" /> PAUSE</span> : <span className="flex items-center gap-2"><Play className="fill-current" /> INITIATE</span>}
                        </Button>
                        <Button onClick={resetTimer} variant="outline" className="h-14 w-14 border-slate-800 bg-slate-950 hover:bg-slate-900 hover:text-white"><RotateCcw /></Button>
                        <Button onClick={() => setIsSettingsOpen(true)} variant="outline" className="h-14 w-14 border-slate-800 bg-slate-950 hover:bg-slate-900 hover:text-primary"><Settings /></Button>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 mb-1">Sessions Completed</span><span className="text-2xl font-mono text-slate-200">{config.sessions}</span></div>
                        <div className="flex flex-col text-right"><span className="text-[10px] uppercase text-slate-500 mb-1">Total Focus Time</span><span className="text-2xl font-mono text-primary">{config.totalMinutes}<span className="text-xs text-slate-500 ml-1">min</span></span></div>
                    </div>
                </div>

                {/* RIGHT COLUMN: VISUAL TIMER (Aligned with Controls) */}
                <div className="flex justify-center relative scale-110">
                    <div className={`absolute inset-0 bg-primary/20 blur-[100px] rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-50' : 'opacity-0'}`} />
                    <div className="relative">
                        {/* SVG Circle */}
                        <svg width="300" height="300" className="transform -rotate-90">
                            <circle cx="150" cy="150" r={radius} fill="transparent" stroke="#0f172a" strokeWidth="12" />
                            <circle cx="150" cy="150" r={radius} fill="transparent" stroke={mode === 'focus' ? '#00f0ff' : '#22c55e'} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                        </svg>
                        {/* Visualizer Bars */}
                        {isActive && isMusicEnabled && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 h-32 opacity-30 pointer-events-none">
                                <div className="w-2 bg-primary/80 animate-[pulse_1s_ease-in-out_infinite] h-12" />
                                <div className="w-2 bg-primary/80 animate-[pulse_1.5s_ease-in-out_infinite] h-20" />
                                <div className="w-2 bg-primary/80 animate-[pulse_1.2s_ease-in-out_infinite] h-16" />
                                <div className="w-2 bg-primary/80 animate-[pulse_0.8s_ease-in-out_infinite] h-24" />
                                <div className="w-2 bg-primary/80 animate-[pulse_1.3s_ease-in-out_infinite] h-14" />
                            </div>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <span className="text-6xl font-mono font-bold text-white tracking-tighter text-glow">{formatTime(timeLeft)}</span>
                            <span className={`text-sm font-bold uppercase tracking-[0.2em] mt-2 ${isActive ? 'animate-pulse' : 'opacity-50'} ${mode === 'focus' ? 'text-primary' : 'text-green-500'}`}>{isActive ? (isMusicEnabled ? 'Sonic Uplink Active' : 'System Active') : 'System Standby'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COMPLETION LOGS */}
            <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-4"><History className="text-primary h-5 w-5" /><h2 className="text-xl font-bold text-slate-200 tracking-tight">Completion Logs</h2></div>
                {sessionLogs.length === 0 ? <div className="p-8 border border-dashed border-slate-800 rounded-lg text-center text-slate-500 text-sm">No session data recorded.</div> :
                    <div className="grid gap-3">{sessionLogs.map((log) => (<div key={log.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded bg-slate-900 border border-slate-800 flex items-center justify-center"><Terminal className="h-5 w-5 text-slate-500" /></div><div><div className="flex items-center gap-2"><span className="font-bold text-slate-200">{log.directiveTitle}</span><span className="text-xs text-slate-500 px-2 py-0.5 rounded-full border border-slate-800 bg-slate-900">{log.milestoneLabel}</span></div><div className="text-xs text-slate-500 mt-1 flex gap-3"><span>{log.timestamp}</span><span className="text-primary">{log.duration} min session</span></div></div></div><div className="text-right"><div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completion</div><div className="font-mono font-bold text-primary">{log.completionPercent}%</div></div></div>))}</div>}
            </div>
        </div>
    )
}
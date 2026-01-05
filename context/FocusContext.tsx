"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"

// --- MUSIC DATA ---
const MUSIC_LIBRARY: Record<string, { title: string, url: string }[]> = {
    "synthwave": [
        { title: "Neon Blade", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { title: "Cyber City", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
        { title: "Night Run", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    ],
    "lofi": [
        { title: "Empty Mind", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
        { title: "Rainy Day", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    ],
    "ambient": [
        { title: "Space Drone", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
        { title: "Deep Ocean", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    ],
    "classical": [
        { title: "Piano Moment", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
        { title: "Violin Solo", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
    ]
}

interface FocusContextType {
  // Timer State
  mode: 'focus' | 'break'
  timeLeft: number
  isActive: boolean
  config: { focusTime: number, breakTime: number, sessions: number, totalMinutes: number }
  
  // Audio State
  isMusicEnabled: boolean
  musicGenre: string
  currentTrack: { title: string, url: string }
  
  // Selection State (Global so dashboard knows what you are doing)
  selectedDirectiveId: string
  selectedMilestoneId: string

  // Actions
  toggleTimer: () => void
  resetTimer: () => void
  setMode: (mode: 'focus' | 'break') => void
  setConfig: (config: any) => void
  setIsMusicEnabled: (enabled: boolean) => void
  setMusicGenre: (genre: string) => void
  nextTrack: () => void
  prevTrack: () => void
  setSelectedDirectiveId: (id: string) => void
  setSelectedMilestoneId: (id: string) => void
  formatTime: (seconds: number) => string
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export function FocusProvider({ children }: { children: React.ReactNode }) {
  // --- STATE ---
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [isActive, setIsActive] = useState(false)
  const [config, setConfig] = useState({ focusTime: 25, breakTime: 5, sessions: 0, totalMinutes: 0 })
  const [timeLeft, setTimeLeft] = useState(25 * 60)

  // Music State
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const [musicGenre, setMusicGenre] = useState("synthwave")
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  
  // Selection State
  const [selectedDirectiveId, setSelectedDirectiveId] = useState("")
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("")

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 1. Load Config from Storage
  useEffect(() => {
    const savedStats = localStorage.getItem("focusStats")
    if (savedStats) setConfig(prev => ({...prev, ...JSON.parse(savedStats)}))
  }, [])

  // 2. Audio Engine
  useEffect(() => {
    if (!audioRef.current) return
    if (isActive && isMusicEnabled) {
        audioRef.current.volume = 0.5
        audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e))
    } else {
        audioRef.current.pause()
    }
  }, [isActive, isMusicEnabled, musicGenre, currentTrackIndex])

  // Reset track when genre changes
  useEffect(() => { setCurrentTrackIndex(0) }, [musicGenre])

  // 3. Timer Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      // Play a notification sound or alert here if needed
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isActive, timeLeft])

  // --- ACTIONS ---
  const toggleTimer = () => setIsActive(!isActive)
  
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? config.focusTime * 60 : config.breakTime * 60)
  }

  const handleSetMode = (newMode: 'focus' | 'break') => {
    setMode(newMode)
    setIsActive(false)
    setTimeLeft(newMode === 'focus' ? config.focusTime * 60 : config.breakTime * 60)
  }

  const nextTrack = () => {
    const playlist = MUSIC_LIBRARY[musicGenre] || []
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
  }

  const prevTrack = () => {
    const playlist = MUSIC_LIBRARY[musicGenre] || []
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get current track object safely
  const currentTrack = MUSIC_LIBRARY[musicGenre]?.[currentTrackIndex] || { title: "Loading...", url: "" }

  return (
    <FocusContext.Provider value={{
        mode, timeLeft, isActive, config,
        isMusicEnabled, musicGenre, currentTrack,
        selectedDirectiveId, selectedMilestoneId,
        toggleTimer, resetTimer, setMode: handleSetMode, setConfig,
        setIsMusicEnabled, setMusicGenre, nextTrack, prevTrack,
        setSelectedDirectiveId, setSelectedMilestoneId,
        formatTime
    }}>
      {children}
      {/* GLOBAL AUDIO PLAYER */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={nextTrack}
        loop={false}
      />
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) throw new Error("useFocus must be used within a FocusProvider")
  return context
}
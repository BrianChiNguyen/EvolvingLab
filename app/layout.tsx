"use client"

import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LayoutGrid, Monitor, Zap, LogOut, Settings, ShieldCheck, User, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { FocusProvider, useFocus } from "@/context/FocusContext"; 
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const ADMIN_EMAIL = "evolvinglab_admin_cong@gmail.com";

// --- SIDEBAR TIMER COMPONENT ---
function SidebarTimer() {
    const { isActive, timeLeft, formatTime } = useFocus()
    if (!isActive) return null
    
    return (
        <div className="mb-6 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 px-2">
            <div className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse mb-2">RUNNING</div>
            <div className="bg-primary/10 border border-primary/20 rounded-md px-3 py-1 w-full text-center shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                <div className="text-sm font-mono font-bold text-white tracking-widest">{formatTime(timeLeft)}</div>
            </div>
        </div>
    )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = () => {
        const user = localStorage.getItem("active_user");
        setCurrentUser(user);
    }
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [pathname]);

  const handleLogout = () => {
    if(confirm("Terminate Evolve ID Session?")) {
        localStorage.removeItem("active_user");
        window.location.href = "/"; 
    }
  }

  // Helper for active link styles
  const isActive = (path: string) => pathname === path ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,255,0.1)]" : "text-slate-400 hover:text-primary hover:bg-primary/5";

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-background text-foreground flex h-screen overflow-hidden`}>
        
        <FocusProvider>
            <AuthGate>
                
                {/* SIDEBAR: W-24 (Wide) */}
                <aside className="w-24 border-r border-border flex flex-col items-center py-8 bg-black/40 backdrop-blur-xl z-50">
                
                {/* 1. MAIN NAVIGATION */}
                <nav className="flex flex-col gap-6 w-full px-4">
                    
                    {/* Dashboard */}
                    <Link href="/" className="group relative flex justify-center w-full">
                        {/* Active Indicator increased to h-10 to match larger icons */}
                        {pathname === '/' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/')}`}>
                            {/* Icon Scale: h-8 w-8 */}
                            <LayoutGrid className="h-8 w-8" />
                        </div>
                    </Link>

                    {/* Analytics */}
                    <Link href="/analytics" className="group relative flex justify-center w-full">
                        {pathname === '/analytics' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/analytics')}`}>
                            <Monitor className="h-8 w-8" />
                        </div>
                    </Link>

                    {/* Focus Room */}
                    <Link href="/focus" className="group relative flex justify-center w-full">
                        {pathname === '/focus' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/focus')}`}>
                            <Zap className="h-8 w-8" />
                        </div>
                    </Link>

                    {/* Flexing Room */}
                    <Link href="/flex" className="group relative flex justify-center w-full">
                        {pathname === '/flex' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/flex')}`}>
                            <Trophy className="h-8 w-8" />
                        </div>
                    </Link>
                    {/* 5. STUDY STORIES (New!) */}
                    <Link href="/stories" className="group relative flex justify-center w-full">
                        {pathname === '/stories' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/stories')}`}>
                            <BookOpen className="h-8 w-8" />
                        </div>
                    </Link>
                </nav>

                <div className="flex-1" />

                {/* 2. SYSTEM STATUS (Timer) */}
                <SidebarTimer />

                {/* 3. USER ACTIONS */}
                <div className="flex flex-col gap-4 w-full px-4">
                    {/* User Profile */}
                    <Link href="/profile" className="group relative flex justify-center w-full">
                        {pathname === '/profile' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/profile')}`}>
                            <User className="h-8 w-8" />
                        </div>
                    </Link>

                    {/* Admin Settings (Conditional) */}
                    {currentUser === ADMIN_EMAIL && (
                        <Link href="/settings" className="group relative flex justify-center w-full">
                            {pathname === '/settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-red-500 rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                            <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${pathname === '/settings' ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"}`}>
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                        </Link>
                    )}

                    {/* Logout */}
                    <button 
                        onClick={handleLogout}
                        className="p-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer w-full flex justify-center"
                        title="Terminate Session"
                    >
                        <LogOut className="h-8 w-8" />
                    </button>
                </div>

                </aside>

                <main className="flex-1 overflow-y-auto bg-[url('/grid-pattern.svg')]">
                    {children}
                </main>

            </AuthGate>
        </FocusProvider>

      </body>
    </html>
  );
}
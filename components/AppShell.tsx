"use client"

import { LayoutGrid, Monitor, Zap, LogOut, ShieldCheck, User, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { FocusProvider, useFocus } from "@/context/FocusContext"; 
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase"; // <--- IMPORT SUPABASE

// --- CONFIG: YOUR NEW ADMIN EMAIL ---
const ADMIN_EMAIL = "congtrangunsw@gmail.com"; 

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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check Supabase User
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setCurrentUserEmail(user.email);
    }
    checkUser();
  }, [pathname]);

  const handleLogout = async () => {
    if(confirm("Terminate Session?")) {
        await supabase.auth.signOut();
        window.location.reload(); // Reload to trigger AuthGate
    }
  }

  const isActive = (path: string) => pathname === path ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,255,0.1)]" : "text-slate-400 hover:text-primary hover:bg-primary/5";

  return (
    <FocusProvider>
        <AuthGate>
            <aside className="w-24 border-r border-border flex flex-col items-center py-8 bg-black/40 backdrop-blur-xl z-50 fixed left-0 top-0 h-full">
            
            {/* NAVIGATION */}
            <nav className="flex flex-col gap-6 w-full px-4">
                <Link href="/" className="group relative flex justify-center w-full">
                    {pathname === '/' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                    <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/')}`}><LayoutGrid className="h-8 w-8" /></div>
                </Link>

                <Link href="/analytics" className="group relative flex justify-center w-full">
                    {pathname === '/analytics' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                    <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/analytics')}`}><Monitor className="h-8 w-8" /></div>
                </Link>

                <Link href="/focus" className="group relative flex justify-center w-full">
                    {pathname === '/focus' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                    <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/focus')}`}><Zap className="h-8 w-8" /></div>
                </Link>

                <Link href="/flex" className="group relative flex justify-center w-full">
                    {pathname === '/flex' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                    <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/flex')}`}><Trophy className="h-8 w-8" /></div>
                </Link>
                
                <Link href="/stories" className="group relative flex justify-center w-full">
                    {pathname === '/stories' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                    <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/stories')}`}><BookOpen className="h-8 w-8" /></div>
                </Link>
            </nav>

            <div className="flex-1" />
            <SidebarTimer />

            {/* USER ACTIONS */}
            <div className="flex flex-col gap-4 w-full px-4">
                <Link href="/profile" className="group relative flex justify-center w-full">
                    {pathname === '/profile' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-primary rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                    <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${isActive('/profile')}`}><User className="h-8 w-8" /></div>
                </Link>

                {/* --- ADMIN CHECK --- */}
                {currentUserEmail === ADMIN_EMAIL && (
                    <Link href="/settings" className="group relative flex justify-center w-full">
                        {pathname === '/settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-10 bg-red-500 rounded-r-full group-hover:translate-x-0 transition-all duration-300 opacity-100" />}
                        <div className={`p-3 rounded-xl transition-all duration-300 w-full flex justify-center ${pathname === '/settings' ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"}`}>
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                    </Link>
                )}

                <button onClick={handleLogout} className="p-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer w-full flex justify-center">
                    <LogOut className="h-8 w-8" />
                </button>
            </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-[url('/grid-pattern.svg')] ml-24 h-full">
                {children}
            </main>
        </AuthGate>
    </FocusProvider>
  );
}
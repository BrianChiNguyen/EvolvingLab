"use client"

import { LayoutGrid, Monitor, Zap, LogOut, ShieldCheck, User, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { FocusProvider, useFocus } from "@/context/FocusContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

// --- CONFIG ---
const ADMIN_EMAIL = "congtrangunsw@gmail.com";

// --- COMPONENT: SIDEBAR TIMER (DESKTOP) ---
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

// --- COMPONENT: HEADER TIMER (MOBILE) ---
function MobileTimer() {
    const { isActive, timeLeft, formatTime } = useFocus()
    if (!isActive) return null
    return (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded px-2 py-1 animate-in fade-in zoom-in mr-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-bold text-white tracking-widest">{formatTime(timeLeft)}</span>
        </div>
    )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setCurrentUserEmail(user.email);
        }
        checkUser();
    }, [pathname]);

    const handleLogout = async () => {
        if (confirm("Terminate Session?")) {
            await supabase.auth.signOut();
            window.location.reload();
        }
    }

    // Active Helper
    const isActive = (path: string) => pathname === path ? "text-primary" : "text-slate-500";
    const getLinkClass = (path: string) =>
        `p-2 rounded-xl transition-all duration-300 flex justify-center items-center ${pathname === path ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,255,255,0.1)]" : "text-slate-400 hover:text-primary hover:bg-primary/5"}`;

    return (
        <FocusProvider>
            <AuthGate>

                {/* =======================================
                1. DESKTOP SIDEBAR (Hidden on Mobile)
               ======================================= */}
                <aside className="hidden md:flex w-24 border-r border-border flex-col items-center py-8 bg-black/40 backdrop-blur-xl z-50 fixed left-0 top-0 h-full">
                    <nav className="flex flex-col gap-6 w-full px-4">
                        <Link href="/" className={getLinkClass('/')}><LayoutGrid className="h-8 w-8" /></Link>
                        <Link href="/analytics" className={getLinkClass('/analytics')}><Monitor className="h-8 w-8" /></Link>
                        <Link href="/focus" className={getLinkClass('/focus')}><Zap className="h-8 w-8" /></Link>
                        <Link href="/flex" className={getLinkClass('/flex')}><Trophy className="h-8 w-8" /></Link>
                        <Link href="/stories" className={getLinkClass('/stories')}><BookOpen className="h-8 w-8" /></Link>
                    </nav>

                    <div className="flex-1" />
                    <SidebarTimer />

                    <div className="flex flex-col gap-4 w-full px-4">
                        <Link href="/profile" className={getLinkClass('/profile')}><User className="h-8 w-8" /></Link>

                        {currentUserEmail === ADMIN_EMAIL && (
                            <Link href="/settings" className={`p-3 rounded-xl flex justify-center ${pathname === '/settings' ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"}`}>
                                <ShieldCheck className="h-8 w-8" />
                            </Link>
                        )}

                        <button onClick={handleLogout} className="p-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 flex justify-center">
                            <LogOut className="h-8 w-8" />
                        </button>
                    </div>
                </aside>

                {/* =======================================
                2. MOBILE HEADER (Top Bar)
               ======================================= */}
                <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4 shadow-lg">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Evolving Lab</span>
                        <span className="text-sm font-bold text-white tracking-tighter">NEURAL OS</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <MobileTimer />

                        {/* PROFILE MOVED HERE */}
                        <Link href="/profile" className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <User className="h-5 w-5" />
                        </Link>

                        {currentUserEmail === ADMIN_EMAIL && (
                            <Link href="/settings" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <ShieldCheck className="h-5 w-5" />
                            </Link>
                        )}
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* =======================================
                3. MOBILE NAVIGATION (Bottom Bar)
               ======================================= */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center px-2 pb-4 pt-2">
                    <Link href="/" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/')}`}>
                        <LayoutGrid className="h-6 w-6" />
                    </Link>

                    <Link href="/focus" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/focus')}`}>
                        <Zap className="h-6 w-6" />
                    </Link>

                    {/* ADDED FLEX HERE */}
                    <Link href="/flex" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/flex')}`}>
                        <Trophy className="h-6 w-6" />
                    </Link>

                    <Link href="/analytics" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/analytics')}`}>
                        <Monitor className="h-6 w-6" />
                    </Link>

                    <Link href="/stories" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/stories')}`}>
                        <BookOpen className="h-6 w-6" />
                    </Link>
                </nav>

                {/* =======================================
                4. MAIN CONTENT AREA
               ======================================= */}
                <main className="flex-1 h-full overflow-y-auto bg-[url('/grid-pattern.svg')] 
                md:ml-24           /* Desktop: Push content right to clear sidebar */
                pt-20 pb-24        /* Mobile: Push content down (header) and up (nav) */
                md:pt-0 md:pb-0    /* Desktop: Remove mobile padding */
            ">
                    {children}
                </main>

            </AuthGate>
        </FocusProvider>
    );
}
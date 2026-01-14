"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Shield, GraduationCap, Briefcase, Mail, Fingerprint, Edit2, Save, Loader2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // --- USER STATE ---
    const [user, setUser] = useState<any>(null)

    // --- FORM STATE ---
    const [username, setUsername] = useState("")
    const [academic, setAcademic] = useState("")
    const [experience, setExperience] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")

    // Password (Only for updates)
    const [newPassword, setNewPassword] = useState("")

    // 1. LOAD DATA
    useEffect(() => {
        async function getProfile() {
            setLoading(true)

            // Get Auth User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUser(user)

            // Get Profile Data
            const { data, error } = await supabase
                .from('profiles')
                .select('username, academic_background, experience, avatar_url')
                .eq('id', user.id)
                .single()

            if (data) {
                setUsername(data.username || "")
                setAcademic(data.academic_background || "")
                setExperience(data.experience || "")
                setAvatarUrl(data.avatar_url || "")
            }
            setLoading(false)
        }

        getProfile()
    }, [])

    // 2. SAVE CHANGES
    const handleUpdateProfile = async () => {
        setUpdating(true)

        try {
            const updates = {
                id: user.id,
                username,
                academic_background: academic,
                experience,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            }

            // A. Update Profile Data
            const { error: profileError } = await supabase.from('profiles').upsert(updates)
            if (profileError) throw profileError

            // B. Update Password (If provided)
            if (newPassword) {
                const { error: passError } = await supabase.auth.updateUser({ password: newPassword })
                if (passError) throw passError
            }

            setIsEditing(false)
            setNewPassword("") // Clear password field for safety
            alert("Identity Record Updated Successfully.")

        } catch (error: any) {
            alert(error.message)
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-primary font-mono animate-pulse">LOADING IDENTITY MATRIX...</div>
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-mono space-y-6 max-w-4xl mx-auto pb-24">

            {/* HEADER */}
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                        <User className="h-8 w-8 text-primary" />
                        EVOLVING PROFILE
                    </h1>
                    <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
                        Identity Verified • Level 1 Access
                    </p>
                </div>

                {/* EDIT TOGGLE BUTTON */}
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                        <Edit2 className="h-4 w-4 mr-2" /> EDIT IDENTITY
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-slate-500 hover:text-white">
                        <X className="h-4 w-4 mr-2" /> CANCEL
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">

                {/* --- LEFT COLUMN: CORE IDENTITY (READ ONLY ID) --- */}
                <div className="space-y-6">
                    <Card className="bg-slate-950/40 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Fingerprint className="h-4 w-4" /> EVOLVING ID
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-slate-600">System UUID (Locked)</Label>
                                <div className="font-mono text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-900 break-all">
                                    {user?.id}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-slate-600">Email Uplink (Locked)</Label>
                                <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-900">
                                    <Mail className="h-3 w-3" />
                                    {user?.email}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AVATAR PLACEHOLDER (You can expand this later to upload images) */}
                    <div className="aspect-square rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden group">
                        {avatarUrl ? (
                            <img src={avatarUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <User className="h-24 w-24 text-slate-800" />
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Input
                                    placeholder="Paste Image URL"
                                    className="w-3/4 bg-black/50 text-xs border-white/20"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT COLUMN: EDITABLE FIELDS --- */}
                <div className="md:col-span-2 space-y-6">

                    {/* 1. BASIC INFO */}
                    <Card className="bg-slate-950/40 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Personal Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Display Name / Codename</Label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!isEditing}
                                    className="bg-slate-900 border-slate-800 focus:border-primary"
                                    placeholder="e.g. Neo"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. ACADEMIC & EXPERIENCE */}
                    <Card className="bg-slate-950/40 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> Background Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><GraduationCap className="h-3 w-3 text-slate-500" /> Academic History</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={academic}
                                        onChange={(e) => setAcademic(e.target.value)}
                                        className="bg-slate-900 border-slate-800 min-h-[80px]"
                                        placeholder="PhD in Robotics, UNSW..."
                                    />
                                ) : (
                                    <div className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-md border border-slate-800/50 min-h-[60px]">
                                        {academic || <span className="text-slate-600 italic">No data recorded.</span>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Briefcase className="h-3 w-3 text-slate-500" /> Operational Experience</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        className="bg-slate-900 border-slate-800 min-h-[120px]"
                                        placeholder="Lecturer at UNSW..."
                                    />
                                ) : (
                                    <div className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-md border border-slate-800/50 min-h-[100px] whitespace-pre-wrap">
                                        {experience || <span className="text-slate-600 italic">No data recorded.</span>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. SECURITY (ONLY VISIBLE IN EDIT MODE) */}
                    {isEditing && (
                        <Card className="bg-red-950/10 border-red-900/30 animate-in slide-in-from-bottom-2">
                            <CardHeader>
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Security Override
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label className="text-red-200">New Passkey</Label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="bg-slate-900 border-red-900/30 focus:border-red-500"
                                        placeholder="Leave empty to keep current password"
                                    />
                                    <p className="text-[10px] text-slate-500">Only enter data here if you wish to rotate your credentials.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* SAVE BUTTON */}
                    {isEditing && (
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleUpdateProfile} disabled={updating} className="bg-primary text-black font-bold hover:bg-cyan-400 w-full md:w-auto">
                                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                SAVE CONFIGURATION
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
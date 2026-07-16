'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import Link from 'next/link'
import {
  ListTodo, BookOpen, Calendar, Wallet,
  Loader2, Activity, ArrowUpRight, CheckCircle, Clock, PlayCircle, Camera, HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function StudentDashboardPage() {
  const { data: session, update } = useSession()
  const studentId = (session?.user as any)?.id || ''

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [classCount, setClassCount] = useState(0)
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false)
  const [nextClass, setNextClass] = useState<any>(null)
  const [recentAssignments, setRecentAssignments] = useState<any[]>([])

  // Phase 2: AIM Rating and Club states
  const [profileData, setProfileData] = useState<any>(null)
  const [showClubPopup, setShowClubPopup] = useState(false)
  const [newlyUnlockedClub, setNewlyUnlockedClub] = useState<any>(null)

  const getProgressToNextClub = (rating: number) => {
    const clubs = [
      { name: "Beginner", min: 500, max: 599 },
      { name: "AIM 600 Club", min: 600, max: 799 },
      { name: "AIM 800 Club", min: 800, max: 999 },
      { name: "AIM 1000 Club", min: 1000, max: 1199 },
      { name: "AIM 1200 Club", min: 1200, max: 1399 },
      { name: "AIM 1400 Club", min: 1400, max: 1599 },
      { name: "AIM 1600 Club", min: 1600, max: 1799 },
      { name: "AIM 1800 Club", min: 1800, max: 1999 },
      { name: "AIM 2000 Club", min: 2000, max: 9999 }
    ]

    const currentIdx = clubs.findIndex(c => rating >= c.min && rating <= c.max)
    if (currentIdx === -1) return { currentClub: "Beginner", nextClub: "AIM 600 Club", targetRating: 600, progress: 0, remaining: 100 }
    
    const current = clubs[currentIdx]
    if (currentIdx === clubs.length - 1) {
      return { currentClub: current.name, nextClub: "None (Max)", targetRating: 2000, progress: 100, remaining: 0 }
    }
    
    const next = clubs[currentIdx + 1]
    const total = next.min - current.min
    const gained = rating - current.min
    const progress = Math.min(100, Math.round((gained / total) * 100))
    const remaining = Math.max(0, next.min - rating)

    return {
      currentClub: current.name,
      nextClub: next.name,
      targetRating: next.min,
      progress,
      remaining
    }
  }

  const getRatingHistorySvg = (history: any[]) => {
    const data = Array.isArray(history) && history.length > 0 ? history : [{ rating: 500 }]
    const ratings = data.map(h => h.rating)
    if (ratings.length === 1) {
      ratings.unshift(500)
    }
    
    const min = Math.min(...ratings, 500) - 20
    const max = Math.max(...ratings, 500) + 20
    const range = max - min || 1

    const width = 500
    const height = 150
    const padding = 20

    const points = ratings.map((r, i) => {
      const x = padding + (i / (ratings.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((r - min) / range) * (height - 2 * padding)
      return `${x},${y}`
    }).join(" ")

    return (
      <svg className="w-full h-36" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          points={points}
        />
        {ratings.map((r, i) => {
          const x = padding + (i / (ratings.length - 1)) * (width - 2 * padding)
          const y = height - padding - ((r - min) / range) * (height - 2 * padding)
          return (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth="2.5"
              />
              <title>Rating: {r}</title>
            </g>
          )
        })}
      </svg>
    )
  }

  useEffect(() => {
    if (!studentId) return
    const fetchData = async () => {
      try {
        const [assignRes, classesRes, profileRes] = await Promise.all([
          fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' }),
          fetch(`/api/classes?studentId=${studentId}`),
          fetch("/api/user/profile")
        ])

        if (assignRes.ok) {
          const assignments = await assignRes.json()
          const pending = assignments.filter((a: any) => !a.isCompleted)
          const completed = assignments.filter((a: any) => a.isCompleted)
          setPendingCount(pending.length)
          setCompletedCount(completed.length)
          setRecentAssignments(pending.slice(0, 3))
        }

        if (classesRes.ok) {
          const classes = await classesRes.json()
          setClassCount(Array.isArray(classes) ? classes.length : 0)
          if (Array.isArray(classes) && classes.length > 0) setNextClass(classes[0])
        }

        if (profileRes.ok) {
          const profile = await profileRes.json()
          setProfileData(profile)
          
          // Check for pending certificates
          const pendingClubCert = profile.certificates?.find((c: any) => c.type === "AIM_CLUB" && c.status === "PENDING")
          if (pendingClubCert) {
            setNewlyUnlockedClub(pendingClubCert)
            setShowClubPopup(true)
          }
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [studentId])

  const handleClaimCertificate = async (certificateId: string) => {
    try {
      const res = await fetch("/api/certificates/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId })
      })
      if (res.ok) {
        toast.success("Certificate claimed successfully!")
        setShowClubPopup(false)
        const profileRes = await fetch("/api/user/profile")
        if (profileRes.ok) {
          setProfileData(await profileRes.json())
        }
      } else {
        toast.error("Failed to claim certificate")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'aimchess')

    try {
      const uploadRes = await fetch("https://api.cloudinary.com/v1_1/dieciekpa/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
      const uploadData = await uploadRes.json()
      const cloudinaryUrl = uploadData.secure_url

      const res = await fetch("/api/user/profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: cloudinaryUrl }),
      })

      if (res.ok) {
        await update({ photoUrl: cloudinaryUrl })
        toast.success("Profile photo updated successfully!")
      } else {
        toast.error("Failed to update profile photo in database")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred during upload")
    }
  }

  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'aimchess')

    try {
      const uploadRes = await fetch("https://api.cloudinary.com/v1_1/dieciekpa/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
      const uploadData = await uploadRes.json()
      const cloudinaryUrl = uploadData.secure_url

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId, idCardUrl: cloudinaryUrl }),
      })

      if (res.ok) {
        await update({ idCardUrl: cloudinaryUrl })
        toast.success("ID Card updated successfully!")
      } else {
        toast.error("Failed to update ID Card in database")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <CRMShellLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </CRMShellLayout>
    )
  }

  return (
    <CRMShellLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#0b1d3a] to-[#1a3a6a] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                {(session?.user as any)?.photoUrl ? (
                  <img src={(session?.user as any).photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-4xl font-black text-sky-300">
                    {session?.user?.name ? (session?.user as any).name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "S"}
                  </span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center justify-center cursor-pointer shadow-lg border-2 border-[#0b1d3a] transition-all hover:scale-110">
                <Camera size={16} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Let&apos;s train, {session?.user?.name}! 🧠♟️</h1>
              <p className="text-sky-200 text-sm">Keep up the great work. Here&apos;s your learning overview.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Level</p>
              <p className="text-xl font-black">{(session?.user as any)?.stage || 'BEGINNER'}</p>
            </div>
            {(session?.user as any)?.idCardUrl && (
              <button 
                onClick={() => setIsIdCardModalOpen(true)}
                className="px-4 py-2 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-500/30 text-center hover:bg-emerald-500/30 transition-all"
              >
                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">ID Card</p>
                <p className="text-xs font-bold text-white flex items-center gap-1"><CheckCircle size={10} /> Verified</p>
              </button>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ListTodo className="text-white" size={20} />
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-orange-700 bg-orange-50">
                  <Clock size={12} /> Due
                </div>
              )}
            </div>
            <div className="text-2xl font-black text-gray-900">{pendingCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Pending Assignments</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <CheckCircle className="text-white" size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{completedCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Exercises Completed</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Calendar className="text-white" size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{classCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Enrolled Classes</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <BookOpen className="text-white" size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{(session?.user as any)?.stage || 'BEGINNER'}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Current Level</p>
          </div>
        </div>

        {/* Phase 2: AIM Rating Profile & History Graph */}
        {profileData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AIM Rating Profile */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">⭐ AIM Chess Rating</h3>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-4xl font-black text-indigo-600">{profileData.aimRating || 500}</span>
                  <span className="text-xs text-gray-500 font-semibold">Peak: {profileData.highestAimRating || 500}</span>
                </div>
                <div className="space-y-1 text-sm mb-4">
                  <p className="text-gray-700 font-semibold"><span className="text-gray-400">Club:</span> {profileData.aimClub || "Beginner"}</p>
                  <p className="text-gray-700 font-semibold"><span className="text-gray-400">Level:</span> {profileData.aimLevel || "Starter Level"}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl text-center text-xs font-bold text-gray-700">
                  <div>
                    <span className="text-emerald-600 block text-sm font-black">{profileData.wins || 0}</span>
                    W
                  </div>
                  <div>
                    <span className="text-amber-600 block text-sm font-black">{profileData.draws || 0}</span>
                    D
                  </div>
                  <div>
                    <span className="text-red-500 block text-sm font-black">{profileData.losses || 0}</span>
                    L
                  </div>
                </div>
              </div>

              {/* Progress Bar towards next club */}
              {(() => {
                const target = getProgressToNextClub(profileData.aimRating || 500);
                return (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>{target.currentClub} ✅</span>
                      <span>{target.nextClub}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3.5 mb-2 overflow-hidden border">
                      <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${target.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>{target.progress}% Complete</span>
                      <span>{target.remaining} points remaining</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Rating History Graph */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">📈 Rating History Graph</h3>
                <p className="text-xs text-gray-500 mb-4">Track your performance over time across all portal matches.</p>
              </div>
              <div className="bg-indigo-50/20 p-2 rounded-xl border border-indigo-100/50">
                {getRatingHistorySvg(profileData.aimRatingHistory)}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Assignments */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ListTodo size={16} className="text-orange-500" /> Upcoming Assignments
              </h3>
              <Link href="/crm/student-todo" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                View All →
              </Link>
            </div>
            {recentAssignments.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border-2 border-dashed">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-300" />
                All caught up! Check the Library for more practice.
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssignments.map((item: any) => {
                  const isOverdue = item.dueDate && new Date() > new Date(item.dueDate)
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isOverdue ? 'border-red-200 bg-red-50/50' : 'border-gray-100 hover:bg-sky-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-red-100' : !!item.mcqId ? 'bg-emerald-100' : 'bg-sky-100'}`}>
                          {!!item.mcqId ? <HelpCircle size={18} className={isOverdue ? 'text-red-500' : 'text-emerald-600'} /> : <PlayCircle size={18} className={isOverdue ? 'text-red-500' : 'text-sky-600'} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.mcqId ? item.mcq.question : item.puzzle?.title}</p>
                          <p className="text-[10px] text-gray-500">By Coach {item.assignedBy}</p>
                        </div>
                      </div>
                      {item.dueDate && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isOverdue ? 'OVERDUE' : new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Achievement History */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={16} className="text-yellow-500" /> Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Start Assignments", href: "/crm/student-todo", icon: ListTodo, color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100" },
                  { label: "Browse Library", href: "/crm/student-library", icon: BookOpen, color: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-100" },
                  { label: "View Schedule", href: "/crm/student-schedule", icon: Calendar, color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100" },
                  { label: "Fee History", href: "/crm/student-fees", icon: Wallet, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${action.color}`}>
                    <action.icon size={18} /> {action.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 cursor-pointer">
                    <Camera size={18} /> Update ID Card
                    <input type="file" className="hidden" accept="image/*" onChange={handleIdCardUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Next Class Card */}
              {nextClass && (
                <div className="mt-6 p-4 bg-[#0b1d3a] rounded-xl text-white">
                  <p className="text-[10px] font-bold text-sky-300 uppercase tracking-widest mb-2">Next Class</p>
                  <p className="font-bold text-sm">{nextClass.name}</p>
                  <p className="text-xs text-sky-200 mt-1">{nextClass.dayOfWeek} • {nextClass.startTime} - {nextClass.endTime}</p>
                  {nextClass.meetingLink && (
                    <a href={nextClass.meetingLink} target="_blank" rel="noopener noreferrer"
                       className="mt-3 block bg-sky-500 hover:bg-sky-600 text-center py-2 rounded-lg text-xs font-bold transition-all">
                      Join Class →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Achievement History (Item 7) */}
            {profileData && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">🏆 Achievement History</h3>
                {profileData.performanceReports?.filter((r: any) => r.award).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No monthly star awards earned yet. Keep active to earn Gold, Silver, or Bronze Star awards!</p>
                ) : (
                  <div className="space-y-3">
                    {profileData.performanceReports?.filter((r: any) => r.award).map((report: any) => {
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const dateStr = `${months[report.month - 1]} ${report.year}`;
                      return (
                        <div key={report.id} className="flex justify-between items-center bg-amber-50/40 border border-amber-100 p-3 rounded-xl">
                          <span className="text-xs font-bold text-gray-700">{dateStr}</span>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                            report.award === "Gold Star Player" ? "bg-yellow-100 text-yellow-800" :
                            report.award === "Silver Star Player" ? "bg-slate-100 text-slate-800" :
                            "bg-orange-100 text-orange-800"
                          }`}>
                            {report.award === "Gold Star Player" ? "🏅 Gold Star" :
                             report.award === "Silver Star Player" ? "🥈 Silver Star" :
                             "🥉 Bronze Star"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {isIdCardModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setIsIdCardModalOpen(false)}>
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Student ID Card</h3>
              <button onClick={() => setIsIdCardModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 md:p-8 flex items-center justify-center bg-gray-50">
              <img 
                src={(session?.user as any)?.idCardUrl} 
                alt="ID Card" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border-4 border-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Club Unlock Popup (Item 12) */}
      {showClubPopup && newlyUnlockedClub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl relative border-t-8 border-indigo-600 animate-in fade-in zoom-in duration-300">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600 text-sm mb-4">
              You have joined the <span className="font-black text-indigo-600">{newlyUnlockedClub.clubName}</span>!
            </p>
            <p className="text-xs bg-indigo-50 text-indigo-700 px-3.5 py-2 rounded-xl inline-block font-extrabold mb-6">
              🔓 Silver Level Unlocked (Your certificate is ready)
            </p>
            <button 
              onClick={() => handleClaimCertificate(newlyUnlockedClub.id)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-100"
            >
              Claim Certificate
            </button>
          </div>
        </div>
      )}
    </CRMShellLayout>
  )
}

// Simple X icon for modal
const X = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

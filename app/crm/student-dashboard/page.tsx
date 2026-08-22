'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import Link from 'next/link'
import {
  ListTodo, BookOpen, Calendar, Wallet,
  Loader2, Activity, CheckCircle, Clock, PlayCircle, Camera, HelpCircle,
  X, Flame, Award, Users, Download, ArrowUpRight, CheckSquare, Zap, Sync, Swords
} from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'

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

  // Dashboard Toggle state
  const [isParentMode, setIsParentMode] = useState(false)

  // Phase 3 states
  const [profileData, setProfileData] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<any[]>([])
  const [syncingLichess, setSyncingLichess] = useState(false)
  const [lichessInput, setLichessInput] = useState("")
  const [checkingBadges, setCheckingBadges] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    if (!studentId) return
    try {
      const [assignRes, classesRes, profileRes, attRes, challengesRes] = await Promise.all([
        fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' }),
        fetch(`/api/classes?studentId=${studentId}`),
        fetch("/api/user/profile", { cache: 'no-store' }),
        fetch(`/api/attendance?studentId=${studentId}`),
        fetch("/api/challenges/weekly", { cache: 'no-store' })
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
        setLichessInput(profile.lichessUsername || "")
      }

      if (attRes.ok) {
        setAttendanceLogs(await attRes.json())
      }

      if (challengesRes.ok) {
        setWeeklyChallenges(await challengesRes.json())
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchDashboardData()
  }, [studentId, fetchDashboardData])

  // Sync Lichess Ratings
  const handleLichessSync = async () => {
    if (!lichessInput.trim()) {
      toast.error("Please enter a Lichess username")
      return
    }
    setSyncingLichess(true)
    try {
      const res = await fetch("/api/lichess/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lichessUsername: lichessInput })
      })

      if (res.ok) {
        toast.success("Lichess ratings synced successfully!")
        fetchDashboardData()
      } else {
        toast.error("Lichess username not found or API issue")
      }
    } catch (e) {
      toast.error("Network error syncing Lichess")
    } finally {
      setSyncingLichess(false)
    }
  }

  // Trigger Badge Checks
  const handleCheckBadges = async () => {
    setCheckingBadges(true)
    try {
      const res = await fetch("/api/badges/check", { method: "POST" })
      if (res.ok) {
        toast.success("Badges bookshelf updated!")
        fetchDashboardData()
      } else {
        toast.error("Failed to update credentials")
      }
    } catch (err) {
      toast.error("Network error check badges")
    } finally {
      setCheckingBadges(false)
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
        fetchDashboardData()
      } else {
        toast.error("Failed to update profile photo in database")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred during upload")
    }
  }

  // Generate Report PDF via jsPDF client-side
  const downloadReportPdf = (report: any) => {
    const doc = new jsPDF()
    const primaryColor = [11, 29, 58] // Navy
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthName = months[report.month - 1]

    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 45, "F")

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("AIM CHESS ACADEMY", 15, 20)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("ACHIEVE • INSPIRE • MAINTAIN", 15, 28)
    doc.text("MONTHLY PERFORMANCE REPORT", 15, 34)

    // Month
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`${monthName} ${report.year}`, 155, 20)

    // Student Card Info border
    doc.setDrawColor(212, 175, 55) // Gold
    doc.rect(15, 55, 180, 35)

    doc.setFontSize(10)
    doc.setTextColor(33, 37, 41)
    
    doc.setFont("helvetica", "bold")
    doc.text("Student Name:", 20, 63)
    doc.setFont("helvetica", "normal")
    doc.text(profileData?.name || "N/A", 50, 63)

    doc.setFont("helvetica", "bold")
    doc.text("Current Level:", 20, 71)
    doc.setFont("helvetica", "normal")
    doc.text(profileData?.aimLevel || "Starter Level", 50, 71)

    doc.setFont("helvetica", "bold")
    doc.text("AIM Rating:", 20, 79)
    doc.setFont("helvetica", "normal")
    doc.text(String(profileData?.aimRating || 500), 50, 79)

    doc.setFont("helvetica", "bold")
    doc.text("Coach Name:", 110, 63)
    doc.setFont("helvetica", "normal")
    doc.text(profileData?.coach?.name || "Unassigned", 140, 63)

    doc.setFont("helvetica", "bold")
    doc.text("Lichess Rapid:", 110, 71)
    doc.setFont("helvetica", "normal")
    doc.text(String(profileData?.lichessRapid || 1500), 140, 71)

    // Scorecard Section
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("SCORECARD RATINGS", 15, 105)
    doc.line(15, 107, 195, 107)

    doc.setTextColor(33, 37, 41)
    doc.setFontSize(10)

    doc.setFont("helvetica", "bold")
    doc.text("Attendance Rating:", 20, 117)
    doc.setFont("helvetica", "normal")
    doc.text(`${report.attendancePoints || 0} / 40`, 70, 117)

    doc.setFont("helvetica", "bold")
    doc.text("Homework Score:", 20, 125)
    doc.setFont("helvetica", "normal")
    doc.text(`${report.homeworkPoints || 0} / 20`, 70, 125)

    doc.setFont("helvetica", "bold")
    doc.text("Assignment Score:", 110, 117)
    doc.setFont("helvetica", "normal")
    doc.text(`${report.assignmentPoints || 0} / 20`, 160, 117)

    doc.setFont("helvetica", "bold")
    doc.text("Tournament Score:", 110, 125)
    doc.setFont("helvetica", "normal")
    doc.text(`${report.tournamentPoints || 0} / 20`, 160, 125)

    // Total Rating points
    doc.setFillColor(240, 244, 248)
    doc.rect(15, 133, 180, 12, "F")
    doc.setFont("helvetica", "bold")
    doc.text(`Total Score: ${report.totalPoints || 0} / 100`, 20, 141)
    doc.text(`Award: ${report.award || 'Participant'}`, 110, 141)

    // Written Assessment
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("COACH WRITTEN ASSESSMENT", 15, 160)
    doc.line(15, 162, 195, 162)

    doc.setTextColor(33, 37, 41)
    doc.setFontSize(9)

    const writeBlock = (title: string, textContent: string, yPos: number) => {
      doc.setFont("helvetica", "bold")
      doc.text(title + ":", 15, yPos)
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(textContent || "No assessment written.", 185)
      doc.text(lines, 15, yPos + 5)
      return yPos + 7 + (lines.length * 4.5)
    }

    let nextY = 168
    nextY = writeBlock("Student Progress", report.studentProgress, nextY)
    nextY = writeBlock("Key Strengths", report.strengths, nextY)
    nextY = writeBlock("Weaknesses / Areas of Improvement", report.weaknesses, nextY)
    nextY = writeBlock("Attitude & Behavior", report.behavior, nextY)
    nextY = writeBlock("Next Month Focus Areas", report.nextMonthFocus, nextY)
    nextY = writeBlock("Coach Recommendations", report.recommendation, nextY)

    // Signatures
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Soumen Banerjee", 150, 275)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("Founder & Head Coach", 150, 279)
    doc.text("AIM Chess Academy", 150, 283)

    doc.save(`AIM_Chess_Report_${monthName}_${report.year}.pdf`)
    toast.success("Monthly report PDF downloaded!")
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

  // Calculated package metrics
  const totalClassesAttended = attendanceLogs.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
  const packageTotal = 12
  const packageProgressPct = Math.round((totalClassesAttended % packageTotal / packageTotal) * 100)
  const remainingInPackage = packageTotal - (totalClassesAttended % packageTotal)

  const badges = profileData?.badges || []

  return (
    <CRMShellLayout>
      <div className="space-y-6">
        
        {/* Portal Header Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-sky-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Workspace:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${isParentMode ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'}`}>
              {isParentMode ? 'Parent Portal' : 'Student Portal'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border">
            <button 
              onClick={() => setIsParentMode(false)}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${!isParentMode ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Student Mode
            </button>
            <button 
              onClick={() => setIsParentMode(true)}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${isParentMode ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Parent Portal
            </button>
          </div>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#0b1d3a] to-[#1a3a6a] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                {(session?.user as any)?.photoUrl ? (
                  <img src={(session?.user as any).photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-4xl font-black text-sky-300">
                    {session?.user?.name ? (session?.user as any).name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "S"}
                  </span>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center justify-center cursor-pointer shadow-lg border-2 border-[#0b1d3a] transition-all hover:scale-110">
                <Camera size={16} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                {isParentMode ? `Parent Portal for ${session?.user?.name}` : `Welcome back, ${session?.user?.name}! 🧠♟️`}
              </h1>
              <p className="text-sky-200 text-sm">
                {isParentMode ? 'Track class session summaries, downloads, attendance, and feedback logs.' : 'Keep training and climbing the club leaderboards!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            {profileData?.currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-md rounded-xl border border-amber-500/30 px-3.5 py-2 text-center text-amber-300 animate-pulse">
                <Flame size={20} className="fill-amber-500" />
                <div className="text-left">
                  <p className="text-[8px] uppercase font-bold text-amber-400">Streak</p>
                  <p className="text-xs font-black">{profileData.currentStreak} Days</p>
                </div>
              </div>
            )}
            <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Level</p>
              <p className="text-xl font-black">{(session?.user as any)?.stage || 'BEGINNER'}</p>
            </div>
          </div>
        </div>

        {/* -------------------- PARENT PORTAL VIEW -------------------- */}
        {isParentMode && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Monthly Reports list & Package Progress */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Monthly Reports Card list */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                    <Award className="text-yellow-500" size={16} /> Monthly Coach Progress Reviews
                  </h3>

                  {profileData?.performanceReports?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 italic text-center">No monthly progress evaluations submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {profileData?.performanceReports?.map((report: any) => {
                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        const period = `${months[report.month - 1]} ${report.year}`
                        return (
                          <div key={report.id} className="p-4 rounded-xl border border-sky-50 bg-sky-50/10 hover:bg-sky-50/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{period} Assessment</p>
                              <div className="flex flex-wrap gap-2.5 mt-2">
                                <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold">Score: {report.totalPoints}/100</span>
                                <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{report.award}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                              <button 
                                onClick={() => downloadReportPdf(report)}
                                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
                              >
                                <Download size={14} /> Download PDF
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Package Progress Indicator */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                    <Clock className="text-sky-500" size={16} /> Class Package Usage Progress
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>Current Package (12 Classes)</span>
                      <span>{totalClassesAttended % 12} / 12 Sessions Used</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border">
                      <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: `${packageProgressPct}%` }}></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{packageProgressPct}% Exhausted</span>
                      <span className="text-emerald-600 font-extrabold">{remainingInPackage} classes remaining before renewal</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Attendance history table (topics, recordings, homework) */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="text-emerald-500" size={16} /> Detailed Session Attendance History
                  </h3>
                  
                  <div className="border border-sky-100 rounded-xl overflow-x-auto">
                    <table className="w-full text-left min-w-[650px] text-xs">
                      <thead className="bg-sky-50/50 border-b border-sky-100">
                        <tr>
                          <th className="p-4 font-bold text-slate-500">Date</th>
                          <th className="p-4 font-bold text-slate-500">Status</th>
                          <th className="p-4 font-bold text-slate-500">Topic Covered</th>
                          <th className="p-4 font-bold text-slate-500">Homework Assigned</th>
                          <th className="p-4 font-bold text-slate-500">Zoom Recording</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {attendanceLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-sky-50/10">
                            <td className="p-4 font-semibold text-slate-700">{new Date(log.date).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                log.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                log.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>{log.status}</span>
                            </td>
                            <td className="p-4 font-medium text-slate-600">{log.topicCovered || <span className="text-slate-300 italic">No topic logged</span>}</td>
                            <td className="p-4 font-medium text-slate-600">{log.homeworkGiven || <span className="text-slate-300 italic">None</span>}</td>
                            <td className="p-4">
                              {log.zoomRecordingLink ? (
                                <a href={log.zoomRecordingLink} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-700 font-bold underline">
                                  Watch Recording →
                                </a>
                              ) : (
                                <span className="text-slate-300 italic">Not Uploaded</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {attendanceLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-10 text-center font-bold text-slate-300 italic">No attendance records logs.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Lichess Synced Ratings & Badge Shelf */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Lichess Rating Tracker Card */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <Activity className="text-indigo-500" size={16} /> Synced Lichess Profile
                  </h3>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Lichess username..."
                      value={lichessInput}
                      onChange={e => setLichessInput(e.target.value)}
                      className="flex-1 p-2 border border-sky-100 rounded-xl text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-indigo-300 font-medium text-slate-700"
                    />
                    <button 
                      onClick={handleLichessSync}
                      disabled={syncingLichess}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 shrink-0"
                    >
                      {syncingLichess ? <Loader2 size={12} className="animate-spin" /> : "Sync"}
                    </button>
                  </div>

                  {profileData?.lichessUsername ? (
                    <div className="space-y-3 pt-2">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">Lichess ELO Rapid</span>
                        <span className="font-black text-slate-800">{profileData.lichessRapid} ELO</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">Lichess ELO Blitz</span>
                        <span className="font-black text-slate-800">{profileData.lichessBlitz} ELO</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">Lichess ELO Puzzles</span>
                        <span className="font-black text-slate-800">{profileData.lichessPuzzle} ELO</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No Lichess profile linked. Enter name above to track ratings.</p>
                  )}
                </div>

                {/* Badge Cabinet Display */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Award className="text-sky-500" size={16} /> Achievement Badges ({badges.length})
                    </h3>
                    <button 
                      onClick={handleCheckBadges}
                      disabled={checkingBadges}
                      className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                      {checkingBadges ? <Loader2 size={10} className="animate-spin" /> : "Refresh"}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {badges.map((b: any) => (
                      <div key={b.id} className="group relative flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-50/20 border border-sky-100 hover:shadow transition-all text-center">
                        <span className="text-2xl">
                          {b.badgeType === "HOMEWORK_HERO" && "📚"}
                          {b.badgeType === "PUZZLE_MASTER" && "🧩"}
                          {b.badgeType === "TOURNAMENT_WARRIOR" && "🏆"}
                          {b.badgeType === "ATTENDANCE_100" && "🗓️"}
                          {b.badgeType === "GOLD_STAR" && "⭐"}
                          {b.badgeType === "CLUB_MEMBER" && "♟️"}
                          {b.badgeType === "WINNING_STREAK" && "🔥"}
                          {b.badgeType === "ASSIGNMENT_CHAMPION" && "🎓"}
                        </span>
                        <span className="text-[8px] font-extrabold text-slate-600 mt-1.5 truncate max-w-full">
                          {b.badgeType.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                    {badges.length === 0 && (
                      <p className="col-span-full text-xs text-slate-400 italic text-center py-4">No achievement badges unlocked yet.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* -------------------- STUDENT DASHBOARD VIEW -------------------- */}
        {!isParentMode && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Student Chess Passport Widget */}
            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-[#0b1d3a] uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2">
                <Users className="text-indigo-500" size={16} /> Student Chess Passport
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Photo ID Layout Block */}
                <div className="md:col-span-4 bg-gradient-to-br from-[#0b1d3a] to-[#1e3c72] rounded-3xl p-5 text-white shadow-lg border border-indigo-400/20 relative overflow-hidden max-w-xs mx-auto w-full">
                  <div className="absolute top-[-10%] right-[-10%] w-36 h-36 bg-sky-500/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-sky-400 tracking-wider">AIM Academy</p>
                      <p className="text-[8px] font-medium text-sky-200">Chess Passport</p>
                    </div>
                    <span className="text-2xl">♟️</span>
                  </div>

                  <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden shrink-0">
                      {profileData?.photoUrl ? (
                        <img src={profileData.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-white">{profileData?.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white truncate max-w-[130px]">{profileData?.name}</p>
                      <p className="text-[8px] font-medium text-sky-200/80">ID: #{profileData?.id?.substring(0, 8).toUpperCase()}</p>
                      <p className="text-[8px] font-black text-yellow-400 uppercase tracking-widest mt-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-full inline-block">
                        {profileData?.aimClub || "Beginner"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-[9px] font-bold text-sky-100/90">
                    <div>
                      <span className="text-sky-300 block text-[7px] uppercase font-bold">Coach</span>
                      <span className="truncate block max-w-full">{profileData?.coach?.name || "Unassigned"}</span>
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[7px] uppercase font-bold">Country</span>
                      <span>India 🇮🇳</span>
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[7px] uppercase font-bold">AIM Rating</span>
                      <span className="text-yellow-400 font-extrabold">{profileData?.aimRating || 500} ELO</span>
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[7px] uppercase font-bold">Active Streak</span>
                      <span className="text-amber-400 font-extrabold">🔥 {profileData?.currentStreak || 0} Days</span>
                    </div>
                  </div>
                </div>

                {/* Ratings & Achievements Cabinet */}
                <div className="md:col-span-8 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">AIM Rating</span>
                      <span className="text-lg font-black text-[#0b1d3a]">{profileData?.aimRating || 500} ELO</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Lichess Rapid</span>
                      <span className="text-lg font-black text-[#0b1d3a]">{profileData?.lichessRapid || 1500} ELO</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Active Badges</span>
                      <span className="text-lg font-black text-[#0b1d3a]">{badges.length} Unlocked</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Best Streak</span>
                      <span className="text-lg font-black text-amber-600">🔥 {profileData?.bestStreak || 0} Days</span>
                    </div>
                  </div>

                  {/* Badge Shelf Cabinet */}
                  <div className="border border-sky-50 bg-sky-50/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Badge shelf cabinet</p>
                      <button 
                        onClick={handleCheckBadges}
                        disabled={checkingBadges}
                        className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline active:scale-95"
                      >
                        Check for new Badges
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {badges.map((b: any) => (
                        <span key={b.id} className="px-3 py-1 bg-white border border-sky-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1.5 shadow-sm">
                          {b.badgeType === "HOMEWORK_HERO" && "📚"}
                          {b.badgeType === "PUZZLE_MASTER" && "🧩"}
                          {b.badgeType === "TOURNAMENT_WARRIOR" && "🏆"}
                          {b.badgeType === "ATTENDANCE_100" && "🗓️"}
                          {b.badgeType === "GOLD_STAR" && "⭐"}
                          {b.badgeType === "CLUB_MEMBER" && "♟️"}
                          {b.badgeType === "WINNING_STREAK" && "🔥"}
                          {b.badgeType === "ASSIGNMENT_CHAMPION" && "🎓"}
                          {b.badgeType.replace("_", " ")}
                        </span>
                      ))}
                      {badges.length === 0 && (
                        <p className="text-xs text-slate-400 font-medium italic">No credentials loaded in cabinet. Solve assignments and win games to unlock credentials!</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Weekly Challenges missions Widget */}
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-[#0b1d3a] uppercase tracking-wider mb-5 flex items-center gap-2 border-b pb-2">
                <Zap className="text-indigo-500 fill-indigo-500" size={16} /> Weekly Mission Challenges
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {weeklyChallenges.map((challenge: any) => {
                  const current = challenge.progress?.currentCount || 0
                  const target = challenge.progress?.targetCount || challenge.targetCount
                  const pct = Math.min(100, Math.round((current / target) * 100))
                  const done = challenge.progress?.isCompleted
                  return (
                    <div key={challenge.id} className="p-4 rounded-xl border border-sky-50 bg-sky-50/10 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-800 text-xs">{challenge.title}</p>
                          {done && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase">Complete</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4">{challenge.description}</p>
                      </div>

                      <div className="mt-auto space-y-1.5">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                          <div className={`h-full transition-all duration-300 ${done ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>{pct}% Complete</span>
                          <span>{current} / {target}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {weeklyChallenges.length === 0 && (
                  <p className="col-span-full text-xs text-slate-400 italic py-4 text-center">Loading active weekly missions...</p>
                )}
              </div>
            </div>

            {/* Assignments & Quick Actions grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Upcoming Assignments */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ListTodo size={16} className="text-orange-500" /> Pending Homework Assignments
                  </h3>
                  <Link href="/crm/student-todo" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                    View Todo List →
                  </Link>
                </div>
                {recentAssignments.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-300" />
                    All homework completed! Take a bot practice game in the Play zone.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAssignments.map((item: any) => {
                      const isOverdue = item.dueDate && new Date() > new Date(item.dueDate)
                      return (
                        <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isOverdue ? 'border-red-100 bg-red-50/50' : 'border-gray-100 hover:bg-sky-50/30'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-sky-100 text-indigo-600'}`}>
                              {item.mcqId ? <HelpCircle size={18} /> : <PlayCircle size={18} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{item.mcqId ? item.mcq.question : item.puzzle?.title}</p>
                              <p className="text-[9px] text-gray-400 font-medium">Assigned by Coach {item.assignedBy}</p>
                            </div>
                          </div>
                          {item.dueDate && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isOverdue ? 'OVERDUE' : new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick Actions & Achievements shelf */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                    <Activity size={16} className="text-yellow-500" /> Trainee Quick Actions
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Start Training", href: "/crm/student-todo", icon: ListTodo, color: "bg-orange-50/50 text-orange-700 hover:bg-orange-100/50 border-orange-100/50" },
                      { label: "Study syllabus PGNs", href: "/crm/student-library", icon: BookOpen, color: "bg-sky-50/50 text-sky-700 hover:bg-sky-100/50 border-sky-100/50" },
                      { label: "Challenge teammate / bots", href: "/crm/play", icon: Swords, color: "bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50 border-indigo-100/50" },
                      { label: "Schedule & timings", href: "/crm/student-schedule", icon: Calendar, color: "bg-purple-50/50 text-purple-700 hover:bg-purple-100/50 border-purple-100/50" }
                    ].map((action) => (
                      <Link key={action.label} href={action.href}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all border ${action.color}`}>
                        <action.icon size={16} /> {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </CRMShellLayout>
  )
}

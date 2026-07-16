'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import Link from 'next/link'
import {
  Users, BookOpen, ClipboardCheck, MousePointer2,
  Loader2, Activity, ArrowUpRight, Trophy, AlertTriangle, CheckSquare, Sparkles
} from 'lucide-react'

export default function CoachDashboardPage() {
  const { data: session } = useSession()
  const coachId = (session?.user as any)?.id || ''

  const [loading, setLoading] = useState(true)
  const [studentCount, setStudentCount] = useState(0)
  const [classCount, setClassCount] = useState(0)
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)

  useEffect(() => {
    if (!coachId) return
    const fetchData = async () => {
      try {
        const [usersRes, classesRes, metricsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch(`/api/classes?coachId=${coachId}`),
          fetch('/api/coach/dashboard')
        ])

        if (usersRes.ok) {
          const users = await usersRes.json()
          if (Array.isArray(users)) {
            setStudentCount(users.filter((u: any) => u.role === 'STUDENT' && u.coachId === coachId).length)
          }
        }
        if (classesRes.ok) {
          const classes = await classesRes.json()
          setClassCount(Array.isArray(classes) ? classes.length : 0)
        }
        if (metricsRes.ok) {
          setDashboardMetrics(await metricsRes.json())
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [coachId])

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
        {/* Welcome */}
        <div className="bg-gradient-to-r from-[#0b1d3a] to-[#1a3a6a] rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {session?.user?.name}! 👋</h1>
            <p className="text-sky-200 text-sm">Here's your coaching overview for today.</p>
          </div>
          {dashboardMetrics?.highestGain && (
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <span className="text-[10px] text-sky-300 uppercase font-black tracking-wider block">🏆 Top Gain This Month</span>
              <p className="text-sm font-bold text-white mt-1">{dashboardMetrics.highestGain.name}</p>
              <p className="text-xs text-emerald-400 font-extrabold">+{dashboardMetrics.highestGain.gain} pts</p>
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Users className="text-white" size={20} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-sky-700 bg-sky-50">
                <ArrowUpRight size={12} /> Active
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{studentCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">My Students</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ClipboardCheck className="text-white" size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{classCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">My Batches</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BookOpen className="text-white" size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {dashboardMetrics ? (dashboardMetrics.goldEligible?.length + dashboardMetrics.silverEligible?.length + dashboardMetrics.bronzeEligible?.length) : 0}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Students Eligible for Star Awards</p>
          </div>
        </div>

        {/* Coach Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Star Eligible Lists */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> Star Awards Eligibility
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-black text-yellow-600 uppercase block mb-1">🏅 Gold Star Player (>= 90 pts)</span>
                {dashboardMetrics?.goldEligible?.length === 0 ? (
                  <span className="text-xs text-gray-400">None</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dashboardMetrics?.goldEligible?.map((s: any) => (
                      <span key={s.id} className="bg-yellow-50 text-yellow-800 border border-yellow-100 text-xs px-2 py-1 rounded-lg font-bold">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs font-black text-slate-500 uppercase block mb-1">🥈 Silver Star Player (>= 80 pts)</span>
                {dashboardMetrics?.silverEligible?.length === 0 ? (
                  <span className="text-xs text-gray-400">None</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dashboardMetrics?.silverEligible?.map((s: any) => (
                      <span key={s.id} className="bg-slate-50 text-slate-800 border border-slate-100 text-xs px-2 py-1 rounded-lg font-bold">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs font-black text-orange-600 block mb-1">🥉 Bronze Star Player (>= 70 pts)</span>
                {dashboardMetrics?.bronzeEligible?.length === 0 ? (
                  <span className="text-xs text-gray-400">None</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dashboardMetrics?.bronzeEligible?.map((s: any) => (
                      <span key={s.id} className="bg-orange-50 text-orange-800 border border-orange-100 text-xs px-2 py-1 rounded-lg font-bold">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating Club Certificate & Low Attendance warnings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" /> Rating Club Certificates
            </h3>
            {dashboardMetrics?.certEligible?.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No pending certificates to issue.</p>
            ) : (
              <div className="space-y-2">
                {dashboardMetrics?.certEligible?.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-xs font-bold text-gray-800">{c.name}</span>
                    <span className="text-xs text-indigo-700 font-extrabold uppercase bg-white border px-2 py-0.5 rounded">{c.clubs.join(", ")}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2 border-t pt-4">
              <AlertTriangle size={16} /> Students with Low Attendance
            </h3>
            {dashboardMetrics?.lowAttendance?.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">All students have good attendance records.</p>
            ) : (
              <div className="space-y-2">
                {dashboardMetrics?.lowAttendance?.map((l: any) => (
                  <div key={l.name} className="flex justify-between items-center bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                    <span className="text-xs font-bold text-red-950">{l.name}</span>
                    <span className="text-xs text-red-700 font-extrabold bg-white border px-2 py-0.5 rounded">{l.rate}% Attendance</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Tasks Lists */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare size={16} className="text-orange-500" /> Homework Pending
            </h3>
            {dashboardMetrics?.homeworkPending?.length === 0 ? (
              <p className="text-xs text-gray-400">No pending homework assignments.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dashboardMetrics?.homeworkPending?.map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-800">{h.studentName}</span>
                    <span className="text-gray-500 max-w-[200px] truncate">{h.task}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare size={16} className="text-sky-500" /> Assignment Pending
            </h3>
            {dashboardMetrics?.assignmentPending?.length === 0 ? (
              <p className="text-xs text-gray-400">No pending puzzle assignments.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dashboardMetrics?.assignmentPending?.map((a: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-800">{a.studentName}</span>
                    <span className="text-gray-500 max-w-[200px] truncate">{a.task}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={16} className="text-yellow-500" /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "View My Students", href: "/crm/coach-students", icon: Users, color: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-100" },
              { label: "Mark Attendance", href: "/crm/coach-attendance", icon: ClipboardCheck, color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100" },
              { label: "Open Library", href: "/crm/coach-library", icon: BookOpen, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100" },
              { label: "Analysis Board", href: "/crm/coach-analysis", icon: MousePointer2, color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100" },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold transition-all border ${action.color}`}>
                <action.icon size={18} /> {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CRMShellLayout>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import Link from 'next/link'
import {
  Users, BookOpen, ClipboardCheck, MousePointer2,
  Loader2, Activity, ArrowUpRight, Trophy, Target, Clock
} from 'lucide-react'

export default function CoachDashboardPage() {
  const { data: session } = useSession()
  const coachId = (session?.user as any)?.id || ''

  const [loading, setLoading] = useState(true)
  const [studentCount, setStudentCount] = useState(0)
  const [classCount, setClassCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (!coachId) return
    const fetchData = async () => {
      try {
        const [usersRes, classesRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch(`/api/classes?coachId=${coachId}`)
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
        <div className="bg-gradient-to-r from-[#0b1d3a] to-[#1a3a6a] rounded-2xl p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {session?.user?.name}! 👋</h1>
          <p className="text-sky-200 text-sm">Here's your coaching overview for today.</p>
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
            <div className="text-2xl font-black text-gray-900">—</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Courses Available</p>
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

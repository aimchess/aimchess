'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import Link from 'next/link'
import {
  ListTodo, BookOpen, Calendar, Wallet,
  Loader2, Activity, ArrowUpRight, CheckCircle, Clock, PlayCircle
} from 'lucide-react'

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  const studentId = (session?.user as any)?.id || ''

  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [classCount, setClassCount] = useState(0)
  const [nextClass, setNextClass] = useState<any>(null)
  const [recentAssignments, setRecentAssignments] = useState<any[]>([])

  useEffect(() => {
    if (!studentId) return
    const fetchData = async () => {
      try {
        const [assignRes, classesRes] = await Promise.all([
          fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' }),
          fetch(`/api/classes?studentId=${studentId}`)
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
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [studentId])

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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Let's train, {session?.user?.name}! 🧠♟️</h1>
          <p className="text-sky-200 text-sm">Keep up the great work. Here's your learning overview.</p>
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
            <p className="text-xs text-gray-500 font-medium mt-1">Puzzles Completed</p>
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
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-sky-100'}`}>
                          <PlayCircle size={18} className={isOverdue ? 'text-red-500' : 'text-sky-600'} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.puzzle?.title}</p>
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
        </div>
      </div>
    </CRMShellLayout>
  )
}

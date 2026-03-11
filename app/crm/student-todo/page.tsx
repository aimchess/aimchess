'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  Clock, PlayCircle, CheckCircle, RefreshCcw, Volume2, HelpCircle
} from 'lucide-react'

export default function StudentTodoPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [assignments, setAssignments] = useState<any[]>([])

  const fetchAssignments = useCallback(async () => {
    if (!session?.user) return
    try {
      setIsRefreshing(true)
      const studentId = (session.user as any).id
      const res = await fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' })
      if (res.ok) setAssignments(await res.json())
    } catch (error) { console.error(error) }
    finally { setIsRefreshing(false); setLoading(false) }
  }, [session])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  const pending = assignments.filter(a => !a.isCompleted)

  const launchPuzzle = (puzzleId: string, nextPuzzleId?: string, dueDate?: string) => {
    if (dueDate && new Date() > new Date(dueDate)) {
      alert("This assignment's deadline has passed.")
      return
    }
    const params = new URLSearchParams()
    if (nextPuzzleId) params.set('next', nextPuzzleId)
    params.set('context', 'todo')
    router.push(`/puzzle/${puzzleId}?${params.toString()}`)
  }

  const launchMCQ = (mcqId: string, nextMcqId?: string, dueDate?: string) => {
    if (dueDate && new Date() > new Date(dueDate)) {
      alert("This assignment's deadline has passed.")
      return
    }
    const params = new URLSearchParams()
    if (nextMcqId) params.set('next', nextMcqId)
    params.set('context', 'todo')
    router.push(`/crm/student-mcq/${mcqId}?${params.toString()}`)
  }

  if (loading) return <CRMShellLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div></div></CRMShellLayout>

  return (
    <CRMShellLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0b1d3a]">My Assignments</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Complete your assigned puzzles before the deadline.</p>
        </div>
        <button onClick={fetchAssignments} className="text-slate-400 hover:text-sky-500 transition p-2 bg-white rounded-full shadow-sm border border-sky-100">
          <RefreshCcw size={20} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pending.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-sky-100 text-center">
            <CheckCircle className="w-12 h-12 text-green-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
            <p className="text-slate-500">Check the Library to practice more.</p>
          </div>
        )}
        {pending.map((item, index) => {
          const nextAssignment = pending[index + 1]
          const nextId = nextAssignment ? (nextAssignment.puzzle?.id || nextAssignment.mcq?.id) : undefined
          const isOverdue = item.dueDate && new Date() > new Date(item.dueDate)
          const isMCQ = !!item.mcqId

          return (
            <div
              key={item.id}
              onClick={() => isMCQ ? launchMCQ(item.mcq.id, nextId, item.dueDate) : launchPuzzle(item.puzzle.id, nextId, item.dueDate)}
              className={`group bg-white rounded-2xl p-6 border shadow-sm transition cursor-pointer relative overflow-hidden ${isOverdue ? 'opacity-75 border-red-200' : isMCQ ? 'hover:shadow-lg hover:border-emerald-300 border-emerald-100' : 'hover:shadow-lg hover:border-sky-300 border-sky-100'}`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${isOverdue ? 'bg-red-500' : isMCQ ? 'bg-emerald-500 group-hover:w-3' : 'bg-sky-500 group-hover:w-3'}`} />
              <div className="flex justify-between mb-4 pl-3">
                <div className={`${isOverdue ? 'bg-red-50 text-red-600' : isMCQ ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'} p-3 rounded-full`}>{isMCQ ? <HelpCircle size={24} /> : <PlayCircle size={24} />}</div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-sky-50 text-sky-500'}`}>
                    {isOverdue ? 'DEADLINE PASSED' : 'ASSIGNED'}
                  </span>
                  {item.dueDate && (
                    <span className={`text-[10px] flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                      <Clock size={10} /> {new Date(item.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="pl-3">
                <h3 className={`text-xl font-bold ${isOverdue ? 'text-slate-500' : 'text-[#0b1d3a]'}`}>{isMCQ ? item.mcq.question : item.puzzle.title}</h3>
                <div className="text-sm text-slate-500 mt-1">By Coach {item.assignedBy}</div>

                {item.audioUrl && (
                  <div className="mt-4 flex items-center gap-2 bg-sky-50 p-2 rounded-lg" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const audio = new Audio(item.audioUrl)
                        audio.play()
                      }}
                      className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                    <span className="text-xs font-bold text-sky-700">Voice Instructions</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </CRMShellLayout>
  )
}

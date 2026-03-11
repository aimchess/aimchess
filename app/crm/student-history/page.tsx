'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import { CheckCircle } from 'lucide-react'

export default function StudentHistoryPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<any[]>([])

  const fetchAssignments = useCallback(async () => {
    if (!session?.user) return
    try {
      const studentId = (session.user as any).id
      const res = await fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' })
      if (res.ok) setAssignments(await res.json())
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [session])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  const completed = assignments.filter(a => a.isCompleted)

  if (loading) return <CRMShellLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div></div></CRMShellLayout>

  return (
    <CRMShellLayout>
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#0b1d3a]">Completed Assignments</h2>
        <p className="text-slate-400 text-sm font-medium mt-1">Your solved puzzles and completed homework.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {completed.length === 0 && <p className="col-span-full text-center text-slate-400 py-20 bg-white rounded-2xl border-2 border-dashed border-sky-100">No completed tasks yet.</p>}
        {completed.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-5 border border-sky-100 opacity-80 hover:opacity-100 transition">
            <div className="flex justify-between items-center mb-3">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-xs font-bold text-slate-400">{new Date(item.assignedAt).toLocaleDateString()}</span>
            </div>
            <h3 className="font-bold text-slate-700 line-through decoration-slate-300">{item.mcqId ? item.mcq.question : item.puzzle.title}</h3>
          </div>
        ))}
      </div>
    </CRMShellLayout>
  )
}

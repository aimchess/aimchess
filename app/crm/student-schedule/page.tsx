'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  Calendar, CheckCircle, Clock, Video
} from 'lucide-react'

export default function StudentSchedulePage() {
  const { data: session } = useSession()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSchedule = useCallback(async () => {
    if (!session?.user) return
    try {
      const studentId = (session.user as any).id
      const res = await fetch(`/api/classes?studentId=${studentId}`)
      if (res.ok) setClasses(await res.json())
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [session])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  if (loading) return <CRMShellLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div></div></CRMShellLayout>

  return (
    <CRMShellLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-sky-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-purple-50 rounded-2xl"><Calendar className="text-purple-600" size={32} /></div>
            <div>
              <h2 className="text-2xl font-bold text-[#0b1d3a]">My Class Schedule</h2>
              <p className="text-slate-500 font-medium text-sm">View your enrolled batches and join online classes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(c => (
              <div key={c.id} className="bg-sky-50/30 rounded-2xl p-6 border-2 border-transparent hover:border-sky-200 hover:bg-white hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-[#0b1d3a] mb-1">{c.name}</h3>
                    <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-widest">
                      <Calendar size={14} /> {c.dayOfWeek}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-600 font-medium">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Clock size={16} className="text-slate-400" />
                    </div>
                    <span>{c.startTime} - {c.endTime}</span>
                  </div>
                  {c.coach && (
                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                      <span>Coach: <span className="font-bold text-[#0b1d3a]">{c.coach.name}</span></span>
                    </div>
                  )}
                </div>

                {c.meetingLink ? (
                  <a
                    href={c.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#0b1d3a] hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 group-hover:shadow-sky-100"
                  >
                    <Video size={20} /> Join Online Class
                  </a>
                ) : (
                  <div className="w-full bg-slate-200 text-slate-400 font-bold py-4 rounded-2xl text-center text-sm uppercase tracking-widest cursor-not-allowed">
                    No Link Provided
                  </div>
                )}
              </div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="text-sky-200" size={40} />
                </div>
                <p className="text-slate-400 font-bold text-lg italic">You are not enrolled in any classes yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRMShellLayout>
  )
}

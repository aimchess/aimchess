'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import AudioRecorder from '@/components/AudioRecorder'
import {
  Users, Folder, FileText, ChevronRight,
  CheckCircle, XCircle, Clock, RotateCcw, Plus,
  Loader2, AlertCircle, Activity, BookOpen, Layers, Trophy, Target, X, HelpCircle
} from 'lucide-react'

/* ---- Modal ---- */
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-2 md:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 md:p-6 border-b shrink-0 bg-gray-50/50">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

/* ---- Homework Browser ---- */
function HomeworkBrowser({ onAssign }: { onAssign: (id: string, type: 'PUZZLE' | 'FOLDER' | 'MCQ', dueDate?: string, audioUrl?: string | null) => void }) {
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
  const [content, setContent] = useState<{ folders: any[], puzzles: any[], mcqs: any[] }>({ folders: [], puzzles: [], mcqs: [] })
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!currentStage) return
    setLoading(true)
    const parent = breadcrumbs[breadcrumbs.length - 1]
    const url = parent ? `/api/content?parentId=${parent.id}` : `/api/content?stage=${currentStage}`
    fetch(url).then(r => r.json()).then(data => setContent({ folders: data.folders || [], puzzles: data.puzzles || [], mcqs: data.mcqs || [] })).catch(console.error).finally(() => setLoading(false))
  }, [currentStage, breadcrumbs])

  if (!currentStage) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
        {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map(stage => (
          <button key={stage} onClick={() => setCurrentStage(stage)} className="h-32 border-2 border-sky-100 rounded-2xl bg-sky-50/50 hover:bg-sky-100 hover:border-sky-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-3">
            <Layers size={32} className="text-sky-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">{stage}</span>
          </button>
        ))}
      </div>
    )
  }

  const currentFolderId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-black">Levels</button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full whitespace-nowrap">{currentStage}</span>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.id}>
              <ChevronRight size={14} className="text-slate-300" />
              <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="text-xs font-bold uppercase tracking-tight text-slate-800 whitespace-nowrap">{b.name}</button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col gap-4 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 grow w-full">
              <Clock size={18} className="text-sky-500 shrink-0" />
              <input type="datetime-local" className="text-xs font-bold border-2 border-white bg-white rounded-xl px-4 py-2.5 focus:ring-2 ring-sky-100 outline-none flex-1 shadow-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            {currentFolderId && !loading && (
              <button onClick={() => onAssign(currentFolderId, 'FOLDER', dueDate, audioUrl)} className="w-full sm:w-auto bg-[#0b1d3a] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-[#132d56] transition-all active:scale-95 shadow-lg">
                Assign Folder
              </button>
            )}
          </div>
          <AudioRecorder onRecordingComplete={setAudioUrl} />
        </div>
      </div>

      {loading ? <div className="text-center py-20"><Loader2 className="animate-spin text-sky-500 inline" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto p-1">
          {content.folders.map(f => (
            <div key={f.id} className="relative group bg-blue-50/50 border-2 border-blue-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-200 transition-all h-32 active:scale-95">
              <div className="flex flex-col items-center justify-center p-4 text-center" onClick={() => setBreadcrumbs([...breadcrumbs, f])}>
                <Folder className="text-blue-400 mb-2" size={32} />
                <span className="text-xs font-bold text-blue-900 line-clamp-2">{f.name}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onAssign(f.id, 'FOLDER', dueDate, audioUrl) }} className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Plus size={16} />
              </button>
            </div>
          ))}
          {content.puzzles.map(p => (
            <div key={p.id} className="p-4 bg-white border-2 border-slate-50 rounded-2xl flex flex-col items-center justify-center relative group hover:border-sky-200 transition-all shadow-sm h-32 active:scale-95">
              <FileText className="text-sky-400 mb-2" size={28} />
              <span className="text-xs font-bold text-center text-slate-700 line-clamp-2">{p.title}</span>
              <button onClick={() => onAssign(p.id, 'PUZZLE', dueDate, audioUrl)} className="absolute inset-0 bg-[#0b1d3a]/90 text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all">
                Assign Now
              </button>
            </div>
          ))}
          {content.mcqs.map(m => (
            <div key={m.id} className="p-4 bg-white border-2 border-slate-50 rounded-2xl flex flex-col items-center justify-center relative group hover:border-emerald-200 transition-all shadow-sm h-32 active:scale-95">
              <HelpCircle className="text-emerald-400 mb-2" size={28} />
              <span className="text-xs font-bold text-center text-slate-700 line-clamp-2">{m.question}</span>
              <button onClick={() => onAssign(m.id, 'MCQ', dueDate, audioUrl)} className="absolute inset-0 bg-[#0b1d3a]/90 text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all">
                Assign Now
              </button>
            </div>
          ))}
          {content.folders.length === 0 && content.puzzles.length === 0 && content.mcqs.length === 0 && <div className="col-span-full py-10 text-center text-slate-300 font-bold uppercase text-xs">Folder is empty</div>}
        </div>
      )}
    </div>
  )
}

/* ---- Main Page ---- */
export default function CoachStudentsPage() {
  const { data: session } = useSession()
  const coachId = (session?.user as any)?.id || ''

  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [stats, setStats] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  useEffect(() => {
    if (!coachId) return
    const loadStudents = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            const myStudents = data.filter((u: any) => u.role === 'STUDENT' && u.coachId === coachId)
            setStudents(myStudents)
          }
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    loadStudents()
  }, [coachId])

  useEffect(() => {
    if (!selectedStudent) return
    setLoadingStats(true)
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/progress?studentId=${selectedStudent.id}`)
        if (res.ok) {
          const data = await res.json()
          setStats(Array.isArray(data) ? data : [])
        } else { setStats([]) }
      } catch (e) { setStats([]) }
      finally { setLoadingStats(false) }
    }
    loadStats()
  }, [selectedStudent])

  const totalSolved = stats.filter(s => s.isSolved).length
  const successRate = stats.length > 0 ? Math.round((totalSolved / stats.length) * 100) : 0

  const handleAssign = async (id: string, type: 'PUZZLE' | 'FOLDER' | 'MCQ', dueDate?: string, audioUrl?: string | null) => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          itemId: id,
          type: type,
          dueDate: dueDate,
          audioUrl: audioUrl
        })
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Successfully assigned ${data.count || 1} puzzle(s)!`)
        setIsAssignModalOpen(false)
      } else {
        const err = await res.json()
        alert(err.message || "Failed to assign")
      }
    } catch (e) {
      console.error(e)
      alert("Network Error")
    }
  }

  return (
    <CRMShellLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student List Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-sky-100 p-4 flex flex-col h-auto lg:h-[calc(100vh-180px)] overflow-hidden">
          <h2 className="font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 text-sky-600">
            <Users size={16} /> My Students ({students.length})
          </h2>

          {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sky-500" /></div> : (
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${selectedStudent?.id === s.id ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-100' : 'bg-white border-slate-100 hover:bg-sky-50/50'}`}
                >
                  <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                  <div className="text-[10px] font-medium text-slate-400 mt-1 flex justify-between items-center">
                    <span className="truncate max-w-[150px]">{s.email}</span>
                    <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{s.stage}</span>
                  </div>
                </button>
              ))}
              {students.length === 0 && <div className="text-gray-400 text-xs font-bold text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed">No students assigned to you.</div>}
            </div>
          )}
        </div>

        {/* Student Detail View */}
        <div className="lg:col-span-8 h-full">
          {selectedStudent ? (
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 md:p-8 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0b1d3a]">{selectedStudent.name}</h2>
                  <div className="text-slate-400 text-xs font-medium mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                    {selectedStudent.email}
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-100 transition-all active:scale-95"
                >
                  <Plus size={18} /> Assign Homework
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block mb-1">Solved</span>
                  <div className="text-2xl font-bold text-green-800 flex items-center gap-2"><Trophy size={20} /> {totalSolved}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Success Rate</span>
                  <div className="text-2xl font-bold text-blue-800 flex items-center gap-2"><Target size={20} /> {successRate}%</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block mb-1">Total Activity</span>
                  <div className="text-2xl font-bold text-purple-800 flex items-center gap-2"><Activity size={20} /> {stats.length}</div>
                </div>
              </div>

              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 border-b pb-2 flex items-center gap-2">
                <Clock size={14} /> Activity Log
              </h3>

              {loadingStats ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sky-500" /></div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {stats.length === 0 && <p className="text-slate-400 font-bold text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">No training data recorded.</p>}

                  {stats.map((stat) => (
                    <div key={stat.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-sky-100 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                        <span className="font-bold text-slate-800 text-sm">{stat.puzzle?.title || "Manual Exercise"}</span>
                        <span className={`w-max flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${stat.isSolved ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {stat.isSolved ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {stat.isSolved ? 'Solved' : 'Unsolved'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2"><RotateCcw size={14} className="text-slate-300" /> {stat.attempts} Attempts</div>
                        <div className="flex items-center gap-2"><Clock size={14} className="text-slate-300" /> {new Date(stat.lastPlayed).toLocaleDateString()}</div>
                      </div>

                      {stat.mistakes && Array.isArray(stat.mistakes) && stat.mistakes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1 mb-2"><AlertCircle size={12} /> Mistakes</span>
                          <div className="flex flex-wrap gap-1.5">
                            {stat.mistakes.map((m: string, i: number) => (
                              <span key={i} className="text-[10px] bg-white text-red-600 px-2 py-0.5 rounded-lg border border-red-100 font-mono font-bold">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-sky-50/30 rounded-2xl border-2 border-dashed border-sky-100 flex flex-col items-center justify-center text-sky-300 min-h-[400px]">
              <Users className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm font-bold text-slate-400">Select a student to view details</p>
            </div>
          )}
        </div>

        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Homework: ${selectedStudent?.name}`}>
          <HomeworkBrowser onAssign={handleAssign} />
        </Modal>
      </div>
    </CRMShellLayout>
  )
}

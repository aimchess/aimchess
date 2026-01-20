'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import {
  Users, Folder, FileText, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, Clock, RotateCcw, Plus, MousePointer2,
  Loader2, AlertCircle, ArrowUpDown, Settings, Trash2,
  Trophy, Target, Activity, BookOpen, Layers, Video
} from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'

// --- HELPER: MODAL ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-xl transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// --- HELPER TYPES ---
type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

export default function CoachDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'analysis' | 'attendance'>('students')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin')
    if (session && (session.user as any).role !== 'COACH') router.push('/')
  }, [status, session, router])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20">
      <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Coach Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner">
          {[
            { id: 'students', label: 'My Students', icon: Users },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle },
            { id: 'courses', label: 'Curriculum', icon: BookOpen },
            { id: 'analysis', label: 'Analysis Board', icon: MousePointer2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === tab.id
                ? 'bg-white shadow text-orange-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'students' && <MyStudentsView coachId={(session?.user as any)?.id} />}
        {activeTab === 'attendance' && <AttendanceView coachId={(session?.user as any)?.id} />}
        {activeTab === 'courses' && <CoursesView />}
        {activeTab === 'analysis' && <AnalysisView />}
      </main>
    </div>
  )
}

// ==========================================
// 1. MY STUDENTS VIEW
// ==========================================
function MyStudentsView({ coachId }: { coachId: string }) {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [stats, setStats] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  // Fetch Students
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

  // Fetch Stats
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

  // Handle Assignment Logic
  const handleAssign = async (id: string, type: 'PUZZLE' | 'FOLDER', dueDate?: string, audioUrl?: string | null) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Student List */}
      <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border p-4 h-[calc(100vh-140px)] flex flex-col">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 shrink-0">
          <Users className="text-orange-500" /> Class Roster ({students.length})
        </h2>

        {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div> : (
          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            {students.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`p-4 rounded-lg border cursor-pointer transition hover:bg-orange-50 ${selectedStudent?.id === s.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'bg-white border-slate-200'}`}
              >
                <div className="font-bold text-slate-800">{s.name}</div>
                <div className="text-xs text-slate-500 flex justify-between mt-1">
                  <span>{s.email}</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium text-[10px]">{s.stage}</span>
                </div>
              </div>
            ))}
            {students.length === 0 && <div className="text-gray-400 text-sm text-center py-4 bg-slate-50 rounded border border-dashed">No students assigned to you yet.</div>}
          </div>
        )}
      </div>

      {/* Student Detail View */}
      <div className="lg:col-span-8">
        {selectedStudent ? (
          <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[500px] h-full overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">{selectedStudent.name}</h2>
                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> {selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" /> Assign Homework
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Solved</span>
                <div className="text-3xl font-bold text-green-800 flex items-center gap-2"><Trophy size={24} /> {totalSolved}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Success Rate</span>
                <div className="text-3xl font-bold text-blue-800 flex items-center gap-2"><Target size={24} /> {successRate}%</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col items-center">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Attempts</span>
                <div className="text-3xl font-bold text-purple-800 flex items-center gap-2"><Activity size={24} /> {stats.reduce((acc, curr) => acc + curr.attempts, 0)}</div>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2"><Clock size={18} /> Recent Activity Log</h3>

            {loadingStats ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : (
              <div className="space-y-3">
                {stats.length === 0 && <p className="text-slate-400 italic text-center py-10 bg-slate-50 rounded-lg border border-dashed">No puzzle activity recorded yet.</p>}

                {stats.map((stat) => (
                  <div key={stat.id} className="border rounded-xl p-4 bg-slate-50 hover:bg-white hover:shadow-md transition duration-200">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-800">{stat.puzzle?.title || "Unknown Puzzle"}</span>
                      {stat.isSolved ?
                        <span className="flex items-center gap-1 text-green-700 font-bold bg-green-100 px-2 py-1 rounded text-xs"><CheckCircle size={14} /> Solved</span> :
                        <span className="flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2 py-1 rounded text-xs"><XCircle size={14} /> Unsolved</span>
                      }
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2"><RotateCcw size={14} /> {stat.attempts} Attempts</div>
                      <div className="flex items-center gap-2"><Clock size={14} /> {new Date(stat.lastPlayed).toLocaleDateString()}</div>
                    </div>

                    {stat.mistakes && Array.isArray(stat.mistakes) && stat.mistakes.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200">
                        <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 mb-1"><AlertCircle size={12} /> Mistakes</span>
                        <div className="flex flex-wrap gap-2">
                          {stat.mistakes.map((m: string, i: number) => (
                            <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-mono">{m}</span>
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
          <div className="h-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a student from the roster</p>
          </div>
        )}
      </div>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Homework to ${selectedStudent?.name}`}>
        <HomeworkBrowser onAssign={handleAssign} />
      </Modal>
    </div>
  )
}

// ==========================================
// 1.5 ATTENDANCE VIEW
// ==========================================
// function AttendanceView({ coachId }: { coachId: string }) {
//   const [classes, setClasses] = useState<any[]>([])
//   const [selectedClassId, setSelectedClassId] = useState('')
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0])
//   const [students, setStudents] = useState<any[]>([])
//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string, remarks: string }>>({})

//   // Fetch classes managed by this coach
//   // FIND THIS BLOCK (Approx. Line 191) AND REPLACE IT:
// useEffect(() => {
//   if (!selectedClassId || !date) return
//   const fetchData = async () => {
//     setLoading(true)
//     try {
//       // MANDATORY: Use the 'classes' array already in state which now contains the names
//       const currentClass = classes.find((c: any) => c.id === selectedClassId)

//       if (currentClass) {
//         setStudents(currentClass.students || [])
//       }

//       // Fetch existing attendance records
//       const attRes = await fetch(`/api/attendance?classTimingId=${selectedClassId}&date=${date}`)
//       if (attRes.ok) {
//         const attData = await attRes.json()
//         const records: any = {}
//         attData.forEach((r: any) => {
//           records[r.studentId] = { status: r.status, remarks: r.remarks || '' }
//         })
//         setAttendanceRecords(records)
//       } else {
//         setAttendanceRecords({})
//       }
//     } catch (e) {
//       console.error(e)
//       setAttendanceRecords({})
//     } finally { setLoading(false) }
//   }
//   fetchData()
// }, [selectedClassId, date, classes]) // <--- 'classes' MUST be here

//   // Fetch students and existing attendance when class or date changes
//   useEffect(() => {
//     if (!selectedClassId || !date) return
//     const fetchData = async () => {
//       setLoading(true)
//       try {
//         // Fetch class details to get students
//         const classRes = await fetch(`/api/classes`)
//         const classesData = await classRes.json()
//         const currentClass = classesData.find((c: any) => c.id === selectedClassId)

//         if (currentClass) {
//           setStudents(currentClass.students || [])
//           // Note: The /api/classes GET currently doesn't include full student list in this specific branch.
//           // But let's assume the API returns what we need or we can optimize it.
//           // Implementation detail: I'll make sure students are included in the GET result above or update it.
//         }

//         // Fetch attendance
//         const attRes = await fetch(`/api/attendance?classTimingId=${selectedClassId}&date=${date}`)
//         if (attRes.ok) {
//           const attData = await attRes.json()
//           const records: any = {}
//           attData.forEach((r: any) => {
//             records[r.studentId] = { status: r.status, remarks: r.remarks || '' }
//           })
//           setAttendanceRecords(records)
//         } else {
//           setAttendanceRecords({})
//         }
//       } catch (e) {
//         console.error(e)
//         setAttendanceRecords({})
//       } finally { setLoading(false) }
//     }
//     fetchData()
//   }, [selectedClassId, date])

//   const handleStatusChange = (studentId: string, status: string) => {
//     setAttendanceRecords(prev => ({
//       ...prev,
//       [studentId]: { ...prev[studentId], status }
//     }))
//   }

//   const handleSave = async () => {
//     setSaving(true)
//     try {
//       const records = Object.entries(attendanceRecords).map(([studentId, data]) => ({
//         studentId,
//         status: data.status,
//         remarks: data.remarks
//       }))

//       const res = await fetch('/api/attendance', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           classTimingId: selectedClassId,
//           date,
//           records
//         })
//       })

//       if (res.ok) {
//         alert("Attendance saved successfully!")
//       } else {
//         alert("Failed to save attendance")
//       }
//     } catch (e) { console.error(e) }
//     finally { setSaving(false) }
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'PRESENT': return 'bg-green-100 text-green-700 border-green-200'
//       case 'ABSENT': return 'bg-red-100 text-red-700 border-red-200'
//       case 'LATE': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
//       case 'LEAVE': return 'bg-blue-100 text-blue-700 border-blue-200'
//       default: return 'bg-slate-100 text-slate-500 border-slate-200'
//     }
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border p-6 animate-in fade-in slide-in-from-bottom-4">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <CheckCircle className="text-orange-500" /> Mark Attendance
//           </h2>
//           <p className="text-slate-500 text-sm mt-1">Select class and date to mark student attendance.</p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           <select
//             value={selectedClassId}
//             onChange={(e) => setSelectedClassId(e.target.value)}
//             className="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
//           >
//             {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.startTime})</option>)}
//           </select>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
//           />
//         </div>
//       </div>

//       {classes.find(c => c.id === selectedClassId)?.meetingLink && (
//         <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
//               <Video size={20} />
//             </div>
//             <div>
//               <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Online Class Link</div>
//               <div className="text-sm font-medium text-blue-700 truncate max-w-md">
//                 {classes.find((c: any) => c.id === selectedClassId).meetingLink}
//               </div>
//             </div>
//           </div>
//           <a
//             href={classes.find((c: any) => c.id === selectedClassId).meetingLink}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
//           >
//             Join Meeting
//           </a>
//         </div>
//       )}

//       {loading ? (
//         <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>
//       ) : (
//         <div className="space-y-4">
//           <div className="border rounded-xl overflow-hidden">
//             <table className="w-full text-left border-collapse">
//               <thead className="bg-slate-50 border-b">
//                 <tr>
//                   <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
//                   <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
//                   <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {students.map(s => {
//                   const currentStatus = attendanceRecords[s.id]?.status || ''
//                   return (
//                     <tr key={s.id} className="hover:bg-slate-50 transition-colors">
//                       <td className="p-4">
//                         <div className="font-bold text-slate-800">{s.name}</div>
//                         <div className="text-xs text-slate-500">{s.email}</div>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex justify-center gap-1">
//                           {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
//                             <button
//                               key={status}
//                               onClick={() => handleStatusChange(s.id, status)}
//                               className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${currentStatus === status
//                                 ? getStatusColor(status) + ' ring-1 ring-orange-500 ring-offset-1 shadow-sm'
//                                 : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
//                                 }`}
//                             >
//                               {status[0]}
//                             </button>
//                           ))}
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <input
//                           value={attendanceRecords[s.id]?.remarks || ''}
//                           onChange={(e) => setAttendanceRecords(prev => ({
//                             ...prev,
//                             [s.id]: { ...prev[s.id], remarks: e.target.value }
//                           }))}
//                           className="w-full p-2 border rounded-md text-sm bg-transparent outline-none focus:border-orange-500"
//                           placeholder="Add remark..."
//                         />
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//             {students.length === 0 && (
//               <div className="p-20 text-center text-slate-400 italic bg-slate-50">
//                 No students enrolled in this class batch.
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end pt-4">
//             <button
//               onClick={handleSave}
//               disabled={students.length === 0 || saving}
//               className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
//             >
//               {saving ? <Loader2 className="animate-spin w-5 h-5" /> : null}
//               Save Attendance
//             </button>
//           </div>
//         </div>
//       )
//       }
//     </div >
//   )
// }

function AttendanceView({ coachId }: { coachId: string }) {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string, remarks: string }>>({})

  // 1. Fetch ALL classes for this coach
  useEffect(() => {
    if (!coachId) return
    const fetchClasses = async () => {
      try {
        const res = await fetch(`/api/classes?coachId=${coachId}`)
        if (res.ok) {
          const data = await res.json()
          setClasses(data)
          // Automatically select the first class if one exists
          if (data.length > 0 && !selectedClassId) {
            setSelectedClassId(data[0].id)
          }
        }
      } catch (e) { console.error("Error fetching classes:", e) }
    }
    fetchClasses()
  }, [coachId])

  // 2. When Class or Date changes, update the student list and fetch existing attendance
  useEffect(() => {
    // Stop if no class is selected yet
    if (!selectedClassId || !date || classes.length === 0) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Find the selected class from our local state to get its student list
        const currentClass = classes.find((c: any) => c.id === selectedClassId)
        if (currentClass) {
          setStudents(currentClass.students || [])
        }

        // Fetch attendance records for this specific day
        const attRes = await fetch(`/api/attendance?classTimingId=${selectedClassId}&date=${date}`)
        if (attRes.ok) {
          const attData = await attRes.json()
          const records: any = {}
          attData.forEach((r: any) => {
            records[r.studentId] = { status: r.status, remarks: r.remarks || '' }
          })
          setAttendanceRecords(records)
        } else {
          setAttendanceRecords({})
        }
      } catch (e) {
        console.error("Error fetching attendance:", e)
        setAttendanceRecords({})
      } finally { setLoading(false) }
    }
    fetchData()
  }, [selectedClassId, date, classes]) // Runs when classes are loaded OR selection changes

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks
      }))

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classTimingId: selectedClassId,
          date,
          records
        })
      })

      if (res.ok) { alert("Attendance saved successfully!") } 
      else { alert("Failed to save attendance") }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-700 border-green-200'
      case 'ABSENT': return 'bg-red-100 text-red-700 border-red-200'
      case 'LATE': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'LEAVE': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-500 border-slate-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="text-orange-500" /> Mark Attendance
          </h2>
          <p className="text-slate-500 text-sm mt-1">Select class and date to mark student attendance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.startTime})</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map(s => {
                  const currentStatus = attendanceRecords[s.id]?.status || ''
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(s.id, status)}
                              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${currentStatus === status
                                ? getStatusColor(status) + ' ring-1 ring-orange-500 ring-offset-1 shadow-sm'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              {status[0]}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          value={attendanceRecords[s.id]?.remarks || ''}
                          onChange={(e) => setAttendanceRecords(prev => ({
                            ...prev,
                            [s.id]: { ...prev[s.id], remarks: e.target.value }
                          }))}
                          className="w-full p-2 border rounded-md text-sm bg-transparent outline-none focus:border-orange-500"
                          placeholder="Add remark..."
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic bg-slate-50">
                No students enrolled in this class batch.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={students.length === 0 || saving}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : null}
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


// ==========================================
// 2. COURSES VIEW (Updated with Navigation)
// ==========================================
function CoursesView() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [activeChapter, setActiveChapter] = useState<any>(null)

  // Board State
  const game = useRef(new Chess())
  const [boardFen, setBoardFen] = useState('start')
  const [squares, setSquares] = useState<Record<string, any>>({})
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')

  // Editor/Setup State
  const [setupMode, setSetupMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses')
        if (res.ok) {
          const data = await res.json()
          setCourses(Array.isArray(data) ? data : [])
        }
      } catch (e) { console.error("Failed to load courses", e) }
      finally { setLoading(false) }
    }
    fetchCourses()
  }, [])

  // Load lesson content when chapter changes
  useEffect(() => {
    if (activeChapter) {
      try {
        game.current.load(activeChapter.fen)
        setBoardFen(activeChapter.fen)
        setSquares({}) // Clear highlights on new lesson
        setSetupMode(false) // Exit setup mode on new lesson
      } catch (e) {
        game.current.reset()
        setBoardFen('start')
      }
    }
  }, [activeChapter])

  const updateBoard = () => setBoardFen(game.current.fen())

  // --- NAVIGATION LOGIC ---
  const currentChapterIndex = selectedCourse?.chapters?.findIndex((c: any) => c.id === activeChapter?.id) ?? -1
  const hasNext = currentChapterIndex !== -1 && currentChapterIndex < (selectedCourse?.chapters?.length || 0) - 1
  const hasPrev = currentChapterIndex > 0

  const handleNext = () => {
    if (hasNext) setActiveChapter(selectedCourse.chapters[currentChapterIndex + 1])
  }

  const handlePrev = () => {
    if (hasPrev) setActiveChapter(selectedCourse.chapters[currentChapterIndex - 1])
  }

  // --- INTERACTION HANDLERS ---

  const onDrop = (source: string, target: string, piece: string) => {
    // 1. Setup Mode Logic (Drag and drop any piece anywhere)
    if (setupMode) {
      const boardPiece = game.current.get(source as any)
      if (source === target) return false;
      game.current.remove(source as any)
      game.current.put(boardPiece, target as any)
      updateBoard()
      return true
    }

    // 2. Normal Move Logic (Chess Rules Apply)
    try {
      const move = game.current.move({ from: source, to: target, promotion: 'q' })
      if (!move) return false
      setBoardFen(game.current.fen())
      return true
    } catch { return false }
  }

  const onSquareClick = (square: string) => {
    if (setupMode && selectedTool) {
      if (selectedTool === 'TRASH') {
        game.current.remove(square as any)
      } else {
        game.current.put({ type: selectedTool.type as any, color: selectedTool.color }, square as any)
      }
      updateBoard()
    }
  }

  const onSquareRightClick = (square: string) => {
    // If in Setup Mode, right click removes piece
    if (setupMode) {
      game.current.remove(square as any)
      updateBoard()
      return
    }

    // Normal Mode: Cycle Highlights (Green -> Red -> Off)
    setSquares((prev) => {
      const newSquares = { ...prev }
      const current = newSquares[square]

      if (!current) {
        // 1st Click: Green
        newSquares[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
      } else if (current.backgroundColor === 'rgba(0, 255, 0, 0.4)') {
        // 2nd Click: Red
        newSquares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
      } else {
        // 3rd Click: Off
        delete newSquares[square]
      }
      return newSquares
    })
  }

  if (loading && !selectedCourse) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-8 h-8" /></div>
  }

  // --- COURSE LIST SELECTION ---
  if (!selectedCourse) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="text-orange-600" /> Available Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${c.level === 'BEGINNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {c.level}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{c.description || "No description provided."}</p>

              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">{c.chapters?.length || 0} Lessons</span>
                <button
                  onClick={() => { setSelectedCourse(c); if (c.chapters?.length > 0) setActiveChapter(c.chapters[0]) }}
                  disabled={!c.chapters || c.chapters.length === 0}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 group-hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Teaching <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <div className="col-span-3 text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed">No courses found. Ask Admin to create some.</div>}
        </div>
      </div>
    )
  }

  // --- CLASSROOM VIEW ---
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-800 text-white p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedCourse(null); setActiveChapter(null) }} className="hover:bg-slate-700 p-2 rounded-lg transition">
            <ChevronLeft />
          </button>
          <div>
            <h2 className="font-bold text-lg">{selectedCourse.title}</h2>
            <p className="text-xs text-slate-400">Classroom Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="p-2 hover:bg-slate-700 rounded" title="Flip Board">
            <ArrowUpDown size={18} />
          </button>
          <button
            onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
            className={`px-3 py-1 rounded text-sm font-bold flex items-center gap-2 transition ${setupMode ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            <Settings size={14} /> {setupMode ? 'Done' : 'Editor'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Lessons */}
        <div className="w-64 bg-slate-50 border-r overflow-y-auto hidden md:block shrink-0">
          <div className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Lessons</div>
          {selectedCourse.chapters.map((chap: any, idx: number) => (
            <button
              key={chap.id}
              onClick={() => setActiveChapter(chap)}
              className={`w-full text-left p-4 border-b text-sm font-medium transition-colors flex items-center gap-3 ${activeChapter?.id === chap.id ? 'bg-orange-50 text-orange-700 border-l-4 border-l-orange-500' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${activeChapter?.id === chap.id ? 'bg-orange-200' : 'bg-slate-200'}`}>
                {idx + 1}
              </div>
              <span className="truncate">{chap.title}</span>
            </button>
          ))}
        </div>

        {/* Center: Board Area */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
          <div className="flex-1 bg-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* BOARD CONTAINER - RESIZES TO FIT */}
            <div className="w-full h-full flex justify-center items-center">
              <div className="aspect-square h-full max-h-full w-auto shadow-2xl rounded-sm border-4 border-white relative">
                <Chessboard
                  position={boardFen}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  customSquareStyles={squares}
                  boardOrientation={orientation}
                  arePiecesDraggable={true}
                  areArrowsAllowed={true} // Allow drawing arrows
                  animationDuration={200}
                  dropOffBoardAction={setupMode ? 'trash' : 'snapback'}
                />
                {setupMode && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse pointer-events-none z-10">
                    EDITOR MODE
                  </div>
                )}
              </div>
            </div>

            {/* EDITOR PALETTE (Overlay when Setup Mode is ON) */}
            {setupMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded-xl shadow-2xl border flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 z-20">
                <div className="flex gap-1">
                  {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                    <button key={'w' + p} onClick={() => setSelectedTool({ type: p, color: 'w' })} className={`w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded border ${selectedTool?.type === p && selectedTool?.color === 'w' ? 'border-orange-500 bg-orange-50' : 'border-transparent'}`}>{getPieceSymbol(p, 'w')}</button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                    <button key={'b' + p} onClick={() => setSelectedTool({ type: p, color: 'b' })} className={`w-8 h-8 flex items-center justify-center text-xl bg-slate-800 text-white hover:bg-slate-700 rounded border ${selectedTool?.type === p && selectedTool?.color === 'b' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-transparent'}`}>{getPieceSymbol(p, 'b')}</button>
                  ))}
                </div>
                <div className="flex w-full gap-2 border-t pt-2 mt-1">
                  <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold p-1 rounded hover:bg-red-50 text-red-600 ${selectedTool === 'TRASH' ? 'bg-red-100 ring-1 ring-red-500' : ''}`}><Trash2 size={14} /> Trash</button>
                  <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 text-xs font-bold p-1 rounded hover:bg-gray-100 text-gray-600">Clear</button>
                  <button onClick={() => { game.current.reset(); updateBoard() }} className="flex-1 text-xs font-bold p-1 rounded hover:bg-gray-100 text-gray-600">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Notes */}
          <div className="w-full md:w-[350px] bg-white border-l flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{activeChapter?.title}</h3>
                <span className="text-xs font-bold text-slate-400 uppercase">Instructor Notes</span>
              </div>
              <button
                onClick={() => { game.current.load(activeChapter.fen); setBoardFen(activeChapter.fen); setSquares({}) }}
                className="p-2 hover:bg-white rounded-full text-slate-500 hover:text-orange-600 transition shadow-sm"
                title="Reset Board to Lesson Start"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 prose prose-slate">
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm">
                {activeChapter?.content || "No detailed notes provided for this lesson."}
              </p>
            </div>

            {/* NEW: Navigation Footer */}
            <div className="p-4 border-t bg-slate-50 flex gap-2">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="flex-1 py-2 px-3 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition shadow-sm"
              >
                Next Lesson <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. HOMEWORK BROWSER (Assign All Added)
// ==========================================
function HomeworkBrowser({ onAssign }: { onAssign: (id: string, type: 'PUZZLE' | 'FOLDER', dueDate?: string, audioUrl?: string | null) => void }) {
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
  const [content, setContent] = useState<{ folders: any[], puzzles: any[] }>({ folders: [], puzzles: [] })
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!currentStage) return
    setLoading(true)
    const parent = breadcrumbs[breadcrumbs.length - 1]
    const url = parent
      ? `/api/content?parentId=${parent.id}`
      : `/api/content?stage=${currentStage}`

    fetch(url)
      .then(r => r.json())
      .then(data => setContent({ folders: data.folders || [], puzzles: data.puzzles || [] }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentStage, breadcrumbs])

  if (!currentStage) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(stage => (
          <button key={stage} onClick={() => setCurrentStage(stage)} className="h-24 border rounded-lg bg-slate-50 hover:bg-orange-50 hover:border-orange-500 font-bold text-slate-600 shadow-sm transition-all flex flex-col items-center justify-center gap-2">
            <Layers size={24} className="text-orange-400" />
            {stage}
          </button>
        ))}
      </div>
    )
  }

  // Current folder ID for bulk assign
  const currentFolderId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4 border-b pb-2">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm overflow-x-auto">
          <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="font-bold text-gray-500 hover:text-black transition">Levels</button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{currentStage}</span>
          {breadcrumbs.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-400" />
              <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="hover:underline whitespace-nowrap font-medium text-slate-700">{b.name}</button>
            </div>
          ))}
        </div>

        {/* Due Date Picker */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-orange-50/50 p-3 rounded-lg border border-orange-100 mb-2">
          <div className="flex items-center gap-2 grow">
            <Clock size={16} className="text-orange-600" />
            <span className="text-xs font-bold text-slate-600 uppercase">Set Deadline:</span>
            <input
              type="datetime-local"
              className="text-sm border rounded px-2 py-1 focus:ring-2 ring-orange-200 outline-none flex-1"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Bulk Assign Button (Only if we are inside a folder) */}
          {currentFolderId && !loading && (content.puzzles.length > 0 || content.folders.length > 0) && (
            <button
              onClick={() => onAssign(currentFolderId, 'FOLDER', dueDate, audioUrl)}
              className="bg-slate-800 text-white text-sm font-bold py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
            >
              <Folder size={16} /> Assign Folder
            </button>
          )}
        </div>

        <AudioRecorder onRecordingComplete={setAudioUrl} />
      </div>

      {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline text-orange-500" /></div> : (
        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {content.folders.length === 0 && content.puzzles.length === 0 && <p className="col-span-3 text-center text-gray-400 py-8 italic">No content in this folder.</p>}

          {/* FOLDERS */}
          {content.folders.map(f => (
            <div key={f.id} className="relative group bg-blue-50 border border-blue-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors h-32">
              {/* Click main area to navigate */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-0" onClick={() => setBreadcrumbs([...breadcrumbs, f])}>
                <Folder className="text-blue-500 mb-2" size={32} />
                <span className="text-xs font-bold text-center text-blue-900 px-2">{f.name}</span>
              </div>
              {/* Quick Assign Button for Folder */}
              <button
                onClick={(e) => { e.stopPropagation(); onAssign(f.id, 'FOLDER', dueDate, audioUrl) }}
                className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Assign Folder"
              >
                <Plus size={14} />
              </button>
            </div>
          ))}

          {/* PUZZLES */}
          {content.puzzles.map(p => (
            <div key={p.id} className="p-4 bg-white border rounded-lg flex flex-col items-center justify-center relative group hover:border-orange-500 transition-all shadow-sm h-32">
              <FileText className="text-orange-500 mb-2" size={28} />
              <span className="text-xs font-medium text-center truncate w-full text-slate-700">{p.title}</span>
              <button
                onClick={() => onAssign(p.id, 'PUZZLE', dueDate, audioUrl)}
                className="absolute inset-0 bg-orange-600/95 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition duration-200 z-10"
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 4. ANALYSIS VIEW
// ==========================================
function AnalysisView() {
  const game = useRef(new Chess())
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [squares, setSquares] = useState<Record<string, any>>({})
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [setupMode, setSetupMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool>(null)

  const updateBoard = () => setFen(game.current.fen())

  const toggleHighlight = (square: string) => {
    setSquares((prev) => {
      const newSquares = { ...prev }
      if (!newSquares[square]) {
        newSquares[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
      } else if (newSquares[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') {
        newSquares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
      } else if (newSquares[square].backgroundColor === 'rgba(255, 0, 0, 0.4)') {
        newSquares[square] = { backgroundColor: 'rgba(0, 0, 255, 0.4)' }
      } else {
        delete newSquares[square]
      }
      return newSquares
    })
  }

  const onDrop = (source: string, target: string, piece: string) => {
    if (setupMode) {
      const boardPiece = game.current.get(source as any)
      if (source === target) return false;
      game.current.remove(source as any)
      game.current.put(boardPiece, target as any)
      updateBoard()
      setSquares({})
      return true
    }
    try {
      const move = game.current.move({ from: source, to: target, promotion: 'q' })
      if (!move) return false
      setFen(game.current.fen())
      setSquares({})
      return true
    } catch { return false }
  }

  const onSquareClick = (square: string) => {
    if (setupMode && selectedTool) {
      if (selectedTool === 'TRASH') {
        game.current.remove(square as any)
      } else {
        game.current.put({ type: selectedTool.type as any, color: selectedTool.color }, square as any)
      }
      updateBoard()
    }
  }

  const onSquareRightClick = (square: string) => {
    if (setupMode) {
      game.current.remove(square as any)
      updateBoard()
    } else {
      toggleHighlight(square)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-8 flex justify-center items-start">
        <div className="w-full max-w-[650px] aspect-square border-4 border-slate-700 rounded-lg shadow-2xl relative bg-slate-800">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={squares}
            boardOrientation={orientation}
            arePiecesDraggable={true}
            areArrowsAllowed={true}
            animationDuration={200}
            dropOffBoardAction={setupMode ? 'trash' : 'snapback'}
          />
          {setupMode && (
            <div className="absolute top-0 right-0 m-2 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded shadow-lg animate-pulse z-10 pointer-events-none">
              SETUP MODE
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
            <MousePointer2 className="text-orange-500" /> Analysis Tools
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="flex-1 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 font-bold text-slate-600 transition">
                <RotateCcw size={18} /> Reset
              </button>
              <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="flex-1 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 font-bold text-slate-600 transition">
                <ArrowUpDown size={18} /> Flip
              </button>
            </div>

            <button
              onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
              className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${setupMode
                ? 'bg-red-600 text-white shadow-inner ring-2 ring-offset-2 ring-red-600'
                : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md'
                }`}
            >
              <Settings size={18} /> {setupMode ? 'Exit Setup Mode' : 'Edit Board Position'}
            </button>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-400 uppercase">Current FEN</label>
              <input
                className="w-full mt-1 border p-2 rounded text-xs font-mono bg-slate-50 text-slate-600 select-all"
                value={fen}
                readOnly
              />
            </div>
          </div>
        </div>

        {setupMode && (
          <div className="bg-white p-6 rounded-xl border shadow-lg animate-in slide-in-from-top-4">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Piece Palette
            </h4>
            <p className="text-xs text-slate-500 mb-3">Select a piece then click a square. Right-click board to remove.</p>

            <div className="flex justify-between gap-1 mb-2">
              {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                <button
                  key={'w' + p}
                  onClick={() => setSelectedTool({ type: p, color: 'w' })}
                  className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center font-serif text-2xl bg-white text-black hover:bg-slate-50 transition ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'w' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-100'}`}
                >
                  {getPieceSymbol(p, 'w')}
                </button>
              ))}
            </div>

            <div className="flex justify-between gap-1 mb-4">
              {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                <button
                  key={'b' + p}
                  onClick={() => setSelectedTool({ type: p, color: 'b' })}
                  className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center font-serif text-2xl bg-slate-800 text-white hover:bg-slate-700 transition ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'b' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-700'}`}
                >
                  {getPieceSymbol(p, 'b')}
                </button>
              ))}
            </div>

            <div className="flex gap-2 border-t pt-4">
              <button
                onClick={() => setSelectedTool('TRASH')}
                className={`flex-1 py-2 border-2 border-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition ${selectedTool === 'TRASH' ? 'bg-red-100 border-red-500' : ''}`}
              >
                <Trash2 size={18} /> Trash
              </button>
              <button
                onClick={() => { game.current.clear(); updateBoard() }}
                className="flex-1 py-2 border-2 border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50"
              >
                Clear Board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getPieceSymbol(type: string, color: string) {
  const symbols: any = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  }
  return symbols[color][type]
}
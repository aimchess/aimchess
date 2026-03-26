// 'use client'

// import React, { useEffect, useState, useRef } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Chess } from 'chess.js'
// import { Chessboard } from 'react-chessboard'
// import {
//   Users, Folder, FileText, ChevronRight, ChevronLeft,
//   CheckCircle, XCircle, Clock, RotateCcw, Plus, MousePointer2,
//   Loader2, AlertCircle, ArrowUpDown, Settings, Trash2,
//   Trophy, Target, Activity, BookOpen, Layers, Video
// } from 'lucide-react'
// import AudioRecorder from '@/components/AudioRecorder'

// // --- HELPER: MODAL ---
// const Modal = ({ isOpen, onClose, title, children }: any) => {
//   if (!isOpen) return null
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//       <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
//         <div className="flex justify-between items-center mb-6 border-b pb-4">
//           <h3 className="text-xl font-bold text-slate-800">{title}</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-xl transition-colors">✕</button>
//         </div>
//         {children}
//       </div>
//     </div>
//   )
// }

// // --- HELPER TYPES ---
// type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

// export default function CoachDashboard() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'analysis' | 'attendance'>('students')

//   useEffect(() => {
//     if (status === 'unauthenticated') router.push('/api/auth/signin')
//     if (session && (session.user as any).role !== 'COACH') router.push('/')
//   }, [status, session, router])

//   if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20">
//       <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 shadow-sm">
//         <div className="mb-4 md:mb-0">
//           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             Coach Dashboard
//           </h1>
//           <p className="text-slate-500 text-sm">Welcome back, {session?.user?.name}</p>
//         </div>
//         <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner overflow-x-auto max-w-full">
//           {[
//             { id: 'students', label: 'My Students', icon: Users },
//             { id: 'attendance', label: 'Attendance', icon: CheckCircle },
//             { id: 'courses', label: 'Curriculum', icon: BookOpen },
//             { id: 'analysis', label: 'Analysis Board', icon: MousePointer2 },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id as any)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
//                 ? 'bg-white shadow text-orange-600'
//                 : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
//                 }`}
//             >
//               <tab.icon size={16} />
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto p-4 md:p-6">
//         {activeTab === 'students' && <MyStudentsView coachId={(session?.user as any)?.id} />}
//         {activeTab === 'attendance' && <AttendanceView coachId={(session?.user as any)?.id} />}
//         {activeTab === 'courses' && <CoursesView />}
//         {activeTab === 'analysis' && <AnalysisView />}
//       </main>
//     </div>
//   )
// }

// // ==========================================
// // 1. MY STUDENTS VIEW
// // ==========================================
// function MyStudentsView({ coachId }: { coachId: string }) {
//   const [students, setStudents] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedStudent, setSelectedStudent] = useState<any>(null)
//   const [stats, setStats] = useState<any[]>([])
//   const [loadingStats, setLoadingStats] = useState(false)
//   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

//   // Fetch Students
//   useEffect(() => {
//     if (!coachId) return
//     const loadStudents = async () => {
//       try {
//         const res = await fetch('/api/admin/users')
//         if (res.ok) {
//           const data = await res.json()
//           if (Array.isArray(data)) {
//             const myStudents = data.filter((u: any) => u.role === 'STUDENT' && u.coachId === coachId)
//             setStudents(myStudents)
//           }
//         }
//       } catch (e) { console.error(e) }
//       finally { setLoading(false) }
//     }
//     loadStudents()
//   }, [coachId])

//   // Fetch Stats
//   useEffect(() => {
//     if (!selectedStudent) return
//     setLoadingStats(true)
//     const loadStats = async () => {
//       try {
//         const res = await fetch(`/api/progress?studentId=${selectedStudent.id}`)
//         if (res.ok) {
//           const data = await res.json()
//           setStats(Array.isArray(data) ? data : [])
//         } else { setStats([]) }
//       } catch (e) { setStats([]) }
//       finally { setLoadingStats(false) }
//     }
//     loadStats()
//   }, [selectedStudent])

//   const totalSolved = stats.filter(s => s.isSolved).length
//   const successRate = stats.length > 0 ? Math.round((totalSolved / stats.length) * 100) : 0

//   // Handle Assignment Logic
//   const handleAssign = async (id: string, type: 'PUZZLE' | 'FOLDER', dueDate?: string, audioUrl?: string | null) => {
//     try {
//       const res = await fetch('/api/assignments', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           studentId: selectedStudent.id,
//           itemId: id,
//           type: type,
//           dueDate: dueDate,
//           audioUrl: audioUrl
//         })
//       })

//       if (res.ok) {
//         const data = await res.json()
//         alert(`Successfully assigned ${data.count || 1} puzzle(s)!`)
//         setIsAssignModalOpen(false)
//       } else {
//         const err = await res.json()
//         alert(err.message || "Failed to assign")
//       }
//     } catch (e) {
//       console.error(e)
//       alert("Network Error")
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
//       {/* Student List */}
//       <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border p-4 h-auto lg:h-[calc(100vh-140px)] flex flex-col">
//         <h2 className="font-bold text-lg mb-4 flex items-center gap-2 shrink-0">
//           <Users className="text-orange-500" /> Class Roster ({students.length})
//         </h2>

//         {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div> : (
//           <div className="space-y-2 overflow-y-auto flex-1 pr-2">
//             {students.map(s => (
//               <div
//                 key={s.id}
//                 onClick={() => setSelectedStudent(s)}
//                 className={`p-4 rounded-lg border cursor-pointer transition hover:bg-orange-50 ${selectedStudent?.id === s.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'bg-white border-slate-200'}`}
//               >
//                 <div className="font-bold text-slate-800">{s.name}</div>
//                 <div className="text-xs text-slate-500 flex justify-between mt-1">
//                   <span>{s.email}</span>
//                   <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium text-[10px]">{s.stage}</span>
//                 </div>
//               </div>
//             ))}
//             {students.length === 0 && <div className="text-gray-400 text-sm text-center py-4 bg-slate-50 rounded border border-dashed">No students assigned to you yet.</div>}
//           </div>
//         )}
//       </div>

//       {/* Student Detail View */}
//       <div className="lg:col-span-8">
//         {selectedStudent ? (
//           <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[500px] h-full overflow-y-auto animate-in fade-in zoom-in-95">
//             <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
//               <div>
//                 <h2 className="text-3xl font-bold text-slate-800">{selectedStudent.name}</h2>
//                 <div className="text-slate-500 text-sm mt-1 flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                   {selectedStudent.email}
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsAssignModalOpen(true)}
//                 className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition transform hover:-translate-y-0.5"
//               >
//                 <Plus className="w-5 h-5" /> Assign Homework
//               </button>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//               <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center">
//                 <span className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Solved</span>
//                 <div className="text-3xl font-bold text-green-800 flex items-center gap-2"><Trophy size={24} /> {totalSolved}</div>
//               </div>
//               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center">
//                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Success Rate</span>
//                 <div className="text-3xl font-bold text-blue-800 flex items-center gap-2"><Target size={24} /> {successRate}%</div>
//               </div>
//               <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col items-center">
//                 <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Attempts</span>
//                 <div className="text-3xl font-bold text-purple-800 flex items-center gap-2"><Activity size={24} /> {stats.reduce((acc, curr) => acc + curr.attempts, 0)}</div>
//               </div>
//             </div>

//             <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2"><Clock size={18} /> Recent Activity Log</h3>

//             {loadingStats ? (
//               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
//             ) : (
//               <div className="space-y-3">
//                 {stats.length === 0 && <p className="text-slate-400 italic text-center py-10 bg-slate-50 rounded-lg border border-dashed">No puzzle activity recorded yet.</p>}

//                 {stats.map((stat) => (
//                   <div key={stat.id} className="border rounded-xl p-4 bg-slate-50 hover:bg-white hover:shadow-md transition duration-200">
//                     <div className="flex justify-between mb-2">
//                       <span className="font-bold text-slate-800">{stat.puzzle?.title || "Unknown Puzzle"}</span>
//                       {stat.isSolved ?
//                         <span className="flex items-center gap-1 text-green-700 font-bold bg-green-100 px-2 py-1 rounded text-xs"><CheckCircle size={14} /> Solved</span> :
//                         <span className="flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2 py-1 rounded text-xs"><XCircle size={14} /> Unsolved</span>
//                       }
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
//                       <div className="flex items-center gap-2"><RotateCcw size={14} /> {stat.attempts} Attempts</div>
//                       <div className="flex items-center gap-2"><Clock size={14} /> {new Date(stat.lastPlayed).toLocaleDateString()}</div>
//                     </div>

//                     {stat.mistakes && Array.isArray(stat.mistakes) && stat.mistakes.length > 0 && (
//                       <div className="mt-3 pt-2 border-t border-slate-200">
//                         <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 mb-1"><AlertCircle size={12} /> Mistakes</span>
//                         <div className="flex flex-wrap gap-2">
//                           {stat.mistakes.map((m: string, i: number) => (
//                             <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-mono">{m}</span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="h-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
//             <Users className="w-16 h-16 mb-4 opacity-20" />
//             <p className="text-lg font-medium">Select a student from the roster</p>
//           </div>
//         )}
//       </div>

//       <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Homework to ${selectedStudent?.name}`}>
//         <HomeworkBrowser onAssign={handleAssign} />
//       </Modal>
//     </div>
//   )
// }

// // ==========================================
// // 1.5 ATTENDANCE VIEW
// // ==========================================
// // function AttendanceView({ coachId }: { coachId: string }) {
// //   const [classes, setClasses] = useState<any[]>([])
// //   const [selectedClassId, setSelectedClassId] = useState('')
// //   const [date, setDate] = useState(new Date().toISOString().split('T')[0])
// //   const [students, setStudents] = useState<any[]>([])
// //   const [loading, setLoading] = useState(false)
// //   const [saving, setSaving] = useState(false)
// //   const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string, remarks: string }>>({})

// //   // Fetch classes managed by this coach
// //   // FIND THIS BLOCK (Approx. Line 191) AND REPLACE IT:
// // useEffect(() => {
// //   if (!selectedClassId || !date) return
// //   const fetchData = async () => {
// //     setLoading(true)
// //     try {
// //       // MANDATORY: Use the 'classes' array already in state which now contains the names
// //       const currentClass = classes.find((c: any) => c.id === selectedClassId)

// //       if (currentClass) {
// //         setStudents(currentClass.students || [])
// //       }

// //       // Fetch existing attendance records
// //       const attRes = await fetch(`/api/attendance?classTimingId=${selectedClassId}&date=${date}`)
// //       if (attRes.ok) {
// //         const attData = await attRes.json()
// //         const records: any = {}
// //         attData.forEach((r: any) => {
// //           records[r.studentId] = { status: r.status, remarks: r.remarks || '' }
// //         })
// //         setAttendanceRecords(records)
// //       } else {
// //         setAttendanceRecords({})
// //       }
// //     } catch (e) {
// //       console.error(e)
// //       setAttendanceRecords({})
// //     } finally { setLoading(false) }
// //   }
// //   fetchData()
// // }, [selectedClassId, date, classes]) // <--- 'classes' MUST be here

// //   // Fetch students and existing attendance when class or date changes
// //   useEffect(() => {
// //     if (!selectedClassId || !date) return
// //     const fetchData = async () => {
// //       setLoading(true)
// //       try {
// //         // Fetch class details to get students
// //         const classRes = await fetch(`/api/classes`)
// //         const classesData = await classRes.json()
// //         const currentClass = classesData.find((c: any) => c.id === selectedClassId)

// //         if (currentClass) {
// //           setStudents(currentClass.students || [])
// //           // Note: The /api/classes GET currently doesn't include full student list in this specific branch.
// //           // But let's assume the API returns what we need or we can optimize it.
// //           // Implementation detail: I'll make sure students are included in the GET result above or update it.
// //         }

// //         // Fetch attendance
// //         const attRes = await fetch(`/api/attendance?classTimingId=${selectedClassId}&date=${date}`)
// //         if (attRes.ok) {
// //           const attData = await attRes.json()
// //           const records: any = {}
// //           attData.forEach((r: any) => {
// //             records[r.studentId] = { status: r.status, remarks: r.remarks || '' }
// //           })
// //           setAttendanceRecords(records)
// //         } else {
// //           setAttendanceRecords({})
// //         }
// //       } catch (e) {
// //         console.error(e)
// //         setAttendanceRecords({})
// //       } finally { setLoading(false) }
// //     }
// //     fetchData()
// //   }, [selectedClassId, date])

// //   const handleStatusChange = (studentId: string, status: string) => {
// //     setAttendanceRecords(prev => ({
// //       ...prev,
// //       [studentId]: { ...prev[studentId], status }
// //     }))
// //   }

// //   const handleSave = async () => {
// //     setSaving(true)
// //     try {
// //       const records = Object.entries(attendanceRecords).map(([studentId, data]) => ({
// //         studentId,
// //         status: data.status,
// //         remarks: data.remarks
// //       }))

// //       const res = await fetch('/api/attendance', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           classTimingId: selectedClassId,
// //           date,
// //           records
// //         })
// //       })

// //       if (res.ok) {
// //         alert("Attendance saved successfully!")
// //       } else {
// //         alert("Failed to save attendance")
// //       }
// //     } catch (e) { console.error(e) }
// //     finally { setSaving(false) }
// //   }

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case 'PRESENT': return 'bg-green-100 text-green-700 border-green-200'
// //       case 'ABSENT': return 'bg-red-100 text-red-700 border-red-200'
// //       case 'LATE': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
// //       case 'LEAVE': return 'bg-blue-100 text-blue-700 border-blue-200'
// //       default: return 'bg-slate-100 text-slate-500 border-slate-200'
// //     }
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow-sm border p-6 animate-in fade-in slide-in-from-bottom-4">
// //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
// //         <div>
// //           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
// //             <CheckCircle className="text-orange-500" /> Mark Attendance
// //           </h2>
// //           <p className="text-slate-500 text-sm mt-1">Select class and date to mark student attendance.</p>
// //         </div>
// //         <div className="flex flex-wrap gap-3">
// //           <select
// //             value={selectedClassId}
// //             onChange={(e) => setSelectedClassId(e.target.value)}
// //             className="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
// //           >
// //             {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.startTime})</option>)}
// //           </select>
// //           <input
// //             type="date"
// //             value={date}
// //             onChange={(e) => setDate(e.target.value)}
// //             className="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
// //           />
// //         </div>
// //       </div>

// //       {classes.find(c => c.id === selectedClassId)?.meetingLink && (
// //         <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
// //           <div className="flex items-center gap-3">
// //             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
// //               <Video size={20} />
// //             </div>
// //             <div>
// //               <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Online Class Link</div>
// //               <div className="text-sm font-medium text-blue-700 truncate max-w-md">
// //                 {classes.find((c: any) => c.id === selectedClassId).meetingLink}
// //               </div>
// //             </div>
// //           </div>
// //           <a
// //             href={classes.find((c: any) => c.id === selectedClassId).meetingLink}
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
// //           >
// //             Join Meeting
// //           </a>
// //         </div>
// //       )}

// //       {loading ? (
// //         <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>
// //       ) : (
// //         <div className="space-y-4">
// //           <div className="border rounded-xl overflow-hidden">
// //             <table className="w-full text-left border-collapse">
// //               <thead className="bg-slate-50 border-b">
// //                 <tr>
// //                   <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
// //                   <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
// //                   <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y">
// //                 {students.map(s => {
// //                   const currentStatus = attendanceRecords[s.id]?.status || ''
// //                   return (
// //                     <tr key={s.id} className="hover:bg-slate-50 transition-colors">
// //                       <td className="p-4">
// //                         <div className="font-bold text-slate-800">{s.name}</div>
// //                         <div className="text-xs text-slate-500">{s.email}</div>
// //                       </td>
// //                       <td className="p-4">
// //                         <div className="flex justify-center gap-1">
// //                           {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
// //                             <button
// //                               key={status}
// //                               onClick={() => handleStatusChange(s.id, status)}
// //                               className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${currentStatus === status
// //                                 ? getStatusColor(status) + ' ring-1 ring-orange-500 ring-offset-1 shadow-sm'
// //                                 : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
// //                                 }`}
// //                             >
// //                               {status[0]}
// //                             </button>
// //                           ))}
// //                         </div>
// //                       </td>
// //                       <td className="p-4">
// //                         <input
// //                           value={attendanceRecords[s.id]?.remarks || ''}
// //                           onChange={(e) => setAttendanceRecords(prev => ({
// //                             ...prev,
// //                             [s.id]: { ...prev[s.id], remarks: e.target.value }
// //                           }))}
// //                           className="w-full p-2 border rounded-md text-sm bg-transparent outline-none focus:border-orange-500"
// //                           placeholder="Add remark..."
// //                         />
// //                       </td>
// //                     </tr>
// //                   )
// //                 })}
// //               </tbody>
// //             </table>
// //             {students.length === 0 && (
// //               <div className="p-20 text-center text-slate-400 italic bg-slate-50">
// //                 No students enrolled in this class batch.
// //               </div>
// //             )}
// //           </div>

// //           <div className="flex justify-end pt-4">
// //             <button
// //               onClick={handleSave}
// //               disabled={students.length === 0 || saving}
// //               className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
// //             >
// //               {saving ? <Loader2 className="animate-spin w-5 h-5" /> : null}
// //               Save Attendance
// //             </button>
// //           </div>
// //         </div>
// //       )
// //       }
// //     </div >
// //   )
// // }

// function AttendanceView({ coachId }: { coachId: string }) {
//   const [classes, setClasses] = useState<any[]>([])
//   const [selectedClassId, setSelectedClassId] = useState('')
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0])
//   const [students, setStudents] = useState<any[]>([])
//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string, remarks: string }>>({})

//   // 1. Fetch ALL classes for this coach
//   useEffect(() => {
//     if (!coachId) return
//     const fetchClasses = async () => {
//       try {
//         const res = await fetch(`/api/classes?coachId=${coachId}`)
//         if (res.ok) {
//           const data = await res.json()
//           setClasses(data)
//           // Automatically select the first class if one exists
//           if (data.length > 0 && !selectedClassId) {
//             setSelectedClassId(data[0].id)
//           }
//         }
//       } catch (e) { console.error("Error fetching classes:", e) }
//     }
//     fetchClasses()
//   }, [coachId])

//   // 2. When Class or Date changes, update the student list and fetch existing attendance
//   useEffect(() => {
//     // Stop if no class is selected yet
//     if (!selectedClassId || !date || classes.length === 0) return

//     const fetchData = async () => {
//       setLoading(true)
//       try {
//         // Find the selected class from our local state to get its student list
//         const currentClass = classes.find((c: any) => c.id === selectedClassId)
//         if (currentClass) {
//           setStudents(currentClass.students || [])
//         }

//         // Fetch attendance records for this specific day
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
//         console.error("Error fetching attendance:", e)
//         setAttendanceRecords({})
//       } finally { setLoading(false) }
//     }
//     fetchData()
//   }, [selectedClassId, date, classes]) // Runs when classes are loaded OR selection changes

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

//       if (res.ok) { alert("Attendance saved successfully!") }
//       else { alert("Failed to save attendance") }
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

//       {loading ? (
//         <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>
//       ) : (
//         <div className="space-y-4">
//           <div className="border rounded-xl overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[600px]">
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
//       )}
//     </div>
//   )
// }


// // ==========================================
// // 2. COURSES VIEW (Updated with Navigation)
// // ==========================================
// function CoursesView() {
//   const [courses, setCourses] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedCourse, setSelectedCourse] = useState<any>(null)
//   const [activeChapter, setActiveChapter] = useState<any>(null)

//   // Board State
//   const game = useRef(new Chess())
//   const [boardFen, setBoardFen] = useState('start')
//   const [squares, setSquares] = useState<Record<string, any>>({})
//   const [orientation, setOrientation] = useState<'white' | 'black'>('white')

//   // Editor/Setup State
//   const [setupMode, setSetupMode] = useState(false)
//   const [selectedTool, setSelectedTool] = useState<Tool>(null)
//   const [boardWidth, setBoardWidth] = useState(500)
//   const boardContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (!boardContainerRef.current) return
//     const observer = new ResizeObserver(entries => {
//       for (let entry of entries) {
//         setBoardWidth(entry.contentRect.width)
//       }
//     })
//     observer.observe(boardContainerRef.current)
//     return () => observer.disconnect()
//   }, [])

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const res = await fetch('/api/courses')
//         if (res.ok) {
//           const data = await res.json()
//           setCourses(Array.isArray(data) ? data : [])
//         }
//       } catch (e) { console.error("Failed to load courses", e) }
//       finally { setLoading(false) }
//     }
//     fetchCourses()
//   }, [])

//   // Load lesson content when chapter changes
//   useEffect(() => {
//     if (activeChapter) {
//       try {
//         game.current.load(activeChapter.fen)
//         setBoardFen(activeChapter.fen)
//         setSquares({}) // Clear highlights on new lesson
//         setSetupMode(false) // Exit setup mode on new lesson
//       } catch (e) {
//         game.current.reset()
//         setBoardFen('start')
//       }
//     }
//   }, [activeChapter])

//   const updateBoard = () => setBoardFen(game.current.fen())

//   // --- NAVIGATION LOGIC ---
//   const currentChapterIndex = selectedCourse?.chapters?.findIndex((c: any) => c.id === activeChapter?.id) ?? -1
//   const hasNext = currentChapterIndex !== -1 && currentChapterIndex < (selectedCourse?.chapters?.length || 0) - 1
//   const hasPrev = currentChapterIndex > 0

//   const handleNext = () => {
//     if (hasNext) setActiveChapter(selectedCourse.chapters[currentChapterIndex + 1])
//   }

//   const handlePrev = () => {
//     if (hasPrev) setActiveChapter(selectedCourse.chapters[currentChapterIndex - 1])
//   }

//   // --- INTERACTION HANDLERS ---

//   const onDrop = (source: string, target: string, piece: string) => {
//     // 1. Setup Mode Logic (Drag and drop any piece anywhere)
//     if (setupMode) {
//       const boardPiece = game.current.get(source as any)
//       if (source === target || !boardPiece) return false;
//       game.current.remove(source as any)
//       game.current.put(boardPiece, target as any)
//       updateBoard()
//       return true
//     }

//     // 2. Normal Move Logic (Chess Rules Apply)
//     try {
//       const move = game.current.move({ from: source, to: target, promotion: 'q' })
//       if (!move) return false
//       setBoardFen(game.current.fen())
//       return true
//     } catch { return false }
//   }

//   const onSquareClick = (square: string) => {
//     if (setupMode && selectedTool) {
//       if (selectedTool === 'TRASH') {
//         game.current.remove(square as any)
//       } else {
//         const tool = selectedTool as { type: string, color: 'w' | 'b' }
//         game.current.put({ type: tool.type as any, color: tool.color as any }, square as any)
//       }
//       updateBoard()
//     }
//   }

//   const onSquareRightClick = (square: string) => {
//     // If in Setup Mode, right click removes piece
//     if (setupMode) {
//       game.current.remove(square as any)
//       updateBoard()
//       return
//     }

//     // Normal Mode: Cycle Highlights (Green -> Red -> Off)
//     setSquares((prev) => {
//       const newSquares = { ...prev }
//       const current = newSquares[square]

//       if (!current) {
//         // 1st Click: Green
//         newSquares[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
//       } else if (current.backgroundColor === 'rgba(0, 255, 0, 0.4)') {
//         // 2nd Click: Red
//         newSquares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
//       } else {
//         // 3rd Click: Off
//         delete newSquares[square]
//       }
//       return newSquares
//     })
//   }

//   if (loading && !selectedCourse) {
//     return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-8 h-8" /></div>
//   }

//   // --- COURSE LIST SELECTION ---
//   if (!selectedCourse) {
//     return (
//       <div className="animate-in fade-in slide-in-from-bottom-4">
//         <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
//           <BookOpen className="text-orange-600" /> Available Courses
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {courses.map(c => (
//             <div key={c.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all group flex flex-col h-full">
//               <div className="flex justify-between items-start mb-3">
//                 <span className={`px-2 py-1 rounded text-xs font-bold ${c.level === 'BEGINNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
//                   {c.level}
//                 </span>
//               </div>
//               <h3 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h3>
//               <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{c.description || "No description provided."}</p>

//               <div className="mt-auto pt-4 border-t flex justify-between items-center">
//                 <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
//                   <span className="text-xs font-bold text-slate-400">{c.chapters?.length || 0} Lessons</span>
//                 </div>
//                 <button
//                   onClick={() => { setSelectedCourse(c); if (c.chapters?.length > 0) setActiveChapter(c.chapters[0]) }}
//                   disabled={!c.chapters || c.chapters.length === 0}
//                   className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 group-hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Start Teaching <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>
//           ))}
//           {courses.length === 0 && <div className="col-span-3 text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed">No courses found. Ask Admin to create some.</div>}
//         </div>
//       </div>
//     )
//   }

//   // --- CLASSROOM VIEW ---
//   return (
//     <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden animate-in fade-in">
//       {/* Header */}
//       <div className="bg-slate-800 text-white p-3 flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-4">
//           <button onClick={() => { setSelectedCourse(null); setActiveChapter(null) }} className="hover:bg-slate-700 p-2 rounded-lg transition">
//             <ChevronLeft />
//           </button>
//           <div>
//             <h2 className="font-bold text-lg">{selectedCourse.title}</h2>
//             <p className="text-xs text-slate-400">Classroom Mode</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="p-2 hover:bg-slate-700 rounded" title="Flip Board">
//             <ArrowUpDown size={18} />
//           </button>
//           <button
//             onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
//             className={`px-3 py-1 rounded text-sm font-bold flex items-center gap-2 transition ${setupMode ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
//           >
//             <Settings size={14} /> {setupMode ? 'Done' : 'Editor'}
//           </button>
//         </div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Sidebar: Lessons */}
//         <div className="w-64 bg-slate-50 border-r overflow-y-auto hidden md:block shrink-0">
//           <div className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Lessons</div>
//           {selectedCourse.chapters.map((chap: any, idx: number) => (
//             <button
//               key={chap.id}
//               onClick={() => setActiveChapter(chap)}
//               className={`w-full text-left p-4 border-b text-sm font-medium transition-colors flex items-center gap-3 ${activeChapter?.id === chap.id ? 'bg-orange-50 text-orange-700 border-l-4 border-l-orange-500' : 'hover:bg-slate-100 text-slate-600'}`}
//             >
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${activeChapter?.id === chap.id ? 'bg-orange-200' : 'bg-slate-200'}`}>
//                 {idx + 1}
//               </div>
//               <span className="truncate">{chap.title}</span>
//             </button>
//           ))}
//         </div>

//         {/* Center: Board Area */}
//         <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
//           <div className="flex-1 bg-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">

//             {/* BOARD CONTAINER - RESIZES TO FIT */}
//             <div ref={boardContainerRef} className="w-full h-full flex justify-center items-center overflow-hidden">
//               <div className="aspect-square w-full max-w-[600px] shadow-2xl rounded-sm border-4 border-white relative">
//                 <Chessboard
//                   position={boardFen}
//                   onPieceDrop={onDrop}
//                   onSquareClick={onSquareClick}
//                   onSquareRightClick={onSquareRightClick}
//                   customSquareStyles={squares}
//                   boardOrientation={orientation}
//                   arePiecesDraggable={true}
//                   areArrowsAllowed={true} // Allow drawing arrows
//                   animationDuration={200}
//                   dropOffBoardAction={setupMode ? 'trash' : 'snapback'}
//                   boardWidth={boardWidth}
//                 />
//                 {setupMode && (
//                   <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse pointer-events-none z-10">
//                     EDITOR MODE
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* EDITOR PALETTE (Overlay when Setup Mode is ON) */}
//             {setupMode && (
//               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded-xl shadow-2xl border flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 z-20">
//                 <div className="flex gap-1">
//                   {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
//                     <button key={'w' + p} onClick={() => setSelectedTool({ type: p, color: 'w' })} className={`w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded border ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool?.color === 'w' ? 'border-orange-500 bg-orange-50' : 'border-transparent'}`}>{getPieceSymbol(p, 'w')}</button>
//                   ))}
//                 </div>
//                 <div className="flex gap-1">
//                   {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
//                     <button key={'b' + p} onClick={() => setSelectedTool({ type: p, color: 'b' })} className={`w-8 h-8 flex items-center justify-center text-xl bg-slate-800 text-white hover:bg-slate-700 rounded border ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool?.color === 'b' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-transparent'}`}>{getPieceSymbol(p, 'b')}</button>
//                   ))}
//                 </div>
//                 <div className="flex w-full gap-2 border-t pt-2 mt-1">
//                   <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold p-1 rounded hover:bg-red-50 text-red-600 ${selectedTool === 'TRASH' ? 'bg-red-100 ring-1 ring-red-500' : ''}`}><Trash2 size={14} /> Trash</button>
//                   <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 text-xs font-bold p-1 rounded hover:bg-gray-100 text-gray-600">Clear</button>
//                   <button onClick={() => { game.current.reset(); updateBoard() }} className="flex-1 text-xs font-bold p-1 rounded hover:bg-gray-100 text-gray-600">Reset</button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Sidebar: Notes */}
//           <div className="w-full md:w-[350px] bg-white border-l flex flex-col overflow-hidden shrink-0">
//             <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
//               <div>
//                 <h3 className="font-bold text-slate-800">{activeChapter?.title}</h3>
//                 <span className="text-xs font-bold text-slate-400 uppercase">Instructor Notes</span>
//               </div>
//               <button
//                 onClick={() => { game.current.load(activeChapter.fen); setBoardFen(activeChapter.fen); setSquares({}) }}
//                 className="p-2 hover:bg-white rounded-full text-slate-500 hover:text-orange-600 transition shadow-sm"
//                 title="Reset Board to Lesson Start"
//               >
//                 <RotateCcw size={16} />
//               </button>
//             </div>
//             <div className="p-6 overflow-y-auto flex-1 prose prose-slate">
//               <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm">
//                 {activeChapter?.content || "No detailed notes provided for this lesson."}
//               </p>
//             </div>

//             {/* NEW: Navigation Footer */}
//             <div className="p-4 border-t bg-slate-50 flex gap-2">
//               <button
//                 onClick={handlePrev}
//                 disabled={!hasPrev}
//                 className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition"
//               >
//                 <ChevronLeft size={16} /> Previous
//               </button>
//               <button
//                 onClick={handleNext}
//                 disabled={!hasNext}
//                 className="flex-1 py-2 px-3 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition shadow-sm"
//               >
//                 Next Lesson <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ==========================================
// // 3. HOMEWORK BROWSER (Assign All Added)
// // ==========================================
// function HomeworkBrowser({ onAssign }: { onAssign: (id: string, type: 'PUZZLE' | 'FOLDER', dueDate?: string, audioUrl?: string | null) => void }) {
//   const [currentStage, setCurrentStage] = useState<string | null>(null)
//   const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
//   const [content, setContent] = useState<{ folders: any[], puzzles: any[] }>({ folders: [], puzzles: [] })
//   const [loading, setLoading] = useState(false)
//   const [dueDate, setDueDate] = useState('')
//   const [audioUrl, setAudioUrl] = useState<string | null>(null)

//   useEffect(() => {
//     if (!currentStage) return
//     setLoading(true)
//     const parent = breadcrumbs[breadcrumbs.length - 1]
//     const url = parent
//       ? `/api/content?parentId=${parent.id}`
//       : `/api/content?stage=${currentStage}`

//     fetch(url)
//       .then(r => r.json())
//       .then(data => setContent({ folders: data.folders || [], puzzles: data.puzzles || [] }))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [currentStage, breadcrumbs])

//   if (!currentStage) {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(stage => (
//           <button key={stage} onClick={() => setCurrentStage(stage)} className="h-24 border rounded-lg bg-slate-50 hover:bg-orange-50 hover:border-orange-500 font-bold text-slate-600 shadow-sm transition-all flex flex-col items-center justify-center gap-2">
//             <Layers size={24} className="text-orange-400" />
//             {stage}
//           </button>
//         ))}
//       </div>
//     )
//   }

//   // Current folder ID for bulk assign
//   const currentFolderId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null

//   return (
//     <div>
//       <div className="flex flex-col gap-2 mb-4 border-b pb-2">
//         {/* Breadcrumbs */}
//         <div className="flex items-center gap-2 text-sm overflow-x-auto">
//           <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="font-bold text-gray-500 hover:text-black transition">Levels</button>
//           <ChevronRight size={14} className="text-gray-400" />
//           <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{currentStage}</span>
//           {breadcrumbs.map((b, i) => (
//             <div key={b.id} className="flex items-center gap-2">
//               <ChevronRight size={14} className="text-gray-400" />
//               <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="hover:underline whitespace-nowrap font-medium text-slate-700">{b.name}</button>
//             </div>
//           ))}
//         </div>

//         {/* Due Date Picker */}
//         <div className="flex flex-col md:flex-row items-center gap-4 bg-orange-50/50 p-3 rounded-lg border border-orange-100 mb-2">
//           <div className="flex items-center gap-2 grow">
//             <Clock size={16} className="text-orange-600" />
//             <span className="text-xs font-bold text-slate-600 uppercase">Set Deadline:</span>
//             <input
//               type="datetime-local"
//               className="text-sm border rounded px-2 py-1 focus:ring-2 ring-orange-200 outline-none flex-1"
//               value={dueDate}
//               onChange={(e) => setDueDate(e.target.value)}
//             />
//           </div>

//           {/* Bulk Assign Button (Only if we are inside a folder) */}
//           {currentFolderId && !loading && (content.puzzles.length > 0 || content.folders.length > 0) && (
//             <button
//               onClick={() => onAssign(currentFolderId, 'FOLDER', dueDate, audioUrl)}
//               className="bg-slate-800 text-white text-sm font-bold py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
//             >
//               <Folder size={16} /> Assign Folder
//             </button>
//           )}
//         </div>

//         <AudioRecorder onRecordingComplete={setAudioUrl} />
//       </div>

//       {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline text-orange-500" /></div> : (
//         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
//           {content.folders.length === 0 && content.puzzles.length === 0 && <p className="col-span-full text-center text-gray-400 py-8 italic">No content in this folder.</p>}

//           {/* FOLDERS */}
//           {content.folders.map(f => (
//             <div key={f.id} className="relative group bg-blue-50 border border-blue-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors h-32">
//               {/* Click main area to navigate */}
//               <div className="absolute inset-0 flex flex-col items-center justify-center z-0" onClick={() => setBreadcrumbs([...breadcrumbs, f])}>
//                 <Folder className="text-blue-500 mb-2" size={32} />
//                 <span className="text-xs font-bold text-center text-blue-900 px-2">{f.name}</span>
//               </div>
//               {/* Quick Assign Button for Folder */}
//               <button
//                 onClick={(e) => { e.stopPropagation(); onAssign(f.id, 'FOLDER', dueDate, audioUrl) }}
//                 className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
//                 title="Assign Folder"
//               >
//                 <Plus size={14} />
//               </button>
//             </div>
//           ))}

//           {/* PUZZLES */}
//           {content.puzzles.map(p => (
//             <div key={p.id} className="p-4 bg-white border rounded-lg flex flex-col items-center justify-center relative group hover:border-orange-500 transition-all shadow-sm h-32">
//               <FileText className="text-orange-500 mb-2" size={28} />
//               <span className="text-xs font-medium text-center truncate w-full text-slate-700">{p.title}</span>
//               <button
//                 onClick={() => onAssign(p.id, 'PUZZLE', dueDate, audioUrl)}
//                 className="absolute inset-0 bg-orange-600/95 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition duration-200 z-10"
//               >
//                 Assign
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ==========================================
// // 4. ANALYSIS VIEW
// // ==========================================
// function AnalysisView() {
//   const game = useRef(new Chess())
//   const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//   const [squares, setSquares] = useState<Record<string, any>>({})
//   const [orientation, setOrientation] = useState<'white' | 'black'>('white')
//   const [setupMode, setSetupMode] = useState(false)
//   const [selectedTool, setSelectedTool] = useState<Tool>(null)
//   const [boardWidth, setBoardWidth] = useState(600)
//   const boardContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (!boardContainerRef.current) return
//     const observer = new ResizeObserver(entries => {
//       for (let entry of entries) {
//         setBoardWidth(entry.contentRect.width)
//       }
//     })
//     observer.observe(boardContainerRef.current)
//     return () => observer.disconnect()
//   }, [])

//   const updateBoard = () => setFen(game.current.fen())

//   const toggleHighlight = (square: string) => {
//     setSquares((prev) => {
//       const newSquares = { ...prev }
//       if (!newSquares[square]) {
//         newSquares[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
//       } else if (newSquares[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') {
//         newSquares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
//       } else if (newSquares[square].backgroundColor === 'rgba(255, 0, 0, 0.4)') {
//         newSquares[square] = { backgroundColor: 'rgba(0, 0, 255, 0.4)' }
//       } else {
//         delete newSquares[square]
//       }
//       return newSquares
//     })
//   }

//   const onDrop = (source: string, target: string, piece: string) => {
//     if (setupMode) {
//       const boardPiece = game.current.get(source as any)
//       if (source === target) return false;
//       game.current.remove(source as any)
//       game.current.put(boardPiece, target as any)
//       updateBoard()
//       setSquares({})
//       return true
//     }
//     try {
//       const move = game.current.move({ from: source, to: target, promotion: 'q' })
//       if (!move) return false
//       setFen(game.current.fen())
//       setSquares({})
//       return true
//     } catch { return false }
//   }

//   const onSquareClick = (square: string) => {
//     if (setupMode && selectedTool) {
//       if (selectedTool === 'TRASH') {
//         game.current.remove(square as any)
//       } else {
//         game.current.put({ type: selectedTool.type as any, color: selectedTool.color }, square as any)
//       }
//       updateBoard()
//     }
//   }

//   const onSquareRightClick = (square: string) => {
//     if (setupMode) {
//       game.current.remove(square as any)
//       updateBoard()
//     } else {
//       toggleHighlight(square)
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
//       <div className="lg:col-span-8 flex justify-center items-start">
//         <div ref={boardContainerRef} className="w-full max-w-[650px] aspect-square border-4 border-slate-700 rounded-lg shadow-2xl relative bg-slate-800">
//           <Chessboard
//             position={fen}
//             onPieceDrop={onDrop}
//             onSquareClick={onSquareClick}
//             onSquareRightClick={onSquareRightClick}
//             customSquareStyles={squares}
//             boardOrientation={orientation}
//             arePiecesDraggable={true}
//             areArrowsAllowed={true}
//             animationDuration={200}
//             dropOffBoardAction={setupMode ? 'trash' : 'snapback'}
//             boardWidth={boardWidth}
//           />
//           {setupMode && (
//             <div className="absolute top-0 right-0 m-2 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded shadow-lg animate-pulse z-10 pointer-events-none">
//               SETUP MODE
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="lg:col-span-4 space-y-6">
//         <div className="bg-white p-6 rounded-xl border shadow-sm">
//           <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
//             <MousePointer2 className="text-orange-500" /> Analysis Tools
//           </h3>
//           <div className="space-y-3">
//             <div className="flex gap-2">
//               <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="flex-1 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 font-bold text-slate-600 transition">
//                 <RotateCcw size={18} /> Reset
//               </button>
//               <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="flex-1 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 font-bold text-slate-600 transition">
//                 <ArrowUpDown size={18} /> Flip
//               </button>
//             </div>

//             <button
//               onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
//               className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${setupMode
//                 ? 'bg-red-600 text-white shadow-inner ring-2 ring-offset-2 ring-red-600'
//                 : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md'
//                 }`}
//             >
//               <Settings size={18} /> {setupMode ? 'Exit Setup Mode' : 'Edit Board Position'}
//             </button>

//             <div className="mt-4">
//               <label className="text-xs font-bold text-slate-400 uppercase">Current FEN</label>
//               <input
//                 className="w-full mt-1 border p-2 rounded text-xs font-mono bg-slate-50 text-slate-600 select-all"
//                 value={fen}
//                 readOnly
//               />
//             </div>
//           </div>
//         </div>

//         {setupMode && (
//           <div className="bg-white p-6 rounded-xl border shadow-lg animate-in slide-in-from-top-4">
//             <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Piece Palette
//             </h4>
//             <p className="text-xs text-slate-500 mb-3">Select a piece then click a square. Right-click board to remove.</p>

//             <div className="flex justify-between gap-1 mb-2">
//               {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
//                 <button
//                   key={'w' + p}
//                   onClick={() => setSelectedTool({ type: p, color: 'w' })}
//                   className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center font-serif text-2xl bg-white text-black hover:bg-slate-50 transition ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'w' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-100'}`}
//                 >
//                   {getPieceSymbol(p, 'w')}
//                 </button>
//               ))}
//             </div>

//             <div className="flex justify-between gap-1 mb-4">
//               {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
//                 <button
//                   key={'b' + p}
//                   onClick={() => setSelectedTool({ type: p, color: 'b' })}
//                   className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center font-serif text-2xl bg-slate-800 text-white hover:bg-slate-700 transition ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'b' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-700'}`}
//                 >
//                   {getPieceSymbol(p, 'b')}
//                 </button>
//               ))}
//             </div>

//             <div className="flex gap-2 border-t pt-4">
//               <button
//                 onClick={() => setSelectedTool('TRASH')}
//                 className={`flex-1 py-2 border-2 border-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition ${selectedTool === 'TRASH' ? 'bg-red-100 border-red-500' : ''}`}
//               >
//                 <Trash2 size={18} /> Trash
//               </button>
//               <button
//                 onClick={() => { game.current.clear(); updateBoard() }}
//                 className="flex-1 py-2 border-2 border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50"
//               >
//                 Clear Board
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function getPieceSymbol(type: string, color: string) {
//   const symbols: any = {
//     w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
//     b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
//   }
//   return symbols[color][type]
// }


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
  Trophy, Target, Activity, BookOpen, Layers, Video, Menu, X
} from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'

// --- HELPER: MODAL ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-2 md:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 md:p-6 border-b shrink-0 bg-gray-50/50">
          <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto no-scrollbar">
          {children}
        </div>
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      {/* 
          Sticky Header: Adjusted top offset to sit below main navbar. 
          Standard desktop nav is approx 88px, mobile 72px.
      */}
      <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-[72px] md:top-[88px] xl:top-[100px] z-40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-100 shrink-0">C</div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Coach Panel</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Instructor: {session?.user?.name}</p>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1 rounded-xl shadow-inner overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'students', label: 'Students', icon: Users },
              { id: 'attendance', label: 'Attendance', icon: CheckCircle },
              { id: 'courses', label: 'Library', icon: BookOpen },
              { id: 'analysis', label: 'Analysis', icon: MousePointer2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-white shadow-md text-orange-600'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </nav>
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
      {/* Student List Sidebar */}
      <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border p-4 flex flex-col h-auto lg:h-[calc(100vh-220px)] overflow-hidden">
        <h2 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
          <Users size={16} /> Roster ({students.length})
        </h2>

        {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div> : (
          <div className="space-y-2 overflow-y-auto pr-1 no-scrollbar flex-1">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${selectedStudent?.id === s.id ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="font-black text-slate-800 uppercase tracking-tight text-sm">{s.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex justify-between items-center">
                  <span className="truncate max-w-[150px]">{s.email}</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{s.stage}</span>
                </div>
              </button>
            ))}
            {students.length === 0 && <div className="text-gray-400 text-xs font-bold text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed">No students found.</div>}
          </div>
        )}
      </div>

      {/* Student Detail View */}
      <div className="lg:col-span-8 h-full">
        {selectedStudent ? (
          <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none">{selectedStudent.name}</h2>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  Student Portal Active
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-100 transition-all active:scale-95"
              >
                <Plus size={18} /> Assign Tasks
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-1">Solved</span>
                <div className="text-2xl font-black text-green-800 flex items-center gap-2"><Trophy size={20} /> {totalSolved}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Success</span>
                <div className="text-2xl font-black text-blue-800 flex items-center gap-2"><Target size={20} /> {successRate}%</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-1">Activity</span>
                <div className="text-2xl font-black text-purple-800 flex items-center gap-2"><Activity size={20} /> {stats.length}</div>
              </div>
            </div>

            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4 border-b pb-2 flex items-center gap-2">
              <Clock size={14} /> Comprehensive Activity Log
            </h3>

            {loadingStats ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
                {stats.length === 0 && <p className="text-slate-400 font-bold text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">No training data recorded.</p>}

                {stats.map((stat) => (
                  <div key={stat.id} className="border border-slate-100 rounded-2xl p-4 md:p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-orange-100 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                      <span className="font-black text-slate-800 uppercase tracking-tight text-sm md:text-base">{stat.puzzle?.title || "Manual Exercise"}</span>
                      <span className={`w-max flex items-center gap-1 font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full border ${stat.isSolved ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {stat.isSolved ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {stat.isSolved ? 'Solved' : 'Unsolved'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2"><RotateCcw size={14} className="text-slate-300" /> {stat.attempts} Retries</div>
                      <div className="flex items-center gap-2"><Clock size={14} className="text-slate-300" /> {new Date(stat.lastPlayed).toLocaleDateString()}</div>
                    </div>

                    {stat.mistakes && Array.isArray(stat.mistakes) && stat.mistakes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 mb-2">Error Log</span>
                        <div className="flex flex-wrap gap-1.5">
                          {stat.mistakes.map((m: string, i: number) => (
                            <span key={i} className="text-[10px] bg-white text-red-600 px-2 py-0.5 rounded-lg border border-red-100 font-mono font-bold shadow-sm">{m}</span>
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
          <div className="h-full bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 min-h-[400px]">
            <Users className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-xs font-black uppercase tracking-widest">Select a student profile to begin</p>
          </div>
        )}
      </div>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Training Assignment: ${selectedStudent?.name}`}>
        <HomeworkBrowser onAssign={handleAssign} />
      </Modal>
    </div>
  )
}

// ==========================================
// 1.5 ATTENDANCE VIEW
// ==========================================
function AttendanceView({ coachId }: { coachId: string }) {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string, remarks: string }>>({})

  useEffect(() => {
    if (!coachId) return
    const fetchClasses = async () => {
      try {
        const res = await fetch(`/api/classes?coachId=${coachId}`)
        if (res.ok) {
          const data = await res.json()
          setClasses(data)
          if (data.length > 0 && !selectedClassId) {
            setSelectedClassId(data[0].id)
          }
        }
      } catch (e) { console.error(e) }
    }
    fetchClasses()
  }, [coachId])

  useEffect(() => {
    if (!selectedClassId || !date || classes.length === 0) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const currentClass = classes.find((c: any) => c.id === selectedClassId)
        if (currentClass) {
          setStudents(currentClass.students || [])
        }
        const attRes = await fetch(`/api/attendance?classTimingId=${selectedClassId}&date=${date}`)
        if (attRes.ok) {
          const attData = await attRes.json()
          const records: any = {}
          attData.forEach((r: any) => {
            records[r.studentId] = { status: r.status, remarks: r.remarks || '' }
          })
          setAttendanceRecords(records)
        } else { setAttendanceRecords({}) }
      } catch (e) { setAttendanceRecords({}) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [selectedClassId, date, classes])

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
        studentId, status: data.status, remarks: data.remarks
      }))
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classTimingId: selectedClassId, date, records })
      })
      if (res.ok) alert("Roll call published successfully!")
      else alert("Publishing failed")
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-600 text-white border-green-700'
      case 'ABSENT': return 'bg-red-600 text-white border-red-700'
      case 'LATE': return 'bg-yellow-500 text-white border-yellow-600'
      case 'LEAVE': return 'bg-blue-600 text-white border-blue-700'
      default: return 'bg-slate-100 text-slate-500 border-slate-200'
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <CheckCircle className="text-orange-500" /> Attendance Audit
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Manage your batch availability logs</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="p-3 border rounded-xl bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-700 outline-none focus:ring-2 ring-orange-100"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.startTime})</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-3 border rounded-xl bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-700 outline-none focus:ring-2 ring-orange-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>
      ) : (
        <div className="space-y-6">
          <div className="border border-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Engagement Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(s => {
                  const currentStatus = attendanceRecords[s.id]?.status || ''
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="font-black text-slate-800 uppercase tracking-tight text-sm">{s.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.email}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-1.5">
                          {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(s.id, status)}
                              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all border shadow-sm ${currentStatus === status
                                ? getStatusColor(status)
                                : 'bg-white text-slate-300 border-slate-100 hover:border-orange-200'
                                }`}
                              title={status}
                            >
                              {status[0]}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <input
                          value={attendanceRecords[s.id]?.remarks || ''}
                          onChange={(e) => setAttendanceRecords(prev => ({
                            ...prev,
                            [s.id]: { ...prev[s.id], remarks: e.target.value }
                          }))}
                          className="w-full p-3 border border-slate-100 rounded-xl text-xs bg-transparent outline-none focus:bg-white focus:border-orange-200"
                          placeholder="Note down observations..."
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {students.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest italic bg-slate-50/50">Batch is currently empty</div>}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={students.length === 0 || saving}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-100 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle size={18} />}
              Publish Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 2. COURSES VIEW
// ==========================================
function CoursesView() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [activeChapter, setActiveChapter] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const game = useRef(new Chess())
  const [boardFen, setBoardFen] = useState('start')
  const [squares, setSquares] = useState<Record<string, any>>({})
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [setupMode, setSetupMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool>(null)
  const [boardWidth, setBoardWidth] = useState(500)
  const boardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setBoardWidth(entry.contentRect.width)
      }
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses')
        if (res.ok) {
          const data = await res.json()
          setCourses(Array.isArray(data) ? data : [])
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    if (activeChapter) {
      try {
        game.current.load(activeChapter.fen)
        setBoardFen(activeChapter.fen)
        setSquares({})
        setSetupMode(false)
        setIsSidebarOpen(false) // Close sidebar on mobile when lesson selected
      } catch (e) {
        game.current.reset()
        setBoardFen('start')
      }
    }
  }, [activeChapter])

  const updateBoard = () => setBoardFen(game.current.fen())

  const currentChapterIndex = selectedCourse?.chapters?.findIndex((c: any) => c.id === activeChapter?.id) ?? -1
  const hasNext = currentChapterIndex !== -1 && currentChapterIndex < (selectedCourse?.chapters?.length || 0) - 1
  const hasPrev = currentChapterIndex > 0

  const handleNext = () => hasNext && setActiveChapter(selectedCourse.chapters[currentChapterIndex + 1])
  const handlePrev = () => hasPrev && setActiveChapter(selectedCourse.chapters[currentChapterIndex - 1])

  const onDrop = (source: string, target: string) => {
    if (setupMode) {
      const boardPiece = game.current.get(source as any)
      if (source === target || !boardPiece) return false;
      game.current.remove(source as any)
      game.current.put(boardPiece, target as any)
      updateBoard()
      return true
    }
    try {
      const move = game.current.move({ from: source, to: target, promotion: 'q' })
      if (!move) return false
      setBoardFen(game.current.fen())
      return true
    } catch { return false }
  }

  const onSquareClick = (square: string) => {
    if (setupMode && selectedTool) {
      if (selectedTool === 'TRASH') game.current.remove(square as any)
      else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
      updateBoard()
    }
  }

  const onSquareRightClick = (square: string) => {
    if (setupMode) {
      game.current.remove(square as any)
      updateBoard()
      return
    }
    setSquares((prev) => {
      const newSquares = { ...prev }
      const current = newSquares[square]
      if (!current) newSquares[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
      else if (current.backgroundColor === 'rgba(0, 255, 0, 0.4)') newSquares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
      else delete newSquares[square]
      return newSquares
    })
  }

  if (loading && !selectedCourse) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600 w-8 h-8" /></div>
  }

  if (!selectedCourse) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight flex items-center gap-3">
          <BookOpen className="text-orange-600" /> Teaching Library
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl transition-all group flex flex-col h-full border-b-4 hover:border-orange-200">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.level === 'BEGINNER' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                  {c.level}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.chapters?.length || 0} Modules</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tight leading-tight">{c.title}</h3>
              <p className="text-slate-400 text-xs font-medium mb-8 flex-1 line-clamp-3 leading-relaxed">{c.description || "Instructional curriculum module."}</p>
              <button
                onClick={() => { setSelectedCourse(c); if (c.chapters?.length > 0) setActiveChapter(c.chapters[0]) }}
                disabled={!c.chapters || c.chapters.length === 0}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-30"
              >
                Launch Classroom <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-[72px] md:top-[88px] xl:top-[100px] z-[45] bg-slate-50 flex flex-col animate-in fade-in">
      {/* Dynamic Classroom Header */}
      <div className="bg-slate-900 text-white p-3 md:p-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-2 md:gap-4 truncate">
          <button onClick={() => { setSelectedCourse(null); setActiveChapter(null) }} className="hover:bg-slate-800 p-2 rounded-xl transition active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <div className="truncate">
            <h2 className="font-black uppercase tracking-tight text-sm md:text-lg truncate">{selectedCourse.title}</h2>
            <p className="text-[9px] md:text-[10px] font-bold text-orange-400 uppercase tracking-widest">Active Classroom Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 hover:bg-slate-800 rounded-xl" title="Toggle Lesson List">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="p-2 hover:bg-slate-800 rounded-xl" title="Flip Board">
            <ArrowUpDown size={18} />
          </button>
          <button
            onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition active:scale-90 ${setupMode ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <Settings size={14} /> <span className="hidden sm:inline">{setupMode ? 'Lock' : 'Edit'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar: Lessons List (Overlay on mobile, fixed on desktop) */}
        <div className={`
          absolute inset-0 z-30 md:relative md:block md:w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Sequence</span>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {selectedCourse.chapters.map((chap: any, idx: number) => (
              <button
                key={chap.id}
                onClick={() => setActiveChapter(chap)}
                className={`w-full text-left p-4 border-b border-slate-50 transition-all flex items-center gap-4 ${activeChapter?.id === chap.id ? 'bg-orange-50/50 border-r-4 border-r-orange-500' : 'hover:bg-slate-50'}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${activeChapter?.id === chap.id ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                  {idx + 1}
                </span>
                <span className={`text-[11px] font-black uppercase tracking-tight truncate ${activeChapter?.id === chap.id ? 'text-slate-800' : 'text-slate-400'}`}>{chap.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Board + Notes */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Board Center Area */}
          <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div ref={boardContainerRef} className="w-full h-full flex justify-center items-center">
              <div className="aspect-square w-full max-w-[550px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-2xl border-4 border-white relative">
                <Chessboard
                  position={boardFen}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  customSquareStyles={squares}
                  boardOrientation={orientation}
                  arePiecesDraggable={true}
                  animationDuration={250}
                  boardWidth={boardWidth}
                />
                {setupMode && <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse z-10 shadow-xl">Setup Active</div>}
              </div>
            </div>

            {setupMode && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-6 z-20 w-[90%] sm:w-auto">
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                    <button key={'w' + p} onClick={() => setSelectedTool({ type: p, color: 'w' })} className={`w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-50 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool?.color === 'w' ? 'border-orange-500 bg-orange-50' : 'border-transparent'}`}>{getPieceSymbol(p, 'w')}</button>
                  ))}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                    <button key={'b' + p} onClick={() => setSelectedTool({ type: p, color: 'b' })} className={`w-10 h-10 flex items-center justify-center text-2xl bg-slate-900 text-white hover:bg-slate-800 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool?.color === 'b' ? 'border-orange-500 ring-2 ring-orange-500' : 'border-transparent'}`}>{getPieceSymbol(p, 'b')}</button>
                  ))}
                </div>
                <div className="flex w-full gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase p-2.5 rounded-xl border-2 transition-all ${selectedTool === 'TRASH' ? 'bg-red-50 border-red-500 text-red-600' : 'text-slate-400 border-transparent hover:bg-slate-50'}`}><Trash2 size={16} /> Trash</button>
                  <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 text-[10px] font-black uppercase p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Clear</button>
                  <button onClick={() => { game.current.reset(); updateBoard() }} className="flex-1 text-[10px] font-black uppercase p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Lecture Notes */}
          <div className="w-full lg:w-[380px] bg-white border-l border-slate-100 flex flex-col shrink-0">
            <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 leading-none truncate max-w-[200px]">{activeChapter?.title}</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Instructor Notes</span>
              </div>
              <button
                onClick={() => { game.current.load(activeChapter.fen); setBoardFen(activeChapter.fen); setSquares({}) }}
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-full transition shadow-sm border border-slate-100 active:scale-90"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 no-scrollbar">
              <p className="whitespace-pre-wrap text-slate-500 leading-relaxed text-sm font-medium">
                {activeChapter?.content || "Focus on board positions for this module."}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="py-4 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 transition active:scale-95"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="py-4 px-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 transition active:scale-95 shadow-xl shadow-slate-100"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. HOMEWORK BROWSER
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
    const url = parent ? `/api/content?parentId=${parent.id}` : `/api/content?stage=${currentStage}`
    fetch(url).then(r => r.json()).then(data => setContent({ folders: data.folders || [], puzzles: data.puzzles || [] })).catch(console.error).finally(() => setLoading(false))
  }, [currentStage, breadcrumbs])

  if (!currentStage) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
        {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map(stage => (
          <button key={stage} onClick={() => setCurrentStage(stage)} className="h-32 md:h-40 border-2 border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-3">
            <Layers size={32} className="text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{stage}</span>
          </button>
        ))}
      </div>
    )
  }

  const currentFolderId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black">Levels</button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap">{currentStage}</span>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.id}>
              <ChevronRight size={14} className="text-slate-300" />
              <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="text-[10px] font-black uppercase tracking-tight text-slate-800 whitespace-nowrap">{b.name}</button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 grow w-full">
              <Clock size={18} className="text-orange-500 shrink-0" />
              <input type="datetime-local" className="text-xs font-bold border-2 border-white bg-white rounded-xl px-4 py-2.5 focus:ring-2 ring-orange-100 outline-none flex-1 shadow-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            {currentFolderId && !loading && (
              <button onClick={() => onAssign(currentFolderId, 'FOLDER', dueDate, audioUrl)} className="w-full sm:w-auto bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-100">
                Assign Folder
              </button>
            )}
          </div>
          <AudioRecorder onRecordingComplete={setAudioUrl} />
        </div>
      </div>

      {loading ? <div className="text-center py-20"><Loader2 className="animate-spin text-orange-500" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto no-scrollbar p-1">
          {content.folders.map(f => (
            <div key={f.id} className="relative group bg-blue-50/50 border-2 border-blue-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-200 transition-all h-32 active:scale-95">
              <div className="flex flex-col items-center justify-center p-4 text-center" onClick={() => setBreadcrumbs([...breadcrumbs, f])}>
                <Folder className="text-blue-400 mb-2" size={32} />
                <span className="text-[10px] font-black uppercase tracking-tight text-blue-900 line-clamp-2">{f.name}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onAssign(f.id, 'FOLDER', dueDate, audioUrl) }} className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Plus size={16} />
              </button>
            </div>
          ))}
          {content.puzzles.map(p => (
            <div key={p.id} className="p-4 bg-white border-2 border-slate-50 rounded-2xl flex flex-col items-center justify-center relative group hover:border-orange-200 transition-all shadow-sm h-32 active:scale-95">
              <FileText className="text-orange-400 mb-2" size={28} />
              <span className="text-[10px] font-black uppercase tracking-tight text-center text-slate-700 line-clamp-2">{p.title}</span>
              <button onClick={() => onAssign(p.id, 'PUZZLE', dueDate, audioUrl)} className="absolute inset-0 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all">
                Assign Now
              </button>
            </div>
          ))}
          {content.folders.length === 0 && content.puzzles.length === 0 && <div className="col-span-full py-10 text-center text-slate-300 font-bold uppercase text-[10px]">Folder is empty</div>}
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
  const [boardWidth, setBoardWidth] = useState(600)
  const boardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setBoardWidth(entry.contentRect.width)
      }
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const updateBoard = () => setFen(game.current.fen())

  const onDrop = (source: string, target: string) => {
    if (setupMode) {
      const boardPiece = game.current.get(source as any)
      if (source === target || !boardPiece) return false;
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
      if (selectedTool === 'TRASH') game.current.remove(square as any)
      else game.current.put({ type: selectedTool.type as any, color: selectedTool.color }, square as any)
      updateBoard()
    }
  }

  const onSquareRightClick = (square: string) => {
    if (setupMode) {
      game.current.remove(square as any)
      updateBoard()
    } else {
      setSquares(prev => {
        const newSquares = { ...prev }
        if (!newSquares[square]) newSquares[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
        else if (newSquares[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') newSquares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
        else delete newSquares[square]
        return newSquares
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-8 flex justify-center items-start">
        <div ref={boardContainerRef} className="w-full max-w-[650px] aspect-square border-4 border-slate-800 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={squares}
            boardOrientation={orientation}
            arePiecesDraggable={true}
            boardWidth={boardWidth}
          />
          {setupMode && <div className="absolute top-4 right-4 bg-red-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-pulse z-10">Board Editor Active</div>}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-800 border-b border-slate-50 pb-4">
            <MousePointer2 className="text-orange-500" /> Interaction Console
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="py-3 px-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition active:scale-95 shadow-sm">
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="py-3 px-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition active:scale-95 shadow-sm">
              <ArrowUpDown size={16} /> Flip
            </button>
          </div>
          <button
            onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
            className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${setupMode ? 'bg-red-600 text-white shadow-red-100' : 'bg-slate-900 text-white shadow-slate-100'}`}
          >
            <Settings size={18} /> {setupMode ? 'Finish Position' : 'Customize Position'}
          </button>
        </div>

        {setupMode && (
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-2xl animate-in slide-in-from-top-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Piece Palette</h4>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div className="flex justify-center gap-1.5 flex-wrap mb-3">
              {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                <button key={'w' + p} onClick={() => setSelectedTool({ type: p, color: 'w' })} className={`w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-50 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'w' ? 'border-orange-500 bg-orange-50' : 'border-transparent'}`}>{getPieceSymbol(p, 'w')}</button>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 flex-wrap mb-6">
              {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                <button key={'b' + p} onClick={() => setSelectedTool({ type: p, color: 'b' })} className={`w-10 h-10 flex items-center justify-center text-2xl bg-slate-900 text-white hover:bg-slate-800 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'b' ? 'border-orange-500 ring-2 ring-orange-500' : 'border-transparent'}`}>{getPieceSymbol(p, 'b')}</button>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-50">
              <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedTool === 'TRASH' ? 'bg-red-50 border-2 border-red-500 text-red-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-red-50 hover:text-red-500'}`}><Trash2 size={16} /> Trash</button>
              <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Wipe Board</button>
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
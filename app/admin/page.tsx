// 'use client'
// import React, { useEffect, useState, useRef } from 'react'
// import { Chess } from 'chess.js'
// import { Chessboard } from 'react-chessboard'
// import {
//   Users, Folder, FileText, ChevronRight, Save, RotateCcw,
//   MousePointer2, Trash2, Plus, Edit, ArrowLeft, Check,
//   Play, Copy, Settings, ArrowUpDown, BookOpen, Video, List, Loader2,
//   MoreVertical, FolderInput, X, Search, Star, CheckSquare, Square, Pencil
// } from 'lucide-react'
// // --- TYPES ---
// type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null
// // --- REUSABLE COMPONENTS ---
// const Modal = ({ isOpen, onClose, title, children }: any) => {
//   if (!isOpen) return null
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
//         <div className="flex justify-between items-center p-4 border-b shrink-0">
//           <h3 className="text-xl font-bold text-slate-800">{title}</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
//             <X size={24} />
//           </button>
//         </div>
//         <div className="p-6">
//             {children}
//         </div>
//       </div>
//     </div>
//   )
// }
// const BoardSetupPalette = ({ selectedTool, setSelectedTool, onClear, onReset }: any) => {
//     const pieces = ['p', 'n', 'b', 'r', 'q', 'k']

//     return (
//         <div className="bg-white border rounded-xl p-3 shadow-sm select-none">
//             <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex justify-between">
//                 <span>White</span>
//                 <span>Black</span>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-3">
//                  <div className="flex gap-1 flex-wrap justify-center">
//                     {pieces.map(p => (
//                         <div
//                             key={'w'+p}
//                             onClick={() => setSelectedTool({ type: p, color: 'w' })}
//                             className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
//                             ${selectedTool?.type === p && selectedTool?.color === 'w' ? 'bg-orange-100 border-orange-500 scale-110' : ''}`}
//                         >
//                            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">
//                              {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
//                            </span>
//                         </div>
//                     ))}
//                  </div>

//                  <div className="flex gap-1 flex-wrap justify-center border-l pl-4">
//                     {pieces.map(p => (
//                         <div
//                             key={'b'+p}
//                             onClick={() => setSelectedTool({ type: p, color: 'b' })}
//                             className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
//                             ${selectedTool?.type === p && selectedTool?.color === 'b' ? 'bg-slate-200 border-slate-500 scale-110' : ''}`}
//                         >
//                            <span className="text-black pb-1">
//                              {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
//                            </span>
//                         </div>
//                     ))}
//                  </div>
//             </div>
//             <div className="border-t pt-3 flex gap-2">
//                 <button
//                     onClick={() => setSelectedTool('TRASH')}
//                     className={`flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-red-50 transition-colors ${selectedTool === 'TRASH' ? 'bg-red-100 text-red-600 ring-1 ring-red-500' : 'text-gray-500'}`}
//                 >
//                     <Trash2 size={16} />
//                     <span className="text-[10px] font-bold">TRASH</span>
//                 </button>
//                 <button onClick={onClear} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
//                     <Trash2 size={16} className="text-gray-400"/>
//                     <span className="text-[10px] font-bold">CLEAR</span>
//                 </button>
//                 <button onClick={onReset} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
//                     <RotateCcw size={16} className="text-gray-400"/>
//                     <span className="text-[10px] font-bold">RESET</span>
//                 </button>
//             </div>
//         </div>
//     )
// }
// // --- MAIN DASHBOARD ---
// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'puzzles' | 'analysis'>('users')
//   return (
//     <div className="min-h-screen bg-gray-50 text-slate-900 font-sans mt-[90px]">
//       <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 shadow-sm mb-12">
//         <div className="flex items-center gap-2 mb-4 md:mb-0">
//              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-orange-200 shadow-lg">C</div>
//              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Royal Rook Admin</h1>
//         </div>
//         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
//           {[
//             { id: 'users', label: 'Users', icon: Users },
//             { id: 'courses', label: 'Courses', icon: BookOpen },
//             { id: 'puzzles', label: 'Puzzles', icon: Folder },
//             { id: 'analysis', label: 'Analysis', icon: MousePointer2 }
//           ].map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id as any)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
//               ${activeTab === tab.id
//                 ? 'bg-slate-900 text-white shadow-md'
//                 : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
//             >
//               <tab.icon size={16} />
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </header>

//       <main className="p-4 md:p-6 max-w-7xl mx-auto pt-20">
//         {activeTab === 'users' && <UserManager />}
//         {activeTab === 'courses' && <CourseManager />}
//         {activeTab === 'puzzles' && <CurriculumManager />}
//         {activeTab === 'analysis' && <AnalysisBoard />}
//       </main>
//     </div>
//   )
// }
// // ==========================================
// // 1. USER MANAGER
// // ==========================================
// function UserManager() {
//     const [users, setUsers] = useState<any[]>([])
//     const [coaches, setCoaches] = useState<any[]>([])
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [loading, setLoading] = useState(true)
//     const [formData, setFormData] = useState<any>({ name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '' })
//     const [editingId, setEditingId] = useState<string | null>(null)

//     const fetchUsers = async () => {
//       setLoading(true)
//       try {
//         const res = await fetch('/api/admin/users')
//         const data = await res.json()
//         if (res.ok && Array.isArray(data)) {
//           const mappedUsers = data.map((u: any) => ({ ...u, status: u.status || 'ACTIVE' }))
//           setUsers(mappedUsers)
//           setCoaches(mappedUsers.filter((u: any) => u.role === 'COACH' || u.role === 'ADMIN'))
//         }
//       } catch (error) {
//         console.error("Failed to fetch users", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     useEffect(() => { fetchUsers() }, [])
//     const handleToggleStatus = async (user: any) => {
//         const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
//         const action = newStatus === 'BLOCKED' ? 'Block' : 'Activate'

//         if(!confirm(`Are you sure you want to ${action} ${user.name}?`)) return
//         try {
//             const res = await fetch('/api/admin/users', {
//                 method: 'PUT',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify({ id: user.id, status: newStatus })
//             })
//             if(res.ok) fetchUsers()
//             else alert("Failed to update status")
//         } catch(e) { console.error(e) }
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//       e.preventDefault()
//       const method = editingId ? 'PUT' : 'POST'
//       const payload = editingId ? { ...formData, id: editingId } : formData

//       try {
//           const res = await fetch('/api/admin/users', {
//               method,
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(payload)
//           })
//           if (res.ok) {
//               setIsModalOpen(false)
//               fetchUsers()
//               setFormData({ name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '' })
//           } else {
//               const err = await res.json()
//               alert(err.error || "Failed to save user")
//           }
//       } catch (e) { console.error(e) }
//     }

//     const handleDelete = async (id: string) => {
//         if(!confirm("Are you sure?")) return
//         try {
//             const res = await fetch('/api/admin/users', {
//                 method: 'DELETE',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify({ id })
//             })
//             if(res.ok) fetchUsers()
//         } catch(e) { console.error(e) }
//     }

//     const openEdit = (user: any) => {
//       setFormData({
//         name: user.name, email: user.email, role: user.role,
//         stage: user.stage, coachId: user.coachId || '', password: ''
//       })
//       setEditingId(user.id)
//       setIsModalOpen(true)
//     }

//     return (
//       <div className="bg-white rounded-xl shadow-sm border p-6">
//         <div className="flex justify-between mb-6">
//           <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-orange-600"/> Manage Users</h2>
//           <button onClick={() => { setEditingId(null); setIsModalOpen(true); setFormData({ name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '' }) }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow"><Plus size={16}/> Add User</button>
//         </div>

//         {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32}/></div> : (
//           <div className="overflow-x-auto rounded-lg border">
//               <table className="w-full text-left border-collapse">
//                   <thead className="bg-gray-50 border-b">
//                   <tr>
//                       <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
//                       <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
//                       <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
//                       <th className="p-4 text-sm font-semibold text-gray-600">Stage</th>
//                       <th className="p-4 text-sm font-semibold text-gray-600">Coach</th>
//                       <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
//                   </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                   {users.map(u => (
//                       <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.status === 'BLOCKED' ? 'bg-red-50' : ''}`}>
//                       <td className="p-4">
//                           <div className="font-bold text-gray-800">{u.name}</div>
//                           <div className="text-xs text-gray-500">{u.email}</div>
//                       </td>
//                       <td className="p-4">
//                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${u.status === 'BLOCKED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
//                               {u.status}
//                           </span>
//                       </td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'COACH' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
//                       <td className="p-4 text-sm">{u.role === 'STUDENT' ? u.stage : '-'}</td>
//                       <td className="p-4 text-sm text-blue-600">{u.coach?.name || '-'}</td>
//                       <td className="p-4 text-right flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => handleToggleStatus(u)}
//                             className={`p-2 rounded-full transition-colors ${u.status === 'BLOCKED' ? 'text-green-600 hover:bg-green-100' : 'text-red-400 hover:bg-red-100'}`}
//                             title={u.status === 'BLOCKED' ? 'Activate User' : 'Block User'}
//                           >
//                             {u.status === 'BLOCKED' ? <Check size={16}/> : <X size={16}/>}
//                           </button>
//                           <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"><Edit size={16}/></button>
//                           <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16}/></button>
//                       </td>
//                       </tr>
//                   ))}
//                   </tbody>
//               </table>
//           </div>
//         )}

//         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit User" : "Add User"}>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//                <div className="space-y-1">
//                    <label className="text-xs font-bold text-gray-500">Full Name</label>
//                    <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
//                </div>
//                <div className="space-y-1">
//                    <label className="text-xs font-bold text-gray-500">Email Address</label>
//                    <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
//                </div>
//             </div>

//             <div className="space-y-1">
//                 <label className="text-xs font-bold text-gray-500">Password</label>
//                 <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" type="password" placeholder={editingId ? "Leave blank to keep current" : "Secure Password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
//             </div>
//             <div className="space-y-1">
//                 <label className="text-xs font-bold text-gray-500">System Role</label>
//                 <select className="w-full border p-2 rounded bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
//                 <option value="STUDENT">Student</option>
//                 <option value="COACH">Coach</option>
//                 <option value="ADMIN">Admin</option>
//                 </select>
//             </div>
//             {formData.role === 'STUDENT' && (
//               <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
//                 <div>
//                     <label className="text-xs font-bold text-gray-500">Chess Level</label>
//                     <select className="w-full border p-2 rounded mt-1" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
//                     <option value="BEGINNER">Beginner</option>
//                     <option value="INTERMEDIATE">Intermediate</option>
//                     <option value="ADVANCED">Advanced</option>
//                     </select>
//                 </div>
//                 <div>
//                     <label className="text-xs font-bold text-gray-500">Assign Coach</label>
//                     <select className="w-full border p-2 rounded mt-1" value={formData.coachId} onChange={e => setFormData({...formData, coachId: e.target.value})}>
//                     <option value="">-- No Coach --</option>
//                     {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                     </select>
//                 </div>
//               </div>
//             )}
//             <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 shadow-lg mt-4 transition-all">
//                 {editingId ? 'Update User' : 'Create User'}
//             </button>
//           </form>
//         </Modal>
//       </div>
//     )
// }
// // ==========================================
// // 2. COURSE MANAGER
// // ==========================================
// function CourseManager() {
//   const [view, setView] = useState<'LIST' | 'EDIT_COURSE'>('LIST')
//   const [courses, setCourses] = useState<any[]>([])
//   const [editingCourse, setEditingCourse] = useState<any>(null)
//   const [loading, setLoading] = useState(false)

//   const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1)
//   const game = useRef(new Chess())
//   const [chapterFen, setChapterFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//   const [selectedTool, setSelectedTool] = useState<Tool>(null)
//   const fetchCourses = async () => {
//       setLoading(true)
//       try {
//         const res = await fetch('/api/courses')
//         if(res.ok) {
//             const data = await res.json()
//             setCourses(data)
//         }
//       } catch(e) { console.error(e) }
//       finally { setLoading(false) }
//   }
//   useEffect(() => { fetchCourses() }, [])
//   const handleCreateCourse = () => {
//     setEditingCourse({ title: '', description: '', level: 'BEGINNER', chapters: [] })
//     setView('EDIT_COURSE')
//     setActiveChapterIndex(-1)
//   }
//   const saveCourse = async () => {
//     try {
//         const res = await fetch('/api/courses', {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(editingCourse)
//         })
//         if(res.ok) {
//             alert('Course saved successfully!')
//             fetchCourses()
//             setView('LIST')
//         } else {
//             alert('Failed to save course')
//         }
//     } catch(e) { console.error(e); alert('Error saving course') }
//   }
//   const updateBoard = () => {
//     const fen = game.current.fen()
//     setChapterFen(fen)
//     if(activeChapterIndex > -1) {
//         const updatedChapters = [...editingCourse.chapters]
//         updatedChapters[activeChapterIndex] = { ...updatedChapters[activeChapterIndex], fen: fen }
//         setEditingCourse({ ...editingCourse, chapters: updatedChapters })
//     }
//   }
//   const onSquareClick = (square: string) => {
//     if (activeChapterIndex === -1 || !selectedTool) return
//     if (selectedTool === 'TRASH') game.current.remove(square)
//     else game.current.put({ type: selectedTool.type, color: selectedTool.color }, square)
//     updateBoard()
//   }
//   const onPieceDrop = (source: string, target: string, piece: string) => {
//     if (activeChapterIndex === -1) return false
//     const p = game.current.get(source)
//     if (!p) return false
//     game.current.remove(source)
//     game.current.put(p, target)
//     updateBoard()
//     return true
//   }
//   const onSquareRightClick = (square: string) => {
//     game.current.remove(square)
//     updateBoard()
//   }
//   if (view === 'LIST') {
//     return (
//       <div className="bg-white rounded-xl shadow-sm border p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><BookOpen className="text-orange-600"/> Courses</h2>
//           <button onClick={handleCreateCourse} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5">
//             <Plus size={18}/> Create Course
//           </button>
//         </div>

//         {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline"/></div> : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {courses.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">No courses found.</div>}
//             {courses.map(c => (
//                 <div key={c.id} className="border rounded-xl p-5 hover:shadow-lg transition-shadow bg-gray-50 flex flex-col justify-between h-48">
//                     <div>
//                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${c.level === 'BEGINNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{c.level}</span>
//                         <h3 className="text-xl font-bold text-slate-800 mt-2 mb-1">{c.title}</h3>
//                         <p className="text-sm text-gray-500">{c.chapters?.length || 0} Lessons</p>
//                     </div>
//                     <button onClick={() => { setEditingCourse(c); setView('EDIT_COURSE'); setActiveChapterIndex(-1); }} className="w-full mt-4 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 py-2 rounded font-bold text-sm flex items-center justify-center gap-2">
//                         <Edit size={14}/> Edit Course
//                     </button>
//                 </div>
//             ))}
//         </div>
//         )}
//       </div>
//     )
//   }
//   return (
//     <div className="bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col h-[85vh]">
//       <div className="bg-white border-b p-4 flex justify-between items-center shrink-0">
//         <div className="flex items-center gap-4">
//           <button onClick={() => setView('LIST')} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><ArrowLeft/></button>
//           <div>
//             <h2 className="text-lg font-bold text-slate-800">{editingCourse.title || 'New Course'}</h2>
//             <p className="text-xs text-slate-500">Course Editor</p>
//           </div>
//         </div>
//         <button onClick={saveCourse} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors">
//           <Save size={18}/> Save Changes
//         </button>
//       </div>
//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar */}
//         <div className="w-80 border-r bg-gray-50 flex flex-col shrink-0">
//             <div className="p-4 space-y-3">
//                 <label className="text-xs font-bold text-gray-400 uppercase">Settings</label>
//                 <input
//                     className="w-full border p-2 rounded bg-white focus:ring-2 ring-orange-200 outline-none"
//                     placeholder="Course Title"
//                     value={editingCourse.title}
//                     onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
//                 />
//                  <select className="w-full border p-2 rounded bg-white" value={editingCourse.level} onChange={e => setEditingCourse({...editingCourse, level: e.target.value})}>
//                     <option value="BEGINNER">Beginner</option>
//                     <option value="INTERMEDIATE">Intermediate</option>
//                     <option value="ADVANCED">Advanced</option>
//                  </select>

//                  <div className="flex justify-between items-center mt-6 mb-2">
//                      <span className="text-xs font-bold text-gray-400 uppercase">Chapters</span>
//                  </div>
//                  <button
//                     onClick={() => {
//                         const newChap = { title: 'New Lesson', content: '', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }
//                         const newChaps = [...editingCourse.chapters, newChap]
//                         setEditingCourse({ ...editingCourse, chapters: newChaps })
//                         setActiveChapterIndex(newChaps.length - 1)
//                         game.current.load(newChap.fen)
//                         setChapterFen(newChap.fen)
//                     }}
//                     className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 font-bold py-2 rounded hover:border-orange-400 hover:text-orange-500 transition-colors"
//                 >
//                     + Add Lesson
//                 </button>
//             </div>
//             <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
//                 {editingCourse.chapters.map((chap: any, idx: number) => (
//                     <div
//                         key={idx}
//                         onClick={() => { setActiveChapterIndex(idx); game.current.load(chap.fen); setChapterFen(chap.fen) }}
//                         className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all border
//                         ${activeChapterIndex === idx ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
//                     >
//                         <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeChapterIndex === idx ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{idx+1}</span>
//                         <div className="truncate text-sm font-medium text-slate-700">{chap.title || 'Untitled'}</div>
//                         <button
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 const newChaps = editingCourse.chapters.filter((_:any, i:number) => i !== idx);
//                                 setEditingCourse({...editingCourse, chapters: newChaps});
//                                 if(activeChapterIndex === idx) setActiveChapterIndex(-1);
//                             }}
//                             className="ml-auto text-gray-300 hover:text-red-500"
//                         ><Trash2 size={14}/></button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//         {/* Editor Area */}
//         <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
//            {activeChapterIndex !== -1 ? (
//                <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-8">
//                    <div className="lg:col-span-5 flex flex-col gap-4 h-full">
//                         <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full">
//                             <input
//                                 className="text-2xl font-bold bg-transparent border-b border-gray-100 focus:border-orange-500 outline-none pb-2 w-full mb-4 text-slate-800"
//                                 value={editingCourse.chapters[activeChapterIndex].title}
//                                 onChange={(e) => {
//                                     const newChaps = [...editingCourse.chapters]
//                                     newChaps[activeChapterIndex].title = e.target.value
//                                     setEditingCourse({...editingCourse, chapters: newChaps})
//                                 }}
//                                 placeholder="Lesson Title"
//                             />
//                             <div className="flex-1 flex flex-col">
//                                 <label className="text-xs font-bold text-gray-400 uppercase mb-2">Coach Notes / Script</label>
//                                 <textarea
//                                     className="flex-1 w-full border rounded-lg p-4 resize-none focus:ring-2 focus:ring-orange-500 outline-none text-sm leading-relaxed text-slate-600 bg-gray-50"
//                                     placeholder="Write instructions for the coach here..."
//                                     value={editingCourse.chapters[activeChapterIndex].content}
//                                     onChange={(e) => {
//                                         const newChaps = [...editingCourse.chapters]
//                                         newChaps[activeChapterIndex].content = e.target.value
//                                         setEditingCourse({...editingCourse, chapters: newChaps})
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                    </div>

//                    <div className="lg:col-span-7 flex flex-col gap-4">
//                         <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-200">
//                             <Chessboard
//                                 position={chapterFen}
//                                 onPieceDrop={onPieceDrop}
//                                 onSquareClick={onSquareClick}
//                                 onSquareRightClick={onSquareRightClick}
//                             />
//                         </div>
//                         <BoardSetupPalette
//                             selectedTool={selectedTool}
//                             setSelectedTool={setSelectedTool}
//                             onClear={() => { game.current.clear(); updateBoard() }}
//                             onReset={() => { game.current.reset(); updateBoard() }}
//                         />
//                    </div>
//                </div>
//            ) : (
//                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
//                    <Settings size={80} className="mb-4 text-gray-200"/>
//                    <p className="text-xl font-bold text-gray-400">Select a lesson from the sidebar to edit</p>
//                </div>
//            )}
//         </div>
//       </div>
//     </div>
//   )
// }



// // ==========================================
// // 4. PUZZLE CREATOR (Updated: Correct Star Saving)
// // ==========================================
// function PuzzleCreator({ folderId, onBack }: { folderId: string, onBack: () => void }) {
//     // Game Reference
//     const game = useRef(new Chess())

//     // State
//     const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//     const [manualFen, setManualFen] = useState(fen) // Text input state
//     const [moves, setMoves] = useState<string[]>([])
//     const [title, setTitle] = useState('')
//     const [mode, setMode] = useState<'SETUP'|'RECORD'>('SETUP')
//     const [selectedTool, setSelectedTool] = useState<Tool>(null)
//     const [startFen, setStartFen] = useState<string | null>(null)

//     // Stars State (Current visible stars)
//     const [stars, setStars] = useState<string[]>([])

//     // NEW: Store original stars layout when entering Record mode
//     const [initialStars, setInitialStars] = useState<string[]>([])

//     // PGN Import State
//     const [isPgnModalOpen, setIsPgnModalOpen] = useState(false)
//     const [pgnInput, setPgnInput] = useState('')

//     // Helper to extract active turn from FEN string (w or b)
//     const getTurnFromFen = (fenStr: string) => {
//         const parts = fenStr.split(' ')
//         return parts.length > 1 ? parts[1] : 'w'
//     }
//     const updateBoard = () => {
//         try {
//             setFen(game.current.fen())
//         } catch(e) {
//             // Chess.js might fail if position is invalid (no king).
//         }
//     }
//     // 1. Sync Manual Input when Board Changes
//     useEffect(() => {
//         setManualFen(fen)
//     }, [fen])
//     // 2. Handle Direct FEN Input
//     const handleManualFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const input = e.target.value
//         setManualFen(input)

//         try {
//             const result = game.current.load(input)
//             setFen(game.current.fen())
//         } catch (error) {
//             setFen(input)
//         }
//     }

//     // --- Toggle Side to Move (White/Black) ---
//     const toggleTurn = (color: 'w' | 'b') => {
//         if (mode !== 'SETUP') return
//         const parts = fen.split(' ')
//         if(parts.length >= 2) {
//             parts[1] = color
//             const newFen = parts.join(' ')
//             setFen(newFen)
//             try { game.current.load(newFen) } catch(e) {}
//         }
//     }
//     // --- Handle PGN Import ---
//     const handleImportPgn = () => {
//         try {
//             game.current.loadPgn(pgnInput)
//             const history = game.current.history()

//             if(history.length > 0) {
//                  while(game.current.undo() !== null) {}
//                  const initialFen = game.current.fen()
//                  setStartFen(initialFen)
//                  setFen(initialFen)
//                  setMoves(history)
//                  setMode('RECORD')
//                  alert(`Imported! ${history.length} moves loaded as solution.`)
//             } else {
//                  setFen(game.current.fen())
//             }
//             setIsPgnModalOpen(false)
//             setPgnInput('')
//         } catch (e) {
//             alert("Invalid PGN. Please check syntax.")
//         }
//     }

//     const toggleMode = () => {
//       if (mode === 'SETUP') {
//         const boardOnly = fen.split(" ")[0];
//         const hasKings = boardOnly.includes("K") && boardOnly.includes("k");

//         if (stars.length === 0 && !hasKings) {
//              if(!confirm("Board has missing kings. This will be treated as a custom exercise (non-standard chess). Continue?")) return;
//         }

//         // --- KEY FIX: Save the stars configuration before entering record mode ---
//         setInitialStars([...stars]);

//         setStartFen(fen)
//         setMoves([])
//         setMode('RECORD')
//         setSelectedTool(null)
//       } else {
//         setMode('SETUP')
//         setStartFen(null)
//         // Optionally restore stars to initial state if going back
//         setStars([...initialStars]) 
//       }
//     }

//     // --- Interaction Handlers ---
//     const onSquareRightClick = (square: string) => {
//         if (mode === 'SETUP') {
//             if (stars.includes(square)) {
//                 setStars(stars.filter(s => s !== square))
//             } else {
//                 setStars([...stars, square])
//             }
//         }
//     }

//     const onSquareClick = (square: string) => {
//       if (mode !== 'SETUP' || !selectedTool) return

//       if (stars.includes(square)) setStars(stars.filter(s => s !== square))

//       if (selectedTool === 'TRASH') {
//           game.current.remove(square)
//       } else {
//           game.current.put({ type: selectedTool.type, color: selectedTool.color }, square)
//       }
//       setFen(game.current.fen())
//     }

//     const onPieceDrop = (source: string, target: string, piece: string) => {
//       if (mode === 'SETUP') {
//         const p = game.current.get(source)
//         if(!p) return false
//         game.current.remove(source)
//         game.current.put(p, target)
//         setFen(game.current.fen())
//         return true
//       }

//       if (mode === 'RECORD') {
//         // 1. Check for Star Collection
//         if (stars.includes(target)) {
//             // Remove star from CURRENT VIEW ONLY
//             setStars(stars.filter(s => s !== target))

//             const p = game.current.get(source)
//             game.current.remove(source)
//             game.current.put(p, target)

//             setMoves([...moves, `${source}-${target}`])
//             setFen(game.current.fen())
//             return true
//         }
//         // 2. Standard Chess Move
//         try {
//           const move = game.current.move({ from: source, to: target, promotion: 'q' })
//           if (!move) return false
//           setMoves([...moves, move.san])
//           setFen(game.current.fen())
//           return true
//         } catch { return false }
//       }
//       return false
//     }

//     // Render Stars overlay
//     const customSquareStyles: Record<string, React.CSSProperties> = {}
//     stars.forEach(square => {
//         customSquareStyles[square] = {
//             backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iZ29sZCIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlnb24gcG9pbnRzPSIxMiAyIDE1LjA5IDguMjYgMjIgOS4yNyAxNyAxNC4xNCAxOC4xOCAyMS4wMiAxMiAxNyAxNyA1LjgyIDIxLjAyIDcgMTQuMTQgMiA5LjI3IDguOTEgOC4yNiAxMiAyIi8+PC9zdmc+")',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//             backgroundSize: '50%',
//         }
//     })

//     const savePuzzle = async () => {
//         if(!title || !startFen) return
//         try {
//             const res = await fetch('/api/content', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify({
//                     type: 'PUZZLE',
//                     title: title,
//                     fen: startFen,
//                     solution: moves.join(' '),
//                     parentId: folderId === 'root' ? null : folderId,
//                     // --- KEY FIX: Save initialStars, NOT current stars (which might be empty) ---
//                     data: { stars: initialStars } 
//                 })
//             })
//             if(res.ok) {
//                 alert("Puzzle Saved Successfully!")
//                 onBack()
//             } else {
//                 alert("Failed to save puzzle")
//             }
//         } catch(e) { console.error(e) }
//     }

//     return (
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl border h-full min-h-[600px]">
//         {/* Left: Board */}
//         <div className="lg:col-span-5 flex justify-center">
//           <div className={`w-full max-w-[500px] border-4 rounded-xl shadow-lg overflow-hidden transition-colors ${mode === 'RECORD' ? 'border-green-500' : 'border-blue-500'}`}>
//             <Chessboard
//                 position={fen}
//                 onPieceDrop={onPieceDrop}
//                 onSquareClick={onSquareClick}
//                 onSquareRightClick={onSquareRightClick}
//                 customSquareStyles={customSquareStyles}
//             />
//           </div>
//         </div>

//         {/* Right: Tools */}
//         <div className="lg:col-span-7 flex flex-col gap-6">
//           <div className="flex items-center gap-2 border-b pb-4 justify-between">
//              <div className="flex items-center gap-2">
//                 <button onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"><ArrowLeft size={20}/></button>
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">New Puzzle</h2>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                         <span className={`w-2 h-2 rounded-full ${mode === 'SETUP' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
//                         Step {mode === 'SETUP' ? '1: Setup Board' : '2: Play Solution'}
//                     </div>
//                 </div>
//              </div>

//              {/* PGN IMPORT BUTTON */}
//              {mode === 'SETUP' && (
//                  <button
//                     onClick={() => setIsPgnModalOpen(true)}
//                     className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
//                  >
//                     <FileText size={14}/> Import PGN
//                  </button>
//              )}
//           </div>

//           {mode === 'SETUP' && (
//             <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
//                <BoardSetupPalette
//                   selectedTool={selectedTool}
//                   setSelectedTool={setSelectedTool}
//                   onClear={() => { game.current.clear(); updateBoard() }}
//                   onReset={() => { game.current.reset(); updateBoard() }}
//                />
//                 {/* Instructions for Stars */}
//                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-center gap-2">
//                    <Star size={14} className="text-yellow-600 fill-yellow-600"/>
//                    <span><b>Right-Click</b> on a square to add/remove a Star target.</span>
//                </div>
//                {/* SIDE TO MOVE SELECTOR */}
//                <div className="bg-gray-50 p-4 rounded-xl border">
//                    <div className="flex justify-between items-center mb-2">
//                       <span className="text-xs font-bold text-gray-400 uppercase">Side to Move</span>
//                    </div>
//                    <div className="flex gap-2">
//                        <button
//                          onClick={() => toggleTurn('w')}
//                          className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
//                          ${getTurnFromFen(fen) === 'w' ? 'bg-white border-2 border-orange-500 text-orange-600 shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
//                        >
//                            <div className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-sm"></div> White
//                        </button>
//                        <button
//                          onClick={() => toggleTurn('b')}
//                          className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
//                          ${getTurnFromFen(fen) === 'b' ? 'bg-slate-800 border-2 border-slate-800 text-white shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
//                        >
//                            <div className="w-3 h-3 rounded-full bg-black shadow-sm"></div> Black
//                        </button>
//                    </div>
//                </div>
//                 {/* DIRECT FEN INPUT */}
//                 <div className="bg-gray-50 p-4 rounded-xl border">
//                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Direct FEN Input</label>
//                    <div className="flex gap-2">
//                        <input
//                           type="text"
//                           className="w-full border p-2 rounded text-sm font-mono text-slate-600 focus:ring-2 focus:ring-orange-500 outline-none"
//                           value={manualFen}
//                           onChange={handleManualFenChange}
//                           placeholder="Paste FEN string here..."
//                        />
//                        <button
//                         onClick={() => { navigator.clipboard.writeText(manualFen); alert("FEN Copied!") }}
//                         className="p-2 bg-white border rounded hover:bg-gray-100 text-gray-500"
//                         title="Copy FEN"
//                        >
//                           <Copy size={16}/>
//                        </button>
//                    </div>
//                </div>
//                <div className="mt-4 flex justify-end">
//                    <button onClick={toggleMode} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-black transition-all flex items-center gap-2">
//                        Next: Record Solution <ChevronRight size={18}/>
//                    </button>
//                </div>
//             </div>
//           )}

//           {mode === 'RECORD' && (
//              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
//                 <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
//                     <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2"><Play size={18}/> Recording Moves...</h3>
//                     <p className="text-sm text-green-700 mb-3">
//                         {stars.length > 0
//                             ? `Collect the stars! (${stars.length} remaining). Move pieces to star squares.`
//                             : "Play the solution on the board. The computer opponent moves will be auto-calculated later."}
//                     </p>
//                     <div className="bg-white p-4 rounded-lg font-mono text-lg min-h-[60px] shadow-inner border border-green-100 break-words">
//                         {moves.length > 0 ? moves.join(' ') : <span className="text-gray-300">Make a move...</span>}
//                     </div>
//                 </div>

//                 <div className="flex gap-3">
//                     <button onClick={() => {
//                         // Undo is complex with custom moves, simple reload for now
//                         game.current.load(startFen!);
//                         setFen(startFen!);
//                         setMoves([]);
//                         // RESTORE INITIAL STARS ON RESET
//                         setStars([...initialStars]);
//                     }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700 flex items-center gap-2">
//                         <RotateCcw size={16}/> Reset
//                     </button>
//                 </div>
//                 <div className="pt-6 border-t mt-6 space-y-4">
//                     <input className="w-full text-lg border-2 border-gray-200 rounded-lg p-3 font-bold focus:border-orange-500 outline-none" placeholder="Puzzle Title (e.g. Knight Star Hunt)" value={title} onChange={e => setTitle(e.target.value)} />
//                     <div className="flex gap-4">
//                         <button onClick={toggleMode} className="px-6 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Back to Setup</button>
//                         <button onClick={savePuzzle} disabled={moves.length === 0} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all">
//                             Save Puzzle
//                         </button>
//                     </div>
//                 </div>
//              </div>
//           )}
//           {/* PGN Modal */}
//           <Modal isOpen={isPgnModalOpen} onClose={() => setIsPgnModalOpen(false)} title="Import PGN">
//               <div className="space-y-4">
//                   <p className="text-sm text-gray-500">Paste a PGN (Portable Game Notation) string below. If the PGN contains moves, they will be automatically loaded as the puzzle solution.</p>
//                   <textarea
//                     className="w-full h-40 border rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none"
//                     placeholder={`[Event "Casual Game"]\n[Site "Berlin GER"]\n...\n\n1. e4 e5 2. Nf3 Nc6...`}
//                     value={pgnInput}
//                     onChange={(e) => setPgnInput(e.target.value)}
//                   />
//                   <div className="flex justify-end gap-2">
//                       <button onClick={() => setIsPgnModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
//                       <button onClick={handleImportPgn} className="px-6 py-2 bg-slate-900 text-white rounded font-bold hover:bg-black">Import</button>
//                   </div>
//               </div>
//           </Modal>
//         </div>
//       </div>
//     )
// }
// // ==========================================
// // 5. ANALYSIS BOARD
// // ==========================================
// function AnalysisBoard() {
//     const game = useRef(new Chess())
//     const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//     const [squares, setSquares] = useState<Record<string, any>>({})
//     const [orientation, setOrientation] = useState<'white'|'black'>('white')
//     const [setupMode, setSetupMode] = useState(false)
//     const [selectedTool, setSelectedTool] = useState<Tool>(null)

//     const updateBoard = () => setFen(game.current.fen())

//     // Clear highlights when a piece moves or is placed
//     const clearHighlight = (square: string) => {
//       setSquares((prev) => {
//         if (prev[square]) {
//           const newSquares = { ...prev }
//           delete newSquares[square]
//           return newSquares
//         }
//         return prev
//       })
//     }

//     const onPieceDrop = (source: string, target: string, piece: string) => {
//       if (setupMode) {
//         const p = game.current.get(source)
//         if(!p) return false
//         game.current.remove(source)
//         game.current.put(p, target)
//         updateBoard()
//         clearHighlight(target)
//         return true
//       }
//       try {
//         const move = game.current.move({ from: source, to: target, promotion: 'q' })
//         if (!move) return false
//         setFen(game.current.fen())
//         clearHighlight(target)
//         return true
//       } catch { return false }
//     }

//     const onSquareClick = (square: string) => {
//       if (setupMode && selectedTool) {
//          if (selectedTool === 'TRASH') game.current.remove(square)
//          else game.current.put({ type: selectedTool.type, color: selectedTool.color }, square)
//          updateBoard()
//          clearHighlight(square)
//       }
//     }

//     // Right click for colored highlights (Analysis specific feature)
//     const onSquareRightClick = (square: string) => {
//       if (!setupMode) {
//          setSquares(prev => {
//           const s = { ...prev }
//           // Toggle Green -> Yellow -> Off
//           if (!s[square]) s[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
//           else if (s[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') s[square] = { background: 'radial-gradient(circle, gold 20%, transparent 30%)', backgroundColor: 'rgba(0, 0, 0, 0)' }
//           else delete s[square]
//           return s
//         })
//       }
//     }

//     return (
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl shadow-sm border">
//         <div className="lg:col-span-8 flex justify-center">
//           <div className="w-[600px] h-[600px] border-4 border-slate-700 rounded shadow-2xl relative">
//             <Chessboard
//               position={fen}
//               onPieceDrop={onPieceDrop}
//               onSquareClick={onSquareClick}
//               onSquareRightClick={onSquareRightClick}
//               customSquareStyles={squares}
//               boardOrientation={orientation}
//               arePiecesDraggable={true}
//             />
//             {setupMode && <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse">SETUP MODE</div>}
//           </div>
//         </div>

//         <div className="lg:col-span-4 space-y-6">
//           <div>
//             <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800"><MousePointer2 className="text-orange-500"/> Analysis Tools</h3>
//             <div className="flex gap-2 mb-4">
//                <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="flex-1 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"><RotateCcw size={16}/> Reset</button>
//                <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="flex-1 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"><ArrowUpDown size={16}/> Flip</button>
//             </div>
//             <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }} className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors ${setupMode ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
//                <Settings size={16}/> {setupMode ? 'Exit Setup Mode' : 'Edit Board Position'}
//             </button>
//           </div>

//           {setupMode && (
//             <div className="border-t pt-4 animate-in fade-in slide-in-from-top-4">
//                <BoardSetupPalette
//                   selectedTool={selectedTool}
//                   setSelectedTool={setSelectedTool}
//                   onClear={() => { game.current.clear(); updateBoard() }}
//                   onReset={() => { game.current.reset(); updateBoard() }}
//                />
//             </div>
//           )}
//         </div>
//       </div>
//     )
// }

// function CurriculumManager() {
//     const [currentStage, setCurrentStage] = useState<string | null>(null)
//     const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
//     const [content, setContent] = useState<{folders: any[], puzzles: any[]}>({ folders: [], puzzles: [] })
//     const [view, setView] = useState<'BROWSE' | 'CREATE_PUZZLE'>('BROWSE')
//     const [refreshTrigger, setRefreshTrigger] = useState(0)
//     const [moveModalOpen, setMoveModalOpen] = useState(false)
//     const [movingItem, setMovingItem] = useState<{id: string, type: 'FOLDER' | 'PUZZLE'} | null>(null)
//     const [availableFolders, setAvailableFolders] = useState<any[]>([])
//     const [newFolderName, setNewFolderName] = useState('')

//     // --- NEW: State for Editing Puzzles ---
//     const [editingPuzzleData, setEditingPuzzleData] = useState<any>(null)

//     // Multi-Select State
//     const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

//     // 1. Fetch Content
//     useEffect(() => {
//         if (!currentStage) return

//         const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
//         const params = new URLSearchParams()
//         if (parentId) params.append('parentId', parentId)
//         else params.append('stage', currentStage)
//         fetch(`/api/content?${params.toString()}`)
//             .then(res => res.json())
//             .then(data => {
//                 if(data) {
//                     setContent({ folders: data.folders || [], puzzles: data.puzzles || [] })
//                     setSelectedItems(new Set()) // Clear selection on navigate
//                 }
//             })
//             .catch(console.error)
//     }, [currentStage, breadcrumbs, refreshTrigger])

//     // 2. Actions
//     const handleDelete = async (id: string, type: string) => {
//         if(!confirm(`Delete this ${type.toLowerCase()}? This cannot be undone.`)) return
//         try {
//             const res = await fetch(`/api/content`, {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id, type })
//             })
//             if(res.ok) setRefreshTrigger(p => p+1)
//         } catch(e) { console.error(e) }
//     }

//     // Bulk Delete
//     const handleBulkDelete = async () => {
//         if(!confirm(`Delete ${selectedItems.size} items? This cannot be undone.`)) return

//         const promises = Array.from(selectedItems).map(id => {
//             // Find item type
//             const isFolder = content.folders.some(f => f.id === id)
//             const type = isFolder ? 'FOLDER' : 'PUZZLE'
//             return fetch(`/api/content`, {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id, type })
//             })
//         })
//         await Promise.all(promises)
//         setRefreshTrigger(p => p + 1)
//         setSelectedItems(new Set())
//     }

//     const toggleSelection = (id: string) => {
//         const newSet = new Set(selectedItems)
//         if(newSet.has(id)) newSet.delete(id)
//         else newSet.add(id)
//         setSelectedItems(newSet)
//     }

//     const prepareMove = async (item: any, type: 'FOLDER' | 'PUZZLE') => {
//         setMovingItem({ id: item.id, type })
//         // Fetch valid destination folders
//         try {
//             const res = await fetch('/api/content/folders')
//             if(res.ok) {
//                 const folders = await res.json()
//                 setAvailableFolders([{id: 'root', name: 'Root Level'}, ...folders])
//             }
//         } catch(e) { console.error(e) }
//         setMoveModalOpen(true)
//     }

//     const handleMoveSubmit = async (targetFolderId: string) => {
//         if(!movingItem) return
//         try {
//             const res = await fetch('/api/content/move', {
//                 method: 'PUT',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify({ itemId: movingItem.id, targetFolderId })
//             })
//             if(res.ok) {
//                 setMoveModalOpen(false)
//                 setMovingItem(null)
//                 setRefreshTrigger(p => p+1)
//             } else {
//                 alert("Move failed")
//             }
//         } catch(e) { console.error(e) }
//     }

//     const createFolder = async () => {
//         if(!newFolderName) return
//         const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
//         try {
//             const res = await fetch('/api/content', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify({
//                     type: 'FOLDER',
//                     name: newFolderName,
//                     stage: !parentId ? currentStage : null,
//                     parentId: parentId
//                 })
//             })
//             if(res.ok) {
//                 setNewFolderName('')
//                 setRefreshTrigger(p => p+1)
//             }
//         } catch(e) { console.error(e) }
//     }

//     // --- NEW: Edit Puzzle Logic ---
//     const handleEditPuzzle = (puzzle: any) => {
//         setEditingPuzzleData(puzzle)
//         setView('CREATE_PUZZLE')
//     }

//     // --- CARD COMPONENT ---
//     const ItemCard = ({ item, type }: { item: any, type: 'FOLDER' | 'PUZZLE' }) => {
//         const [showMenu, setShowMenu] = useState(false)
//         const isSelected = selectedItems.has(item.id)

//         return (
//             <div
//                 className={`relative group h-36 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg
//                 ${isSelected ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : type === 'FOLDER' ? 'bg-blue-50 border-blue-100 hover:border-blue-300' : 'bg-white border-gray-100 hover:border-orange-300'}`}
//                 onClick={() => {
//                     if(selectedItems.size > 0) toggleSelection(item.id)
//                     else if(type === 'FOLDER') setBreadcrumbs([...breadcrumbs, item])
//                 }}
//             >
//                 {/* Selection Checkbox */}
//                 <div className="absolute top-2 left-2 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id) }}>
//                     {isSelected ? <CheckSquare className="text-orange-600"/> : <Square className="text-gray-300 hover:text-gray-500"/>}
//                 </div>
//                 <div className="absolute top-2 right-2">
//                     <button
//                         onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
//                         className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                         <MoreVertical size={16}/>
//                     </button>
//                     {showMenu && (
//                         <div className="absolute right-0 top-6 bg-white shadow-xl border rounded-lg w-32 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
//                             {type === 'PUZZLE' && (
//                                 <button onClick={() => handleEditPuzzle(item)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-slate-700">
//                                     <Pencil size={12}/> Edit
//                                 </button>
//                             )}
//                             <button onClick={() => prepareMove(item, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-slate-700">
//                                 <FolderInput size={12}/> Move
//                             </button>
//                             <button onClick={() => handleDelete(item.id, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 flex items-center gap-2">
//                                 <Trash2 size={12}/> Delete
//                             </button>
//                         </div>
//                     )}
//                     {showMenu && <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); setShowMenu(false)}} />}
//                 </div>
//                 {type === 'FOLDER' ? <Folder className="w-10 h-10 text-blue-500 mb-2"/> : <FileText className="w-8 h-8 text-orange-500 mb-2"/>}
//                 <span className={`font-bold text-sm px-4 text-center truncate w-full ${type === 'FOLDER' ? 'text-blue-900' : 'text-slate-700'}`}>
//                     {type === 'FOLDER' ? item.name : item.title}
//                 </span>
//             </div>
//         )
//     }

//     if (view === 'CREATE_PUZZLE') {
//         const parent = breadcrumbs[breadcrumbs.length - 1]
//         return <PuzzleCreator 
//             folderId={parent?.id || 'root'} 
//             existingPuzzle={editingPuzzleData} // Pass the data to edit
//             onBack={() => { 
//                 setView('BROWSE'); 
//                 setRefreshTrigger(p=>p+1); 
//                 setEditingPuzzleData(null); // Reset after edit
//             }} 
//         />
//     }

//     if (!currentStage) {
//         return (
//             <div className="bg-white rounded-xl shadow-sm border p-8 min-h-[500px]">
//                 <h2 className="text-2xl font-bold mb-8 text-slate-800">Select Difficulty Level</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(stage => (
//                         <button key={stage} onClick={() => setCurrentStage(stage)} className="h-48 group relative overflow-hidden bg-white border-2 hover:border-orange-500 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4">
//                             <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"/>
//                             <div className="relative z-10 p-4 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform"><Folder size={32}/></div>
//                             <span className="relative z-10 text-xl font-bold text-slate-700">{stage}</span>
//                         </button>
//                     ))}
//                 </div>
//             </div>
//         )
//     }
//     return (
//         <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[600px] flex flex-col">
//             <div className="flex items-center gap-2 mb-8 pb-4 border-b justify-between">
//                 <div className="flex items-center gap-2">
//                     <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="font-bold text-gray-400 hover:text-black transition-colors">Levels</button>
//                     <ChevronRight size={16} className="text-gray-300"/>
//                     <span className="font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded">{currentStage}</span>
//                     {breadcrumbs.map((b, i) => (
//                         <div key={b.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
//                             <ChevronRight size={16} className="text-gray-300"/>
//                             <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i+1))} className="hover:bg-gray-100 px-2 py-1 rounded font-medium text-slate-700">{b.name}</button>
//                         </div>
//                     ))}
//                 </div>
//                 {selectedItems.size > 0 && (
//                     <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors animate-in fade-in">
//                         <Trash2 size={14}/> Delete Selected ({selectedItems.size})
//                     </button>
//                 )}
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-auto">
//                 {/* Folder Creation Input */}
//                 <div className="h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 gap-2">
//                     <input
//                         className="w-full text-center border-b focus:border-orange-500 outline-none pb-1 text-sm bg-transparent"
//                         placeholder="New Folder Name"
//                         value={newFolderName}
//                         onChange={e => setNewFolderName(e.target.value)}
//                         onKeyDown={e => e.key === 'Enter' && createFolder()}
//                     />
//                     <button onClick={createFolder} disabled={!newFolderName} className="bg-slate-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50">Create</button>
//                 </div>

//                 {content.folders.map(f => <ItemCard key={f.id} item={f} type="FOLDER" />)}
//                 {content.puzzles.map(p => <ItemCard key={p.id} item={p} type="PUZZLE" />)}
//             </div>
//             <div className="border-t pt-6 mt-6 flex justify-end">
//                  <button onClick={() => { setEditingPuzzleData(null); setView('CREATE_PUZZLE'); }} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 font-bold">
//                      <Plus size={20}/> New Puzzle
//                  </button>
//             </div>
//             <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Move to Folder">
//                 <div className="space-y-2">
//                     <p className="text-sm text-gray-500 mb-2">Select destination:</p>
//                     <div className="max-h-60 overflow-y-auto border rounded-lg divide-y bg-gray-50">
//                         {availableFolders.map(folder => (
//                             <button
//                                 key={folder.id}
//                                 onClick={() => handleMoveSubmit(folder.id)}
//                                 className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors"
//                             >
//                                 <Folder size={16} className="text-blue-400"/>
//                                 {folder.name}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     )
// }


'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import {
    Users, Folder, FileText, ChevronRight, Save, RotateCcw,
    MousePointer2, Trash2, Plus, Edit, ArrowLeft, Check,
    Play, Copy, Settings, ArrowUpDown, BookOpen, Video, List, Loader2,
    MoreVertical, FolderInput, X, Search, Star, CheckSquare, Square, Pencil
} from 'lucide-react'

// --- TYPES ---
type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

// --- REUSABLE COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

const BoardSetupPalette = ({ selectedTool, setSelectedTool, onClear, onReset }: any) => {
    const pieces = ['p', 'n', 'b', 'r', 'q', 'k']

    return (
        <div className="bg-white border rounded-xl p-3 shadow-sm select-none">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex justify-between">
                <span>White</span>
                <span>Black</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex gap-1 flex-wrap justify-center">
                    {pieces.map(p => (
                        <div
                            key={'w' + p}
                            onClick={() => setSelectedTool({ type: p, color: 'w' })}
                            className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
                            ${selectedTool?.type === p && selectedTool?.color === 'w' ? 'bg-orange-100 border-orange-500 scale-110' : ''}`}
                        >
                            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">
                                {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-1 flex-wrap justify-center border-l pl-4">
                    {pieces.map(p => (
                        <div
                            key={'b' + p}
                            onClick={() => setSelectedTool({ type: p, color: 'b' })}
                            className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
                            ${selectedTool?.type === p && selectedTool?.color === 'b' ? 'bg-slate-200 border-slate-500 scale-110' : ''}`}
                        >
                            <span className="text-black pb-1">
                                {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t pt-3 flex gap-2">
                <button
                    onClick={() => setSelectedTool('TRASH')}
                    className={`flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-red-50 transition-colors ${selectedTool === 'TRASH' ? 'bg-red-100 text-red-600 ring-1 ring-red-500' : 'text-gray-500'}`}
                >
                    <Trash2 size={16} />
                    <span className="text-[10px] font-bold">TRASH</span>
                </button>
                <button onClick={onClear} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
                    <Trash2 size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold">CLEAR</span>
                </button>
                <button onClick={onReset} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
                    <RotateCcw size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold">RESET</span>
                </button>
            </div>
        </div>
    )
}

// --- MAIN DASHBOARD ---
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'puzzles' | 'analysis'>('users')
    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans mt-[90px]">
            <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 shadow-sm mb-12">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-orange-200 shadow-lg">C</div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Royal Rook Admin</h1>
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {[
                        { id: 'users', label: 'Users', icon: Users },
                        { id: 'courses', label: 'Courses', icon: BookOpen },
                        { id: 'puzzles', label: 'Puzzles', icon: Folder },
                        { id: 'analysis', label: 'Analysis', icon: MousePointer2 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="p-4 md:p-6 max-w-7xl mx-auto pt-20">
                {activeTab === 'users' && <UserManager />}
                {activeTab === 'courses' && <CourseManager />}
                {activeTab === 'puzzles' && <CurriculumManager />}
                {activeTab === 'analysis' && <AnalysisBoard />}
            </main>
        </div>
    )
}

// ==========================================
// 1. USER MANAGER
// ==========================================
function UserManager() {
    const [users, setUsers] = useState<any[]>([])
    const [coaches, setCoaches] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<any>({ name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '' })
    const [editingId, setEditingId] = useState<string | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (res.ok && Array.isArray(data)) {
                const mappedUsers = data.map((u: any) => ({ ...u, status: u.status || 'ACTIVE' }))
                setUsers(mappedUsers)
                setCoaches(mappedUsers.filter((u: any) => u.role === 'COACH' || u.role === 'ADMIN'))
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])
    const handleToggleStatus = async (user: any) => {
        const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
        const action = newStatus === 'BLOCKED' ? 'Block' : 'Activate'

        if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, status: newStatus })
            })
            if (res.ok) fetchUsers()
            else alert("Failed to update status")
        } catch (e) { console.error(e) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingId ? 'PUT' : 'POST'
        const payload = editingId ? { ...formData, id: editingId } : formData

        try {
            const res = await fetch('/api/admin/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setIsModalOpen(false)
                fetchUsers()
                setFormData({ name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '' })
            } else {
                const err = await res.json()
                alert(err.error || "Failed to save user")
            }
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            if (res.ok) fetchUsers()
        } catch (e) { console.error(e) }
    }

    const openEdit = (user: any) => {
        setFormData({
            name: user.name, email: user.email, role: user.role,
            stage: user.stage, coachId: user.coachId || '', password: ''
        })
        setEditingId(user.id)
        setIsModalOpen(true)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-orange-600" /> Manage Users</h2>
                <button onClick={() => { setEditingId(null); setIsModalOpen(true); setFormData({ name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '' }) }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow"><Plus size={16} /> Add User</button>
            </div>

            {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div> : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Stage</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Coach</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(u => (
                                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.status === 'BLOCKED' ? 'bg-red-50' : ''}`}>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{u.name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${u.status === 'BLOCKED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'COACH' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                                    <td className="p-4 text-sm">{u.role === 'STUDENT' ? u.stage : '-'}</td>
                                    <td className="p-4 text-sm text-blue-600">{u.coach?.name || '-'}</td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(u)}
                                            className={`p-2 rounded-full transition-colors ${u.status === 'BLOCKED' ? 'text-green-600 hover:bg-green-100' : 'text-red-400 hover:bg-red-100'}`}
                                            title={u.status === 'BLOCKED' ? 'Activate User' : 'Block User'}
                                        >
                                            {u.status === 'BLOCKED' ? <Check size={16} /> : <X size={16} />}
                                        </button>
                                        <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit User" : "Add User"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">Full Name</label>
                            <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">Email Address</label>
                            <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Password</label>
                        <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" type="password" placeholder={editingId ? "Leave blank to keep current" : "Secure Password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">System Role</label>
                        <select className="w-full border p-2 rounded bg-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                            <option value="STUDENT">Student</option>
                            <option value="COACH">Coach</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    {formData.role === 'STUDENT' && (
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Chess Level</label>
                                <select className="w-full border p-2 rounded mt-1" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Assign Coach</label>
                                <select className="w-full border p-2 rounded mt-1" value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })}>
                                    <option value="">-- No Coach --</option>
                                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 shadow-lg mt-4 transition-all">
                        {editingId ? 'Update User' : 'Create User'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

// ==========================================
// 2. COURSE MANAGER
// ==========================================
function CourseManager() {
    const [view, setView] = useState<'LIST' | 'EDIT_COURSE'>('LIST')
    const [courses, setCourses] = useState<any[]>([])
    const [editingCourse, setEditingCourse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1)
    const game = useRef(new Chess())
    const [chapterFen, setChapterFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    const [selectedTool, setSelectedTool] = useState<Tool>(null)

    const fetchCourses = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/courses')
            if (res.ok) {
                const data = await res.json()
                setCourses(data)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }
    useEffect(() => { fetchCourses() }, [])

    const handleCreateCourse = () => {
        setEditingCourse({ title: '', description: '', level: 'BEGINNER', chapters: [] })
        setView('EDIT_COURSE')
        setActiveChapterIndex(-1)
    }

    // --- NEW: Delete Course Functionality ---
    const handleDeleteCourse = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
        try {
            const res = await fetch('/api/courses', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                fetchCourses();
            } else {
                alert("Failed to delete course");
            }
        } catch (e) { console.error(e); }
    }

    const saveCourse = async () => {
        try {
            const method = editingCourse.id ? 'PUT' : 'POST'
            const res = await fetch('/api/courses', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCourse)
            })
            if (res.ok) {
                alert('Course saved successfully!')
                fetchCourses()
                setView('LIST')
            } else {
                alert('Failed to save course')
            }
        } catch (e) { console.error(e); alert('Error saving course') }
    }

    const updateBoard = () => {
        const fen = game.current.fen()
        setChapterFen(fen)
        if (activeChapterIndex > -1) {
            const updatedChapters = [...editingCourse.chapters]
            updatedChapters[activeChapterIndex] = { ...updatedChapters[activeChapterIndex], fen: fen }
            setEditingCourse({ ...editingCourse, chapters: updatedChapters })
        }
    }
    const onSquareClick = (square: string) => {
        if (activeChapterIndex === -1 || !selectedTool) return
        if (selectedTool === 'TRASH') game.current.remove(square)
        else game.current.put({ type: selectedTool.type, color: selectedTool.color }, square)
        updateBoard()
    }
    const onPieceDrop = (source: string, target: string, piece: string) => {
        if (activeChapterIndex === -1) return false
        const p = game.current.get(source)
        if (!p) return false
        game.current.remove(source)
        game.current.put(p, target)
        updateBoard()
        return true
    }
    const onSquareRightClick = (square: string) => {
        game.current.remove(square)
        updateBoard()
    }

    if (view === 'LIST') {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><BookOpen className="text-orange-600" /> Courses</h2>
                    <button onClick={handleCreateCourse} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5">
                        <Plus size={18} /> Create Course
                    </button>
                </div>

                {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline" /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">No courses found.</div>}
                        {courses.map(c => (
                            <div key={c.id} className="border rounded-xl p-5 hover:shadow-lg transition-shadow bg-gray-50 flex flex-col justify-between h-48 group">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${c.level === 'BEGINNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{c.level}</span>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }} className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mt-2 mb-1">{c.title}</h3>
                                    <p className="text-sm text-gray-500">{c.chapters?.length || 0} Lessons</p>
                                </div>
                                <button onClick={() => { setEditingCourse(c); setView('EDIT_COURSE'); setActiveChapterIndex(-1); }} className="w-full mt-4 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 py-2 rounded font-bold text-sm flex items-center justify-center gap-2">
                                    <Edit size={14} /> Edit Course
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col h-[85vh]">
            <div className="bg-white border-b p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('LIST')} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><ArrowLeft /></button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{editingCourse.title || 'New Course'}</h2>
                        <p className="text-xs text-slate-500">Course Editor</p>
                    </div>
                </div>
                <button onClick={saveCourse} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors">
                    <Save size={18} /> Save Changes
                </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r bg-gray-50 flex flex-col shrink-0">
                    <div className="p-4 space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase">Settings</label>
                        <input
                            className="w-full border p-2 rounded bg-white focus:ring-2 ring-orange-200 outline-none"
                            placeholder="Course Title"
                            value={editingCourse.title}
                            onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                        />
                        <select className="w-full border p-2 rounded bg-white" value={editingCourse.level} onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value })}>
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </select>

                        <div className="flex justify-between items-center mt-6 mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Chapters</span>
                        </div>
                        <button
                            onClick={() => {
                                const newChap = { title: 'New Lesson', content: '', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }
                                const newChaps = [...editingCourse.chapters, newChap]
                                setEditingCourse({ ...editingCourse, chapters: newChaps })
                                setActiveChapterIndex(newChaps.length - 1)
                                game.current.load(newChap.fen)
                                setChapterFen(newChap.fen)
                            }}
                            className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 font-bold py-2 rounded hover:border-orange-400 hover:text-orange-500 transition-colors"
                        >
                            + Add Lesson
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                        {editingCourse.chapters.map((chap: any, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => { setActiveChapterIndex(idx); game.current.load(chap.fen); setChapterFen(chap.fen) }}
                                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all border
                        ${activeChapterIndex === idx ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeChapterIndex === idx ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
                                <div className="truncate text-sm font-medium text-slate-700">{chap.title || 'Untitled'}</div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newChaps = editingCourse.chapters.filter((_: any, i: number) => i !== idx);
                                        setEditingCourse({ ...editingCourse, chapters: newChaps });
                                        if (activeChapterIndex === idx) setActiveChapterIndex(-1);
                                    }}
                                    className="ml-auto text-gray-300 hover:text-red-500"
                                ><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Editor Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                    {activeChapterIndex !== -1 ? (
                        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 flex flex-col gap-4 h-full">
                                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full">
                                    <input
                                        className="text-2xl font-bold bg-transparent border-b border-gray-100 focus:border-orange-500 outline-none pb-2 w-full mb-4 text-slate-800"
                                        value={editingCourse.chapters[activeChapterIndex].title}
                                        onChange={(e) => {
                                            const newChaps = [...editingCourse.chapters]
                                            newChaps[activeChapterIndex].title = e.target.value
                                            setEditingCourse({ ...editingCourse, chapters: newChaps })
                                        }}
                                        placeholder="Lesson Title"
                                    />
                                    <div className="flex-1 flex flex-col">
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2">Coach Notes / Script</label>
                                        <textarea
                                            className="flex-1 w-full border rounded-lg p-4 resize-none focus:ring-2 focus:ring-orange-500 outline-none text-sm leading-relaxed text-slate-600 bg-gray-50"
                                            placeholder="Write instructions for the coach here..."
                                            value={editingCourse.chapters[activeChapterIndex].content}
                                            onChange={(e) => {
                                                const newChaps = [...editingCourse.chapters]
                                                newChaps[activeChapterIndex].content = e.target.value
                                                setEditingCourse({ ...editingCourse, chapters: newChaps })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 flex flex-col gap-4">
                                <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-200">
                                    <Chessboard
                                        position={chapterFen}
                                        onPieceDrop={onPieceDrop}
                                        onSquareClick={onSquareClick}
                                        onSquareRightClick={onSquareRightClick}
                                    />
                                </div>
                                <BoardSetupPalette
                                    selectedTool={selectedTool}
                                    setSelectedTool={setSelectedTool}
                                    onClear={() => { game.current.clear(); updateBoard() }}
                                    onReset={() => { game.current.reset(); updateBoard() }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
                            <Settings size={80} className="mb-4 text-gray-200" />
                            <p className="text-xl font-bold text-gray-400">Select a lesson from the sidebar to edit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ==========================================
// 3. CURRICULUM MANAGER
// ==========================================
function CurriculumManager() {
    const [currentStage, setCurrentStage] = useState<string | null>(null)
    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
    const [content, setContent] = useState<{ folders: any[], puzzles: any[] }>({ folders: [], puzzles: [] })
    const [view, setView] = useState<'BROWSE' | 'CREATE_PUZZLE'>('BROWSE')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [moveModalOpen, setMoveModalOpen] = useState(false)
    const [movingItem, setMovingItem] = useState<{ id: string, type: 'FOLDER' | 'PUZZLE' } | null>(null)
    const [availableFolders, setAvailableFolders] = useState<any[]>([])
    const [newFolderName, setNewFolderName] = useState('')

    // --- NEW: State for Editing Puzzles ---
    const [editingPuzzle, setEditingPuzzle] = useState<any>(null)

    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    // 1. Fetch Content
    useEffect(() => {
        if (!currentStage) return

        const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
        const params = new URLSearchParams()
        if (parentId) params.append('parentId', parentId)
        else params.append('stage', currentStage)
        fetch(`/api/content?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setContent({ folders: data.folders || [], puzzles: data.puzzles || [] })
                    setSelectedItems(new Set())
                }
            })
            .catch(console.error)
    }, [currentStage, breadcrumbs, refreshTrigger])

    // 2. Actions
    const handleDelete = async (id: string, type: string) => {
        if (!confirm(`Delete this ${type.toLowerCase()}? This cannot be undone.`)) return
        try {
            const res = await fetch(`/api/content`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type })
            })
            if (res.ok) setRefreshTrigger(p => p + 1)
        } catch (e) { console.error(e) }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedItems.size} items?`)) return
        const promises = Array.from(selectedItems).map(id => {
            const isFolder = content.folders.some(f => f.id === id)
            return fetch(`/api/content`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type: isFolder ? 'FOLDER' : 'PUZZLE' })
            })
        })
        await Promise.all(promises)
        setRefreshTrigger(p => p + 1)
        setSelectedItems(new Set())
    }

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedItems)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedItems(newSet)
    }

    const prepareMove = async (item: any, type: 'FOLDER' | 'PUZZLE') => {
        setMovingItem({ id: item.id, type })
        try {
            const res = await fetch('/api/content/folders')
            if (res.ok) {
                const folders = await res.json()
                setAvailableFolders([{ id: 'root', name: 'Root Level' }, ...folders])
            }
        } catch (e) { console.error(e) }
        setMoveModalOpen(true)
    }

    const handleMoveSubmit = async (targetFolderId: string) => {
        if (!movingItem) return
        try {
            const res = await fetch('/api/content/move', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: movingItem.id, targetFolderId })
            })
            if (res.ok) {
                setMoveModalOpen(false)
                setMovingItem(null)
                setRefreshTrigger(p => p + 1)
            } else {
                alert("Move failed")
            }
        } catch (e) { console.error(e) }
    }

    const createFolder = async () => {
        if (!newFolderName) return
        const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
        try {
            const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'FOLDER',
                    name: newFolderName,
                    stage: !parentId ? currentStage : null,
                    parentId: parentId
                })
            })
            if (res.ok) {
                setNewFolderName('')
                setRefreshTrigger(p => p + 1)
            }
        } catch (e) { console.error(e) }
    }

    // --- CARD COMPONENT ---
    const ItemCard = ({ item, type }: { item: any, type: 'FOLDER' | 'PUZZLE' }) => {
        const [showMenu, setShowMenu] = useState(false)
        const isSelected = selectedItems.has(item.id)

        return (
            <div
                className={`relative group h-36 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg
                ${isSelected ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : type === 'FOLDER' ? 'bg-blue-50 border-blue-100 hover:border-blue-300' : 'bg-white border-gray-100 hover:border-orange-300'}`}
                onClick={() => {
                    if (selectedItems.size > 0) toggleSelection(item.id)
                    else if (type === 'FOLDER') setBreadcrumbs([...breadcrumbs, item])
                }}
            >
                <div className="absolute top-2 left-2 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id) }}>
                    {isSelected ? <CheckSquare className="text-orange-600" /> : <Square className="text-gray-300 hover:text-gray-500" />}
                </div>
                <div className="absolute top-2 right-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                        className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-6 bg-white shadow-xl border rounded-lg w-32 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            {type === 'PUZZLE' && (
                                <button onClick={() => { setEditingPuzzle(item); setView('CREATE_PUZZLE') }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-slate-700">
                                    <Pencil size={12} /> Edit
                                </button>
                            )}
                            <button onClick={() => prepareMove(item, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-slate-700">
                                <FolderInput size={12} /> Move
                            </button>
                            <button onClick={() => handleDelete(item.id, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 flex items-center gap-2">
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                    )}
                    {showMenu && <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />}
                </div>
                {type === 'FOLDER' ? <Folder className="w-10 h-10 text-blue-500 mb-2" /> : <FileText className="w-8 h-8 text-orange-500 mb-2" />}
                <span className={`font-bold text-sm px-4 text-center truncate w-full ${type === 'FOLDER' ? 'text-blue-900' : 'text-slate-700'}`}>
                    {type === 'FOLDER' ? item.name : item.title}
                </span>
            </div>
        )
    }

    if (view === 'CREATE_PUZZLE') {
        const parent = breadcrumbs[breadcrumbs.length - 1]
        return <PuzzleCreator
            folderId={parent?.id || 'root'}
            existingPuzzle={editingPuzzle}
            onBack={() => { setView('BROWSE'); setRefreshTrigger(p => p + 1); setEditingPuzzle(null) }}
        />
    }

    if (!currentStage) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-8 min-h-[500px]">
                <h2 className="text-2xl font-bold mb-8 text-slate-800">Select Difficulty Level</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(stage => (
                        <button key={stage} onClick={() => setCurrentStage(stage)} className="h-48 group relative overflow-hidden bg-white border-2 hover:border-orange-500 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4">
                            <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 p-4 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform"><Folder size={32} /></div>
                            <span className="relative z-10 text-xl font-bold text-slate-700">{stage}</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="font-bold text-gray-400 hover:text-black transition-colors">Levels</button>
                    <ChevronRight size={16} className="text-gray-300" />
                    <span className="font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded">{currentStage}</span>
                    {breadcrumbs.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <ChevronRight size={16} className="text-gray-300" />
                            <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="hover:bg-gray-100 px-2 py-1 rounded font-medium text-slate-700">{b.name}</button>
                        </div>
                    ))}
                </div>
                {selectedItems.size > 0 && (
                    <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors animate-in fade-in">
                        <Trash2 size={14} /> Delete Selected ({selectedItems.size})
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-auto">
                {/* Folder Creation Input */}
                <div className="h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 gap-2">
                    <input
                        className="w-full text-center border-b focus:border-orange-500 outline-none pb-1 text-sm bg-transparent"
                        placeholder="New Folder Name"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && createFolder()}
                    />
                    <button onClick={createFolder} disabled={!newFolderName} className="bg-slate-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50">Create</button>
                </div>

                {content.folders.map(f => <ItemCard key={f.id} item={f} type="FOLDER" />)}
                {content.puzzles.map(p => <ItemCard key={p.id} item={p} type="PUZZLE" />)}
            </div>
            <div className="border-t pt-6 mt-6 flex justify-end">
                <button onClick={() => { setEditingPuzzle(null); setView('CREATE_PUZZLE') }} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 font-bold">
                    <Plus size={20} /> New Puzzle
                </button>
            </div>
            <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Move to Folder">
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-2">Select destination:</p>
                    <div className="max-h-60 overflow-y-auto border rounded-lg divide-y bg-gray-50">
                        {availableFolders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => handleMoveSubmit(folder.id)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors"
                            >
                                <Folder size={16} className="text-blue-400" />
                                {folder.name}
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ==========================================
// 4. PUZZLE CREATOR
// ==========================================
function PuzzleCreator({ folderId, existingPuzzle, onBack }: { folderId: string, existingPuzzle?: any, onBack: () => void }) {
    const game = useRef(new Chess())

    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    const [manualFen, setManualFen] = useState(fen)
    const [moves, setMoves] = useState<string[]>([])
    const [title, setTitle] = useState('')
    const [mode, setMode] = useState<'SETUP' | 'RECORD'>('SETUP')
    const [selectedTool, setSelectedTool] = useState<Tool>(null)
    const [startFen, setStartFen] = useState<string | null>(null)
    const [stars, setStars] = useState<string[]>([])
    const [initialStars, setInitialStars] = useState<string[]>([])
    const [isPgnModalOpen, setIsPgnModalOpen] = useState(false)
    const [pgnInput, setPgnInput] = useState('')

    // --- EFFECT: Load Existing Data ---
    useEffect(() => {
        if (existingPuzzle) {
            setTitle(existingPuzzle.title)
            setFen(existingPuzzle.fen)
            setStartFen(existingPuzzle.fen)
            setManualFen(existingPuzzle.fen)

            if (existingPuzzle.solution) {
                setMoves(existingPuzzle.solution.split(' '))
            }
            if (existingPuzzle.data?.stars) {
                setInitialStars(existingPuzzle.data.stars)
                setStars(existingPuzzle.data.stars)
            }

            try {
                game.current.load(existingPuzzle.fen)
            } catch (e) { }

            // Go straight to record mode so they can just save if needed
            setMode('RECORD')
        }
    }, [existingPuzzle])

    const getTurnFromFen = (fenStr: string) => {
        const parts = fenStr.split(' ')
        return parts.length > 1 ? parts[1] : 'w'
    }
    const updateBoard = () => {
        try {
            setFen(game.current.fen())
        } catch (e) { }
    }

    useEffect(() => {
        setManualFen(fen)
    }, [fen])

    const handleManualFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        setManualFen(input)
        try {
            game.current.load(input)
            setFen(game.current.fen())
        } catch (error) {
            setFen(input)
        }
    }

    const toggleTurn = (color: 'w' | 'b') => {
        if (mode !== 'SETUP') return
        const parts = fen.split(' ')
        if (parts.length >= 2) {
            parts[1] = color
            const newFen = parts.join(' ')
            setFen(newFen)
            try { game.current.load(newFen) } catch (e) { }
        }
    }

    const handleImportPgn = () => {
        try {
            game.current.loadPgn(pgnInput)
            const history = game.current.history()

            if (history.length > 0) {
                while (game.current.undo() !== null) { }
                const initialFen = game.current.fen()
                setStartFen(initialFen)
                setFen(initialFen)
                setMoves(history)
                setMode('RECORD')
                alert(`Imported! ${history.length} moves loaded as solution.`)
            } else {
                setFen(game.current.fen())
            }
            setIsPgnModalOpen(false)
            setPgnInput('')
        } catch (e) {
            alert("Invalid PGN. Please check syntax.")
        }
    }

    const toggleMode = () => {
        if (mode === 'SETUP') {
            const boardOnly = fen.split(" ")[0];
            const hasKings = boardOnly.includes("K") && boardOnly.includes("k");

            if (stars.length === 0 && !hasKings) {
                if (!confirm("Board has missing kings. This will be treated as a custom exercise (non-standard chess). Continue?")) return;
            }

            setInitialStars([...stars]);
            setStartFen(fen)
            setMoves([])
            setMode('RECORD')
            setSelectedTool(null)
        } else {
            setMode('SETUP')
            setStartFen(null)
            setStars([...initialStars])
        }
    }

    const onSquareRightClick = (square: string) => {
        if (mode === 'SETUP') {
            if (stars.includes(square)) {
                setStars(stars.filter(s => s !== square))
            } else {
                setStars([...stars, square])
            }
        }
    }

    const onSquareClick = (square: string) => {
        if (mode !== 'SETUP' || !selectedTool) return

        if (stars.includes(square)) setStars(stars.filter(s => s !== square))

        if (selectedTool === 'TRASH') {
            game.current.remove(square)
        } else {
            game.current.put({ type: selectedTool.type, color: selectedTool.color }, square)
        }
        setFen(game.current.fen())
    }

    const onPieceDrop = (source: string, target: string, piece: string) => {
        if (mode === 'SETUP') {
            const p = game.current.get(source)
            if (!p) return false
            game.current.remove(source)
            game.current.put(p, target)
            setFen(game.current.fen())
            return true
        }

        if (mode === 'RECORD') {
            if (stars.includes(target)) {
                setStars(stars.filter(s => s !== target))
                const p = game.current.get(source)
                game.current.remove(source)
                game.current.put(p, target)
                setMoves([...moves, `${source}-${target}`])
                setFen(game.current.fen())
                return true
            }
            try {
                const move = game.current.move({ from: source, to: target, promotion: 'q' })
                if (!move) return false
                setMoves([...moves, move.san])
                setFen(game.current.fen())
                return true
            } catch { return false }
        }
        return false
    }

    const customSquareStyles: Record<string, React.CSSProperties> = {}
    stars.forEach(square => {
        customSquareStyles[square] = {
            backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iZ29sZCIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlnb24gcG9pbnRzPSIxMiAyIDE1LjA5IDguMjYgMjIgOS4yNyAxNyAxNC4xNCAxOC4xOCAyMS4wMiAxMiAxNyAxNyA1LjgyIDIxLjAyIDcgMTQuMTQgMiA5LjI3IDguOTEgOC4yNiAxMiAyIi8+PC9zdmc+")',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
        }
    })

    const savePuzzle = async () => {
        if (!title || !startFen) return

        // --- KEY FIX: Use moves state directly ---
        const payload: any = {
            type: 'PUZZLE',
            title: title,
            fen: startFen, // Ensure this is the puzzle start position
            solution: moves.join(' '), // This uses the current moves array
            data: { stars: initialStars }
        }

        const method = existingPuzzle ? 'PUT' : 'POST'
        if (existingPuzzle) {
            payload.id = existingPuzzle.id
        } else {
            payload.parentId = folderId === 'root' ? null : folderId
        }

        try {
            const res = await fetch('/api/content', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                alert(existingPuzzle ? "Puzzle Updated!" : "Puzzle Saved!")
                onBack()
            } else {
                alert("Failed to save puzzle")
            }
        } catch (e) { console.error(e) }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl border h-full min-h-[600px]">
            <div className="lg:col-span-5 flex justify-center">
                <div className={`w-full max-w-[500px] border-4 rounded-xl shadow-lg overflow-hidden transition-colors ${mode === 'RECORD' ? 'border-green-500' : 'border-blue-500'}`}>
                    <Chessboard
                        position={fen}
                        onPieceDrop={onPieceDrop}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        customSquareStyles={customSquareStyles}
                    />
                </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b pb-4 justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{existingPuzzle ? 'Edit Puzzle' : 'New Puzzle'}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className={`w-2 h-2 rounded-full ${mode === 'SETUP' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                Step {mode === 'SETUP' ? '1: Setup Board' : '2: Play Solution'}
                            </div>
                        </div>
                    </div>
                    {mode === 'SETUP' && (
                        <button onClick={() => setIsPgnModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                            <FileText size={14} /> Import PGN
                        </button>
                    )}
                </div>

                {mode === 'SETUP' && (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                        <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard() }} onReset={() => { game.current.reset(); updateBoard() }} />
                        <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-center gap-2">
                            <Star size={14} className="text-yellow-600 fill-yellow-600" />
                            <span><b>Right-Click</b> on a square to add/remove a Star target.</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-400 uppercase">Side to Move</span></div>
                            <div className="flex gap-2">
                                <button onClick={() => toggleTurn('w')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${getTurnFromFen(fen) === 'w' ? 'bg-white border-2 border-orange-500 text-orange-600 shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>White</button>
                                <button onClick={() => toggleTurn('b')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${getTurnFromFen(fen) === 'b' ? 'bg-slate-800 border-2 border-slate-800 text-white shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>Black</button>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Direct FEN Input</label>
                            <div className="flex gap-2">
                                <input type="text" className="w-full border p-2 rounded text-sm font-mono text-slate-600 focus:ring-2 focus:ring-orange-500 outline-none" value={manualFen} onChange={handleManualFenChange} placeholder="Paste FEN string here..." />
                                <button onClick={() => { navigator.clipboard.writeText(manualFen); alert("FEN Copied!") }} className="p-2 bg-white border rounded hover:bg-gray-100 text-gray-500" title="Copy FEN"><Copy size={16} /></button>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={toggleMode} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-black transition-all flex items-center gap-2">
                                Next: Record Solution <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'RECORD' && (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                        <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
                            <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2"><Play size={18} /> Recording Moves...</h3>
                            <p className="text-sm text-green-700 mb-3">{stars.length > 0 ? `Collect the stars! (${stars.length} remaining).` : "Play the solution on the board."}</p>
                            <div className="bg-white p-4 rounded-lg font-mono text-lg min-h-[60px] shadow-inner border border-green-100 break-words">
                                {moves.length > 0 ? moves.join(' ') : <span className="text-gray-300">Make a move...</span>}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { game.current.load(startFen!); setFen(startFen!); setMoves([]); setStars([...initialStars]); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700 flex items-center gap-2"><RotateCcw size={16} /> Reset</button>
                        </div>
                        <div className="pt-6 border-t mt-6 space-y-4">
                            <input className="w-full text-lg border-2 border-gray-200 rounded-lg p-3 font-bold focus:border-orange-500 outline-none" placeholder="Puzzle Title" value={title} onChange={e => setTitle(e.target.value)} />
                            <div className="flex gap-4">
                                <button onClick={toggleMode} className="px-6 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Back to Setup</button>
                                <button onClick={savePuzzle} disabled={moves.length === 0} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all">
                                    {existingPuzzle ? 'Update Puzzle' : 'Save Puzzle'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <Modal isOpen={isPgnModalOpen} onClose={() => setIsPgnModalOpen(false)} title="Import PGN">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Paste a PGN string below.</p>
                        <textarea className="w-full h-40 border rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={pgnInput} onChange={(e) => setPgnInput(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsPgnModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleImportPgn} className="px-6 py-2 bg-slate-900 text-white rounded font-bold hover:bg-black">Import</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    )
}

// ==========================================
// 5. ANALYSIS BOARD (No Changes)
// ==========================================
function AnalysisBoard() {
    const game = useRef(new Chess())
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    const [squares, setSquares] = useState<Record<string, any>>({})
    const [orientation, setOrientation] = useState<'white' | 'black'>('white')
    const [setupMode, setSetupMode] = useState(false)
    const [selectedTool, setSelectedTool] = useState<Tool>(null)

    const updateBoard = () => setFen(game.current.fen())

    const clearHighlight = (square: string) => {
        setSquares((prev) => {
            if (prev[square]) {
                const newSquares = { ...prev }
                delete newSquares[square]
                return newSquares
            }
            return prev
        })
    }

    const onPieceDrop = (source: string, target: string, piece: string) => {
        if (setupMode) {
            const p = game.current.get(source)
            if (!p) return false
            game.current.remove(source)
            game.current.put(p, target)
            updateBoard()
            clearHighlight(target)
            return true
        }
        try {
            const move = game.current.move({ from: source, to: target, promotion: 'q' })
            if (!move) return false
            setFen(game.current.fen())
            clearHighlight(target)
            return true
        } catch { return false }
    }

    const onSquareClick = (square: string) => {
        if (setupMode && selectedTool) {
            if (selectedTool === 'TRASH') game.current.remove(square)
            else game.current.put({ type: selectedTool.type, color: selectedTool.color }, square)
            updateBoard()
            clearHighlight(square)
        }
    }

    const onSquareRightClick = (square: string) => {
        if (!setupMode) {
            setSquares(prev => {
                const s = { ...prev }
                if (!s[square]) s[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
                else if (s[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') s[square] = { background: 'radial-gradient(circle, gold 20%, transparent 30%)', backgroundColor: 'rgba(0, 0, 0, 0)' }
                else delete s[square]
                return s
            })
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl shadow-sm border">
            <div className="lg:col-span-8 flex justify-center">
                <div className="w-[600px] h-[600px] border-4 border-slate-700 rounded shadow-2xl relative">
                    <Chessboard
                        position={fen}
                        onPieceDrop={onPieceDrop}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        customSquareStyles={squares}
                        boardOrientation={orientation}
                        arePiecesDraggable={true}
                    />
                    {setupMode && <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse">SETUP MODE</div>}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800"><MousePointer2 className="text-orange-500" /> Analysis Tools</h3>
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="flex-1 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"><RotateCcw size={16} /> Reset</button>
                        <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="flex-1 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"><ArrowUpDown size={16} /> Flip</button>
                    </div>
                    <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }} className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors ${setupMode ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
                        <Settings size={16} /> {setupMode ? 'Exit Setup Mode' : 'Edit Board Position'}
                    </button>
                </div>

                {setupMode && (
                    <div className="border-t pt-4 animate-in fade-in slide-in-from-top-4">
                        <BoardSetupPalette
                            selectedTool={selectedTool}
                            setSelectedTool={setSelectedTool}
                            onClear={() => { game.current.clear(); updateBoard() }}
                            onReset={() => { game.current.reset(); updateBoard() }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
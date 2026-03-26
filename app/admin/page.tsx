// 'use client'
// import React, { useEffect, useState, useRef } from 'react'
// import { Chess } from 'chess.js'
// import { Chessboard } from 'react-chessboard'
// import {
//     Users, Folder, FileText, ChevronRight, Save, RotateCcw,
//     MousePointer2, Trash2, Plus, Edit, ArrowLeft, Check,
//     Play, Copy, Settings, ArrowUpDown, BookOpen, Video, List, Loader2,
//     MoreVertical, FolderInput, X, Search, Star, CheckSquare, Square, Pencil, Clock, CreditCard,
//     TrendingUp, Calculator, Calendar
// } from 'lucide-react'
// import AudioRecorder from '@/components/AudioRecorder'

// // --- TYPES ---
// type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

// // --- REUSABLE COMPONENTS ---
// const Modal = ({ isOpen, onClose, title, children }: any) => {
//     if (!isOpen) return null
//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
//                 <div className="flex justify-between items-center p-4 border-b shrink-0">
//                     <h3 className="text-xl font-bold text-slate-800">{title}</h3>
//                     <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
//                         <X size={24} />
//                     </button>
//                 </div>
//                 <div className="p-6">
//                     {children}
//                 </div>
//             </div>
//         </div>
//     )
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
//                 <div className="flex gap-1 flex-wrap justify-center">
//                     {pieces.map(p => (
//                         <div
//                             key={'w' + p}
//                             onClick={() => setSelectedTool({ type: p, color: 'w' })}
//                             className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
//                             ${selectedTool?.type === p && selectedTool?.color === 'w' ? 'bg-orange-100 border-orange-500 scale-110' : ''}`}
//                         >
//                             <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">
//                                 {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
//                             </span>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="flex gap-1 flex-wrap justify-center border-l pl-4">
//                     {pieces.map(p => (
//                         <div
//                             key={'b' + p}
//                             onClick={() => setSelectedTool({ type: p, color: 'b' })}
//                             className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
//                             ${selectedTool?.type === p && selectedTool?.color === 'b' ? 'bg-slate-200 border-slate-500 scale-110' : ''}`}
//                         >
//                             <span className="text-black pb-1">
//                                 {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
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
//                     <Trash2 size={16} className="text-gray-400" />
//                     <span className="text-[10px] font-bold">CLEAR</span>
//                 </button>
//                 <button onClick={onReset} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
//                     <RotateCcw size={16} className="text-gray-400" />
//                     <span className="text-[10px] font-bold">RESET</span>
//                 </button>
//             </div>
//         </div>
//     )
// }

// // --- MAIN DASHBOARD ---
// export default function AdminDashboard() {
//     const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'puzzles' | 'analysis' | 'classes' | 'payments'>('users')
//     return (
//         <div className="min-h-screen bg-gray-50 text-slate-900 font-sans mt-[90px]">
//             <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 shadow-sm mb-12">
//                 <div className="flex items-center gap-2 mb-4 md:mb-0">
//                     <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-orange-200 shadow-lg">C</div>
//                     <h1 className="text-xl font-bold text-slate-800 tracking-tight">Royal Rook Admin</h1>
//                 </div>
//                 <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
//                     {[
//                         { id: 'users', label: 'Users', icon: Users },
//                         { id: 'classes', label: 'Batch/Classes', icon: Clock },
//                         { id: 'payments', label: 'Payments', icon: CreditCard },
//                         { id: 'courses', label: 'Courses', icon: BookOpen },
//                         { id: 'puzzles', label: 'Puzzles', icon: Folder },
//                         { id: 'analysis', label: 'Analysis', icon: MousePointer2 }
//                     ].map(tab => (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id as any)}
//                             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
//               ${activeTab === tab.id
//                                     ? 'bg-slate-900 text-white shadow-md'
//                                     : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
//                         >
//                             <tab.icon size={16} />
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>
//             </header>

//             <main className="p-4 md:p-6 max-w-7xl mx-auto pt-8 md:pt-20">
//                 {activeTab === 'users' && <UserManager />}
//                 {activeTab === 'classes' && <ClassManager />}
//                 {activeTab === 'payments' && <PaymentManager />}
//                 {activeTab === 'courses' && <CourseManager />}
//                 {activeTab === 'puzzles' && <CurriculumManager />}
//                 {activeTab === 'analysis' && <AnalysisBoard />}
//             </main>
//         </div>
//     )
// }

// // ==========================================
// // 1. USER MANAGER
// // ==========================================
// function UserManager() {
//     const [users, setUsers] = useState<any[]>([])
//     const [coaches, setCoaches] = useState<any[]>([])
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [loading, setLoading] = useState(true)
//     const [formData, setFormData] = useState<any>({
//         name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '',
//         joiningDate: '', birthDate: '', address: '', parentName: '', parentPhone: '',
//         photoUrl: '', idCardUrl: ''
//     })
//     const [editingId, setEditingId] = useState<string | null>(null)

//     const fetchUsers = async () => {
//         setLoading(true)
//         try {
//             const res = await fetch('/api/admin/users')
//             const data = await res.json()
//             if (res.ok && Array.isArray(data)) {
//                 const mappedUsers = data.map((u: any) => ({ ...u, status: u.status || 'ACTIVE' }))
//                 setUsers(mappedUsers)
//                 setCoaches(mappedUsers.filter((u: any) => u.role === 'COACH' || u.role === 'ADMIN'))
//             }
//         } catch (error) {
//             console.error("Failed to fetch users", error)
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => { fetchUsers() }, [])
//     const handleToggleStatus = async (user: any) => {
//         const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
//         const action = newStatus === 'BLOCKED' ? 'Block' : 'Activate'

//         if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return
//         try {
//             const res = await fetch('/api/admin/users', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id: user.id, status: newStatus })
//             })
//             if (res.ok) fetchUsers()
//             else alert("Failed to update status")
//         } catch (e) { console.error(e) }
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         const method = editingId ? 'PUT' : 'POST'
//         const payload = editingId ? { ...formData, id: editingId } : formData

//         try {
//             const res = await fetch('/api/admin/users', {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             if (res.ok) {
//                 setIsModalOpen(false)
//                 fetchUsers()
//                 setFormData({
//                     name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '',
//                     joiningDate: '', birthDate: '', address: '', parentName: '', parentPhone: '',
//                     photoUrl: '', idCardUrl: ''
//                 })
//             } else {
//                 const err = await res.json()
//                 alert(err.error || "Failed to save user")
//             }
//         } catch (e) { console.error(e) }
//     }

//     const handleDelete = async (id: string) => {
//         if (!confirm("Are you sure?")) return
//         try {
//             const res = await fetch('/api/admin/users', {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id })
//             })
//             if (res.ok) fetchUsers()
//         } catch (e) { console.error(e) }
//     }

//     const openEdit = (user: any) => {
//         setFormData({
//             name: user.name, email: user.email, role: user.role,
//             stage: user.stage, coachId: user.coachId || '', password: '',
//             joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : '',
//             birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
//             address: user.address || '',
//             parentName: user.parentName || '',
//             parentPhone: user.parentPhone || '',
//             photoUrl: user.photoUrl || '',
//             idCardUrl: user.idCardUrl || ''
//         })
//         setEditingId(user.id)
//         setIsModalOpen(true)
//     }

//     return (
//         <div className="bg-white rounded-xl shadow-sm border p-6">
//             <div className="flex justify-between mb-6">
//                 <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-orange-600" /> Manage Users</h2>
//                 <button onClick={() => {
//                     setEditingId(null);
//                     setIsModalOpen(true);
//                     setFormData({
//                         name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '',
//                         joiningDate: '', birthDate: '', address: '', parentName: '', parentPhone: '',
//                         photoUrl: '', idCardUrl: ''
//                     })
//                 }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow"><Plus size={16} /> Add User</button>
//             </div>

//             {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div> : (
//                 <div className="overflow-x-auto rounded-lg border">
//                     <table className="w-full text-left border-collapse">
//                         <thead className="bg-gray-50 border-b">
//                             <tr>
//                                 <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
//                                 <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
//                                 <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
//                                 <th className="p-4 text-sm font-semibold text-gray-600">Stage</th>
//                                 <th className="p-4 text-sm font-semibold text-gray-600">Coach</th>
//                                 <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y">
//                             {users.map(u => (
//                                 <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.status === 'BLOCKED' ? 'bg-red-50' : ''}`}>
//                                     <td className="p-4">
//                                         <div className="font-bold text-gray-800">{u.name}</div>
//                                         <div className="text-xs text-gray-500">{u.email}</div>
//                                     </td>
//                                     <td className="p-4">
//                                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${u.status === 'BLOCKED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
//                                             {u.status}
//                                         </span>
//                                     </td>
//                                     <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'COACH' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
//                                     <td className="p-4 text-sm">{u.role === 'STUDENT' ? u.stage : '-'}</td>
//                                     <td className="p-4 text-sm text-blue-600">{u.coach?.name || '-'}</td>
//                                     <td className="p-4 text-right flex items-center justify-end gap-2">
//                                         <button
//                                             onClick={() => handleToggleStatus(u)}
//                                             className={`p-2 rounded-full transition-colors ${u.status === 'BLOCKED' ? 'text-green-600 hover:bg-green-100' : 'text-red-400 hover:bg-red-100'}`}
//                                             title={u.status === 'BLOCKED' ? 'Activate User' : 'Block User'}
//                                         >
//                                             {u.status === 'BLOCKED' ? <Check size={16} /> : <X size={16} />}
//                                         </button>
//                                         <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"><Edit size={16} /></button>
//                                         <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit User" : "Add User"}>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-1">
//                             <label className="text-xs font-bold text-gray-500">Full Name</label>
//                             <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
//                         </div>
//                         <div className="space-y-1">
//                             <label className="text-xs font-bold text-gray-500">Email Address</label>
//                             <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
//                         </div>
//                     </div>

//                     <div className="space-y-1">
//                         <label className="text-xs font-bold text-gray-500">Password</label>
//                         <input className="w-full border p-2 rounded focus:ring-2 ring-orange-200 outline-none" type="password" placeholder={editingId ? "Leave blank to keep current" : "Secure Password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
//                     </div>
//                     <div className="space-y-1">
//                         <label className="text-xs font-bold text-gray-500">System Role</label>
//                         <select className="w-full border p-2 rounded bg-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
//                             <option value="STUDENT">Student</option>
//                             <option value="COACH">Coach</option>
//                             <option value="ADMIN">Admin</option>
//                         </select>
//                     </div>
//                     {formData.role === 'STUDENT' && (
//                         <>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
//                                 <div>
//                                     <label className="text-xs font-bold text-gray-500">Chess Level</label>
//                                     <select className="w-full border p-2 rounded mt-1" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
//                                         <option value="BEGINNER">Beginner</option>
//                                         <option value="INTERMEDIATE">Intermediate</option>
//                                         <option value="ADVANCED">Advanced</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="text-xs font-bold text-gray-500">Assign Coach</label>
//                                     <select className="w-full border p-2 rounded mt-1" value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })}>
//                                         <option value="">-- No Coach --</option>
//                                         {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-gray-500">Joining Date</label>
//                                     <input type="date" className="w-full border p-2 rounded outline-none shadow-sm" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
//                                 </div>
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-gray-500">Birth Date</label>
//                                     <input type="date" className="w-full border p-2 rounded outline-none shadow-sm" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
//                                 </div>
//                             </div>

//                             <div className="space-y-1">
//                                 <label className="text-xs font-bold text-gray-500">Address</label>
//                                 <textarea className="w-full border p-2 rounded outline-none shadow-sm h-20" placeholder="Student Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-gray-500">Parent's Name</label>
//                                     <input className="w-full border p-2 rounded outline-none shadow-sm" placeholder="Parent Name" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
//                                 </div>
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-gray-500">Parent's Phone</label>
//                                     <input className="w-full border p-2 rounded outline-none shadow-sm" placeholder="Parent Phone" value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-gray-500">Student Photo</label>
//                                     <input type="file" accept="image/*" className="text-xs w-full" onChange={async (e) => {
//                                         const file = e.target.files?.[0];
//                                         if (file) {
//                                             const reader = new FileReader();
//                                             reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result });
//                                             reader.readAsDataURL(file);
//                                         }
//                                     }} />
//                                     {formData.photoUrl && <img src={formData.photoUrl} className="w-16 h-16 object-cover rounded mt-2 border" alt="Preview" />}
//                                 </div>
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-gray-500">ID Card (Photo)</label>
//                                     <input type="file" accept="image/*" className="text-xs w-full" onChange={async (e) => {
//                                         const file = e.target.files?.[0];
//                                         if (file) {
//                                             const reader = new FileReader();
//                                             reader.onloadend = () => setFormData({ ...formData, idCardUrl: reader.result });
//                                             reader.readAsDataURL(file);
//                                         }
//                                     }} />
//                                     {formData.idCardUrl && <img src={formData.idCardUrl} className="w-16 h-16 object-cover rounded mt-2 border" alt="ID Preview" />}
//                                 </div>
//                             </div>
//                         </>
//                     )}
//                     <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 shadow-lg mt-4 transition-all">
//                         {editingId ? 'Update User' : 'Create User'}
//                     </button>
//                 </form>
//             </Modal>
//         </div>
//     )
// }

// // ==========================================
// // 1.5 BATCH / CLASS MANAGER
// // ==========================================
// function ClassManager() {
//     const [classes, setClasses] = useState<any[]>([])
//     const [users, setUsers] = useState<any[]>([])
//     const [coaches, setCoaches] = useState<any[]>([])
//     const [students, setStudents] = useState<any[]>([])
//     const [loading, setLoading] = useState(true)
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
//     const [editingClass, setEditingClass] = useState<any>(null)
//     const [formData, setFormData] = useState({
//         name: '', dayOfWeek: 'Monday', startTime: '17:00', endTime: '18:00', coachId: '', meetingLink: ''
//     })
//     const [selectedStudents, setSelectedStudents] = useState<string[]>([])

//     const fetchData = async () => {
//         setLoading(true)
//         try {
//             const [classRes, userRes] = await Promise.all([
//                 fetch('/api/classes'),
//                 fetch('/api/admin/users')
//             ])
//             const classData = await classRes.json()
//             const userData = await userRes.json()

//             if (classRes.ok && Array.isArray(classData)) setClasses(classData)
//             if (userRes.ok && Array.isArray(userData)) {
//                 setUsers(userData)
//                 setCoaches(userData.filter(u => u.role === 'COACH' || u.role === 'ADMIN'))
//                 setStudents(userData.filter(u => u.role === 'STUDENT'))
//             }
//         } catch (e) {
//             console.error(e)
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => { fetchData() }, [])

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         const method = editingClass ? 'PUT' : 'POST'
//         const payload = editingClass ? { ...formData, id: editingClass.id } : formData

//         try {
//             const res = await fetch('/api/classes', {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             if (res.ok) {
//                 setIsModalOpen(false)
//                 fetchData()
//             } else {
//                 const err = await res.json()
//                 alert(err.error || "Failed to save class")
//             }
//         } catch (e) { console.error(e) }
//     }

//     const handleDelete = async (id: string) => {
//         if (!confirm("Are you sure? This will delete the class and its attendance records.")) return
//         try {
//             const res = await fetch(`/api/classes?id=${id}`, { method: 'DELETE' })
//             if (res.ok) fetchData()
//         } catch (e) { console.error(e) }
//     }

//     const handleEnroll = async () => {
//         try {
//             const res = await fetch('/api/classes', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id: editingClass.id, studentIds: selectedStudents })
//             })
//             if (res.ok) {
//                 setIsEnrollModalOpen(false)
//                 fetchData()
//             } else {
//                 const err = await res.json()
//                 alert(err.error || "Failed to enroll students")
//             }
//         } catch (e) { console.error(e) }
//     }

//     return (
//         <div className="bg-white rounded-xl shadow-sm border p-6">
//             <div className="flex justify-between mb-6">
//                 <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="text-orange-600" /> Manage Batches / Classes</h2>
//                 <button onClick={() => {
//                     setEditingClass(null);
//                     setFormData({ name: '', dayOfWeek: 'Monday', startTime: '17:00', endTime: '18:00', coachId: '', meetingLink: '' });
//                     setIsModalOpen(true);
//                 }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow">
//                     <Plus size={16} /> Add Class
//                 </button>
//             </div>

//             {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div> : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {classes.map(c => (
//                         <div key={c.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-slate-50">
//                             <div className="flex justify-between items-start mb-2">
//                                 <h3 className="font-bold text-lg text-slate-800">{c.name}</h3>
//                                 <div className="flex gap-1">
//                                     <button onClick={() => {
//                                         setEditingClass(c);
//                                         setFormData({
//                                             name: c.name, dayOfWeek: c.dayOfWeek,
//                                             startTime: c.startTime, endTime: c.endTime, coachId: c.coachId, meetingLink: c.meetingLink || ''
//                                         });
//                                         setIsModalOpen(true);
//                                     }} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button>
//                                     <button onClick={() => handleDelete(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
//                                 </div>
//                             </div>
//                             <div className="text-sm text-slate-600 space-y-1 mb-4">
//                                 <div className="flex items-center gap-2"><BookOpen size={14} /> {c.dayOfWeek}</div>
//                                 <div className="flex items-center gap-2"><Clock size={14} /> {c.startTime} - {c.endTime}</div>
//                                 <div className="flex items-center gap-2 font-medium text-orange-700"><Users size={14} /> Coach: {c.coach?.name}</div>
//                                 {c.meetingLink && (
//                                     <div className="flex items-center gap-2 text-blue-600 truncate">
//                                         <Video size={14} /> <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-[10px] font-bold">JOIN MEETING</a>
//                                     </div>
//                                 )}
//                                 <div className="mt-2 pt-2 border-t flex justify-between items-center">
//                                     <span className="font-bold text-xs uppercase text-slate-400">Enrolled: {c._count?.students || 0}</span>
//                                     <button
//                                         onClick={() => {
//                                             setEditingClass(c);
//                                             setSelectedStudents(c.students?.map((s: any) => s.id) || []);
//                                             setIsEnrollModalOpen(true);
//                                         }}
//                                         className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded transition-colors"
//                                     >MANAGE STUDENTS</button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                     {classes.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed rounded-xl">No classes defined yet. Click "Add Class" to start.</div>}
//                 </div>
//             )}

//             {/* Add/Edit Modal */}
//             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "Edit Class" : "Add New Class"}>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Name</label>
//                         <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Beginners Group A" />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Day of Week</label>
//                         <select value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
//                             {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
//                         </select>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
//                             <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
//                             <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Coach</label>
//                         <select value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
//                             <option value="">Select a Coach</option>
//                             {coaches.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meeting Link (Zoom/Google Meet)</label>
//                         <input value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="https://zoom.us/j/..." />
//                     </div>
//                     <div className="pt-4">
//                         <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">
//                             {editingClass ? "Update Class" : "Create Class"}
//                         </button>
//                     </div>
//                 </form>
//             </Modal>

//             {/* Enroll Modal */}
//             <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={`Enroll Students in ${editingClass?.name}`}>
//                 <div className="space-y-4">
//                     <div className="max-h-[300px] overflow-y-auto border rounded-xl divide-y">
//                         {students.map(s => (
//                             <div key={s.id} onClick={() => {
//                                 setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])
//                             }} className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${selectedStudents.includes(s.id) ? 'bg-orange-50' : ''}`}>
//                                 <div>
//                                     <div className="font-bold text-slate-800">{s.name}</div>
//                                     <div className="text-xs text-slate-500">{s.email}</div>
//                                 </div>
//                                 {selectedStudents.includes(s.id) ? <CheckSquare className="text-orange-600" /> : <Square className="text-slate-300" />}
//                             </div>
//                         ))}
//                     </div>
//                     <div className="pt-4">
//                         <button onClick={handleEnroll} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">
//                             Save Enrollment ({selectedStudents.length} Students)
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     )
// }

// // ==========================================
// // 1.7 FEE PAYMENT MANAGER
// // ==========================================
// function PaymentManager() {
//     const [payments, setPayments] = useState<any[]>([])
//     const [students, setStudents] = useState<any[]>([])
//     const [loading, setLoading] = useState(true)
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [editingPayment, setEditingPayment] = useState<any>(null)
//     const [formData, setFormData] = useState({
//         amount: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED', method: 'Cash', remarks: '', studentId: ''
//     })

//     const fetchData = async () => {
//         setLoading(true)
//         try {
//             const [payRes, userRes] = await Promise.all([
//                 fetch('/api/payments'),
//                 fetch('/api/admin/users')
//             ])
//             if (payRes.ok) setPayments(await payRes.json())
//             if (userRes.ok) {
//                 const users = await userRes.json()
//                 setStudents(users.filter((u: any) => u.role === 'STUDENT'))
//             }
//         } catch (e) { console.error(e) }
//         finally { setLoading(false) }
//     }

//     useEffect(() => { fetchData() }, [])

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         const method = editingPayment ? 'PUT' : 'POST'
//         const payload = editingPayment ? { ...formData, id: editingPayment.id } : formData

//         try {
//             const res = await fetch('/api/payments', {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             if (res.ok) {
//                 setIsModalOpen(false)
//                 fetchData()
//             } else {
//                 const err = await res.json()
//                 alert(err.error || "Failed to save payment")
//             }
//         } catch (e) { console.error(e) }
//     }

//     const handleDelete = async (id: string) => {
//         if (!confirm("Are you sure?")) return
//         try {
//             const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' })
//             if (res.ok) fetchData()
//         } catch (e) { console.error(e) }
//     }

//     const totalCollected = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)

//     return (
//         <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
//                     <div className="flex justify-between items-center mb-2">
//                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
//                         <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="text-green-600" size={16} /></div>
//                     </div>
//                     <div className="text-3xl font-black text-slate-800">₹{totalCollected.toLocaleString()}</div>
//                 </div>
//                 <div className="bg-white p-6 rounded-xl shadow-sm border">
//                     <div className="flex justify-between items-center mb-2">
//                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</span>
//                         <div className="p-2 bg-blue-50 rounded-lg"><Calculator className="text-blue-600" size={16} /></div>
//                     </div>
//                     <div className="text-3xl font-black text-slate-800">{payments.length}</div>
//                 </div>
//                 <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-center items-center">
//                     <button onClick={() => {
//                         setEditingPayment(null);
//                         setFormData({ amount: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED', method: 'Cash', remarks: '', studentId: '' });
//                         setIsModalOpen(true);
//                     }} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
//                         <Plus size={20} /> Record New Payment
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//                 <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
//                     <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800"><CreditCard className="text-orange-600" /> Transaction History</h2>
//                 </div>
//                 {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div> : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead className="bg-gray-50 border-b">
//                                 <tr>
//                                     <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
//                                     <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
//                                     <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
//                                     <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
//                                     <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
//                                     <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {payments.map(p => (
//                                     <tr key={p.id} className="hover:bg-gray-50 transition-colors">
//                                         <td className="p-4">
//                                             <div className="font-bold text-slate-800">{p.student?.name}</div>
//                                             <div className="text-[10px] text-slate-500 uppercase tracking-tight">{p.student?.email}</div>
//                                         </td>
//                                         <td className="p-4 font-black text-slate-800">₹{p.amount.toLocaleString()}</td>
//                                         <td className="p-4 text-sm text-slate-600 flex items-center gap-1"><Calendar size={14} /> {new Date(p.date).toLocaleDateString()}</td>
//                                         <td className="p-4 text-sm"><span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold text-[10px] uppercase">{p.method}</span></td>
//                                         <td className="p-4 text-center">
//                                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
//                                                 p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
//                                                     'bg-red-100 text-red-700 border-red-200'
//                                                 }`}>
//                                                 {p.status}
//                                             </span>
//                                         </td>
//                                         <td className="p-4 text-right">
//                                             <div className="flex justify-end gap-2">
//                                                 <button onClick={() => {
//                                                     setEditingPayment(p);
//                                                     setFormData({
//                                                         amount: p.amount.toString(),
//                                                         date: new Date(p.date).toISOString().split('T')[0],
//                                                         status: p.status,
//                                                         method: p.method,
//                                                         remarks: p.remarks || '',
//                                                         studentId: p.studentId
//                                                     });
//                                                     setIsModalOpen(true);
//                                                 }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
//                                                 <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                                 {payments.length === 0 && (
//                                     <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic">No transactions recorded yet.</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPayment ? "Edit Payment Record" : "Record New Payment"}>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {!editingPayment && (
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Student</label>
//                             <select value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50">
//                                 <option value="">Select a student...</option>
//                                 {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
//                             </select>
//                         </div>
//                     )}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
//                             <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50" placeholder="0.00" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Date</label>
//                             <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50" />
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label>
//                             <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50">
//                                 <option value="Cash">Cash</option>
//                                 <option value="UPI">UPI / Google Pay</option>
//                                 <option value="Bank Transfer">Bank Transfer</option>
//                                 <option value="Cheque">Cheque</option>
//                                 <option value="Other">Other</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
//                             <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50">
//                                 <option value="COMPLETED">Completed</option>
//                                 <option value="PENDING">Pending</option>
//                                 <option value="FAILED">Failed</option>
//                                 <option value="REFUNDED">Refunded</option>
//                             </select>
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks</label>
//                         <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 h-24" placeholder="Optional notes..."></textarea>
//                     </div>
//                     <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 mt-4">
//                         {editingPayment ? "Update Record" : "Save Record"}
//                     </button>
//                 </form>
//             </Modal>
//         </div>
//     )
// }

// // ==========================================
// // 2. COURSE MANAGER
// // ==========================================
// function CourseManager() {
//     const [view, setView] = useState<'LIST' | 'EDIT_COURSE'>('LIST')
//     const [courses, setCourses] = useState<any[]>([])
//     const [editingCourse, setEditingCourse] = useState<any>(null)
//     const [loading, setLoading] = useState(false)

//     const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1)
//     const game = useRef(new Chess())
//     const [chapterFen, setChapterFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//     const [selectedTool, setSelectedTool] = useState<Tool>(null)
//     const [boardWidth, setBoardWidth] = useState(500)
//     const boardContainerRef = useRef<HTMLDivElement>(null)

//     useEffect(() => {
//         if (!boardContainerRef.current) return
//         const observer = new ResizeObserver(entries => {
//             for (let entry of entries) {
//                 setBoardWidth(entry.contentRect.width)
//             }
//         })
//         observer.observe(boardContainerRef.current)
//         return () => observer.disconnect()
//     }, [])

//     const fetchCourses = async () => {
//         setLoading(true)
//         try {
//             const res = await fetch('/api/courses')
//             if (res.ok) {
//                 const data = await res.json()
//                 setCourses(data)
//             }
//         } catch (e) { console.error(e) }
//         finally { setLoading(false) }
//     }
//     useEffect(() => { fetchCourses() }, [])

//     const handleCreateCourse = () => {
//         setEditingCourse({ title: '', description: '', level: 'BEGINNER', chapters: [], audioUrl: null })
//         setView('EDIT_COURSE')
//         setActiveChapterIndex(-1)
//     }

//     // --- NEW: Delete Course Functionality ---
//     const handleDeleteCourse = async (id: string) => {
//         if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
//         try {
//             const res = await fetch('/api/courses', {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id })
//             });
//             if (res.ok) {
//                 fetchCourses();
//             } else {
//                 alert("Failed to delete course");
//             }
//         } catch (e) { console.error(e); }
//     }

//     const saveCourse = async () => {
//         try {
//             const method = editingCourse.id ? 'PUT' : 'POST'
//             const res = await fetch('/api/courses', {
//                 method: method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(editingCourse)
//             })
//             if (res.ok) {
//                 alert('Course saved successfully!')
//                 fetchCourses()
//                 setView('LIST')
//             } else {
//                 alert('Failed to save course')
//             }
//         } catch (e) { console.error(e); alert('Error saving course') }
//     }

//     const updateBoard = () => {
//         const fen = game.current.fen()
//         setChapterFen(fen)
//         if (activeChapterIndex > -1) {
//             const updatedChapters = [...editingCourse.chapters]
//             updatedChapters[activeChapterIndex] = { ...updatedChapters[activeChapterIndex], fen: fen }
//             setEditingCourse({ ...editingCourse, chapters: updatedChapters })
//         }
//     }
//     const onSquareClick = (square: string) => {
//         if (activeChapterIndex === -1 || !selectedTool) return
//         if (selectedTool === 'TRASH') game.current.remove(square as any)
//         else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
//         updateBoard()
//     }
//     const onPieceDrop = (source: string, target: string, piece: string) => {
//         if (activeChapterIndex === -1) return false
//         const p = game.current.get(source as any)
//         if (!p) return false
//         game.current.remove(source as any)
//         game.current.put(p, target as any)
//         updateBoard()
//         return true
//     }
//     const onSquareRightClick = (square: string) => {
//         game.current.remove(square as any)
//         updateBoard()
//     }

//     if (view === 'LIST') {
//         return (
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><BookOpen className="text-orange-600" /> Courses</h2>
//                     <button onClick={handleCreateCourse} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5">
//                         <Plus size={18} /> Create Course
//                     </button>
//                 </div>

//                 {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline" /></div> : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {courses.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">No courses found.</div>}
//                         {courses.map(c => (
//                             <div key={c.id} className="border rounded-xl p-5 hover:shadow-lg transition-shadow bg-gray-50 flex flex-col justify-between h-48 group">
//                                 <div>
//                                     <div className="flex justify-between items-start">
//                                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${c.level === 'BEGINNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{c.level}</span>
//                                         <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }} className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
//                                             <Trash2 size={16} />
//                                         </button>
//                                     </div>
//                                     <h3 className="text-xl font-bold text-slate-800 mt-2 mb-1">{c.title}</h3>
//                                     <p className="text-sm text-gray-500">{c.chapters?.length || 0} Lessons</p>
//                                 </div>
//                                 <button onClick={() => { setEditingCourse(c); setView('EDIT_COURSE'); setActiveChapterIndex(-1); }} className="w-full mt-4 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 py-2 rounded font-bold text-sm flex items-center justify-center gap-2">
//                                     <Edit size={14} /> Edit Course
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         )
//     }
//     return (
//         <div className="bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col h-[85vh]">
//             <div className="bg-white border-b p-4 flex justify-between items-center shrink-0">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => setView('LIST')} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><ArrowLeft /></button>
//                     <div>
//                         <h2 className="text-lg font-bold text-slate-800">{editingCourse.title || 'New Course'}</h2>
//                         <p className="text-xs text-slate-500">Course Editor</p>
//                     </div>
//                 </div>
//                 <button onClick={saveCourse} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors">
//                     <Save size={18} /> Save Changes
//                 </button>
//             </div>
//             <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
//                 {/* Sidebar */}
//                 <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 bg-gray-50 flex flex-col shrink-0 max-h-[40vh] lg:max-h-full">
//                     <div className="p-4 space-y-3">
//                         <label className="text-xs font-bold text-gray-400 uppercase">Settings</label>
//                         <input
//                             className="w-full border p-2 rounded bg-white focus:ring-2 ring-orange-200 outline-none"
//                             placeholder="Course Title"
//                             value={editingCourse.title}
//                             onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
//                         />
//                         <select className="w-full border p-2 rounded bg-white" value={editingCourse.level} onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value })}>
//                             <option value="BEGINNER">Beginner</option>
//                             <option value="INTERMEDIATE">Intermediate</option>
//                             <option value="ADVANCED">Advanced</option>
//                         </select>

//                         <div className="pt-4">
//                             <AudioRecorder
//                                 onRecordingComplete={(url) => setEditingCourse({ ...editingCourse, audioUrl: url })}
//                                 initialAudio={editingCourse.audioUrl}
//                             />
//                         </div>

//                         <div className="flex justify-between items-center mt-6 mb-2">
//                             <span className="text-xs font-bold text-gray-400 uppercase">Chapters</span>
//                         </div>
//                         <button
//                             onClick={() => {
//                                 const newChap = { title: 'New Lesson', content: '', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }
//                                 const newChaps = [...editingCourse.chapters, newChap]
//                                 setEditingCourse({ ...editingCourse, chapters: newChaps })
//                                 setActiveChapterIndex(newChaps.length - 1)
//                                 game.current.load(newChap.fen)
//                                 setChapterFen(newChap.fen)
//                             }}
//                             className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 font-bold py-2 rounded hover:border-orange-400 hover:text-orange-500 transition-colors"
//                         >
//                             + Add Lesson
//                         </button>
//                     </div>
//                     <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
//                         {editingCourse.chapters.map((chap: any, idx: number) => (
//                             <div
//                                 key={idx}
//                                 onClick={() => { setActiveChapterIndex(idx); game.current.load(chap.fen); setChapterFen(chap.fen) }}
//                                 className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all border
//                         ${activeChapterIndex === idx ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
//                             >
//                                 <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeChapterIndex === idx ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
//                                 <div className="truncate text-sm font-medium text-slate-700">{chap.title || 'Untitled'}</div>
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         const newChaps = editingCourse.chapters.filter((_: any, i: number) => i !== idx);
//                                         setEditingCourse({ ...editingCourse, chapters: newChaps });
//                                         if (activeChapterIndex === idx) setActiveChapterIndex(-1);
//                                     }}
//                                     className="ml-auto text-gray-300 hover:text-red-500"
//                                 ><Trash2 size={14} /></button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 {/* Editor Area */}
//                 <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
//                     {activeChapterIndex !== -1 ? (
//                         <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-8">
//                             <div className="lg:col-span-5 flex flex-col gap-4 h-full">
//                                 <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full">
//                                     <input
//                                         className="text-2xl font-bold bg-transparent border-b border-gray-100 focus:border-orange-500 outline-none pb-2 w-full mb-4 text-slate-800"
//                                         value={editingCourse.chapters[activeChapterIndex].title}
//                                         onChange={(e) => {
//                                             const newChaps = [...editingCourse.chapters]
//                                             newChaps[activeChapterIndex].title = e.target.value
//                                             setEditingCourse({ ...editingCourse, chapters: newChaps })
//                                         }}
//                                         placeholder="Lesson Title"
//                                     />
//                                     <div className="flex-1 flex flex-col">
//                                         <label className="text-xs font-bold text-gray-400 uppercase mb-2">Coach Notes / Script</label>
//                                         <textarea
//                                             className="flex-1 w-full border rounded-lg p-4 resize-none focus:ring-2 focus:ring-orange-500 outline-none text-sm leading-relaxed text-slate-600 bg-gray-50"
//                                             placeholder="Write instructions for the coach here..."
//                                             value={editingCourse.chapters[activeChapterIndex].content}
//                                             onChange={(e) => {
//                                                 const newChaps = [...editingCourse.chapters]
//                                                 newChaps[activeChapterIndex].content = e.target.value
//                                                 setEditingCourse({ ...editingCourse, chapters: newChaps })
//                                             }}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="lg:col-span-7 flex flex-col gap-4">
//                                 <div ref={boardContainerRef} className="bg-white p-1 rounded-xl shadow-lg border border-slate-200 w-full max-w-[550px] mx-auto">
//                                     <Chessboard
//                                         position={chapterFen}
//                                         onPieceDrop={onPieceDrop}
//                                         onSquareClick={onSquareClick}
//                                         onSquareRightClick={onSquareRightClick}
//                                         boardWidth={boardWidth}
//                                     />
//                                 </div>
//                                 <BoardSetupPalette
//                                     selectedTool={selectedTool}
//                                     setSelectedTool={setSelectedTool}
//                                     onClear={() => { game.current.clear(); updateBoard() }}
//                                     onReset={() => { game.current.reset(); updateBoard() }}
//                                 />
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
//                             <Settings size={80} className="mb-4 text-gray-200" />
//                             <p className="text-xl font-bold text-gray-400">Select a lesson from the sidebar to edit</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }

// // ==========================================
// // 3. CURRICULUM MANAGER
// // ==========================================
// function CurriculumManager() {
//     const [currentStage, setCurrentStage] = useState<string | null>(null)
//     const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
//     const [content, setContent] = useState<{ folders: any[], puzzles: any[] }>({ folders: [], puzzles: [] })
//     const [view, setView] = useState<'BROWSE' | 'CREATE_PUZZLE'>('BROWSE')
//     const [refreshTrigger, setRefreshTrigger] = useState(0)
//     const [moveModalOpen, setMoveModalOpen] = useState(false)
//     const [movingItem, setMovingItem] = useState<{ id: string, type: 'FOLDER' | 'PUZZLE' } | null>(null)
//     const [availableFolders, setAvailableFolders] = useState<any[]>([])
//     const [newFolderName, setNewFolderName] = useState('')

//     // --- NEW: State for Editing Puzzles ---
//     const [editingPuzzle, setEditingPuzzle] = useState<any>(null)

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
//                 if (data) {
//                     setContent({ folders: data.folders || [], puzzles: data.puzzles || [] })
//                     setSelectedItems(new Set())
//                 }
//             })
//             .catch(console.error)
//     }, [currentStage, breadcrumbs, refreshTrigger])

//     // 2. Actions
//     const handleDelete = async (id: string, type: string) => {
//         if (!confirm(`Delete this ${type.toLowerCase()}? This cannot be undone.`)) return
//         try {
//             const res = await fetch(`/api/content`, {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id, type })
//             })
//             if (res.ok) setRefreshTrigger(p => p + 1)
//         } catch (e) { console.error(e) }
//     }

//     const handleBulkDelete = async () => {
//         if (!confirm(`Delete ${selectedItems.size} items?`)) return
//         const promises = Array.from(selectedItems).map(id => {
//             const isFolder = content.folders.some(f => f.id === id)
//             return fetch(`/api/content`, {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id, type: isFolder ? 'FOLDER' : 'PUZZLE' })
//             })
//         })
//         await Promise.all(promises)
//         setRefreshTrigger(p => p + 1)
//         setSelectedItems(new Set())
//     }

//     const toggleSelection = (id: string) => {
//         const newSet = new Set(selectedItems)
//         if (newSet.has(id)) newSet.delete(id)
//         else newSet.add(id)
//         setSelectedItems(newSet)
//     }

//     const prepareMove = async (item: any, type: 'FOLDER' | 'PUZZLE') => {
//         setMovingItem({ id: item.id, type })
//         try {
//             const res = await fetch('/api/content/folders')
//             if (res.ok) {
//                 const folders = await res.json()
//                 setAvailableFolders([{ id: 'root', name: 'Root Level' }, ...folders])
//             }
//         } catch (e) { console.error(e) }
//         setMoveModalOpen(true)
//     }

//     const handleMoveSubmit = async (targetFolderId: string) => {
//         if (!movingItem) return
//         try {
//             const res = await fetch('/api/content/move', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ itemId: movingItem.id, targetFolderId })
//             })
//             if (res.ok) {
//                 setMoveModalOpen(false)
//                 setMovingItem(null)
//                 setRefreshTrigger(p => p + 1)
//             } else {
//                 alert("Move failed")
//             }
//         } catch (e) { console.error(e) }
//     }

//     const createFolder = async () => {
//         if (!newFolderName) return
//         const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
//         try {
//             const res = await fetch('/api/content', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     type: 'FOLDER',
//                     name: newFolderName,
//                     stage: !parentId ? currentStage : null,
//                     parentId: parentId
//                 })
//             })
//             if (res.ok) {
//                 setNewFolderName('')
//                 setRefreshTrigger(p => p + 1)
//             }
//         } catch (e) { console.error(e) }
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
//                     if (selectedItems.size > 0) toggleSelection(item.id)
//                     else if (type === 'FOLDER') setBreadcrumbs([...breadcrumbs, item])
//                 }}
//             >
//                 <div className="absolute top-2 left-2 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id) }}>
//                     {isSelected ? <CheckSquare className="text-orange-600" /> : <Square className="text-gray-300 hover:text-gray-500" />}
//                 </div>
//                 <div className="absolute top-2 right-2">
//                     <button
//                         onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
//                         className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                         <MoreVertical size={16} />
//                     </button>
//                     {showMenu && (
//                         <div className="absolute right-0 top-6 bg-white shadow-xl border rounded-lg w-32 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
//                             {type === 'PUZZLE' && (
//                                 <button onClick={() => { setEditingPuzzle(item); setView('CREATE_PUZZLE') }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-slate-700">
//                                     <Pencil size={12} /> Edit
//                                 </button>
//                             )}
//                             <button onClick={() => prepareMove(item, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-slate-700">
//                                 <FolderInput size={12} /> Move
//                             </button>
//                             <button onClick={() => handleDelete(item.id, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 flex items-center gap-2">
//                                 <Trash2 size={12} /> Delete
//                             </button>
//                         </div>
//                     )}
//                     {showMenu && <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />}
//                 </div>
//                 {type === 'FOLDER' ? <Folder className="w-10 h-10 text-blue-500 mb-2" /> : <FileText className="w-8 h-8 text-orange-500 mb-2" />}
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
//             existingPuzzle={editingPuzzle}
//             onBack={() => { setView('BROWSE'); setRefreshTrigger(p => p + 1); setEditingPuzzle(null) }}
//         />
//     }

//     if (!currentStage) {
//         return (
//             <div className="bg-white rounded-xl shadow-sm border p-8 min-h-[500px]">
//                 <h2 className="text-2xl font-bold mb-8 text-slate-800">Select Difficulty Level</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(stage => (
//                         <button key={stage} onClick={() => setCurrentStage(stage)} className="h-48 group relative overflow-hidden bg-white border-2 hover:border-orange-500 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4">
//                             <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
//                             <div className="relative z-10 p-4 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform"><Folder size={32} /></div>
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
//                 <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide max-w-full">
//                     <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="font-bold text-gray-400 hover:text-black transition-colors">Levels</button>
//                     <ChevronRight size={16} className="text-gray-300" />
//                     <span className="font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded">{currentStage}</span>
//                     {breadcrumbs.map((b, i) => (
//                         <div key={b.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
//                             <ChevronRight size={16} className="text-gray-300" />
//                             <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="hover:bg-gray-100 px-2 py-1 rounded font-medium text-slate-700">{b.name}</button>
//                         </div>
//                     ))}
//                 </div>
//                 {selectedItems.size > 0 && (
//                     <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors animate-in fade-in">
//                         <Trash2 size={14} /> Delete Selected ({selectedItems.size})
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
//                 <button onClick={() => { setEditingPuzzle(null); setView('CREATE_PUZZLE') }} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 font-bold">
//                     <Plus size={20} /> New Puzzle
//                 </button>
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
//                                 <Folder size={16} className="text-blue-400" />
//                                 {folder.name}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     )
// }

// // ==========================================
// // 4. PUZZLE CREATOR
// // ==========================================
// function PuzzleCreator({ folderId, existingPuzzle, onBack }: { folderId: string, existingPuzzle?: any, onBack: () => void }) {
//     const game = useRef(new Chess())

//     const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//     const [manualFen, setManualFen] = useState(fen)
//     const [moves, setMoves] = useState<string[]>([])
//     const [title, setTitle] = useState('')
//     const [mode, setMode] = useState<'SETUP' | 'RECORD'>('SETUP')
//     const [selectedTool, setSelectedTool] = useState<Tool>(null)
//     const [startFen, setStartFen] = useState<string | null>(null)
//     const [stars, setStars] = useState<string[]>([])
//     const [initialStars, setInitialStars] = useState<string[]>([])
//     const [isPgnModalOpen, setIsPgnModalOpen] = useState(false)
//     const [pgnInput, setPgnInput] = useState('')
//     const [boardWidth, setBoardWidth] = useState(500)
//     const boardContainerRef = useRef<HTMLDivElement>(null)

//     useEffect(() => {
//         if (!boardContainerRef.current) return
//         const observer = new ResizeObserver(entries => {
//             for (let entry of entries) {
//                 setBoardWidth(entry.contentRect.width)
//             }
//         })
//         observer.observe(boardContainerRef.current)
//         return () => observer.disconnect()
//     }, [])

//     // --- EFFECT: Load Existing Data ---
//     useEffect(() => {
//         if (existingPuzzle) {
//             setTitle(existingPuzzle.title)
//             setFen(existingPuzzle.fen)
//             setStartFen(existingPuzzle.fen)
//             setManualFen(existingPuzzle.fen)

//             if (existingPuzzle.solution) {
//                 setMoves(existingPuzzle.solution.split(' '))
//             }
//             if (existingPuzzle.data?.stars) {
//                 setInitialStars(existingPuzzle.data.stars)
//                 setStars(existingPuzzle.data.stars)
//             }

//             try {
//                 game.current.load(existingPuzzle.fen)
//             } catch (e) { }

//             // Go straight to record mode so they can just save if needed
//             setMode('RECORD')
//         }
//     }, [existingPuzzle])

//     const getTurnFromFen = (fenStr: string) => {
//         const parts = fenStr.split(' ')
//         return parts.length > 1 ? parts[1] : 'w'
//     }
//     const updateBoard = () => {
//         try {
//             setFen(game.current.fen())
//         } catch (e) { }
//     }

//     useEffect(() => {
//         setManualFen(fen)
//     }, [fen])

//     const handleManualFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const input = e.target.value
//         setManualFen(input)
//         try {
//             game.current.load(input)
//             setFen(game.current.fen())
//         } catch (error) {
//             setFen(input)
//         }
//     }

//     const toggleTurn = (color: 'w' | 'b') => {
//         if (mode !== 'SETUP') return
//         const parts = fen.split(' ')
//         if (parts.length >= 2) {
//             parts[1] = color
//             const newFen = parts.join(' ')
//             setFen(newFen)
//             try { game.current.load(newFen) } catch (e) { }
//         }
//     }

//     const handleImportPgn = () => {
//         try {
//             game.current.loadPgn(pgnInput)
//             const history = game.current.history()

//             if (history.length > 0) {
//                 while (game.current.undo() !== null) { }
//                 const initialFen = game.current.fen()
//                 setStartFen(initialFen)
//                 setFen(initialFen)
//                 setMoves(history)
//                 setMode('RECORD')
//                 alert(`Imported! ${history.length} moves loaded as solution.`)
//             } else {
//                 setFen(game.current.fen())
//             }
//             setIsPgnModalOpen(false)
//             setPgnInput('')
//         } catch (e) {
//             alert("Invalid PGN. Please check syntax.")
//         }
//     }

//     const toggleMode = () => {
//         if (mode === 'SETUP') {
//             const boardOnly = fen.split(" ")[0];
//             const hasKings = boardOnly.includes("K") && boardOnly.includes("k");

//             if (stars.length === 0 && !hasKings) {
//                 if (!confirm("Board has missing kings. This will be treated as a custom exercise (non-standard chess). Continue?")) return;
//             }

//             setInitialStars([...stars]);
//             setStartFen(fen)
//             setMoves([])
//             setMode('RECORD')
//             setSelectedTool(null)
//         } else {
//             setMode('SETUP')
//             setStartFen(null)
//             setStars([...initialStars])
//         }
//     }

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
//         if (mode !== 'SETUP' || !selectedTool) return

//         if (stars.includes(square)) setStars(stars.filter(s => s !== square))

//         if (selectedTool === 'TRASH') {
//             game.current.remove(square as any)
//         } else {
//             game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
//         }
//         setFen(game.current.fen())
//     }

//     const onPieceDrop = (source: string, target: string, piece: string) => {
//         if (mode === 'SETUP') {
//             const p = game.current.get(source as any)
//             if (!p) return false
//             game.current.remove(source as any)
//             game.current.put(p, target as any)
//             setFen(game.current.fen())
//             return true
//         }

//         if (mode === 'RECORD') {
//             if (stars.includes(target)) {
//                 setStars(stars.filter(s => s !== target))
//                 const p = game.current.get(source as any)
//                 game.current.remove(source as any)
//                 game.current.put(p as any, target as any)
//                 setMoves([...moves, `${source}-${target}`])
//                 setFen(game.current.fen())
//                 return true
//             }
//             try {
//                 const move = game.current.move({ from: source as any, to: target as any, promotion: 'q' })
//                 if (!move) return false
//                 setMoves([...moves, move.san])
//                 setFen(game.current.fen())
//                 return true
//             } catch { return false }
//         }
//         return false
//     }

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
//         if (!title || !startFen) return

//         // --- KEY FIX: Use moves state directly ---
//         const payload: any = {
//             type: 'PUZZLE',
//             title: title,
//             fen: startFen, // Ensure this is the puzzle start position
//             solution: moves.join(' '), // This uses the current moves array
//             data: { stars: initialStars }
//         }

//         const method = existingPuzzle ? 'PUT' : 'POST'
//         if (existingPuzzle) {
//             payload.id = existingPuzzle.id
//         } else {
//             payload.parentId = folderId === 'root' ? null : folderId
//         }

//         try {
//             const res = await fetch('/api/content', {
//                 method: method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             if (res.ok) {
//                 alert(existingPuzzle ? "Puzzle Updated!" : "Puzzle Saved!")
//                 onBack()
//             } else {
//                 alert("Failed to save puzzle")
//             }
//         } catch (e) { console.error(e) }
//     }

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl border h-full min-h-[600px]">
//             <div className="lg:col-span-5 flex justify-center">
//                 <div ref={boardContainerRef} className={`w-full max-w-[500px] border-4 rounded-xl shadow-lg overflow-hidden transition-colors ${mode === 'RECORD' ? 'border-green-500' : 'border-blue-500'}`}>
//                     <Chessboard
//                         position={fen}
//                         onPieceDrop={onPieceDrop}
//                         onSquareClick={onSquareClick}
//                         onSquareRightClick={onSquareRightClick}
//                         customSquareStyles={customSquareStyles}
//                         boardWidth={boardWidth}
//                     />
//                 </div>
//             </div>

//             <div className="lg:col-span-7 flex flex-col gap-6">
//                 <div className="flex items-center gap-2 border-b pb-4 justify-between">
//                     <div className="flex items-center gap-2">
//                         <button onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"><ArrowLeft size={20} /></button>
//                         <div>
//                             <h2 className="text-2xl font-bold text-slate-800">{existingPuzzle ? 'Edit Puzzle' : 'New Puzzle'}</h2>
//                             <div className="flex items-center gap-2 text-sm text-gray-500">
//                                 <span className={`w-2 h-2 rounded-full ${mode === 'SETUP' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
//                                 Step {mode === 'SETUP' ? '1: Setup Board' : '2: Play Solution'}
//                             </div>
//                         </div>
//                     </div>
//                     {mode === 'SETUP' && (
//                         <button onClick={() => setIsPgnModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
//                             <FileText size={14} /> Import PGN
//                         </button>
//                     )}
//                 </div>

//                 {mode === 'SETUP' && (
//                     <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
//                         <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard() }} onReset={() => { game.current.reset(); updateBoard() }} />
//                         <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-center gap-2">
//                             <Star size={14} className="text-yellow-600 fill-yellow-600" />
//                             <span><b>Right-Click</b> on a square to add/remove a Star target.</span>
//                         </div>
//                         <div className="bg-gray-50 p-4 rounded-xl border">
//                             <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-400 uppercase">Side to Move</span></div>
//                             <div className="flex gap-2">
//                                 <button onClick={() => toggleTurn('w')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${getTurnFromFen(fen) === 'w' ? 'bg-white border-2 border-orange-500 text-orange-600 shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>White</button>
//                                 <button onClick={() => toggleTurn('b')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${getTurnFromFen(fen) === 'b' ? 'bg-slate-800 border-2 border-slate-800 text-white shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>Black</button>
//                             </div>
//                         </div>
//                         <div className="bg-gray-50 p-4 rounded-xl border">
//                             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Direct FEN Input</label>
//                             <div className="flex gap-2">
//                                 <input type="text" className="w-full border p-2 rounded text-sm font-mono text-slate-600 focus:ring-2 focus:ring-orange-500 outline-none" value={manualFen} onChange={handleManualFenChange} placeholder="Paste FEN string here..." />
//                                 <button onClick={() => { navigator.clipboard.writeText(manualFen); alert("FEN Copied!") }} className="p-2 bg-white border rounded hover:bg-gray-100 text-gray-500" title="Copy FEN"><Copy size={16} /></button>
//                             </div>
//                         </div>
//                         <div className="mt-4 flex justify-end">
//                             <button onClick={toggleMode} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-black transition-all flex items-center gap-2">
//                                 Next: Record Solution <ChevronRight size={18} />
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {mode === 'RECORD' && (
//                     <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
//                         <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
//                             <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2"><Play size={18} /> Recording Moves...</h3>
//                             <p className="text-sm text-green-700 mb-3">{stars.length > 0 ? `Collect the stars! (${stars.length} remaining).` : "Play the solution on the board."}</p>
//                             <div className="bg-white p-4 rounded-lg font-mono text-lg min-h-[60px] shadow-inner border border-green-100 break-words">
//                                 {moves.length > 0 ? moves.join(' ') : <span className="text-gray-300">Make a move...</span>}
//                             </div>
//                         </div>
//                         <div className="flex gap-3">
//                             <button onClick={() => { game.current.load(startFen!); setFen(startFen!); setMoves([]); setStars([...initialStars]); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700 flex items-center gap-2"><RotateCcw size={16} /> Reset</button>
//                         </div>
//                         <div className="pt-6 border-t mt-6 space-y-4">
//                             <input className="w-full text-lg border-2 border-gray-200 rounded-lg p-3 font-bold focus:border-orange-500 outline-none" placeholder="Puzzle Title" value={title} onChange={e => setTitle(e.target.value)} />
//                             <div className="flex gap-4">
//                                 <button onClick={toggleMode} className="px-6 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Back to Setup</button>
//                                 <button onClick={savePuzzle} disabled={moves.length === 0} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all">
//                                     {existingPuzzle ? 'Update Puzzle' : 'Save Puzzle'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//                 <Modal isOpen={isPgnModalOpen} onClose={() => setIsPgnModalOpen(false)} title="Import PGN">
//                     <div className="space-y-4">
//                         <p className="text-sm text-gray-500">Paste a PGN string below.</p>
//                         <textarea className="w-full h-40 border rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={pgnInput} onChange={(e) => setPgnInput(e.target.value)} />
//                         <div className="flex justify-end gap-2">
//                             <button onClick={() => setIsPgnModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
//                             <button onClick={handleImportPgn} className="px-6 py-2 bg-slate-900 text-white rounded font-bold hover:bg-black">Import</button>
//                         </div>
//                     </div>
//                 </Modal>
//             </div>
//         </div>
//     )
// }

// // ==========================================
// // 5. ANALYSIS BOARD (No Changes)
// // ==========================================
// function AnalysisBoard() {
//     const game = useRef(new Chess())
//     const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
//     const [squares, setSquares] = useState<Record<string, any>>({})
//     const [orientation, setOrientation] = useState<'white' | 'black'>('white')
//     const [setupMode, setSetupMode] = useState(false)
//     const [selectedTool, setSelectedTool] = useState<Tool>(null)
//     const [boardWidth, setBoardWidth] = useState(600)
//     const boardContainerRef = useRef<HTMLDivElement>(null)

//     useEffect(() => {
//         if (!boardContainerRef.current) return
//         const observer = new ResizeObserver(entries => {
//             for (let entry of entries) {
//                 setBoardWidth(entry.contentRect.width)
//             }
//         })
//         observer.observe(boardContainerRef.current)
//         return () => observer.disconnect()
//     }, [])

//     const updateBoard = () => setFen(game.current.fen())

//     const clearHighlight = (square: string) => {
//         setSquares((prev) => {
//             if (prev[square]) {
//                 const newSquares = { ...prev }
//                 delete newSquares[square]
//                 return newSquares
//             }
//             return prev
//         })
//     }

//     const onPieceDrop = (source: string, target: string, piece: string) => {
//         if (setupMode) {
//             const p = game.current.get(source as any)
//             if (!p) return false
//             game.current.remove(source as any)
//             game.current.put(p as any, target as any)
//             updateBoard()
//             clearHighlight(target)
//             return true
//         }
//         try {
//             const move = game.current.move({ from: source as any, to: target as any, promotion: 'q' })
//             if (!move) return false
//             setFen(game.current.fen())
//             clearHighlight(target)
//             return true
//         } catch { return false }
//     }

//     const onSquareClick = (square: string) => {
//         if (setupMode && selectedTool) {
//             if (selectedTool === 'TRASH') game.current.remove(square as any)
//             else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
//             updateBoard()
//             clearHighlight(square)
//         }
//     }

//     const onSquareRightClick = (square: string) => {
//         if (!setupMode) {
//             setSquares(prev => {
//                 const s = { ...prev }
//                 if (!s[square]) s[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
//                 else if (s[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') s[square] = { background: 'radial-gradient(circle, gold 20%, transparent 30%)', backgroundColor: 'rgba(0, 0, 0, 0)' }
//                 else delete s[square]
//                 return s
//             })
//         }
//     }

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl shadow-sm border">
//             <div className="lg:col-span-8 flex justify-center">
//                 <div ref={boardContainerRef} className="w-full max-w-[600px] aspect-square border-4 border-slate-700 rounded shadow-2xl relative" id="analysis-board-container">
//                     <Chessboard
//                         position={fen}
//                         onPieceDrop={onPieceDrop}
//                         onSquareClick={onSquareClick}
//                         onSquareRightClick={onSquareRightClick}
//                         customSquareStyles={squares}
//                         boardOrientation={orientation}
//                         arePiecesDraggable={true}
//                         boardWidth={boardWidth}
//                     />
//                     {setupMode && <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse">SETUP MODE</div>}
//                 </div>
//             </div>

//             <div className="lg:col-span-4 space-y-6">
//                 <div>
//                     <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800"><MousePointer2 className="text-orange-500" /> Analysis Tools</h3>
//                     <div className="flex gap-2 mb-4">
//                         <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="flex-1 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"><RotateCcw size={16} /> Reset</button>
//                         <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="flex-1 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"><ArrowUpDown size={16} /> Flip</button>
//                     </div>
//                     <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }} className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors ${setupMode ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
//                         <Settings size={16} /> {setupMode ? 'Exit Setup Mode' : 'Edit Board Position'}
//                     </button>
//                 </div>

//                 {setupMode && (
//                     <div className="border-t pt-4 animate-in fade-in slide-in-from-top-4">
//                         <BoardSetupPalette
//                             selectedTool={selectedTool}
//                             setSelectedTool={setSelectedTool}
//                             onClear={() => { game.current.clear(); updateBoard() }}
//                             onReset={() => { game.current.reset(); updateBoard() }}
//                         />
//                     </div>
//                 )}
//             </div>
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
    MoreVertical, FolderInput, X, Search, Star, CheckSquare, Square, Pencil, Clock, CreditCard,
    TrendingUp, Calculator, Calendar
} from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'

// --- TYPES ---
type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

// --- REUSABLE COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] backdrop-blur-sm p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b shrink-0 bg-gray-50/50">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto no-scrollbar">
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

            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3">
                <div className="flex gap-1 flex-wrap justify-center">
                    {pieces.map(p => (
                        <div
                            key={'w' + p}
                            onClick={() => setSelectedTool({ type: p, color: 'w' })}
                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
                            ${selectedTool?.type === p && selectedTool?.color === 'w' ? 'bg-orange-100 border-orange-500 scale-110' : ''}`}
                        >
                            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">
                                {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : p === 'q' ? '♛' : '♚'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-1 flex-wrap justify-center border-l pl-2 md:pl-4">
                    {pieces.map(p => (
                        <div
                            key={'b' + p}
                            onClick={() => setSelectedTool({ type: p, color: 'b' })}
                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent
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
    const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'puzzles' | 'analysis' | 'classes' | 'payments'>('users')
    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-20">
            {/* 
                STAY BELOW NAVBAR: 
                - md:top-[88px] accounts for the fixed height of your main header 
                - z-40 ensures it's above content but below main nav (z-100)
            */}
            <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-[72px] md:top-[88px] xl:top-[100px] z-50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-orange-200 shadow-lg shrink-0">C</div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Royal Rooks Admin</h1>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                        {[
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'classes', label: 'Batch/Classes', icon: Clock },
                            { id: 'payments', label: 'Payments', icon: CreditCard },
                            { id: 'courses', label: 'Courses', icon: BookOpen },
                            { id: 'puzzles', label: 'Puzzles', icon: Folder },
                            { id: 'analysis', label: 'Analysis', icon: MousePointer2 }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
                            >
                                <tab.icon size={16} className="shrink-0" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-6 max-w-7xl mx-auto mt-4 md:mt-8">
                {activeTab === 'users' && <UserManager />}
                {activeTab === 'classes' && <ClassManager />}
                {activeTab === 'payments' && <PaymentManager />}
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
    const [formData, setFormData] = useState<any>({
        name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '',
        joiningDate: '', birthDate: '', address: '', parentName: '', parentPhone: '',
        photoUrl: '', idCardUrl: ''
    })
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
                setFormData({
                    name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '',
                    joiningDate: '', birthDate: '', address: '', parentName: '', parentPhone: '',
                    photoUrl: '', idCardUrl: ''
                })
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
            stage: user.stage, coachId: user.coachId || '', password: '',
            joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : '',
            birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
            address: user.address || '',
            parentName: user.parentName || '',
            parentPhone: user.parentPhone || '',
            photoUrl: user.photoUrl || '',
            idCardUrl: user.idCardUrl || ''
        })
        setEditingId(user.id)
        setIsModalOpen(true)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <Users className="text-orange-600" /> Manage Users
                </h2>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setIsModalOpen(true);
                        setFormData({
                            name: '', email: '', password: '', role: 'STUDENT', stage: 'BEGINNER', coachId: '',
                            joiningDate: '', birthDate: '', address: '', parentName: '', parentPhone: '',
                            photoUrl: '', idCardUrl: ''
                        })
                    }} 
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} /> Add User
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div>
            ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0 rounded-lg border border-gray-100">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Coach</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.status === 'BLOCKED' ? 'bg-red-50/50' : ''}`}>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{u.name}</div>
                                        <div className="text-[10px] text-gray-400 font-medium uppercase">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${u.status === 'BLOCKED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'COACH' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-semibold text-slate-600">{u.role === 'STUDENT' ? u.stage : '-'}</td>
                                    <td className="p-4 text-xs font-semibold text-blue-600">{u.coach?.name || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1 md:gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(u)}
                                                className={`p-2 rounded-lg transition-colors ${u.status === 'BLOCKED' ? 'text-green-600 hover:bg-green-100' : 'text-red-400 hover:bg-red-50'}`}
                                                title={u.status === 'BLOCKED' ? 'Activate User' : 'Block User'}
                                            >
                                                {u.status === 'BLOCKED' ? <Check size={18} /> : <X size={18} />}
                                            </button>
                                            <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit User Account" : "Create New User"}>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                            <input className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-orange-100 outline-none transition-all" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                            <input className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-orange-100 outline-none transition-all" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                        <input className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-orange-100 outline-none transition-all" type="password" placeholder={editingId ? "•••••••• (Leave blank to keep)" : "Minimum 6 characters"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Level / Role</label>
                        <select className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none cursor-pointer" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                            <option value="STUDENT">Student</option>
                            <option value="COACH">Coach / Instructor</option>
                            <option value="ADMIN">Super Admin</option>
                        </select>
                    </div>

                    {formData.role === 'STUDENT' && (
                        <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                <div>
                                    <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Current Level</label>
                                    <select className="w-full border p-2.5 rounded-xl mt-1 bg-white outline-none" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Assign Instructor</label>
                                    <select className="w-full border p-2.5 rounded-xl mt-1 bg-white outline-none" value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })}>
                                        <option value="">-- No Coach Assigned --</option>
                                        {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joining Date</label>
                                    <input type="date" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Birth</label>
                                    <input type="date" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Physical Address</label>
                                <textarea className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none h-20 resize-none" placeholder="Residential Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Name</label>
                                    <input className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none" placeholder="Full Name" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emergency Phone</label>
                                    <input className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none" placeholder="+91 ..." value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Photo</label>
                                    <input type="file" accept="image/*" className="text-[10px] w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result });
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                    {formData.photoUrl && <img src={formData.photoUrl} className="w-16 h-16 object-cover rounded-xl mt-2 border-2 border-orange-100 shadow-sm" alt="Preview" />}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ID Document</label>
                                    <input type="file" accept="image/*" className="text-[10px] w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setFormData({ ...formData, idCardUrl: reader.result });
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                    {formData.idCardUrl && <img src={formData.idCardUrl} className="w-16 h-16 object-cover rounded-xl mt-2 border-2 border-orange-100 shadow-sm" alt="ID Preview" />}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black shadow-lg mt-6 transition-all active:scale-95">
                        {editingId ? 'Update Profile' : 'Register User'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

// ==========================================
// 1.5 BATCH / CLASS MANAGER
// ==========================================
function ClassManager() {
    const [classes, setClasses] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [coaches, setCoaches] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
    const [editingClass, setEditingClass] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: '', dayOfWeek: 'Monday', startTime: '17:00', endTime: '18:00', coachId: '', meetingLink: ''
    })
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [classRes, userRes] = await Promise.all([
                fetch('/api/classes'),
                fetch('/api/admin/users')
            ])
            const classData = await classRes.json()
            const userData = await userRes.json()

            if (classRes.ok && Array.isArray(classData)) setClasses(classData)
            if (userRes.ok && Array.isArray(userData)) {
                setUsers(userData)
                setCoaches(userData.filter(u => u.role === 'COACH' || u.role === 'ADMIN'))
                setStudents(userData.filter(u => u.role === 'STUDENT'))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingClass ? 'PUT' : 'POST'
        const payload = editingClass ? { ...formData, id: editingClass.id } : formData

        try {
            const res = await fetch('/api/classes', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setIsModalOpen(false)
                fetchData()
            } else {
                const err = await res.json()
                alert(err.error || "Failed to save class")
            }
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the class and its attendance records.")) return
        try {
            const res = await fetch(`/api/classes?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchData()
        } catch (e) { console.error(e) }
    }

    const handleEnroll = async () => {
        try {
            const res = await fetch('/api/classes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingClass.id, studentIds: selectedStudents })
            })
            if (res.ok) {
                setIsEnrollModalOpen(false)
                fetchData()
            } else {
                const err = await res.json()
                alert(err.error || "Failed to enroll students")
            }
        } catch (e) { console.error(e) }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="text-orange-600" /> Batch Management</h2>
                <button onClick={() => {
                    setEditingClass(null);
                    setFormData({ name: '', dayOfWeek: 'Monday', startTime: '17:00', endTime: '18:00', coachId: '', meetingLink: '' });
                    setIsModalOpen(true);
                }} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                    <Plus size={18} /> New Batch
                </button>
            </div>

            {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {classes.map(c => (
                        <div key={c.id} className="border rounded-2xl p-4 md:p-5 hover:shadow-lg transition-all bg-slate-50 border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-black text-base md:text-lg text-slate-800 tracking-tight leading-tight">{c.name}</h3>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => {
                                        setEditingClass(c);
                                        setFormData({
                                            name: c.name, dayOfWeek: c.dayOfWeek,
                                            startTime: c.startTime, endTime: c.endTime, coachId: c.coachId, meetingLink: c.meetingLink || ''
                                        });
                                        setIsModalOpen(true);
                                    }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    <Calendar size={14} className="text-orange-500" /> {c.dayOfWeek}
                                </div>
                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    <Clock size={14} className="text-orange-500" /> {c.startTime} - {c.endTime}
                                </div>
                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    <Users size={14} className="text-orange-500" /> {c.coach?.name}
                                </div>
                                {c.meetingLink && (
                                    <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest bg-blue-50 py-1 px-2 rounded-lg truncate">
                                        <Video size={14} /> Join Meeting
                                    </a>
                                )}
                            </div>
                            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-black text-[10px] uppercase text-slate-400">Students: {c._count?.students || 0}</span>
                                <button
                                    onClick={() => {
                                        setEditingClass(c);
                                        setSelectedStudents(c.students?.map((s: any) => s.id) || []);
                                        setIsEnrollModalOpen(true);
                                    }}
                                    className="text-[10px] font-black bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                >ROSTER</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "Edit Class Details" : "Schedule New Class"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Class Name</label>
                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-orange-100 outline-none transition-all" placeholder="e.g. Masterclass Group B" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weekly Schedule</label>
                        <select value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 outline-none">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Starts At</label>
                            <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required className="w-full p-3 border rounded-xl bg-gray-50 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ends At</label>
                            <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required className="w-full p-3 border rounded-xl bg-gray-50 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Primary Coach</label>
                        <select value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })} required className="w-full p-3 border rounded-xl bg-gray-50 outline-none">
                            <option value="">Select an Instructor</option>
                            {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Online Classroom Link</label>
                        <input value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 outline-none" placeholder="Zoom / Google Meet URL" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 mt-4">
                        {editingClass ? "Update Class" : "Create Class"}
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={`Student Roster: ${editingClass?.name}`}>
                <div className="space-y-4">
                    <div className="max-h-[350px] overflow-y-auto border rounded-2xl divide-y scrollbar-hide">
                        {students.map(s => (
                            <div key={s.id} onClick={() => {
                                setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])
                            }} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${selectedStudents.includes(s.id) ? 'bg-orange-50' : ''}`}>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                                    <div className="text-[10px] text-slate-500 font-medium uppercase">{s.email}</div>
                                </div>
                                {selectedStudents.includes(s.id) ? <CheckSquare className="text-orange-600" /> : <Square className="text-slate-200" />}
                            </div>
                        ))}
                    </div>
                    <button onClick={handleEnroll} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95">
                        Update Enrollment ({selectedStudents.length})
                    </button>
                </div>
            </Modal>
        </div>
    )
}

// ==========================================
// 1.7 FEE PAYMENT MANAGER
// ==========================================
function PaymentManager() {
    const [payments, setPayments] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPayment, setEditingPayment] = useState<any>(null)
    const [formData, setFormData] = useState({
        amount: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED', method: 'Cash', remarks: '', studentId: ''
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            const [payRes, userRes] = await Promise.all([
                fetch('/api/payments'),
                fetch('/api/admin/users')
            ])
            if (payRes.ok) setPayments(await payRes.json())
            if (userRes.ok) {
                const users = await userRes.json()
                setStudents(users.filter((u: any) => u.role === 'STUDENT'))
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingPayment ? 'PUT' : 'POST'
        const payload = editingPayment ? { ...formData, id: editingPayment.id } : formData

        try {
            const res = await fetch('/api/payments', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setIsModalOpen(false)
                fetchData()
            } else {
                const err = await res.json()
                alert(err.error || "Failed to save payment")
            }
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchData()
        } catch (e) { console.error(e) }
    }

    const totalCollected = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                        <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="text-green-600" size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-800">₹{totalCollected.toLocaleString()}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactions</span>
                        <div className="p-2 bg-blue-50 rounded-lg"><Calculator className="text-blue-600" size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-800">{payments.length}</div>
                </div>
                <button onClick={() => {
                    setEditingPayment(null);
                    setFormData({ amount: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED', method: 'Cash', remarks: '', studentId: '' });
                    setIsModalOpen(true);
                }} className="sm:col-span-2 lg:col-span-1 bg-orange-600 hover:bg-orange-700 text-white font-bold p-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Plus size={20} /> Record New Fee
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                    <h2 className="text-base md:text-lg font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                        <CreditCard size={20} className="text-orange-600" /> Transaction Audit
                    </h2>
                </div>
                {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-orange-600" size={32} /></div> : (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 border-b">
                                <tr>
                                    <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Student</th>
                                    <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                                    <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Details</th>
                                    <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-5">
                                            <div className="font-black text-slate-800 text-sm leading-tight">{p.student?.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{p.student?.email}</div>
                                        </td>
                                        <td className="p-5 font-black text-slate-800 text-base">₹{p.amount.toLocaleString()}</td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Calendar size={12} /> {new Date(p.date).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded w-max uppercase">{p.method}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-1 md:gap-2">
                                                <button onClick={() => {
                                                    setEditingPayment(p);
                                                    setFormData({
                                                        amount: p.amount.toString(),
                                                        date: new Date(p.date).toISOString().split('T')[0],
                                                        status: p.status,
                                                        method: p.method,
                                                        remarks: p.remarks || '',
                                                        studentId: p.studentId
                                                    });
                                                    setIsModalOpen(true);
                                                }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPayment ? "Edit Transaction" : "New Fee Deposit"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingPayment && (
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Student</label>
                            <select value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required className="w-full p-3.5 border rounded-xl bg-gray-50 outline-none">
                                <option value="">Identify student...</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount (INR)</label>
                            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required className="w-full p-3.5 border rounded-xl bg-gray-50 outline-none" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deposit Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="w-full p-3.5 border rounded-xl bg-gray-50 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Method</label>
                            <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className="w-full p-3.5 border rounded-xl bg-gray-50 outline-none">
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI / GPay / PhonePe</option>
                                <option value="Bank Transfer">NEFT / IMPS</option>
                                <option value="Cheque">Bank Cheque</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-3.5 border rounded-xl bg-gray-50 outline-none">
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Internal Notes</label>
                        <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full p-3.5 border rounded-xl bg-gray-50 outline-none h-24 resize-none" placeholder="Transaction ID or specific details..."></textarea>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4">
                        {editingPayment ? "Update Transaction" : "Confirm Deposit"}
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
        setEditingCourse({ title: '', description: '', level: 'BEGINNER', chapters: [], audioUrl: null })
        setView('EDIT_COURSE')
        setActiveChapterIndex(-1)
    }

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
        if (selectedTool === 'TRASH') game.current.remove(square as any)
        else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
        updateBoard()
    }
    const onPieceDrop = (source: string, target: string, piece: string) => {
        if (activeChapterIndex === -1) return false
        const p = game.current.get(source as any)
        if (!p) return false
        game.current.remove(source as any)
        game.current.put(p, target as any)
        updateBoard()
        return true
    }
    const onSquareRightClick = (square: string) => {
        game.current.remove(square as any)
        updateBoard()
    }

    if (view === 'LIST') {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-slate-800 tracking-tight uppercase">
                        <BookOpen size={24} className="text-orange-600" /> Curriculum
                    </h2>
                    <button onClick={handleCreateCourse} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                        <Plus size={20} /> Create New Course
                    </button>
                </div>

                {loading ? <div className="text-center py-20"><Loader2 className="animate-spin inline" /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-20 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl">
                                No curriculum modules found.
                            </div>
                        )}
                        {courses.map(c => (
                            <div key={c.id} className="border-2 border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:border-orange-200 transition-all bg-white flex flex-col justify-between group h-64">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${c.level === 'BEGINNER' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {c.level}
                                        </span>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }} className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 leading-tight">{c.title}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{c.chapters?.length || 0} Professional Lessons</p>
                                </div>
                                <button onClick={() => { setEditingCourse(c); setView('EDIT_COURSE'); setActiveChapterIndex(-1); }} className="w-full mt-6 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Edit size={16} /> Edit Curriculum
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col h-[85vh] fixed inset-4 top-[90px] md:top-[120px] z-[60]">
            <div className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setView('LIST')} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><ArrowLeft /></button>
                    <div>
                        <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">{editingCourse.title || 'Drafting Module'}</h2>
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Curriculum Editor</p>
                    </div>
                </div>
                <button onClick={saveCourse} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors active:scale-95">
                    <Save size={20} /> Publish Module
                </button>
            </div>
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 bg-slate-50 flex flex-col shrink-0 max-h-[35vh] lg:max-h-full">
                    <div className="p-4 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module Core Configuration</label>
                        <input
                            className="w-full border p-3 rounded-xl bg-white focus:ring-2 ring-orange-200 outline-none font-bold"
                            placeholder="Course Title"
                            value={editingCourse.title}
                            onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                        />
                        <select className="w-full border p-3 rounded-xl bg-white outline-none font-bold cursor-pointer" value={editingCourse.level} onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value })}>
                            <option value="BEGINNER">Beginner Level</option>
                            <option value="INTERMEDIATE">Intermediate Level</option>
                            <option value="ADVANCED">Advanced Level</option>
                            <option value="EXPERT">Expert Level</option>
                        </select>

                        <div className="pt-2">
                            <AudioRecorder
                                onRecordingComplete={(url) => setEditingCourse({ ...editingCourse, audioUrl: url })}
                                initialAudio={editingCourse.audioUrl}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lesson Sequences</span>
                        </div>
                        <button
                            onClick={() => {
                                const newChap = { title: 'Lesson Point', content: '', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }
                                const newChaps = [...editingCourse.chapters, newChap]
                                setEditingCourse({ ...editingCourse, chapters: newChaps })
                                setActiveChapterIndex(newChaps.length - 1)
                                game.current.load(newChap.fen)
                                setChapterFen(newChap.fen)
                            }}
                            className="w-full bg-white border-2 border-dashed border-slate-300 text-slate-500 font-black py-3 rounded-xl hover:border-orange-400 hover:text-orange-500 transition-all text-xs uppercase"
                        >
                            + Add Lecture / Drill
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
                        {editingCourse.chapters.map((chap: any, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => { setActiveChapterIndex(idx); game.current.load(chap.fen); setChapterFen(chap.fen) }}
                                className={`p-4 rounded-2xl cursor-pointer flex items-center gap-3 transition-all border
                        ${activeChapterIndex === idx ? 'bg-orange-50 border-orange-500 shadow-md scale-[1.02]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${activeChapterIndex === idx ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</span>
                                <div className="truncate text-xs font-black uppercase tracking-tight text-slate-700">{chap.title || 'Untitled Lesson'}</div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newChaps = editingCourse.chapters.filter((_: any, i: number) => i !== idx);
                                        setEditingCourse({ ...editingCourse, chapters: newChaps });
                                        if (activeChapterIndex === idx) setActiveChapterIndex(-1);
                                    }}
                                    className="ml-auto text-gray-300 hover:text-red-500 transition-colors"
                                ><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50/50 no-scrollbar">
                    {activeChapterIndex !== -1 ? (
                        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <div className="bg-white p-6 rounded-3xl border shadow-lg flex flex-col h-full">
                                    <input
                                        className="text-xl md:text-2xl font-black bg-transparent border-b-2 border-slate-50 focus:border-orange-500 outline-none pb-3 w-full mb-6 text-slate-800 uppercase tracking-tight"
                                        value={editingCourse.chapters[activeChapterIndex].title}
                                        onChange={(e) => {
                                            const newChaps = [...editingCourse.chapters]
                                            newChaps[activeChapterIndex].title = e.target.value
                                            setEditingCourse({ ...editingCourse, chapters: newChaps })
                                        }}
                                        placeholder="Lesson Heading"
                                    />
                                    <div className="flex-1 flex flex-col min-h-[300px]">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lecture Notes & Coach Script</label>
                                        <textarea
                                            className="flex-1 w-full border rounded-2xl p-5 resize-none focus:ring-4 ring-orange-50 outline-none text-sm leading-relaxed text-slate-600 bg-slate-50/50"
                                            placeholder="Outline the concepts for the instructor..."
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

                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <div ref={boardContainerRef} className="bg-white p-2 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[550px] mx-auto">
                                    <Chessboard
                                        position={chapterFen}
                                        onPieceDrop={onPieceDrop}
                                        onSquareClick={onSquareClick}
                                        onSquareRightClick={onSquareRightClick}
                                        boardWidth={boardWidth}
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
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <Settings size={48} className="text-slate-300" />
                            </div>
                            <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Editor Ready</h4>
                            <p className="text-xs font-black text-slate-300 uppercase mt-2">Select a lesson from the left to begin drafting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ==========================================
// 3. CURRICULUM MANAGER (Puzzles)
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
    const [editingPuzzle, setEditingPuzzle] = useState<any>(null)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

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

    const ItemCard = ({ item, type }: { item: any, type: 'FOLDER' | 'PUZZLE' }) => {
        const [showMenu, setShowMenu] = useState(false)
        const isSelected = selectedItems.has(item.id)

        return (
            <div
                className={`relative group h-32 md:h-36 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl
                ${isSelected ? 'bg-orange-50 border-orange-500 ring-4 ring-orange-100' : type === 'FOLDER' ? 'bg-blue-50 border-blue-100 hover:border-blue-300' : 'bg-white border-gray-100 hover:border-orange-300'}`}
                onClick={() => {
                    if (selectedItems.size > 0) toggleSelection(item.id)
                    else if (type === 'FOLDER') setBreadcrumbs([...breadcrumbs, item])
                }}
            >
                <div className="absolute top-2 left-2 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id) }}>
                    {isSelected ? <CheckSquare className="text-orange-600" /> : <Square className="text-slate-200 hover:text-slate-400 transition-colors" />}
                </div>
                <div className="absolute top-2 right-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                        className="p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-8 bg-white shadow-2xl border border-gray-100 rounded-xl w-40 z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            {type === 'PUZZLE' && (
                                <button onClick={() => { setEditingPuzzle(item); setView('CREATE_PUZZLE') }} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-tight hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                    <Pencil size={12} /> Modify
                                </button>
                            )}
                            <button onClick={() => prepareMove(item, type)} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-tight hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <FolderInput size={12} /> Relocate
                            </button>
                            <button onClick={() => handleDelete(item.id, type)} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-tight hover:bg-red-50 text-red-600 flex items-center gap-2">
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                    )}
                    {showMenu && <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />}
                </div>
                {type === 'FOLDER' ? <Folder className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2" /> : <FileText className="w-7 h-7 md:w-8 md:h-8 text-orange-500 mb-2" />}
                <span className={`font-black text-[11px] md:text-xs px-4 text-center truncate w-full uppercase tracking-tight ${type === 'FOLDER' ? 'text-blue-900' : 'text-slate-700'}`}>
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
            <div className="bg-white rounded-3xl shadow-sm border p-4 md:p-10 min-h-[500px]">
                <h2 className="text-xl md:text-2xl font-black mb-8 text-slate-800 uppercase tracking-tight text-center md:text-left">Select Database Segment</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map(stage => (
                        <button key={stage} onClick={() => setCurrentStage(stage)} className="h-48 md:h-64 group relative overflow-hidden bg-slate-50 border-2 border-slate-100 hover:border-orange-500 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-4 active:scale-95 shadow-sm hover:shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 p-6 bg-white rounded-3xl text-orange-600 group-hover:scale-110 shadow-sm transition-transform"><Folder size={40} /></div>
                            <span className="relative z-10 text-lg md:text-xl font-black text-slate-700 uppercase tracking-widest">{stage}</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }
    return (
        <div className="bg-white rounded-3xl shadow-sm border p-4 md:p-8 min-h-[600px] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 pb-6 border-b border-slate-100 justify-between">
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                    <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]) }} className="font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Segments</button>
                    <ChevronRight size={16} className="text-gray-300" />
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-orange-600 px-3 py-1 bg-orange-50 rounded-full">{currentStage}</span>
                    {breadcrumbs.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <ChevronRight size={16} className="text-gray-300" />
                            <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="hover:bg-slate-50 px-3 py-1 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest text-slate-700">{b.name}</button>
                        </div>
                    ))}
                </div>
                {selectedItems.size > 0 && (
                    <button onClick={handleBulkDelete} className="w-full md:w-auto bg-red-600 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 animate-in zoom-in">
                        <Trash2 size={16} /> Wipe ({selectedItems.size})
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-auto">
                <div className="h-32 md:h-36 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 gap-2 bg-slate-50/50">
                    <input
                        className="w-full text-center border-b border-slate-200 focus:border-orange-500 outline-none pb-1 text-[11px] font-black uppercase tracking-tight bg-transparent"
                        placeholder="New Folder"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && createFolder()}
                    />
                    <button onClick={createFolder} disabled={!newFolderName} className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full disabled:opacity-30 transition-all active:scale-95">Create</button>
                </div>

                {content.folders.map(f => <ItemCard key={f.id} item={f} type="FOLDER" />)}
                {content.puzzles.map(p => <ItemCard key={p.id} item={p} type="PUZZLE" />)}
            </div>
            
            <div className="pt-8 mt-8 flex justify-center md:justify-end">
                <button onClick={() => { setEditingPuzzle(null); setView('CREATE_PUZZLE') }} className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95 font-black uppercase text-xs tracking-widest">
                    <Plus size={20} /> Add Practice Drill
                </button>
            </div>
            
            <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Relocate Asset">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Destination:</p>
                    <div className="max-h-60 overflow-y-auto border rounded-2xl divide-y scrollbar-hide bg-slate-50">
                        {availableFolders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => handleMoveSubmit(folder.id)}
                                className="w-full text-left px-5 py-4 hover:bg-white hover:text-orange-600 flex items-center gap-3 transition-all group"
                            >
                                <Folder size={18} className="text-blue-400 group-hover:text-orange-500 transition-colors" />
                                <span className="text-xs font-black uppercase tracking-tight">{folder.name}</span>
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
            game.current.remove(square as any)
        } else {
            game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
        }
        setFen(game.current.fen())
    }

    const onPieceDrop = (source: string, target: string, piece: string) => {
        if (mode === 'SETUP') {
            const p = game.current.get(source as any)
            if (!p) return false
            game.current.remove(source as any)
            game.current.put(p, target as any)
            setFen(game.current.fen())
            return true
        }

        if (mode === 'RECORD') {
            if (stars.includes(target)) {
                setStars(stars.filter(s => s !== target))
                const p = game.current.get(source as any)
                game.current.remove(source as any)
                game.current.put(p as any, target as any)
                setMoves([...moves, `${source}-${target}`])
                setFen(game.current.fen())
                return true
            }
            try {
                const move = game.current.move({ from: source as any, to: target as any, promotion: 'q' })
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

        const payload: any = {
            type: 'PUZZLE',
            title: title,
            fen: startFen,
            solution: moves.join(' '),
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 bg-white p-4 md:p-8 rounded-[2rem] border-2 border-slate-50 h-full min-h-[600px] shadow-2xl">
            <div className="lg:col-span-5 flex flex-col items-center">
                <div ref={boardContainerRef} className={`w-full max-w-[500px] border-4 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 ${mode === 'RECORD' ? 'border-green-500 shadow-green-100' : 'border-blue-500 shadow-blue-100'}`}>
                    <Chessboard
                        position={fen}
                        onPieceDrop={onPieceDrop}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        customSquareStyles={customSquareStyles}
                        boardWidth={boardWidth}
                    />
                </div>
                <div className="mt-6 w-full lg:hidden">
                    {mode === 'SETUP' ? (
                        <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard() }} onReset={() => { game.current.reset(); updateBoard() }} />
                    ) : (
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                             <h4 className="font-black text-[10px] uppercase text-green-600 tracking-widest mb-2">Sequence</h4>
                             <div className="font-mono text-sm break-all font-bold text-green-900">{moves.length > 0 ? moves.join(' ') : '---'}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-50 pb-6 justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-gray-400 hover:bg-slate-100 p-3 rounded-full transition-all active:scale-90"><ArrowLeft size={24} /></button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">{existingPuzzle ? 'Edit Drill' : 'Drafting Drill'}</h2>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <span className={`w-2.5 h-2.5 rounded-full ${mode === 'SETUP' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></span>
                                {mode === 'SETUP' ? 'Stage 1: Position Setup' : 'Stage 2: Solution Input'}
                            </div>
                        </div>
                    </div>
                    {mode === 'SETUP' && (
                        <button onClick={() => setIsPgnModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200">
                            <FileText size={16} /> Load PGN
                        </button>
                    )}
                </div>

                {mode === 'SETUP' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="hidden lg:block">
                            <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard() }} onReset={() => { game.current.reset(); updateBoard() }} />
                        </div>
                        <div className="text-[10px] font-black text-orange-600 bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-3 uppercase tracking-widest leading-relaxed">
                            <Star size={18} className="fill-orange-600 shrink-0" />
                            <span>Right-click a square to mark it as a Target Square for the student.</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Initiating Side</span>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleTurn('w')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${getTurnFromFen(fen) === 'w' ? 'bg-white border-2 border-orange-500 text-orange-600 shadow-xl shadow-orange-100 scale-105' : 'bg-slate-100 text-slate-400'}`}>White</button>
                                    <button onClick={() => toggleTurn('b')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${getTurnFromFen(fen) === 'b' ? 'bg-slate-800 border-2 border-slate-800 text-white shadow-xl shadow-slate-200 scale-105' : 'bg-slate-100 text-slate-400'}`}>Black</button>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">FEN Signature</span>
                                <div className="flex gap-2">
                                    <input type="text" className="w-full border p-2.5 rounded-xl text-[10px] font-mono text-slate-600 bg-white focus:ring-2 ring-orange-100 outline-none" value={manualFen} onChange={handleManualFenChange} placeholder="Paste position code..." />
                                    <button onClick={() => { navigator.clipboard.writeText(manualFen); alert("FEN Copied!") }} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors shadow-sm" title="Copy FEN"><Copy size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <button onClick={toggleMode} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-slate-100 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
                            Confirm Position & Move to Record <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {mode === 'RECORD' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-green-50 border-2 border-green-100 p-6 md:p-8 rounded-[2rem] shadow-inner">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-green-700 flex items-center gap-2 mb-4"><Play size={16} className="fill-green-700" /> Real-time Recording</h3>
                            <div className="bg-white/80 p-6 rounded-2xl font-mono text-xl md:text-2xl font-black min-h-[80px] shadow-sm border border-green-200/50 break-words text-green-900 flex items-center">
                                {moves.length > 0 ? moves.join(' ') : <span className="text-green-200 animate-pulse uppercase tracking-tighter">Execute Solution on Board...</span>}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button onClick={() => { game.current.load(startFen!); setFen(startFen!); setMoves([]); setStars([...initialStars]); }} className="px-4 py-2 bg-white hover:bg-green-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-green-700 flex items-center gap-2 border border-green-200 shadow-sm transition-all active:scale-95"><RotateCcw size={14} /> Clear History</button>
                            </div>
                        </div>
                        
                        <div className="pt-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Drill Title</label>
                                <input className="w-full text-lg md:text-xl border-2 border-slate-100 rounded-2xl p-4 font-black uppercase tracking-tight focus:border-orange-500 outline-none transition-all shadow-sm" placeholder="e.g. Back-Rank Mate Pattern" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={toggleMode} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95">Re-Setup Board</button>
                                <button onClick={savePuzzle} disabled={moves.length === 0} className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-orange-100 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95">
                                    {existingPuzzle ? 'Update practice data' : 'Publish to segment'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <Modal isOpen={isPgnModalOpen} onClose={() => setIsPgnModalOpen(false)} title="Import PGN Sequence">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paste PGN Text Below:</p>
                        <textarea className="w-full h-48 border-2 border-slate-50 rounded-2xl p-4 font-mono text-xs focus:ring-4 ring-orange-50 outline-none bg-slate-50/50" value={pgnInput} onChange={(e) => setPgnInput(e.target.value)} placeholder="[Event 'Royal Rooks Drill'] ..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsPgnModalOpen(false)} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl">Abort</button>
                            <button onClick={handleImportPgn} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all active:scale-95">Translate PGN</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    )
}

// ==========================================
// 5. ANALYSIS BOARD
// ==========================================
function AnalysisBoard() {
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
            const p = game.current.get(source as any)
            if (!p) return false
            game.current.remove(source as any)
            game.current.put(p as any, target as any)
            updateBoard()
            clearHighlight(target)
            return true
        }
        try {
            const move = game.current.move({ from: source as any, to: target as any, promotion: 'q' })
            if (!move) return false
            setFen(game.current.fen())
            clearHighlight(target)
            return true
        } catch { return false }
    }

    const onSquareClick = (square: string) => {
        if (setupMode && selectedTool) {
            if (selectedTool === 'TRASH') game.current.remove(square as any)
            else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="lg:col-span-8 flex flex-col items-center">
                <div ref={boardContainerRef} className="w-full max-w-[600px] aspect-square border-8 border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden" id="analysis-board-container">
                    <Chessboard
                        position={fen}
                        onPieceDrop={onPieceDrop}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        customSquareStyles={squares}
                        boardOrientation={orientation}
                        arePiecesDraggable={true}
                        boardWidth={boardWidth}
                    />
                    {setupMode && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-pulse z-10 ring-4 ring-white">
                            Setup Mode Engaged
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h3 className="font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                        <MousePointer2 size={20} className="text-orange-500" /> Interaction Console
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"><RotateCcw size={14} /> Start Over</button>
                        <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"><ArrowUpDown size={14} /> Flip Perspective</button>
                    </div>
                    <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${setupMode ? 'bg-red-600 text-white shadow-red-100' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}>
                        <Settings size={16} /> {setupMode ? 'Lock Board Position' : 'Customize Board Position'}
                    </button>
                </div>

                {setupMode && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
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
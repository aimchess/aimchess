"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
    GraduationCap, Plus, Edit, Trash2, X, Loader2,
    Clock, Users, Video, BookOpen, CheckSquare, Square,
} from "lucide-react";

export default function BatchesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "", dayOfWeek: "Monday", startTime: "17:00", endTime: "18:00", coachId: "", meetingLink: "",
    });
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [enrollSearch, setEnrollSearch] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classRes, userRes] = await Promise.all([fetch("/api/classes"), fetch("/api/admin/users")]);
            const classData = await classRes.json();
            const userData = await userRes.json();
            if (classRes.ok && Array.isArray(classData)) setClasses(classData);
            if (userRes.ok && Array.isArray(userData)) {
                setUsers(userData);
                setCoaches(userData.filter((u: any) => u.role === "COACH" || u.role === "ADMIN"));
                setStudents(userData.filter((u: any) => u.role === "STUDENT"));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingClass ? "PUT" : "POST";
        const payload = editingClass ? { ...formData, id: editingClass.id } : formData;
        try {
            const res = await fetch("/api/classes", {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
            else { const err = await res.json(); alert(err.error || "Failed to save class"); }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the class and its attendance records.")) return;
        try {
            const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const handleEnroll = async () => {
        try {
            const res = await fetch("/api/classes", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingClass.id, studentIds: selectedStudents }),
            });
            if (res.ok) { setIsEnrollModalOpen(false); fetchData(); }
            else { const err = await res.json(); alert(err.error || "Failed to enroll students"); }
        } catch (e) { console.error(e); }
    };

    const openEdit = (c: any) => {
        setEditingClass(c);
        setFormData({
            name: c.name, dayOfWeek: c.dayOfWeek,
            startTime: c.startTime, endTime: c.endTime, coachId: c.coachId, meetingLink: c.meetingLink || "",
        });
        setIsModalOpen(true);
    };

    const openEnroll = (c: any) => {
        setEditingClass(c);
        setSelectedStudents(c.students?.map((s: any) => s.id) || []);
        setEnrollSearch("");
        setIsEnrollModalOpen(true);
    };

    const filteredStudents = students.filter(
        (s) => s.name?.toLowerCase().includes(enrollSearch.toLowerCase()) || s.email?.toLowerCase().includes(enrollSearch.toLowerCase())
    );

    const dayColors: Record<string, string> = {
        Monday: "from-sky-500 to-sky-600", Tuesday: "from-indigo-500 to-indigo-600",
        Wednesday: "from-emerald-500 to-emerald-600", Thursday: "from-yellow-500 to-amber-500",
        Friday: "from-rose-500 to-rose-600", Saturday: "from-purple-500 to-purple-600",
        Sunday: "from-teal-500 to-teal-600",
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Batches & Classes ({classes.length})</h2>
                            <p className="text-xs text-gray-500">Manage class schedules and student enrollment</p>
                        </div>
                    </div>
                    <button onClick={() => {
                        setEditingClass(null);
                        setFormData({ name: "", dayOfWeek: "Monday", startTime: "17:00", endTime: "18:00", coachId: "", meetingLink: "" });
                        setIsModalOpen(true);
                    }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus size={16} /> Add Class
                    </button>
                </div>

                {/* Class Cards */}
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                        <GraduationCap className="mx-auto mb-3 text-gray-300" size={40} />
                        <p className="text-sm font-medium">No classes defined yet</p>
                        <p className="text-xs mt-1">Click &quot;Add Class&quot; to create your first batch</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((c) => (
                            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                                {/* Color top stripe */}
                                <div className={`h-1.5 bg-gradient-to-r ${dayColors[c.dayOfWeek] || "from-sky-500 to-sky-600"}`} />
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-gray-900 truncate">{c.name}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><Edit size={15} /></button>
                                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                                        <div className="flex items-center gap-2"><BookOpen size={14} className="text-gray-400" /> <span className="font-medium">{c.dayOfWeek}</span></div>
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> {c.startTime} – {c.endTime}</div>
                                        <div className="flex items-center gap-2 font-medium text-sky-700"><Users size={14} /> Coach: {c.coach?.name || "—"}</div>
                                        {c.meetingLink && (
                                            <div className="flex items-center gap-2">
                                                <Video size={14} className="text-indigo-500" />
                                                <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-[11px] font-bold uppercase tracking-wide">Join Meeting</a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Enrolled: {c._count?.students || 0}</span>
                                        <button onClick={() => openEnroll(c)}
                                            className="text-[11px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors">
                                            Manage Students
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Class Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{editingClass ? "Edit Class" : "Add New Class"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Class Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" placeholder="e.g. Beginners Group A" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Day of Week</label>
                                <select value={formData.dayOfWeek} onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none">
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Start Time</label>
                                    <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required
                                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">End Time</label>
                                    <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required
                                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Assign Coach</label>
                                <select value={formData.coachId} onChange={(e) => setFormData({ ...formData, coachId: e.target.value })} required
                                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none">
                                    <option value="">Select a Coach</option>
                                    {coaches.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Meeting Link (Zoom / Google Meet)</label>
                                <input value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" placeholder="https://zoom.us/j/..." />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2">
                                {editingClass ? "Update Class" : "Create Class"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Enroll Students Modal */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Enroll Students</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{editingClass?.name} • {selectedStudents.length} selected</p>
                            </div>
                            <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-3">
                                <input type="text" placeholder="Search students..." value={enrollSearch} onChange={(e) => setEnrollSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" />
                                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                                {filteredStudents.map((s) => (
                                    <div key={s.id} onClick={() => setSelectedStudents((prev) => prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${selectedStudents.includes(s.id) ? "bg-sky-50" : ""}`}>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                                            <div className="text-xs text-gray-500">{s.email}</div>
                                        </div>
                                        {selectedStudents.includes(s.id) ? <CheckSquare className="text-sky-600" size={20} /> : <Square className="text-gray-300" size={20} />}
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No students found</div>}
                            </div>
                            <button onClick={handleEnroll}
                                className="w-full mt-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                Save Enrollment ({selectedStudents.length} Students)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CRMShellLayout>
    );
}

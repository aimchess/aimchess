"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { ClipboardCheck, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function AttendancePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [existingRecords, setExistingRecords] = useState<any[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch("/api/classes");
                if (res.ok) {
                    const data = await res.json();
                    setClasses(data);
                    if (data.length > 0) setSelectedClass(data[0].id);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (!selectedClass) return;
        const cls = classes.find(c => c.id === selectedClass);
        const enrolled = cls?.students || [];
        setStudents(enrolled);

        const initialAtt: Record<string, string> = {};
        enrolled.forEach((s: any) => { initialAtt[s.id] = "PRESENT"; });
        setAttendance(initialAtt);

        // Fetch existing attendance
        const fetchExisting = async () => {
            try {
                const res = await fetch(`/api/attendance?classTimingId=${selectedClass}&date=${selectedDate}`);
                if (res.ok) {
                    const data = await res.json();
                    setExistingRecords(data);
                    if (Array.isArray(data) && data.length > 0) {
                        const existing: Record<string, string> = {};
                        data.forEach((r: any) => { existing[r.studentId] = r.status; });
                        setAttendance(prev => ({ ...prev, ...existing }));
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchExisting();
    }, [selectedClass, selectedDate, classes]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId, classTimingId: selectedClass, date: selectedDate, status,
            }));

            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records }),
            });

            if (res.ok) alert("Attendance saved successfully!");
            else { const err = await res.json(); alert(err.error || "Failed to save"); }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
        PRESENT: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 ring-emerald-500/20" },
        ABSENT: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200 ring-red-500/20" },
        LATE: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200 ring-amber-500/20" },
        LEAVE: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50 border-blue-200 ring-blue-500/20" },
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <ClipboardCheck className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Mark Attendance</h2>
                        <p className="text-xs text-gray-500">Select a class and date to mark or view attendance</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Class / Batch</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 outline-none">
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.dayOfWeek} ({c.startTime}-{c.endTime})</option>)}
                            {classes.length === 0 && <option value="">No classes found</option>}
                        </select>
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400" />
                    </div>
                </div>

                {/* Attendance List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                        <ClipboardCheck className="mx-auto mb-3 text-gray-300" size={40} />
                        <p className="text-sm font-medium">No students enrolled in this class</p>
                        <p className="text-xs mt-1">Enroll students from the Batches page first</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-50">
                            {students.map((s: any) => {
                                const status = attendance[s.id] || "PRESENT";
                                return (
                                    <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">
                                                {s.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                                                <div className="text-xs text-gray-500">{s.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {(["PRESENT", "ABSENT", "LATE", "LEAVE"] as const).map(st => {
                                                const cfg = statusConfig[st];
                                                const Icon = cfg.icon;
                                                const isActive = status === st;
                                                return (
                                                    <button key={st} onClick={() => setAttendance(prev => ({ ...prev, [s.id]: st }))}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isActive ? `${cfg.bg} ${cfg.color} ring-2` : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}>
                                                        <Icon size={14} />
                                                        <span className="hidden sm:inline">{st}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button onClick={handleSave} disabled={saving}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                {saving ? "Saving..." : "Save Attendance"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </CRMShellLayout>
    );
}

"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Loader2, Award, Calendar, Search, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function ReportsPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    
    // Default to current month/year
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [month, year]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/reports/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month, year })
            });
            if (res.ok) {
                toast.success("Reports generated successfully!");
                fetchReports();
            } else {
                toast.error("Failed to generate reports.");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setGenerating(false);
        }
    };

    const handleExportCSV = () => {
        if (reports.length === 0) {
            toast.error("No reports to export");
            return;
        }

        const headers = ["Student Name", "Attendance", "Homework", "Assignment", "Tournament", "Total", "Award"];
        
        const csvRows = [
            headers.join(","),
            ...reports.map(r => [
                `"${r.student.name}"`,
                r.attendancePoints,
                r.homeworkPoints,
                r.assignmentPoints,
                r.tournamentPoints,
                r.totalPoints,
                `"${r.award || 'Participant'}"`
            ].join(","))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Performance_Reports_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#0b1d3a] to-[#1a3a6a] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md">
                            <Award size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">Performance Reports</h1>
                            <p className="text-sky-200 text-sm">Monthly student scorecards and Star Player awards.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl backdrop-blur-md border border-white/10">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="bg-transparent text-white font-bold outline-none cursor-pointer"
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m} className="text-gray-900">Month {m}</option>
                            ))}
                        </select>
                        <span className="text-white/30">/</span>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-transparent text-white font-bold outline-none cursor-pointer"
                        >
                            <option className="text-gray-900" value={2024}>2024</option>
                            <option className="text-gray-900" value={2025}>2025</option>
                            <option className="text-gray-900" value={2026}>2026</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search student..."
                                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <button 
                                    onClick={handleGenerate} 
                                    disabled={generating}
                                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
                                    Generate Month
                                </button>
                            )}
                            <button 
                                onClick={handleExportCSV}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Attendance (40)</th>
                                    <th className="px-6 py-4">Homework (20)</th>
                                    <th className="px-6 py-4">Assignment (20)</th>
                                    <th className="px-6 py-4">Tournament (20)</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Award</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center">
                                            <Loader2 size={24} className="animate-spin text-sky-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500 font-medium">
                                            No reports generated for this month.
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id} className="border-b hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-bold text-gray-900">{report.student.name}</td>
                                            <td className="px-6 py-4 font-semibold text-emerald-600">{report.attendancePoints}</td>
                                            <td className="px-6 py-4 font-semibold text-blue-600">{report.homeworkPoints}</td>
                                            <td className="px-6 py-4 font-semibold text-purple-600">{report.assignmentPoints}</td>
                                            <td className="px-6 py-4 font-semibold text-orange-600">{report.tournamentPoints}</td>
                                            <td className="px-6 py-4 font-black text-gray-900 text-base">{report.totalPoints}</td>
                                            <td className="px-6 py-4">
                                                {report.award ? (
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        report.award.includes('Gold') ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                        report.award.includes('Silver') ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                                                        report.award.includes('Bronze') ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {report.award}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Participant</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </CRMShellLayout>
    );
}

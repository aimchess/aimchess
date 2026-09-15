"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Loader2, Award, Calendar, Search, RefreshCw, Download, Eye, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { downloadReportPdf } from "@/lib/generate-report-pdf";

export default function ReportsPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "COACH";
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

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

    const handleDownloadSinglePdf = (report: any) => {
        try {
            downloadReportPdf(report, report.student);
            toast.success(`Report downloaded for ${report.student?.name || 'Student'}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to download PDF report");
        }
    };

    const handleDownloadAllPDFs = async () => {
        const targets = filteredReports;
        if (targets.length === 0) {
            toast.error("No reports to download");
            return;
        }

        toast.info(`Downloading ${targets.length} student monthly report PDFs...`);
        for (let i = 0; i < targets.length; i++) {
            const r = targets[i];
            setTimeout(() => {
                downloadReportPdf(r, r.student);
            }, i * 300); // staggered to avoid browser popup blocks
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
                `"${r.student?.name || 'Unknown'}"`,
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

    const filteredReports = reports.filter(r => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const studentName = r.student?.name?.toLowerCase() || "";
        const coachName = r.student?.coach?.name?.toLowerCase() || "";
        return studentName.includes(q) || coachName.includes(q);
    });

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
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
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
                    <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search student or coach..."
                                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                                onClick={handleDownloadAllPDFs}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
                            >
                                <Download size={16} /> Download All PDFs
                            </button>
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
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center">
                                            <Loader2 size={24} className="animate-spin text-sky-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500 font-medium">
                                            No reports generated for this selection.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="border-b hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                <div>{report.student?.name || 'Student'}</div>
                                                <div className="text-[11px] font-normal text-slate-400">
                                                    Coach: {report.student?.coach?.name || 'Unassigned'}
                                                </div>
                                            </td>
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
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        title="View Assessment Details"
                                                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-sky-200 flex items-center gap-1 text-xs font-bold px-2.5"
                                                    >
                                                        <Eye size={14} /> Preview
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadSinglePdf(report)}
                                                        title="Download Report PDF"
                                                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 flex items-center gap-1 text-xs font-bold px-2.5"
                                                    >
                                                        <Download size={14} /> PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Report Detail Preview Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{selectedReport.student?.name}'s Report</h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                        Month {selectedReport.month} / {selectedReport.year} • Coach: {selectedReport.student?.coach?.name || 'Unassigned'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Score Overview Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Attendance</p>
                                    <p className="text-lg font-black text-emerald-700">{selectedReport.attendancePoints} / 40</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Homework</p>
                                    <p className="text-lg font-black text-blue-700">{selectedReport.homeworkPoints} / 20</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                                    <p className="text-[10px] font-bold text-purple-600 uppercase">Assignment</p>
                                    <p className="text-lg font-black text-purple-700">{selectedReport.assignmentPoints} / 20</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase">Tournament</p>
                                    <p className="text-lg font-black text-orange-700">{selectedReport.tournamentPoints} / 20</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Total Performance Score</p>
                                    <p className="text-2xl font-black">{selectedReport.totalPoints} / 100</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                    (selectedReport.award || '').includes('Gold') ? 'bg-yellow-400 text-yellow-950' :
                                    (selectedReport.award || '').includes('Silver') ? 'bg-slate-300 text-slate-900' :
                                    (selectedReport.award || '').includes('Bronze') ? 'bg-orange-400 text-orange-950' :
                                    'bg-white/20 text-white'
                                }`}>
                                    {selectedReport.award || 'Participant'}
                                </span>
                            </div>

                            {/* Coach Feedback Sections */}
                            <div className="space-y-4 text-sm text-slate-700 border-t pt-4">
                                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                                    <FileText size={18} className="text-sky-500" /> Coach Written Assessment
                                </h4>

                                <div>
                                    <p className="font-bold text-slate-900 text-xs uppercase text-sky-600 mb-1">Student Progress</p>
                                    <p className="bg-gray-50 p-3 rounded-xl border text-xs">{selectedReport.studentProgress || "No assessment written."}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xs uppercase text-emerald-600 mb-1">Key Strengths</p>
                                    <p className="bg-gray-50 p-3 rounded-xl border text-xs">{selectedReport.strengths || "No assessment written."}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xs uppercase text-rose-600 mb-1">Weaknesses / Areas of Improvement</p>
                                    <p className="bg-gray-50 p-3 rounded-xl border text-xs">{selectedReport.weaknesses || "No assessment written."}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xs uppercase text-indigo-600 mb-1">Attitude & Behavior</p>
                                    <p className="bg-gray-50 p-3 rounded-xl border text-xs">{selectedReport.behavior || "No assessment written."}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xs uppercase text-amber-600 mb-1">Next Month Focus Areas</p>
                                    <p className="bg-gray-50 p-3 rounded-xl border text-xs">{selectedReport.nextMonthFocus || "No assessment written."}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xs uppercase text-slate-600 mb-1">Coach Recommendations</p>
                                    <p className="bg-gray-50 p-3 rounded-xl border text-xs">{selectedReport.recommendation || "No assessment written."}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-4 py-2 border rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleDownloadSinglePdf(selectedReport);
                                    }}
                                    className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
                                >
                                    <Download size={14} /> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CRMShellLayout>
    );
}

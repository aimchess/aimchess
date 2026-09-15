"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, AlertCircle, Clock, FileCheck, CheckSquare, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function CoachSOPCard() {
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState(false);
    const [sopStatus, setSopStatus] = useState<{
        sopAcknowledged: boolean;
        sopAcknowledgedAt: string | null;
        name?: string;
    } | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const fetchSOPStatus = async () => {
        try {
            const res = await fetch("/api/coach/sop-ack");
            if (res.ok) {
                const data = await res.json();
                setSopStatus(data);
            }
        } catch (error) {
            console.error("Error fetching SOP status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSOPStatus();
    }, []);

    const handleAcknowledge = async () => {
        setAcknowledging(true);
        try {
            const res = await fetch("/api/coach/sop-ack", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setSopStatus(data);
                toast.success("Thank you! You have successfully acknowledged the AIM Coach Retention SOP.");
            } else {
                toast.error("Failed to submit acknowledgment. Please try again.");
            }
        } catch (error) {
            console.error("Error acknowledging SOP:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setAcknowledging(false);
        }
    };

    if (loading) return null;

    const isAcknowledged = sopStatus?.sopAcknowledged;
    const ackDateFormatted = sopStatus?.sopAcknowledgedAt
        ? new Date(sopStatus.sopAcknowledgedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
        : null;

    return (
        <div className={`rounded-3xl border transition-all duration-300 shadow-md ${
            isAcknowledged 
                ? "bg-gradient-to-br from-slate-900 via-[#0b1d3a] to-slate-900 border-slate-700 text-white" 
                : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-rose-500/10 border-amber-300/80 text-slate-900 shadow-amber-500/5"
        }`}>
            {/* Header */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                        isAcknowledged 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                            : "bg-amber-500 text-white"
                    }`}>
                        {isAcknowledged ? <FileCheck size={26} /> : <ShieldAlert size={26} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isAcknowledged ? "text-white" : "text-slate-900"}`}>
                                AIM Coach Retention SOP
                            </h2>
                            {isAcknowledged ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                                    <CheckCircle2 size={14} /> Acknowledged
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wider animate-pulse">
                                    <Clock size={14} /> Action Required
                                </span>
                            )}
                        </div>
                        <p className={`text-xs md:text-sm font-medium mt-1 ${isAcknowledged ? "text-slate-300" : "text-slate-600"}`}>
                            Mandatory standard operating procedure guidelines for all AIM Chess Academy coaches.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`self-start md:self-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isAcknowledged 
                            ? "bg-white/10 hover:bg-white/20 text-white" 
                            : "bg-amber-100 hover:bg-amber-200 text-amber-900"
                    }`}
                >
                    {isExpanded ? "Collapse SOP" : "View SOP Details"}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* SOP Content details */}
            {isExpanded && (
                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Point 1 */}
                        <div className={`p-4 rounded-2xl border ${
                            isAcknowledged 
                                ? "bg-white/5 border-white/10" 
                                : "bg-white border-amber-200 shadow-sm"
                        }`}>
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-xs">1</span>
                                <h4 className={`text-sm font-bold ${isAcknowledged ? "text-white" : "text-slate-900"}`}>
                                    Post-Class Requirements
                                </h4>
                            </div>
                            <p className={`text-xs leading-relaxed ${isAcknowledged ? "text-slate-300" : "text-slate-600"}`}>
                                After every class, coaches must record <strong>student attendance</strong>, log detailed <strong>class notes</strong>, and update <strong>homework & assignment tasks</strong>.
                            </p>
                        </div>

                        {/* Point 2 */}
                        <div className={`p-4 rounded-2xl border ${
                            isAcknowledged 
                                ? "bg-white/5 border-white/10" 
                                : "bg-white border-amber-200 shadow-sm"
                        }`}>
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">2</span>
                                <h4 className={`text-sm font-bold ${isAcknowledged ? "text-white" : "text-slate-900"}`}>
                                    Student Progress & Engagement
                                </h4>
                            </div>
                            <p className={`text-xs leading-relaxed ${isAcknowledged ? "text-slate-300" : "text-slate-600"}`}>
                                Perform regular monitoring of student attendance, practice routines, puzzle activity, game engagement, and learning progress.
                            </p>
                        </div>

                        {/* Point 3 */}
                        <div className={`p-4 rounded-2xl border ${
                            isAcknowledged 
                                ? "bg-white/5 border-white/10" 
                                : "bg-white border-amber-200 shadow-sm"
                        }`}>
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs">3</span>
                                <h4 className={`text-sm font-bold ${isAcknowledged ? "text-white" : "text-slate-900"}`}>
                                    At-Risk Student Reporting
                                </h4>
                            </div>
                            <p className={`text-xs leading-relaxed ${isAcknowledged ? "text-slate-300" : "text-slate-600"}`}>
                                Immediately report inactive or at-risk students to AIM management/CRM so prompt support and parent follow-up can be initiated.
                            </p>
                        </div>

                        {/* Point 4 */}
                        <div className={`p-4 rounded-2xl border ${
                            isAcknowledged 
                                ? "bg-white/5 border-white/10" 
                                : "bg-white border-amber-200 shadow-sm"
                        }`}>
                            <div className="flex items-center gap-2.5 mb-2">
                                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">4</span>
                                <h4 className={`text-sm font-bold ${isAcknowledged ? "text-white" : "text-slate-900"}`}>
                                    Monthly Report Deadline
                                </h4>
                            </div>
                            <p className={`text-xs leading-relaxed ${isAcknowledged ? "text-slate-300" : "text-slate-600"}`}>
                                Monthly student progress evaluations and written feedback must be completed and submitted before the <strong>30th of every month</strong>.
                            </p>
                        </div>

                        {/* Point 5 - Deduction Notice */}
                        <div className={`p-4 rounded-2xl border col-span-1 md:col-span-2 lg:col-span-2 ${
                            isAcknowledged 
                                ? "bg-rose-950/40 border-rose-500/40 text-rose-100" 
                                : "bg-rose-50 border-rose-300 text-rose-900 shadow-sm"
                        }`}>
                            <div className="flex items-center gap-2.5 mb-2">
                                <AlertCircle size={20} className={isAcknowledged ? "text-rose-400" : "text-rose-600"} />
                                <h4 className="text-sm font-black uppercase tracking-wider">
                                    Policy Non-Compliance Penalty
                                </h4>
                            </div>
                            <p className="text-xs font-semibold leading-relaxed">
                                Failure to submit the monthly progress report on time will result in a <strong>₹1,000 deduction</strong> per monthly evaluation cycle as per mandatory AIM policy.
                            </p>
                        </div>
                    </div>

                    {/* Acknowledgement Status / Action Button */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {isAcknowledged ? (
                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-3.5 rounded-2xl w-full">
                                <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-white">SOP Read & Acknowledged</p>
                                    <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                                        Tracked on: {ackDateFormatted}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-500/10 border border-amber-300 p-4 rounded-2xl">
                                <div className="text-xs font-semibold text-slate-800">
                                    Please read all guidelines above and click to confirm your agreement with the AIM Coach Retention SOP.
                                </div>
                                <button
                                    onClick={handleAcknowledge}
                                    disabled={acknowledging}
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
                                >
                                    <CheckSquare size={18} />
                                    {acknowledging ? "Saving Acknowledgment..." : "I Have Read & Acknowledge"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

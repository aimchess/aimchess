"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
    Users, GraduationCap, CreditCard, TrendingUp,
    ArrowUpRight, ArrowDownRight, Activity, Loader2,
} from "lucide-react";
import Link from "next/link";

export default function CRMDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({ students: 0, coaches: 0, classes: 0, revenue: 0, payments: 0 });
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userRole = ((session?.user as any)?.role || "").toUpperCase();

    // Redirect non-admin users to their own dashboard
    useEffect(() => {
        if (status !== "authenticated") return;
        if (userRole === "COACH") {
            router.replace("/crm/coach-dashboard");
            return;
        }
        if (userRole === "STUDENT") {
            router.replace("/crm/student-dashboard");
            return;
        }
    }, [status, userRole, router]);

    useEffect(() => {
        if (userRole !== "ADMIN") return;
        const fetchData = async () => {
            try {
                const [usersRes, classesRes, paymentsRes] = await Promise.all([
                    fetch("/api/admin/users"), fetch("/api/classes"), fetch("/api/payments"),
                ]);
                const users = usersRes.ok ? await usersRes.json() : [];
                const classes = classesRes.ok ? await classesRes.json() : [];
                const payments = paymentsRes.ok ? await paymentsRes.json() : [];

                const studentCount = Array.isArray(users) ? users.filter((u: any) => u.role === "STUDENT").length : 0;
                const coachCount = Array.isArray(users) ? users.filter((u: any) => u.role === "COACH" || u.role === "ADMIN").length : 0;
                const totalRevenue = Array.isArray(payments) ? payments.filter((p: any) => p.status === "COMPLETED").reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0;

                setStats({
                    students: studentCount, coaches: coachCount,
                    classes: Array.isArray(classes) ? classes.length : 0,
                    revenue: totalRevenue,
                    payments: Array.isArray(payments) ? payments.length : 0,
                });
                setRecentPayments(Array.isArray(payments) ? payments.slice(0, 5) : []);
            } catch (e) { console.error("Failed to fetch dashboard data", e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [userRole]);

    // Show loading for non-admin users while redirecting
    if (userRole !== "ADMIN") {
        return (
            <CRMShellLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                </div>
            </CRMShellLayout>
        );
    }

    const statCards = [
        { label: "Total Students", value: stats.students, icon: Users, color: "from-sky-500 to-sky-600", shadowColor: "shadow-sky-500/20", change: "+12%", up: true },
        { label: "Active Batches", value: stats.classes, icon: GraduationCap, color: "from-indigo-500 to-indigo-600", shadowColor: "shadow-indigo-500/20", change: "+3", up: true },
        { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: CreditCard, color: "from-emerald-500 to-emerald-600", shadowColor: "shadow-emerald-500/20", change: "+8%", up: true },
        { label: "Transactions", value: stats.payments, icon: TrendingUp, color: "from-yellow-500 to-amber-500", shadowColor: "shadow-yellow-500/20", change: stats.payments.toString(), up: true },
    ];

    if (loading) {
        return (
            <CRMShellLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                        <p className="text-gray-400 text-sm">Loading dashboard...</p>
                    </div>
                </div>
            </CRMShellLayout>
        );
    }

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <div key={i} className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg ${stat.shadowColor} transition-all duration-300 hover:-translate-y-1`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                                    <stat.icon className="text-white" size={20} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.up ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
                                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                            <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions + Recent Payments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-yellow-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: "Add New Student", href: "/crm/students", color: "bg-sky-50 text-sky-700 hover:bg-sky-100" },
                                { label: "Record Payment", href: "/crm/payments", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                                { label: "Mark Attendance", href: "/crm/attendance", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
                            ].map((action) => (
                                <Link key={action.label} href={action.href}
                                    className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${action.color}`}>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <CreditCard size={16} className="text-emerald-500" />
                                Recent Payments
                            </h3>
                            <Link href="/crm/payments" className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                                View All →
                            </Link>
                        </div>
                        {recentPayments.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No payments recorded yet</div>
                        ) : (
                            <div className="space-y-3">
                                {recentPayments.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                                                {p.student?.photoUrl ? (
                                                    <img 
                                                        src={p.student.photoUrl} 
                                                        alt={p.student.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    p.student?.name?.[0] || "?"
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.student?.name || "Unknown"}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(p.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">₹{p.amount?.toLocaleString()}</p>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : p.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CRMShellLayout>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CreditCard,
    ClipboardCheck,
    LogOut,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Puzzle,
    MousePointer2,
    ListTodo,
    History,
    Library,
    Wallet,
    Calendar,
} from "lucide-react";
import { useState } from "react";


type NavSection = {
    label: string;
    items: { href: string; label: string; icon: any }[];
};

const navSections: NavSection[] = [
    {
        label: "Admin",
        items: [
            { href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/crm/students", label: "Students", icon: Users },
            { href: "/crm/batches", label: "Batches", icon: GraduationCap },
            { href: "/crm/payments", label: "Payments", icon: CreditCard },
            { href: "/crm/attendance", label: "Attendance", icon: ClipboardCheck },
            { href: "/crm/courses", label: "Courses", icon: BookOpen },
            { href: "/crm/puzzles", label: "Puzzles", icon: Puzzle },
            { href: "/crm/analysis", label: "Analysis", icon: MousePointer2 },
        ],
    },
    {
        label: "Coach",
        items: [
            { href: "/crm/coach-students", label: "My Students", icon: Users },
            { href: "/crm/coach-attendance", label: "Attendance", icon: ClipboardCheck },
            { href: "/crm/coach-library", label: "Library", icon: Library },
            { href: "/crm/coach-analysis", label: "Analysis", icon: MousePointer2 },
        ],
    },
    {
        label: "Student",
        items: [
            { href: "/crm/student-todo", label: "To Do", icon: ListTodo },
            { href: "/crm/student-history", label: "Completed", icon: History },
            { href: "/crm/student-library", label: "Library", icon: BookOpen },
            { href: "/crm/student-fees", label: "Fees", icon: Wallet },
            { href: "/crm/student-schedule", label: "Schedule", icon: Calendar },
        ],
    },
];

export default function CRMSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "w-[72px]" : "w-[260px]"
                }`}
            style={{
                background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white">
                    <img
                        src="/aim-logo.jpeg"
                        alt="AIM Chess Academy"
                        className="w-full h-full object-cover"
                    />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                            AIM Chess
                        </h1>
                        <span className="text-[10px] font-semibold text-sky-400/80 uppercase tracking-widest">
                            Academy CRM
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.label} className="mb-2">
                        {!collapsed && (
                            <div className="px-3 pt-4 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                {section.label}
                            </div>
                        )}
                        {collapsed && <div className="border-t border-white/10 my-2" />}
                        {section.items.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${isActive
                                        ? "bg-white/15 text-white shadow-lg shadow-white/5"
                                        : "text-white/60 hover:text-white hover:bg-white/8"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-sky-400 rounded-r-full" />
                                    )}
                                    <item.icon
                                        size={20}
                                        className={`shrink-0 transition-colors ${isActive ? "text-sky-400" : "text-white/50 group-hover:text-white/80"
                                            }`}
                                    />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="px-3 py-4 border-t border-white/10 space-y-2">
                <button
                    onClick={() => signOut({ callbackUrl: "/crm/login" })}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${collapsed ? "justify-center" : ""
                        }`}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-full py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
}

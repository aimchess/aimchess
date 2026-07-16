"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";

const pageTitles: Record<string, string> = {
    "/crm/dashboard": "Dashboard",
    "/crm/students": "Students",
    "/crm/batches": "Batches & Classes",
    "/crm/payments": "Payments",
    "/crm/attendance": "Attendance",
    "/crm/courses": "Courses",
    "/crm/puzzles": "Puzzles & Curriculum",
    "/crm/analysis": "Analysis Board",
    "/crm/coach-students": "My Students",
    "/crm/coach-attendance": "Coach Attendance",
    "/crm/coach-library": "Teaching Library",
    "/crm/coach-analysis": "Coach Analysis",
    "/crm/coach-dashboard": "Coach Dashboard",
    "/crm/student-todo": "My Assignments",
    "/crm/student-history": "Completed Work",
    "/crm/student-library": "Learning Library",
    "/crm/student-fees": "Fee History",
    "/crm/student-schedule": "My Schedule",
    "/crm/student-dashboard": "Student Dashboard",
    "/crm/leaderboard": "Leaderboard",
};

export default function CRMTopbar({
    onMenuToggle,
}: {
    onMenuToggle?: () => void;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);

    const title = pageTitles[pathname] || "CRM";

    const initials = session?.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "AC";

    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);

    useEffect(() => {
        if (!session?.user) return;
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    setNotifications(await res.json());
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [session]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-xl hover:bg-sky-50 transition-colors">
                        <Menu size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Search */}
                    {/* <div className={`transition-all duration-300 overflow-hidden ${searchOpen ? "w-40 sm:w-64" : "w-0"}`}>
                        <input type="text" placeholder="Search..."
                            className="w-full px-4 py-2 text-sm bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-sky-400/50 outline-none" />
                    </div>
                    <button onClick={() => setSearchOpen(!searchOpen)}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-sky-50 transition-colors">
                        <Search size={18} className="text-gray-500" />
                    </button> */}

                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setNotifOpen(!notifOpen);
                                if (!notifOpen && unreadCount > 0) {
                                    handleMarkAsRead();
                                }
                            }}
                            className="p-2 sm:p-2.5 rounded-xl hover:bg-sky-50 transition-colors relative"
                        >
                            <Bell size={18} className="text-gray-500" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-500 border-2 border-white rounded-full" />
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex justify-between items-center border-b pb-2 mb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notifications</h4>
                                    {unreadCount > 0 && (
                                        <button onClick={() => handleMarkAsRead()} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold">Mark all read</button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {notifications.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-2.5 rounded-xl border text-xs transition-colors ${n.isRead ? 'bg-white border-gray-50 text-gray-600' : 'bg-indigo-50/40 border-indigo-100/50 text-indigo-950 font-semibold'}`}>
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="font-bold">{n.title}</span>
                                                    <span className="text-[9px] text-gray-400 font-normal shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="mt-1 text-[11px] leading-relaxed">{n.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Avatar */}
                    <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-sky-500/20 overflow-hidden">
                            {(session?.user as any)?.photoUrl ? (
                                <img 
                                    src={(session?.user as any).photoUrl} 
                                    alt={session?.user?.name || "Avatar"} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{session?.user?.name || "Admin"}</p>
                            <p className="text-[10px] text-sky-600 uppercase font-medium tracking-wide">{session?.user?.role || "Admin"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

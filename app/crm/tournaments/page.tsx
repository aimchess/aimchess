"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Loader2, Trophy, Plus, Calendar as CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TournamentsPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState<any[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTournament, setNewTournament] = useState({ title: "", description: "", startDate: "" });

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tournaments");
            if (res.ok) {
                const data = await res.json();
                setTournaments(data);
            }
        } catch (error) {
            toast.error("Failed to fetch tournaments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTournament)
            });
            if (res.ok) {
                toast.success("Tournament created!");
                setIsCreateModalOpen(false);
                setNewTournament({ title: "", description: "", startDate: "" });
                fetchTournaments();
            } else {
                toast.error("Failed to create tournament");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleJoin = async (id: string) => {
        try {
            const res = await fetch(`/api/tournaments/${id}/join`, {
                method: "POST",
            });
            if (res.ok) {
                toast.success("Joined tournament!");
                fetchTournaments();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to join");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <Trophy size={200} className="transform translate-x-10 -translate-y-10" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md">
                            <Trophy size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">Internal Tournaments</h1>
                            <p className="text-indigo-200 text-sm">Compete with your peers, earn rating points and awards.</p>
                        </div>
                    </div>
                    
                    {isAdmin && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg relative z-10"
                        >
                            <Plus size={20} /> Create Tournament
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Tournaments Yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">There are no upcoming or active tournaments right now. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament) => {
                            const currentUserId = (session?.user as any)?.id;
                            const isJoined = tournament.participants.some((p: any) => p.userId === currentUserId);
                            
                            return (
                                <div key={tournament.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                tournament.status === 'UPCOMING' ? 'bg-sky-100 text-sky-700' :
                                                tournament.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700 animate-pulse' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {tournament.status}
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-500 text-sm font-semibold">
                                                <Users size={16} /> {tournament.participants.length}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{tournament.title}</h3>
                                        {tournament.description && (
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mt-auto">
                                            <CalendarIcon size={16} className="text-indigo-400" />
                                            {new Date(tournament.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                                        <Link href={`/crm/tournaments/${tournament.id}`} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2 rounded-xl text-sm font-bold text-center transition-colors">
                                            Details
                                        </Link>
                                        {!isAdmin && tournament.status === 'UPCOMING' && !isJoined && (
                                            <button 
                                                onClick={() => handleJoin(tournament.id)}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-bold transition-colors"
                                            >
                                                Join
                                            </button>
                                        )}
                                        {!isAdmin && isJoined && (
                                            <div className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-1">
                                                Joined
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Tournament Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Tournament</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={newTournament.title}
                                    onChange={e => setNewTournament({...newTournament, title: e.target.value})}
                                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Summer Blitz Arena"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea 
                                    value={newTournament.description}
                                    onChange={e => setNewTournament({...newTournament, description: e.target.value})}
                                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
                                    placeholder="Format, rules, prizes..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Start Date & Time</label>
                                <input 
                                    required 
                                    type="datetime-local" 
                                    value={newTournament.startDate}
                                    onChange={e => setNewTournament({...newTournament, startDate: e.target.value})}
                                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-200">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </CRMShellLayout>
    );
}

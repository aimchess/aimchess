"use client";

import CRMShellLayout from "@/components/crm/crm-shell";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, Swords, History, CircleUserRound, CircleDashed, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PlayArea() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activePlayers, setActivePlayers] = useState<any[]>([]);
    const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
    const [stats, setStats] = useState({ played: 0, wins: 0, draws: 0, losses: 0 });

    const [challengeTarget, setChallengeTarget] = useState<string | null>(null);
    const [challengeTargetName, setChallengeTargetName] = useState("");
    const [challengeTimeControl, setChallengeTimeControl] = useState("10+0");
    const [challengeIsRated, setChallengeIsRated] = useState(true);

    useEffect(() => {
        const fetchActivePlayers = async () => {
            try {
                const res = await fetch("/api/play/active");
                if (res.ok) {
                    const data = await res.json();
                    setActivePlayers(data);
                }
            } catch (e) {
                console.error("Failed to fetch active players", e);
            } finally {
                setLoading(false);
            }
        };

        const fetchPendingChallenges = async () => {
            try {
                const res = await fetch("/api/play/pending");
                if (res.ok) {
                    const data = await res.json();
                    if (data.activeGameId) {
                        router.push(`/crm/play/${data.activeGameId}`);
                        return;
                    }
                    setPendingChallenges(data.pendingChallenges);
                }
            } catch (e) {
                console.error("Failed to fetch pending challenges", e);
            }
        };

        fetchActivePlayers();
        fetchPendingChallenges();
        const interval = setInterval(() => {
            fetchActivePlayers();
            fetchPendingChallenges();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleChallengeClick = (userId: string, userName: string) => {
        setChallengeTarget(userId);
        setChallengeTargetName(userName);
    };

    const handleSendChallenge = async () => {
        if (!challengeTarget) return;
        try {
            const res = await fetch("/api/play/challenge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    challengedId: challengeTarget === "SELECT" ? (document.getElementById("challenged-select") as HTMLSelectElement)?.value : challengeTarget, 
                    timeControl: challengeTimeControl,
                    isRated: challengeIsRated
                })
            });
            if (res.ok) {
                toast.success("Challenge sent!");
                setChallengeTarget(null);
            } else {
                toast.error("Failed to send challenge.");
            }
        } catch (e) {
            toast.error("An error occurred.");
        }
    };

    const handleRespondToChallenge = async (challengeId: string, status: "ACCEPTED" | "DECLINED") => {
        try {
            const res = await fetch(`/api/play/challenge/${challengeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(`Challenge ${status.toLowerCase()}`);
                if (status === "ACCEPTED" && data.game) {
                    router.push(`/crm/play/${data.game.id}`);
                }
            } else {
                toast.error("Failed to respond to challenge");
            }
        } catch (e) {
            toast.error("An error occurred.");
        }
        setPendingChallenges(prev => prev.filter(c => c.id !== challengeId));
    };

    if (loading) {
        return (
            <CRMShellLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                </div>
            </CRMShellLayout>
        );
    }

    const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                
                {/* Incoming Challenges Modal Overlay */}
                {pendingChallenges.length > 0 && (
                    <div className="fixed top-4 right-4 z-[100] w-80 space-y-3">
                        {pendingChallenges.map((challenge) => (
                            <div key={challenge.id} className="bg-white rounded-xl shadow-2xl border border-indigo-100 p-4 animate-in slide-in-from-right">
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Incoming Challenge!</p>
                                <p className="text-gray-900 font-bold mb-3">
                                    <span className="text-indigo-600">{challenge.challenger.name}</span> has challenged you to a game.
                                </p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleRespondToChallenge(challenge.id, "ACCEPTED")}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                                    >
                                        <Check size={16} /> Accept
                                    </button>
                                    <button 
                                        onClick={() => handleRespondToChallenge(challenge.id, "DECLINED")}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                                    >
                                        <X size={16} /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Header Section */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2 uppercase text-sky-900 flex items-center gap-2">
                            PLAYER VS PLAYER
                        </h1>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Ready to play?</h2>
                        <p className="text-gray-500 text-sm">Challenge a teammate to a live match — pick your color and time control.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (activePlayers.length > 0) {
                                setChallengeTarget("SELECT");
                                setChallengeTargetName("Select Player");
                            } else {
                                toast.error("No active players online to challenge.");
                            }
                        }}
                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all"
                    >
                        <Swords size={20} /> New Challenge
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Games played</p>
                        <p className="text-3xl font-black text-gray-900">{stats.played}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Win rate</p>
                        <p className="text-3xl font-black text-gray-900">{winRate}%</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Wins</p>
                        <p className="text-3xl font-black text-gray-900">{stats.wins}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Draws</p>
                        <p className="text-3xl font-black text-gray-900">{stats.draws}</p>
                    </div>
                </div>

                {/* Active Players & Past Games */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Players List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <h3 className="font-bold text-gray-900">Active Players</h3>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                                {activePlayers.length} online
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {activePlayers.map((player) => (
                                <div key={player.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                                                {player.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-gray-900">{player.name}</p>
                                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold">{player.role}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">@{player.email.split('@')[0]}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleChallengeClick(player.id, player.name)}
                                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                                    >
                                        <Swords size={14} /> Challenge
                                    </button>
                                </div>
                            ))}
                            {activePlayers.length === 0 && (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <CircleDashed size={32} className="mb-2 opacity-50 animate-spin-slow" />
                                    <p className="text-sm">No players online right now.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Past Games */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <History size={18} className="text-indigo-500" /> Past Games
                            </h3>
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button className="px-3 py-1 text-xs font-bold bg-white shadow-sm rounded-md text-gray-900">All</button>
                                <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-900">Wins</button>
                                <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-900">Losses</button>
                                <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-900">Draws</button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <CircleUserRound size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-semibold">No games match this filter.</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Challenge setup modal */}
            {challengeTarget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setChallengeTarget(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Challenge</h2>
                        
                        <div className="space-y-4">
                            {challengeTarget === "SELECT" ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Opponent</label>
                                    <select 
                                        id="challenged-select"
                                        className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        {activePlayers.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Opponent</label>
                                    <input 
                                        disabled
                                        type="text" 
                                        value={challengeTargetName}
                                        className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-600 font-semibold outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Time Control</label>
                                <select 
                                    value={challengeTimeControl}
                                    onChange={e => setChallengeTimeControl(e.target.value)}
                                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="5+0">5+0</option>
                                    <option value="10+0">10+0</option>
                                    <option value="10+5">10+5</option>
                                    <option value="10+10">10+10</option>
                                    <option value="15+10">15+10</option>
                                    <option value="25+10">25+10</option>
                                    <option value="30+20">30+20</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Challenge Type</label>
                                <select 
                                    value={challengeIsRated ? "rated" : "friendly"}
                                    onChange={e => setChallengeIsRated(e.target.value === "rated")}
                                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="rated">⭐ Rated (Updates AIM Rating)</option>
                                    <option value="friendly">🤝 Friendly Match</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t mt-6">
                                <button type="button" onClick={() => setChallengeTarget(null)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
                                <button onClick={handleSendChallenge} className="flex-1 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-200">Send Challenge</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CRMShellLayout>
    );
}

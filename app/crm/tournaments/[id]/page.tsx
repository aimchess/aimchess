"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Loader2, Trophy, Swords, Calendar as CalendarIcon, Hash } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TournamentDetailsPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const currentUserId = (session?.user as any)?.id;
    
    const [loading, setLoading] = useState(true);
    const [tournament, setTournament] = useState<any>(null);
    const [challenging, setChallenging] = useState<string | null>(null);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const res = await fetch(`/api/tournaments/${params.id}`);
                if (res.ok) {
                    setTournament(await res.json());
                } else {
                    toast.error("Tournament not found");
                }
            } catch (error) {
                toast.error("Failed to load tournament");
            } finally {
                setLoading(false);
            }
        };
        
        fetchTournament();

        const checkActiveGame = async () => {
            try {
                const res = await fetch("/api/play/pending");
                if (res.ok) {
                    const data = await res.json();
                    if (data.activeGameId) {
                        router.push(`/crm/play/${data.activeGameId}`);
                    }
                }
            } catch (e) {
                // ignore
            }
        };

        const interval = setInterval(() => {
            checkActiveGame();
            // Refresh tournament leaderboard too while we're at it
            fetchTournament();
        }, 5000);

        return () => clearInterval(interval);
    }, [params.id, router]);

    const handleChallenge = async (opponentId: string) => {
        setChallenging(opponentId);
        try {
            const res = await fetch("/api/play/challenge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    challengedId: opponentId, 
                    timeControl: "10+0",
                    tournamentId: params.id 
                })
            });

            if (res.ok) {
                toast.success("Tournament Challenge sent! Waiting for them to accept...");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to send challenge");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setChallenging(null);
        }
    };

    if (loading) {
        return (
            <CRMShellLayout>
                <div className="flex justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                </div>
            </CRMShellLayout>
        );
    }

    if (!tournament) return null;

    const isParticipant = tournament.participants.some((p: any) => p.userId === currentUserId);

    return (
        <CRMShellLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <Trophy size={200} className="transform translate-x-10 -translate-y-10" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md">
                            <Trophy size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-2 inline-block ${
                                tournament.status === 'UPCOMING' ? 'bg-sky-500/20 text-sky-200' :
                                tournament.status === 'ONGOING' ? 'bg-emerald-500/20 text-emerald-200 animate-pulse' :
                                'bg-gray-500/20 text-gray-200'
                            }`}>
                                {tournament.status}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{tournament.title}</h1>
                            <div className="flex items-center gap-2 text-indigo-200 text-sm font-semibold">
                                <CalendarIcon size={14} />
                                {new Date(tournament.startDate).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Leaderboard and Pairings */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Hash className="text-indigo-500" size={20} />
                            Tournament Leaderboard & Pairings
                        </h2>

                        {tournament.participants.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No participants have joined this tournament yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b">
                                        <tr>
                                            <th className="px-6 py-4">Rank</th>
                                            <th className="px-6 py-4">Player</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournament.participants.map((p: any, index: number) => {
                                            const isMe = p.userId === currentUserId;
                                            
                                            // A user is online if active in last 5 minutes
                                            const isOnline = p.user.lastActiveAt && 
                                                (new Date().getTime() - new Date(p.user.lastActiveAt).getTime() < 5 * 60 * 1000);

                                            return (
                                                <tr key={p.id} className={`border-b hover:bg-gray-50/50 ${isMe ? 'bg-indigo-50/30' : ''}`}>
                                                    <td className="px-6 py-4 font-black text-gray-400">#{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                                    {p.user.name[0]}
                                                                </div>
                                                                {isOnline && (
                                                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">
                                                                    {p.user.name} {isMe && <span className="text-xs text-indigo-500 font-normal">(You)</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-lg text-gray-900">{p.score}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!isMe && isParticipant && tournament.status !== "COMPLETED" && (
                                                            <button 
                                                                onClick={() => handleChallenge(p.userId)}
                                                                disabled={challenging === p.userId || !isOnline}
                                                                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ml-auto transition-all ${
                                                                    isOnline 
                                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {challenging === p.userId ? <Loader2 size={16} className="animate-spin" /> : <Swords size={16} />}
                                                                {isOnline ? 'Challenge' : 'Offline'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Tournament Info Sidebar */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 h-fit">
                        <h3 className="text-lg font-black text-gray-900 border-b pb-2">Tournament Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Status:</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                    tournament.status === 'UPCOMING' ? 'bg-sky-100 text-sky-700' :
                                    tournament.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>{tournament.status}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Time Control:</span>
                                <span className="font-bold text-gray-900">{tournament.timeControl || "10+0"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Total Rounds:</span>
                                <span className="font-bold text-gray-900">{tournament.totalRounds || 4} Rounds</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Pairing System:</span>
                                <span className="font-bold text-gray-900">{tournament.pairingSystem || "Swiss"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Current Round:</span>
                                <span className="font-bold text-emerald-600">Round {tournament.currentRound || 1}</span>
                            </div>
                            {tournament.status === "COMPLETED" && (
                                <div className="pt-2">
                                    <span className="text-gray-500 font-semibold block mb-2">Final Standings:</span>
                                    <div className="space-y-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                        {tournament.participants.slice(0, 3).map((p: any, idx: number) => (
                                            <div key={p.id} className="flex justify-between font-bold text-xs text-indigo-950">
                                                <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"} {p.user.name}</span>
                                                <span>{p.score} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CRMShellLayout>
    );
}

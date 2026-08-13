"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Loader2, Trophy, Swords, Calendar as CalendarIcon, Hash, Play, RefreshCw, CheckCircle2, Trash2, Eye, Award, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TournamentDetailsPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const currentUserId = (session?.user as any)?.id;
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    
    const [loading, setLoading] = useState(true);
    const [tournament, setTournament] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

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

    useEffect(() => {
        fetchTournament();

        const interval = setInterval(() => {
            fetchTournament();
        }, 3000);

        return () => clearInterval(interval);
    }, [params.id]);

    // Detect if student is paired in the current round with an active in-progress game
    const activeRoundGame = tournament?.games?.find((g: any) => 
        g.round === tournament.currentRound && 
        g.status === "IN_PROGRESS" && 
        (g.whiteId === currentUserId || g.blackId === currentUserId)
    );

    // Auto redirect countdown trigger
    useEffect(() => {
        if (activeRoundGame && !isAdmin) {
            setRedirectCountdown(3);
            const interval = setInterval(() => {
                setRedirectCountdown((prev) => {
                    if (prev !== null && prev <= 1) {
                        clearInterval(interval);
                        router.push(`/crm/play/${activeRoundGame.id}?tournamentId=${tournament.id}`);
                        return null;
                    }
                    return prev !== null ? prev - 1 : null;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setRedirectCountdown(null);
        }
    }, [activeRoundGame?.id, isAdmin, tournament?.id]);

    const handleJoin = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/tournaments/${params.id}/join`, {
                method: "POST",
            });
            if (res.ok) {
                toast.success("Joined tournament successfully!");
                fetchTournament();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to join");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdminAction = async (action: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/tournaments/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "Tournament updated!");
                fetchTournament();
            } else {
                toast.error("Failed to update tournament");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this tournament? This will delete all matches associated with it.")) return;
        try {
            const res = await fetch(`/api/tournaments/${params.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Tournament deleted successfully");
                router.push("/crm/tournaments");
            } else {
                toast.error("Failed to delete tournament");
            }
        } catch (error) {
            toast.error("An error occurred");
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
    const myScore = tournament.participants.find((p: any) => p.userId === currentUserId)?.score ?? 0;
    
    // Check for BYE
    const currentRoundGames = tournament.games?.filter((g: any) => g.round === tournament.currentRound) || [];
    const isPaired = currentRoundGames.some((g: any) => g.whiteId === currentUserId || g.blackId === currentUserId);
    const hasBye = tournament.status === "ONGOING" && currentRoundGames.length > 0 && isParticipant && !isPaired;

    return (
        <CRMShellLayout>
            <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <Trophy size={200} className="transform translate-x-10 -translate-y-10" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
                            <Trophy size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    tournament.status === 'UPCOMING' ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30' :
                                    tournament.status === 'ONGOING' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse' :
                                    'bg-gray-500/20 text-gray-200 border border-gray-400/30'
                                }`}>
                                    {tournament.status === 'ONGOING' ? '🟢 LIVE ONGOING' : tournament.status}
                                </span>
                                {tournament.timeControl && (
                                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md text-[10px] font-black">
                                        ⏱️ {tournament.timeControl}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{tournament.title}</h1>
                            <div className="flex items-center gap-2 text-indigo-200 text-sm font-semibold">
                                <CalendarIcon size={14} />
                                {new Date(tournament.startDate).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {/* Join / Delete actions */}
                    <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                        {!isAdmin && tournament.status === 'UPCOMING' && !isParticipant && (
                            <button
                                onClick={handleJoin}
                                disabled={actionLoading}
                                className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-black px-6 py-3.5 rounded-xl text-sm shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Play size={16} /> Join Tournament
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                onClick={handleDelete}
                                className="bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-600 text-red-200 hover:text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                            >
                                <Trash2 size={14} /> Delete Tournament
                            </button>
                        )}
                    </div>
                </div>

                {/* Redirecting Overlay Alert */}
                {redirectCountdown !== null && activeRoundGame && (
                    <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⚔️</span>
                            <div>
                                <h3 className="font-black text-lg">Your Match is Ready!</h3>
                                <p className="text-indigo-100 text-xs font-semibold">Playing against {activeRoundGame.whiteId === currentUserId ? activeRoundGame.black.name : activeRoundGame.white.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-indigo-700/80 px-3 py-1.5 rounded-lg font-mono">
                                Auto-opening board in {redirectCountdown}s...
                            </span>
                            <Link
                                href={`/crm/play/${activeRoundGame.id}?tournamentId=${tournament.id}`}
                                className="bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-colors"
                            >
                                <Play size={14} /> Play Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Dashboard layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Kid-friendly Status banner */}
                        {isParticipant && tournament.status === "ONGOING" && (
                            <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-indigo-900">
                                    <Swords size={120} />
                                </div>
                                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1.5">Your Match Status</h3>
                                
                                {activeRoundGame ? (
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 mb-2">Round {tournament.currentRound} Match is LIVE!</h4>
                                        <p className="text-gray-500 text-sm mb-4">Click below to join the board and make your moves.</p>
                                        <Link
                                            href={`/crm/play/${activeRoundGame.id}?tournamentId=${tournament.id}`}
                                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-100"
                                        >
                                            <Play size={16} /> Enter Game Board
                                        </Link>
                                    </div>
                                ) : hasBye ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 animate-in zoom-in-95">
                                        <span className="text-2xl shrink-0">⏳</span>
                                        <div>
                                            <h4 className="font-extrabold text-amber-900 text-sm">BYE – You are not paired for this round.</h4>
                                            <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                                                You receive 1 tournament point automatically. Please wait here for the next round pairings to start.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Paired but game is completed in current round */}
                                        {tournament.games?.some((g: any) => g.round === tournament.currentRound && g.status === "COMPLETED" && (g.whiteId === currentUserId || g.blackId === currentUserId)) ? (
                                            <div>
                                                <h4 className="text-lg font-extrabold text-emerald-800 flex items-center gap-1.5">
                                                    🎉 Round Match Finished!
                                                </h4>
                                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                                    Great job! Your game for Round {tournament.currentRound} has finished. Please wait here for the next round pairings to start.
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="text-lg font-extrabold text-indigo-900">⌛ Waiting for Round Pairings...</h4>
                                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                                    Round {tournament.currentRound} pairings are being generated by the administrator. Stay on this page!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Child-friendly Instructions */}
                        {isParticipant && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                                <h3 className="font-black text-indigo-950 text-sm mb-3 flex items-center gap-1.5">
                                    <Info size={16} className="text-indigo-600" /> simple Chess Academy Rules
                                </h3>
                                <ul className="space-y-2.5 text-xs text-indigo-900 font-semibold">
                                    <li className="flex items-start gap-2">
                                        <span>♟️</span>
                                        <span>Your match will open automatically when pairings start.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>⚔️</span>
                                        <span>If you receive a BYE, you automatically get 1 point.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>⌛</span>
                                        <span>After your match ends, you will be returned here. Please wait for the next round.</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Timeline of Rounds */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <h2 className="text-base font-black text-gray-900">Rounds Progression</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Array.from({ length: tournament.totalRounds }).map((_, i) => {
                                    const roundNum = i + 1;
                                    const isCurrent = roundNum === tournament.currentRound;
                                    const isPast = roundNum < tournament.currentRound;
                                    
                                    let statusText = "Upcoming";
                                    let colorClasses = "bg-gray-50 border-gray-100 text-gray-400";
                                    
                                    if (isPast || tournament.status === "COMPLETED") {
                                        statusText = "Completed";
                                        colorClasses = "bg-emerald-50 border-emerald-100 text-emerald-700";
                                    } else if (isCurrent && tournament.status === "ONGOING") {
                                        statusText = "LIVE ROUND";
                                        colorClasses = "bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse font-extrabold";
                                    }

                                    return (
                                        <div key={roundNum} className={`border rounded-2xl p-4 text-center ${colorClasses}`}>
                                            <div className="text-xs uppercase tracking-wider font-extrabold opacity-80">Round {roundNum}</div>
                                            <div className="text-xs mt-1 font-bold">{statusText}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live Games in Current Round */}
                        {tournament.status === "ONGOING" && (
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <Swords size={18} className="text-indigo-600" />
                                        Round {tournament.currentRound} Board Matches
                                    </h2>
                                    <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                                        {currentRoundGames.length} Paired
                                    </span>
                                </div>

                                {currentRoundGames.length === 0 ? (
                                    <p className="text-center py-6 text-xs text-gray-400 font-bold">No active games generated for this round yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentRoundGames.map((game: any, index: number) => {
                                            const boardNumber = index + 1;
                                            const isMyGame = game.whiteId === currentUserId || game.blackId === currentUserId;
                                            
                                            return (
                                                <div 
                                                    key={game.id} 
                                                    className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                                                        isMyGame ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-gray-50/50 border-gray-100'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2.5">
                                                        <span className="bg-white text-gray-700 border border-gray-200 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                                                            Board {boardNumber}
                                                        </span>
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                            game.status === "IN_PROGRESS" ? "bg-emerald-100 text-emerald-700 animate-pulse" : "bg-gray-200 text-gray-600"
                                                        }`}>
                                                            {game.status === "IN_PROGRESS" ? "🟢 LIVE" : "🏁 FINISHED"}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-gray-900 truncate">⚪ {game.white.name}</span>
                                                            {game.status === "COMPLETED" && (
                                                                <span className="font-extrabold text-[11px] text-gray-700">{game.result?.split('-')[0]}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-gray-900 truncate">⚫ {game.black.name}</span>
                                                            {game.status === "COMPLETED" && (
                                                                <span className="font-extrabold text-[11px] text-gray-700">{game.result?.split('-')[1]}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!isMyGame && (
                                                        <Link
                                                            href={`/crm/play/${game.id}`}
                                                            className="mt-3.5 w-full py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-sm transition-colors"
                                                        >
                                                            <Eye size={12} /> Spectate Board
                                                        </Link>
                                                    )}
                                                    {isMyGame && game.status === "IN_PROGRESS" && (
                                                        <Link
                                                            href={`/crm/play/${game.id}?tournamentId=${tournament.id}`}
                                                            className="mt-3.5 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-md transition-colors"
                                                        >
                                                            <Play size={12} /> Go to Board
                                                        </Link>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tournament Leaderboard Standings */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                                <Award size={18} className="text-yellow-500" /> Tournament Leaderboard
                            </h2>
                            {tournament.participants.length === 0 ? (
                                <p className="text-center py-6 text-xs text-gray-400 font-bold">No players have joined yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-2.5">Rank</th>
                                                <th className="px-4 py-2.5">Player</th>
                                                <th className="px-4 py-2.5 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {tournament.participants.map((p: any, index: number) => {
                                                const isMe = p.userId === currentUserId;
                                                const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                                                
                                                return (
                                                    <tr key={p.id} className={`hover:bg-gray-50/50 ${isMe ? 'bg-indigo-50/30' : ''}`}>
                                                        <td className="px-4 py-3 font-black text-gray-400">
                                                            {rankEmoji ? <span className="text-base">{rankEmoji}</span> : `#${index + 1}`}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-gray-900">{p.user.name} {isMe && "(You)"}</td>
                                                        <td className="px-4 py-3 font-black text-right text-base text-indigo-900">{p.score} pts</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Sidebar / Info & Admin Panel */}
                    <div className="space-y-6">

                        {/* Admin Command Console */}
                        {isAdmin && (
                            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
                                <h3 className="text-sm font-black tracking-widest text-indigo-400 uppercase border-b border-indigo-950 pb-2.5">Admin Control Panel</h3>
                                
                                <div className="space-y-3">
                                    {tournament.status === 'UPCOMING' && (
                                        <button
                                            onClick={() => handleAdminAction("START")}
                                            disabled={actionLoading}
                                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                                        >
                                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                            Start & Pair Round 1
                                        </button>
                                    )}

                                    {tournament.status === 'ONGOING' && (
                                        <>
                                            <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 text-xs space-y-2">
                                                <p className="font-extrabold text-slate-300">Round {tournament.currentRound} Progress:</p>
                                                <div className="flex justify-between text-[11px] text-slate-400">
                                                    <span>Live Matches:</span>
                                                    <span className="font-bold text-white">{currentRoundGames.filter((g:any)=>g.status === "IN_PROGRESS").length}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] text-slate-400">
                                                    <span>Completed:</span>
                                                    <span className="font-bold text-white">{currentRoundGames.filter((g:any)=>g.status === "COMPLETED").length}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAdminAction("PAIR_ROUND")}
                                                disabled={actionLoading}
                                                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                                            >
                                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Swords size={14} />}
                                                Pair Round Matches
                                            </button>

                                            <button
                                                onClick={() => handleAdminAction("COMPLETE")}
                                                disabled={actionLoading}
                                                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                                            >
                                                <CheckCircle2 size={14} />
                                                Complete Tournament
                                            </button>
                                        </>
                                    )}

                                    {tournament.status === 'COMPLETED' && (
                                        <div className="text-center bg-slate-850 p-4 rounded-2xl border border-slate-750 text-xs text-slate-400">
                                            🏁 This tournament has finished.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tournament Guidelines Sidebar */}
                        {tournament.guidelines && (
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                                <h3 className="text-xs font-black tracking-wider text-gray-500 uppercase">Guidelines</h3>
                                <div className="text-xs font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {tournament.guidelines}
                                </div>
                            </div>
                        )}

                        {/* Tournament Info Sidebar */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-gray-900 border-b pb-2">Tournament Info</h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-semibold">Status:</span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
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
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-500 font-semibold">Participants:</span>
                                    <span className="font-bold text-indigo-600">{tournament.participants.length} Joined</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </CRMShellLayout>
    );
}

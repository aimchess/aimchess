"use client";

import CRMShellLayout from "@/components/crm/crm-shell";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, Swords, History, CircleUserRound, CircleDashed, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlayArea() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activePlayers, setActivePlayers] = useState<any[]>([]);
    const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
    const [stats, setStats] = useState({ played: 0, wins: 0, draws: 0, losses: 0 });
    const [history, setHistory] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [newFriendEmail, setNewFriendEmail] = useState("");

    const [challengeTarget, setChallengeTarget] = useState<string | null>(null);
    const [challengeTargetName, setChallengeTargetName] = useState("");
    const [challengeTimeControl, setChallengeTimeControl] = useState("10+0");
    const [challengeIsRated, setChallengeIsRated] = useState(true);

    const [activeTab, setActiveTab] = useState<"players" | "friends" | "bots">("players");
    const [historyFilter, setHistoryFilter] = useState<"all" | "wins" | "losses" | "draws">("all");

    // Fetch active online players + pending challenges + friends list
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

        const fetchFriendsList = async () => {
            try {
                const res = await fetch("/api/friends");
                if (res.ok) {
                    const data = await res.json();
                    setFriends(data);
                }
            } catch (e) {
                console.error("Failed to fetch friends:", e);
            }
        };

        fetchActivePlayers();
        fetchPendingChallenges();
        fetchFriendsList();
        
        const interval = setInterval(() => {
            fetchActivePlayers();
            fetchPendingChallenges();
            fetchFriendsList();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);

    // Fetch completed games history
    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/play/history");
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
                
                const completed = data.filter((g: any) => g.status === "COMPLETED");
                let wins = 0;
                let draws = 0;
                let losses = 0;
                
                completed.forEach((g: any) => {
                    if (g.winnerId === (session?.user as any)?.id) {
                        wins++;
                    } else if (g.winnerId === null) {
                        draws++;
                    } else {
                        losses++;
                    }
                });
                
                setStats({
                    played: completed.length,
                    wins,
                    draws,
                    losses
                });
            }
        } catch (e) {
            console.error("Failed to fetch history:", e);
        }
    };

    useEffect(() => {
        if (session) {
            fetchHistory();
        }
    }, [session]);

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

    const handlePlayBot = async (difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT") => {
        setLoading(true);
        try {
            const res = await fetch("/api/play/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty, playAs: "random" })
            });
            if (res.ok) {
                const game = await res.json();
                toast.success("Practice match initialized!");
                router.push(`/crm/play/${game.id}`);
            } else {
                toast.error("Failed to start bot game");
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Network error");
            setLoading(false);
        }
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFriendEmail.trim()) return;
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetEmail: newFriendEmail })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.autoAccepted) {
                    toast.success("Friend added successfully!");
                } else {
                    toast.success("Friend request sent!");
                }
                setNewFriendEmail("");
                // Refresh list
                const fres = await fetch("/api/friends");
                if (fres.ok) setFriends(await fres.json());
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to add friend.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        }
    };

    const handleFriendAction = async (friendshipId: string, action: "ACCEPT" | "DECLINE") => {
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendshipId, action })
            });
            if (res.ok) {
                toast.success(`Friend request ${action.toLowerCase()}ed.`);
                const fres = await fetch("/api/friends");
                if (fres.ok) setFriends(await fres.json());
            } else {
                toast.error("Failed to execute friend action.");
            }
        } catch (err) {
            toast.error("Network error.");
        }
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

    const filteredHistory = history.filter((g: any) => {
        if (historyFilter === "all") return true;
        if (historyFilter === "wins") return g.status === "COMPLETED" && g.winnerId === (session?.user as any)?.id;
        if (historyFilter === "losses") return g.status === "COMPLETED" && g.winnerId !== null && g.winnerId !== (session?.user as any)?.id;
        if (historyFilter === "draws") return g.status === "COMPLETED" && g.winnerId === null;
        return true;
    });

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
                            PLAY ZONE
                        </h1>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Ready to play?</h2>
                        <p className="text-gray-500 text-sm">Challenge a teammate or test your tactical skills against the AIM Chess bots.</p>
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all"
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
                        <p className="text-xs text-gray-500 font-semibold mb-1">Losses / Draws</p>
                        <p className="text-3xl font-black text-gray-900">{stats.losses} / {stats.draws}</p>
                    </div>
                </div>

                {/* Active Players / AI Bots / Friends Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1 shrink-0">
                            <button 
                                onClick={() => setActiveTab("players")}
                                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${activeTab === "players" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Active ({activePlayers.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab("friends")}
                                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${activeTab === "friends" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Friends
                            </button>
                            <button 
                                onClick={() => setActiveTab("bots")}
                                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${activeTab === "bots" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                AI Bots
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === "players" ? (
                                <div className="space-y-3">
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
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
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
                            ) : activeTab === "friends" ? (
                                <div className="space-y-4">
                                    <form onSubmit={handleAddFriend} className="flex gap-2">
                                        <input 
                                            type="email"
                                            placeholder="Friend's email..."
                                            value={newFriendEmail}
                                            onChange={e => setNewFriendEmail(e.target.value)}
                                            className="flex-1 p-2 border border-sky-100 rounded-xl text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-indigo-300 font-medium text-slate-700"
                                            required
                                        />
                                        <button 
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                                        >
                                            Add
                                        </button>
                                    </form>

                                    <div className="space-y-3.5">
                                        {friends.map((item) => (
                                            <div key={item.friendshipId} className="p-3.5 rounded-xl border border-slate-100 bg-white flex flex-col gap-2.5 hover:border-sky-100 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900">{item.friend.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">AIM Rating: {item.friend.aimRating}</p>
                                                    </div>
                                                    {item.status === "ACCEPTED" ? (
                                                        <button 
                                                            onClick={() => handleChallengeClick(item.friend.id, item.friend.name)}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0"
                                                        >
                                                            <Swords size={12} /> Play
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded font-black uppercase">
                                                            {item.isSender ? "Sent" : "Pending"}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.status === "PENDING" && !item.isSender && (
                                                    <div className="flex gap-2 border-t pt-2.5">
                                                        <button 
                                                            onClick={() => handleFriendAction(item.friendshipId, "ACCEPT")}
                                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1 rounded-lg text-[10px] font-bold"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleFriendAction(item.friendshipId, "DECLINE")}
                                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 rounded-lg text-[10px] font-bold"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {friends.length === 0 && (
                                            <div className="text-center py-10 text-slate-400 font-medium italic text-xs">
                                                No friends added yet. Enter their email to connect!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[
                                        { level: "BEGINNER", title: "Beginner Bot", desc: "Great for start levels. Simple material calculation.", rating: 600, color: "bg-emerald-500" },
                                        { level: "INTERMEDIATE", title: "Intermediate Bot", desc: "Bronze rating test. Thinks 2 moves ahead.", rating: 1000, color: "bg-sky-500" },
                                        { level: "ADVANCED", title: "Advanced Bot", desc: "Gold level challenge. Deep positional plays.", rating: 1400, color: "bg-amber-500" },
                                        { level: "EXPERT", title: "Expert Bot", desc: "Master level sparring partner. Searches 4 depths.", rating: 1800, color: "bg-red-500" }
                                    ].map(bot => (
                                        <div key={bot.level} className="p-4 rounded-xl border border-gray-100 bg-white flex justify-between items-center shadow-sm hover:border-indigo-100 hover:shadow-md transition-all">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${bot.color}`}></span>
                                                    <p className="font-bold text-sm text-gray-900">{bot.title}</p>
                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-500 font-semibold">{bot.rating} ELO</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 max-w-[160px]">{bot.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => handlePlayBot(bot.level as any)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                                            >
                                                Play
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Past Games History with dynamic listing */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <History size={18} className="text-[#0b1d3a]" /> Past Games
                            </h3>
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                {[
                                    { label: "All", value: "all" },
                                    { label: "Wins", value: "wins" },
                                    { label: "Losses", value: "losses" },
                                    { label: "Draws", value: "draws" }
                                ].map(btn => (
                                    <button 
                                        key={btn.value}
                                        onClick={() => setHistoryFilter(btn.value as any)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${historyFilter === btn.value ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {filteredHistory.map((game) => {
                                const isWhite = game.whiteId === (session?.user as any)?.id;
                                const opponent = isWhite ? game.black : game.white;
                                const isBotGame = game.isBot;
                                
                                let outcome = "DRAW";
                                if (game.winnerId) {
                                    outcome = game.winnerId === (session?.user as any)?.id ? "WIN" : "LOSS";
                                }
                                
                                return (
                                    <div key={game.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-all bg-white shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-gray-900">
                                                    vs {opponent?.name || (isBotGame ? `AIM ${game.botDifficulty?.toLowerCase()} Bot` : "AIM Bot")}
                                                </p>
                                                {isBotGame && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black">AI</span>}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(game.createdAt).toLocaleDateString()} • {game.timeControl}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                                                outcome === "WIN" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                outcome === "DRAW" ? "bg-gray-50 text-gray-700 border border-gray-100" :
                                                "bg-red-50 text-red-700 border border-red-100"
                                            }`}>
                                                {outcome}
                                            </span>
                                            <Link href={`/crm/play/${game.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                                                View Game →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 h-full">
                                    <CircleUserRound size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm font-semibold">No games match this filter.</p>
                                </div>
                            )}
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
                                <button onClick={handleSendChallenge} className="flex-1 py-3 text-white font-bold bg-[#0b1d3a] hover:bg-[#132d56] rounded-xl transition-all shadow-lg shadow-indigo-200">Send Challenge</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CRMShellLayout>
    );
}

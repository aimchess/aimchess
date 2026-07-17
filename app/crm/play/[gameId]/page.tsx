"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Loader2, ArrowLeft, Flag, Check, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function GamePage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const gameId = params.gameId as string;

    const [game, setGame] = useState(new Chess());
    const [loading, setLoading] = useState(true);
    const [gameData, setGameData] = useState<any>(null);
    const [playerColor, setPlayerColor] = useState<"white" | "black" | "spectator">("spectator");
    const [wTime, setWTime] = useState<number | null>(null);
    const [bTime, setBTime] = useState<number | null>(null);

    const fetchGameState = async () => {
        try {
            const res = await fetch(`/api/play/game/${gameId}`);
            if (res.ok) {
                const data = await res.json();
                setGameData(data);
                
                const newGame = new Chess();
                if (data.pgn) {
                    newGame.loadPgn(data.pgn);
                } else if (data.fen) {
                    newGame.load(data.fen);
                }
                setGame(newGame);

                const currentUserId = (session?.user as any)?.id;
                if (currentUserId === data.whiteId) setPlayerColor("white");
                else if (currentUserId === data.blackId) setPlayerColor("black");
            }
        } catch (error) {
            console.error("Failed to fetch game state:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!session?.user) return;
        fetchGameState();
        
        // Simple polling for game state updates
        const interval = setInterval(fetchGameState, 3000);
        return () => clearInterval(interval);
    }, [gameId, session]);

    // Sync local clocks with gameData
    useEffect(() => {
        if (gameData) {
            setWTime(gameData.whiteTimeLeft);
            setBTime(gameData.blackTimeLeft);
        }
    }, [gameData]);

    // Client-side real-time ticking (every 100ms for smooth tenths-of-second updates under 10s)
    useEffect(() => {
        if (!gameData || gameData.status !== "IN_PROGRESS") return;

        const interval = setInterval(() => {
            const activeColor = game.turn();
            if (activeColor === "w") {
                setWTime((prev) => (prev !== null ? Math.max(0, prev - 100) : null));
            } else {
                setBTime((prev) => (prev !== null ? Math.max(0, prev - 100) : null));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [gameData, game]);

    const formatTime = (ms: number | null) => {
        if (ms === null || ms === undefined) return "--:--";
        if (ms <= 0) return "0:00";
        
        const totalSecs = Math.floor(ms / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;

        if (ms < 10000) {
            // under 10 seconds: show tenths of a second
            const tenths = Math.floor((ms % 1000) / 100);
            return `${seconds}.${tenths}`;
        }

        const minStr = minutes.toString();
        const secStr = seconds.toString().padStart(2, "0");

        if (hours > 0) {
            return `${hours}:${minStr.padStart(2, "0")}:${secStr}`;
        }
        return `${minStr}:${secStr}`;
    };

    const onDrop = (sourceSquare: string, targetSquare: string) => {
        if (playerColor === "spectator" || gameData?.status !== "IN_PROGRESS") return false;
        
        const turn = game.turn() === "w" ? "white" : "black";
        if (turn !== playerColor) {
            toast.error("Not your turn!");
            return false;
        }

        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: "q" // Always promote to queen for simplicity here
        };

        try {
            const newGame = new Chess(game.fen());
            const result = newGame.move(move);

            if (result) {
                setGame(newGame);
                
                // Send move to server
                fetch(`/api/play/game/${gameId}/move`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ move, fen: newGame.fen(), pgn: newGame.pgn() })
                });
                
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
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

    if (!gameData) {
        return (
            <CRMShellLayout>
                <div className="text-center py-20">Game not found</div>
            </CRMShellLayout>
        );
    }

    return (
        <CRMShellLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <Link href="/crm/play" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold text-sm">
                        <ArrowLeft size={16} /> Back to Play Area
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <span className="flex items-center gap-1 text-gray-700">
                            <Users size={16} /> 
                            {gameData.white.name} <span className="text-gray-400 font-normal">vs</span> {gameData.black.name}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${
                            gameData.status === "IN_PROGRESS" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                        }`}>
                            {gameData.status.replace("_", " ")}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
                        <div className="w-full max-w-[600px] aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-indigo-50">
                            <Chessboard 
                                position={game.fen()} 
                                onPieceDrop={onDrop}
                                boardOrientation={playerColor === "black" ? "black" : "white"}
                                customDarkSquareStyle={{ backgroundColor: "#4f46e5" }}
                                customLightSquareStyle={{ backgroundColor: "#e0e7ff" }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[600px] lg:h-auto">
                        <h3 className="font-bold text-gray-900 mb-4 border-b pb-4">Game Info</h3>
                        
                        <div className="space-y-4 flex-1 overflow-y-auto">
                            {gameData.timeControl && (
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-950">
                                    <span>Time Control</span>
                                    <span>{gameData.timeControl}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-white border border-gray-300"></div>
                                    <span className="font-semibold text-sm text-gray-900">{gameData.white.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {gameData.timeControl && wTime !== null && (
                                        <div className={`${
                                            wTime < 30000 && game.turn() === "w" && gameData.status === "IN_PROGRESS"
                                                ? "bg-red-500 text-white border-red-600 animate-pulse"
                                                : game.turn() === "w" && gameData.status === "IN_PROGRESS"
                                                    ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                        } border px-3 py-1 rounded-lg font-mono text-sm shadow-sm transition-colors duration-200`}>
                                            {formatTime(wTime)}
                                        </div>
                                    )}
                                    {game.turn() === "w" && gameData.status === "IN_PROGRESS" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800 text-white border border-gray-900">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-gray-950 border border-gray-700"></div>
                                    <span className="font-semibold text-sm">{gameData.black.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {gameData.timeControl && bTime !== null && (
                                        <div className={`${
                                            bTime < 30000 && game.turn() === "b" && gameData.status === "IN_PROGRESS"
                                                ? "bg-red-500 text-white border-red-600 animate-pulse"
                                                : game.turn() === "b" && gameData.status === "IN_PROGRESS"
                                                    ? "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                                                    : "bg-gray-700 text-gray-200 border-gray-600"
                                        } border px-3 py-1 rounded-lg font-mono text-sm shadow-sm transition-colors duration-200`}>
                                            {formatTime(bTime)}
                                        </div>
                                    )}
                                    {game.turn() === "b" && gameData.status === "IN_PROGRESS" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                                </div>
                            </div>
                            
                            {playerColor !== "spectator" && gameData.status === "IN_PROGRESS" && (
                                <div className="pt-6 mt-auto">
                                    <button className="w-full py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                        <Flag size={16} /> Resign
                                    </button>
                                </div>
                            )}

                            {gameData.status === "COMPLETED" && (
                                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center animate-in slide-in-from-bottom-2">
                                    <h4 className="font-black text-emerald-800 text-lg mb-1">Game Over</h4>
                                    <p className="text-emerald-600 font-semibold text-sm">Result: {gameData.result}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </CRMShellLayout>
    );
}

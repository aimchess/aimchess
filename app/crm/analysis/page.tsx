"use client";

import React, { useEffect, useState, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
    MousePointer2, RotateCcw, ArrowUpDown, Settings, Trash2,
} from "lucide-react";

type Tool = { type: string; color: "w" | "b" } | "TRASH" | null;

const BoardSetupPalette = ({ selectedTool, setSelectedTool, onClear, onReset }: any) => {
    const pieces = ["p", "n", "b", "r", "q", "k"];
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm select-none">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex justify-between"><span>White</span><span>Black</span></div>
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex gap-1 flex-wrap justify-center">
                    {pieces.map((p) => (
                        <div key={"w" + p} onClick={() => setSelectedTool({ type: p, color: "w" })}
                            className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent ${selectedTool?.type === p && selectedTool?.color === "w" ? "bg-sky-100 border-sky-500 scale-110" : ""}`}>
                            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">{p === "p" ? "♟" : p === "n" ? "♞" : p === "b" ? "♝" : p === "r" ? "♜" : p === "q" ? "♛" : "♚"}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1 flex-wrap justify-center border-l pl-4">
                    {pieces.map((p) => (
                        <div key={"b" + p} onClick={() => setSelectedTool({ type: p, color: "b" })}
                            className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent ${selectedTool?.type === p && selectedTool?.color === "b" ? "bg-slate-200 border-slate-500 scale-110" : ""}`}>
                            <span className="text-black pb-1">{p === "p" ? "♟" : p === "n" ? "♞" : p === "b" ? "♝" : p === "r" ? "♜" : p === "q" ? "♛" : "♚"}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t pt-3 flex gap-2">
                <button onClick={() => setSelectedTool("TRASH")} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-red-50 transition-colors ${selectedTool === "TRASH" ? "bg-red-100 text-red-600 ring-1 ring-red-500" : "text-gray-500"}`}>
                    <Trash2 size={16} /><span className="text-[10px] font-bold">TRASH</span>
                </button>
                <button onClick={onClear} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
                    <Trash2 size={16} className="text-gray-400" /><span className="text-[10px] font-bold">CLEAR</span>
                </button>
                <button onClick={onReset} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
                    <RotateCcw size={16} className="text-gray-400" /><span className="text-[10px] font-bold">RESET</span>
                </button>
            </div>
        </div>
    );
};

export default function AnalysisPage() {
    const game = useRef(new Chess());
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [squares, setSquares] = useState<Record<string, any>>({});
    const [orientation, setOrientation] = useState<"white" | "black">("white");
    const [setupMode, setSetupMode] = useState(false);
    const [selectedTool, setSelectedTool] = useState<Tool>(null);
    const [boardWidth, setBoardWidth] = useState(600);
    const boardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!boardContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) setBoardWidth(entry.contentRect.width);
        });
        observer.observe(boardContainerRef.current);
        return () => observer.disconnect();
    }, []);

    const updateBoard = () => setFen(game.current.fen());

    const clearHighlight = (square: string) => {
        setSquares((prev) => {
            if (prev[square]) { const ns = { ...prev }; delete ns[square]; return ns; }
            return prev;
        });
    };

    const onPieceDrop = (source: string, target: string) => {
        if (setupMode) {
            const p = game.current.get(source as any);
            if (!p) return false;
            game.current.remove(source as any);
            game.current.put(p as any, target as any);
            updateBoard();
            clearHighlight(target);
            return true;
        }
        try {
            const move = game.current.move({ from: source as any, to: target as any, promotion: "q" });
            if (!move) return false;
            setFen(game.current.fen());
            clearHighlight(target);
            return true;
        } catch { return false; }
    };

    const onSquareClick = (square: string) => {
        if (setupMode && selectedTool) {
            if (selectedTool === "TRASH") game.current.remove(square as any);
            else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any);
            updateBoard();
            clearHighlight(square);
        }
    };

    const onSquareRightClick = (square: string) => {
        if (!setupMode) {
            setSquares((prev) => {
                const s = { ...prev };
                if (!s[square]) s[square] = { backgroundColor: "rgba(0, 255, 0, 0.4)" };
                else if (s[square].backgroundColor === "rgba(0, 255, 0, 0.4)") s[square] = { background: "radial-gradient(circle, gold 20%, transparent 30%)", backgroundColor: "rgba(0, 0, 0, 0)" };
                else delete s[square];
                return s;
            });
        }
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <MousePointer2 className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Analysis Board</h2>
                        <p className="text-xs text-gray-500">Free-play chessboard for analyzing positions and games</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="lg:col-span-8 flex justify-center">
                        <div ref={boardContainerRef} className="w-full max-w-[600px] aspect-square border-4 border-slate-700 rounded-xl shadow-2xl relative overflow-hidden">
                            <Chessboard
                                position={fen}
                                onPieceDrop={onPieceDrop}
                                onSquareClick={onSquareClick}
                                onSquareRightClick={onSquareRightClick}
                                customSquareStyles={squares}
                                boardOrientation={orientation}
                                arePiecesDraggable={true}
                                boardWidth={boardWidth}
                            />
                            {setupMode && <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse">SETUP MODE</div>}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                                <MousePointer2 className="text-yellow-500" size={18} /> Analysis Tools
                            </h3>
                            <div className="flex gap-2 mb-4">
                                <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}); }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                                    <RotateCcw size={16} /> Reset
                                </button>
                                <button onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                                    <ArrowUpDown size={16} /> Flip
                                </button>
                            </div>
                            <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null); }}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm ${setupMode ? "bg-red-600 text-white shadow-lg" : "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/20"}`}>
                                <Settings size={16} /> {setupMode ? "Exit Setup Mode" : "Edit Board Position"}
                            </button>
                        </div>

                        {setupMode && (
                            <div className="border-t pt-4">
                                <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard(); }} onReset={() => { game.current.reset(); updateBoard(); }} />
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tips</span>
                            <ul className="text-xs text-gray-500 space-y-1.5">
                                <li>• <b>Drag pieces</b> to make moves</li>
                                <li>• <b>Right-click</b> squares to highlight (green → gold → clear)</li>
                                <li>• Use <b>Setup Mode</b> to place custom pieces</li>
                                <li>• <b>Flip</b> board to see from other perspective</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </CRMShellLayout>
    );
}

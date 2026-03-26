"use client";

import React, { useEffect, useState, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
    Puzzle, Folder, FileText, ChevronRight, Plus, Trash2,
    ArrowLeft, RotateCcw, Play, Copy, Loader2, MoreVertical,
    FolderInput, X, Star, CheckSquare, Square, Pencil,
    HelpCircle,
} from "lucide-react";

type Tool = { type: string; color: "w" | "b" } | "TRASH" | null;

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50/50 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-5 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

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

// ====== PUZZLE CREATOR ======
function PuzzleCreator({ folderId, existingPuzzle, onBack }: { folderId: string; existingPuzzle?: any; onBack: () => void }) {
    const game = useRef(new Chess());
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [manualFen, setManualFen] = useState(fen);
    const [moves, setMoves] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [mode, setMode] = useState<"SETUP" | "RECORD">("SETUP");
    const [selectedTool, setSelectedTool] = useState<Tool>(null);
    const [startFen, setStartFen] = useState<string | null>(null);
    const [stars, setStars] = useState<string[]>([]);
    const [initialStars, setInitialStars] = useState<string[]>([]);
    const [isPgnModalOpen, setIsPgnModalOpen] = useState(false);
    const [pgnInput, setPgnInput] = useState("");
    const [boardWidth, setBoardWidth] = useState(500);
    const boardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!boardContainerRef.current) return;
        const observer = new ResizeObserver((entries) => { for (const e of entries) setBoardWidth(e.contentRect.width); });
        observer.observe(boardContainerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (existingPuzzle) {
            setTitle(existingPuzzle.title);
            setFen(existingPuzzle.fen);
            setStartFen(existingPuzzle.fen);
            setManualFen(existingPuzzle.fen);
            if (existingPuzzle.solution) setMoves(existingPuzzle.solution.split(" "));
            if (existingPuzzle.data?.stars) { setInitialStars(existingPuzzle.data.stars); setStars(existingPuzzle.data.stars); }
            try { game.current.load(existingPuzzle.fen); } catch { }
            setMode("RECORD");
        }
    }, [existingPuzzle]);

    const getTurnFromFen = (f: string) => { const p = f.split(" "); return p.length > 1 ? p[1] : "w"; };
    const updateBoard = () => { try { setFen(game.current.fen()); } catch { } };
    useEffect(() => { setManualFen(fen); }, [fen]);

    const handleManualFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualFen(e.target.value);
        try { game.current.load(e.target.value); setFen(game.current.fen()); } catch { setFen(e.target.value); }
    };

    const toggleTurn = (color: "w" | "b") => {
        if (mode !== "SETUP") return;
        const parts = fen.split(" ");
        if (parts.length >= 2) { parts[1] = color; const nf = parts.join(" "); setFen(nf); try { game.current.load(nf); } catch { } }
    };

    const handleImportPgn = () => {
        try {
            game.current.loadPgn(pgnInput);
            const history = game.current.history();
            if (history.length > 0) {
                while (game.current.undo() !== null) { }
                const initFen = game.current.fen();
                setStartFen(initFen); setFen(initFen); setMoves(history); setMode("RECORD");
                alert(`Imported! ${history.length} moves loaded.`);
            } else { setFen(game.current.fen()); }
            setIsPgnModalOpen(false); setPgnInput("");
        } catch { alert("Invalid PGN."); }
    };

    const toggleMode = () => {
        if (mode === "SETUP") {
            const boardOnly = fen.split(" ")[0];
            const hasKings = boardOnly.includes("K") && boardOnly.includes("k");
            if (stars.length === 0 && !hasKings) { if (!confirm("Board has missing kings. Continue as custom exercise?")) return; }
            setInitialStars([...stars]); setStartFen(fen); setMoves([]); setMode("RECORD"); setSelectedTool(null);
        } else { setMode("SETUP"); setStartFen(null); setStars([...initialStars]); }
    };

    const onSquareRightClick = (sq: string) => { if (mode === "SETUP") { setStars((s) => s.includes(sq) ? s.filter((x) => x !== sq) : [...s, sq]); } };
    const onSquareClick = (sq: string) => {
        if (mode !== "SETUP" || !selectedTool) return;
        if (stars.includes(sq)) setStars(stars.filter((s) => s !== sq));
        if (selectedTool === "TRASH") game.current.remove(sq as any);
        else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, sq as any);
        setFen(game.current.fen());
    };
    const onPieceDrop = (source: string, target: string) => {
        if (mode === "SETUP") {
            const p = game.current.get(source as any); if (!p) return false;
            game.current.remove(source as any); game.current.put(p, target as any); setFen(game.current.fen()); return true;
        }
        if (mode === "RECORD") {
            if (stars.includes(target)) {
                setStars(stars.filter((s) => s !== target));
                const p = game.current.get(source as any); game.current.remove(source as any); game.current.put(p as any, target as any);
                setMoves([...moves, `${source}-${target}`]); setFen(game.current.fen()); return true;
            }
            try {
                const move = game.current.move({ from: source as any, to: target as any, promotion: "q" });
                if (!move) return false; setMoves([...moves, move.san]); setFen(game.current.fen()); return true;
            } catch { return false; }
        }
        return false;
    };

    const customSquareStyles: Record<string, React.CSSProperties> = {};
    stars.forEach((sq) => {
        customSquareStyles[sq] = {
            backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iZ29sZCIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlnb24gcG9pbnRzPSIxMiAyIDE1LjA5IDguMjYgMjIgOS4yNyAxNyAxNC4xNCAxOC4xOCAyMS4wMiAxMiAxNyAxNyA1LjgyIDIxLjAyIDcgMTQuMTQgMiA5LjI3IDguOTEgOC4yNiAxMiAyIi8+PC9zdmc+")',
            backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "50%",
        };
    });

    const savePuzzle = async () => {
        if (!title || !startFen) return;
        const payload: any = { type: "PUZZLE", title, fen: startFen, solution: moves.join(" "), data: { stars: initialStars } };
        const method = existingPuzzle ? "PUT" : "POST";
        if (existingPuzzle) payload.id = existingPuzzle.id;
        else payload.parentId = folderId === "root" ? null : folderId;
        try {
            const res = await fetch("/api/content", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) { alert(existingPuzzle ? "Puzzle Updated!" : "Puzzle Saved!"); onBack(); }
            else alert("Failed to save puzzle");
        } catch (e) { console.error(e); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-2xl border border-gray-100 min-h-[600px]">
            <div className="lg:col-span-5 flex justify-center">
                <div ref={boardContainerRef} className={`w-full max-w-[500px] border-4 rounded-xl shadow-lg overflow-hidden transition-colors ${mode === "RECORD" ? "border-emerald-500" : "border-sky-500"}`}>
                    <Chessboard position={fen} onPieceDrop={onPieceDrop} onSquareClick={onSquareClick} onSquareRightClick={onSquareRightClick} customSquareStyles={customSquareStyles} boardWidth={boardWidth} />
                </div>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b pb-4 justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{existingPuzzle ? "Edit Puzzle" : "New Puzzle"}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className={`w-2 h-2 rounded-full ${mode === "SETUP" ? "bg-sky-500" : "bg-emerald-500"}`} />
                                Step {mode === "SETUP" ? "1: Setup Board" : "2: Play Solution"}
                            </div>
                        </div>
                    </div>
                    {mode === "SETUP" && (
                        <button onClick={() => setIsPgnModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors">
                            <FileText size={14} /> Import PGN
                        </button>
                    )}
                </div>

                {mode === "SETUP" && (
                    <div className="space-y-6">
                        <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard(); }} onReset={() => { game.current.reset(); updateBoard(); }} />
                        <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-lg border border-yellow-200 flex items-center gap-2">
                            <Star size={14} className="text-yellow-600 fill-yellow-600" /><span><b>Right-Click</b> on a square to add/remove a Star target.</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">Side to Move</span>
                            <div className="flex gap-2">
                                <button onClick={() => toggleTurn("w")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${getTurnFromFen(fen) === "w" ? "bg-white border-2 border-sky-500 text-sky-600 shadow-sm" : "bg-gray-200 text-gray-500"}`}>White</button>
                                <button onClick={() => toggleTurn("b")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${getTurnFromFen(fen) === "b" ? "bg-slate-800 border-2 border-slate-800 text-white shadow-sm" : "bg-gray-200 text-gray-500"}`}>Black</button>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Direct FEN Input</label>
                            <div className="flex gap-2">
                                <input type="text" className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-mono text-gray-600 focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" value={manualFen} onChange={handleManualFenChange} placeholder="Paste FEN..." />
                                <button onClick={() => { navigator.clipboard.writeText(manualFen); alert("FEN Copied!"); }} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-500"><Copy size={16} /></button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={toggleMode} className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2">
                                Next: Record Solution <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {mode === "RECORD" && (
                    <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                            <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><Play size={18} /> Recording Moves...</h3>
                            <p className="text-sm text-emerald-700 mb-3">{stars.length > 0 ? `Collect the stars! (${stars.length} remaining).` : "Play the solution on the board."}</p>
                            <div className="bg-white p-4 rounded-lg font-mono text-lg min-h-[60px] shadow-inner border border-emerald-100 break-words">
                                {moves.length > 0 ? moves.join(" ") : <span className="text-gray-300">Make a move...</span>}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { game.current.load(startFen!); setFen(startFen!); setMoves([]); setStars([...initialStars]); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 flex items-center gap-2"><RotateCcw size={16} /> Reset</button>
                        </div>
                        <div className="pt-6 border-t mt-6 space-y-4">
                            <input className="w-full text-lg border-2 border-gray-200 rounded-xl p-3 font-bold focus:border-sky-500 outline-none" placeholder="Puzzle Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            <div className="flex gap-4">
                                <button onClick={toggleMode} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Back to Setup</button>
                                <button onClick={savePuzzle} disabled={moves.length === 0} className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all">
                                    {existingPuzzle ? "Update Puzzle" : "Save Puzzle"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <Modal isOpen={isPgnModalOpen} onClose={() => setIsPgnModalOpen(false)} title="Import PGN">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Paste a PGN string below.</p>
                        <textarea className="w-full h-40 border border-gray-200 rounded-xl p-3 font-mono text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" value={pgnInput} onChange={(e) => setPgnInput(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsPgnModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                            <button onClick={handleImportPgn} className="px-6 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-bold">Import</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

// ====== MCQ CREATOR ======
function MCQCreator({ folderId, existingMCQ, onBack }: { folderId: string; existingMCQ?: any; onBack: () => void }) {
    const [fen, setFen] = useState(existingMCQ?.position || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [manualFen, setManualFen] = useState(fen);
    const [question, setQuestion] = useState(existingMCQ?.question || "");
    const [explanation, setExplanation] = useState(existingMCQ?.explanation || "");
    const [options, setOptions] = useState<string[]>(existingMCQ?.options || ["", "", "", ""]);
    const [correctOptions, setCorrectOptions] = useState<number[]>(existingMCQ?.correctOptions || []);
    const [selectedTool, setSelectedTool] = useState<Tool>(null);
    const game = useRef(new Chess());
    const [boardWidth, setBoardWidth] = useState(500);
    const boardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!boardContainerRef.current) return;
        const observer = new ResizeObserver((entries) => { for (const e of entries) setBoardWidth(e.contentRect.width); });
        observer.observe(boardContainerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        try { game.current.load(fen); } catch { }
    }, [fen]);

    const handleManualFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualFen(e.target.value);
        try { game.current.load(e.target.value); setFen(game.current.fen()); } catch { setFen(e.target.value); }
    };

    const onSquareClick = (sq: string) => {
        if (!selectedTool) return;
        if (selectedTool === "TRASH") game.current.remove(sq as any);
        else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, sq as any);
        setFen(game.current.fen()); setManualFen(game.current.fen());
    };

    const onPieceDrop = (source: string, target: string) => {
        const p = game.current.get(source as any); if (!p) return false;
        game.current.remove(source as any); game.current.put(p as any, target as any);
        setFen(game.current.fen()); setManualFen(game.current.fen()); return true;
    };

    const toggleCorrectOption = (idx: number) => {
        if (correctOptions.includes(idx)) setCorrectOptions(correctOptions.filter(i => i !== idx));
        else setCorrectOptions([...correctOptions, idx]);
    };

    const saveMCQ = async () => {
        if (!question || options.some(o => !o) || correctOptions.length === 0) {
            alert("Please fill question, all options, and select at least one correct answer.");
            return;
        }
        const payload: any = {
            position: fen,
            question,
            options,
            correctOptions,
            explanation,
            folderId: folderId === "root" ? null : folderId,
        };
        const method = existingMCQ ? "PUT" : "POST";
        const url = existingMCQ ? `/api/mcq/${existingMCQ.id}` : "/api/mcq";

        try {
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) { alert(existingMCQ ? "MCQ Updated!" : "MCQ Saved!"); onBack(); }
            else alert("Failed to save MCQ");
        } catch (e) { console.error(e); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-2xl border border-gray-100 min-h-[600px]">
            <div className="lg:col-span-5 flex flex-col gap-4">
                <div ref={boardContainerRef} className="w-full max-w-[500px] border-4 border-sky-500 rounded-xl shadow-lg overflow-hidden">
                    <Chessboard position={fen} onPieceDrop={onPieceDrop} onSquareClick={onSquareClick} boardWidth={boardWidth} />
                </div>
                <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); setFen(game.current.fen()); }} onReset={() => { game.current.reset(); setFen(game.current.fen()); }} />
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Direct FEN Input</label>
                    <input type="text" className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-mono text-gray-600 focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none" value={manualFen} onChange={handleManualFenChange} placeholder="Paste FEN..." />
                </div>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b pb-4">
                    <button onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <h2 className="text-xl font-bold text-gray-900">{existingMCQ ? "Edit MCQ" : "New MCQ"}</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Question</label>
                        <textarea className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-sky-500 outline-none min-h-[80px]" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter the chess question..." />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 block">Options (Check the box for correct answers)</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <button onClick={() => toggleCorrectOption(idx)} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${correctOptions.includes(idx) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-gray-300 hover:border-sky-300"}`}>
                                    {correctOptions.includes(idx) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                                <input className="flex-1 border-2 border-gray-100 rounded-xl p-3 focus:border-sky-500 outline-none" value={opt} onChange={(e) => { const no = [...options]; no[idx] = e.target.value; setOptions(no); }} placeholder={`Option ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Explanation (Optional)</label>
                        <textarea className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-sky-500 outline-none min-h-[80px]" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain the correct answer..." />
                    </div>
                    <button onClick={saveMCQ} className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-sky-500/20 hover:scale-[1.01] transition-all">
                        {existingMCQ ? "Update MCQ" : "Save MCQ"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PuzzlesPage() {
    const [currentStage, setCurrentStage] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
    const [content, setContent] = useState<{ folders: any[]; puzzles: any[]; mcqs: any[] }>({ folders: [], puzzles: [], mcqs: [] });
    const [view, setView] = useState<"BROWSE" | "CREATE_PUZZLE" | "CREATE_MCQ">("BROWSE");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [movingItem, setMovingItem] = useState<{ id: string; type: "FOLDER" | "PUZZLE" | "MCQ" } | null>(null);
    const [availableFolders, setAvailableFolders] = useState<any[]>([]);
    const [newFolderName, setNewFolderName] = useState("");
    const [editingPuzzle, setEditingPuzzle] = useState<any>(null);
    const [editingMCQ, setEditingMCQ] = useState<any>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!currentStage) return;
        const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
        const params = new URLSearchParams();
        if (parentId) params.append("parentId", parentId);
        else params.append("stage", currentStage);
        fetch(`/api/content?${params.toString()}`).then((r) => r.json()).then((data) => {
            if (data) { setContent({ folders: data.folders || [], puzzles: data.puzzles || [], mcqs: data.mcqs || [] }); setSelectedItems(new Set()); }
        }).catch(console.error);
    }, [currentStage, breadcrumbs, refreshTrigger]);

    const handleDelete = async (id: string, type: string) => {
        if (!confirm(`Delete this ${type.toLowerCase()}?`)) return;
        try {
            const res = await fetch("/api/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, type }) });
            if (res.ok) setRefreshTrigger((p) => p + 1);
        } catch (e) { console.error(e); }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedItems.size} items?`)) return;
        const promises = Array.from(selectedItems).map((id) => {
            const isFolder = content.folders.some((f) => f.id === id);
            const isMCQ = content.mcqs.some((m) => m.id === id);
            return fetch("/api/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, type: isFolder ? "FOLDER" : isMCQ ? "MCQ" : "PUZZLE" }) });
        });
        await Promise.all(promises);
        setRefreshTrigger((p) => p + 1);
        setSelectedItems(new Set());
    };

    const toggleSelection = (id: string) => {
        const ns = new Set(selectedItems);
        if (ns.has(id)) ns.delete(id); else ns.add(id);
        setSelectedItems(ns);
    };

    const prepareMove = async (item: any, type: "FOLDER" | "PUZZLE" | "MCQ") => {
        setMovingItem({ id: item.id, type });
        try {
            const res = await fetch("/api/content/folders");
            if (res.ok) { const folders = await res.json(); setAvailableFolders([{ id: "root", name: "Root Level" }, ...folders]); }
        } catch (e) { console.error(e); }
        setMoveModalOpen(true);
    };

    const handleMoveSubmit = async (targetFolderId: string) => {
        if (!movingItem) return;
        try {
            const res = await fetch("/api/content/move", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: movingItem.id, targetFolderId }) });
            if (res.ok) { setMoveModalOpen(false); setMovingItem(null); setRefreshTrigger((p) => p + 1); }
            else { const err = await res.json(); alert(err.error || "Move failed"); }
        } catch (e) { console.error(e); }
    };

    const createFolder = async () => {
        if (!newFolderName) return;
        const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
        try {
            const res = await fetch("/api/content", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "FOLDER", name: newFolderName, stage: !parentId ? currentStage : null, parentId }),
            });
            if (res.ok) { setNewFolderName(""); setRefreshTrigger((p) => p + 1); }
        } catch (e) { console.error(e); }
    };

    const ItemCard = ({ item, type }: { item: any; type: "FOLDER" | "PUZZLE" | "MCQ" }) => {
        const [showMenu, setShowMenu] = useState(false);
        const isSelected = selectedItems.has(item.id);
        return (
            <div className={`relative group h-36 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg
        ${isSelected ? "bg-sky-50 border-sky-500 ring-1 ring-sky-500" : type === "FOLDER" ? "bg-indigo-50 border-indigo-100 hover:border-indigo-300" : type === "MCQ" ? "bg-emerald-50 border-emerald-100 hover:border-emerald-300" : "bg-white border-gray-100 hover:border-sky-300"}`}
                onClick={() => { if (selectedItems.size > 0) toggleSelection(item.id); else if (type === "FOLDER") setBreadcrumbs([...breadcrumbs, item]); }}>
                <div className="absolute top-2 left-2 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}>
                    {isSelected ? <CheckSquare className="text-sky-600" /> : <Square className="text-gray-300 hover:text-gray-500" />}
                </div>
                <div className="absolute top-2 right-2">
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={16} /></button>
                    {showMenu && (
                        <div className="absolute right-0 top-6 bg-white shadow-xl border border-gray-100 rounded-xl w-32 z-20 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {type === "PUZZLE" && (<button onClick={() => { setEditingPuzzle(item); setView("CREATE_PUZZLE"); }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-gray-700"><Pencil size={12} /> Edit</button>)}
                            {type === "MCQ" && (<button onClick={() => { setEditingMCQ(item); setView("CREATE_MCQ"); }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-gray-700"><Pencil size={12} /> Edit</button>)}
                            <button onClick={() => prepareMove(item, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-gray-700"><FolderInput size={12} /> Move</button>
                            <button onClick={() => handleDelete(item.id, type)} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                        </div>
                    )}
                    {showMenu && <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />}
                </div>
                {type === "FOLDER" ? <Folder className="w-10 h-10 text-indigo-500 mb-2" /> : type === "MCQ" ? <HelpCircle className="w-8 h-8 text-emerald-500 mb-2" /> : <FileText className="w-8 h-8 text-sky-500 mb-2" />}
                <span className={`font-bold text-sm px-4 text-center truncate w-full ${type === "FOLDER" ? "text-indigo-900" : type === "MCQ" ? "text-emerald-900" : "text-gray-700"}`}>{type === "FOLDER" ? item.name : type === "MCQ" ? item.question : item.title}</span>
            </div>
        );
    };

    if (view === "CREATE_PUZZLE") {
        const parent = breadcrumbs[breadcrumbs.length - 1];
        return (
            <CRMShellLayout>
                <PuzzleCreator folderId={parent?.id || "root"} existingPuzzle={editingPuzzle} onBack={() => { setView("BROWSE"); setRefreshTrigger((p) => p + 1); setEditingPuzzle(null); }} />
            </CRMShellLayout>
        );
    }

    if (view === "CREATE_MCQ") {
        const parent = breadcrumbs[breadcrumbs.length - 1];
        return (
            <CRMShellLayout>
                <MCQCreator folderId={parent?.id || "root"} existingMCQ={editingMCQ} onBack={() => { setView("BROWSE"); setRefreshTrigger((p) => p + 1); setEditingMCQ(null); }} />
            </CRMShellLayout>
        );
    }

    if (!currentStage) {
        return (
            <CRMShellLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Puzzle className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Puzzles & Curriculum</h2>
                            <p className="text-xs text-gray-500">Select a difficulty level to browse or create puzzles</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].map((stage) => (
                            <button key={stage} onClick={() => setCurrentStage(stage)}
                                className="h-48 group relative overflow-hidden bg-white border-2 hover:border-sky-500 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4">
                                <div className="absolute inset-0 bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 p-4 bg-sky-100 rounded-full text-sky-600 group-hover:scale-110 transition-transform"><Folder size={32} /></div>
                                <span className="relative z-10 text-xl font-bold text-gray-700">{stage}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </CRMShellLayout>
        );
    }

    return (
        <CRMShellLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px] flex flex-col">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 max-w-full">
                        <button onClick={() => { setCurrentStage(null); setBreadcrumbs([]); }} className="font-bold text-gray-400 hover:text-black transition-colors">Levels</button>
                        <ChevronRight size={16} className="text-gray-300" />
                        <span className="font-bold text-sky-600 px-2 py-1 bg-sky-50 rounded-lg">{currentStage}</span>
                        {breadcrumbs.map((b, i) => (
                            <div key={b.id} className="flex items-center gap-2">
                                <ChevronRight size={16} className="text-gray-300" />
                                <button onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} className="hover:bg-gray-100 px-2 py-1 rounded-lg font-medium text-gray-700">{b.name}</button>
                            </div>
                        ))}
                    </div>
                    {selectedItems.size > 0 && (
                        <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors">
                            <Trash2 size={14} /> Delete Selected ({selectedItems.size})
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-auto">
                    <div className="h-36 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-4 gap-2">
                        <input className="w-full text-center border-b border-gray-200 focus:border-sky-500 outline-none pb-1 text-sm bg-transparent"
                            placeholder="New Folder Name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFolder()} />
                        <button onClick={createFolder} disabled={!newFolderName} className="bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs px-3 py-1 rounded-lg disabled:opacity-50 font-bold">Create</button>
                    </div>
                    {content.folders.map((f) => <ItemCard key={f.id} item={f} type="FOLDER" />)}
                    {content.puzzles.map((p) => <ItemCard key={p.id} item={p} type="PUZZLE" />)}
                    {content.mcqs.map((m) => <ItemCard key={m.id} item={m} type="MCQ" />)}
                </div>
                <div className="border-t pt-6 mt-6 flex justify-end gap-4">
                    <button onClick={() => { setEditingMCQ(null); setView("CREATE_MCQ"); }}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] font-bold transition-all">
                        <Plus size={20} /> New MCQ
                    </button>
                    <button onClick={() => { setEditingPuzzle(null); setView("CREATE_PUZZLE"); }}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] font-bold transition-all">
                        <Plus size={20} /> New Puzzle
                    </button>
                </div>
                <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Move to Folder">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-2">Select destination:</p>
                        <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y bg-gray-50">
                            {availableFolders.map((folder) => (
                                <button key={folder.id} onClick={() => handleMoveSubmit(folder.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-3 text-sm font-medium text-gray-700 transition-colors">
                                    <Folder size={16} className="text-indigo-400" />{folder.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
            </div>
        </CRMShellLayout>
    );
}

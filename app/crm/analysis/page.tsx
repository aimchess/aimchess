"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
  MousePointer2, RotateCcw, ArrowUpDown, Settings, Trash2,
  Cpu, ChevronLeft, ChevronRight, ZapOff, Zap, Copy
} from "lucide-react";

type Tool = { type: string; color: "w" | "b" } | "TRASH" | null;

interface EngineEval {
  depth: number;
  score: string; // e.g. "+0.34" or "M5"
  bestMove: string;
  pv: string[];
  loading: boolean;
}

// ── Stockfish Web Worker helper ─────────────────────────────────────
class StockfishEngine {
  private worker: Worker | null = null;
  private onMessage: ((line: string) => void) | null = null;

  start() {
    if (this.worker) return;
    // Use the Stockfish CDN WASM build via a blob worker
    const workerCode = `
      importScripts("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");
      var sf = STOCKFISH();
      sf.onmessage = function(line) { postMessage(line); };
      onmessage = function(e) { sf.postMessage(e.data); };
    `;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.onmessage = (e) => {
      if (this.onMessage) this.onMessage(e.data);
    };
    this.worker.postMessage("uci");
    this.worker.postMessage("isready");
  }

  stop() {
    this.worker?.postMessage("stop");
  }

  evaluate(fen: string, depth: number, onMessage: (line: string) => void) {
    if (!this.worker) return;
    this.onMessage = onMessage;
    this.worker.postMessage("stop");
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage(`go depth ${depth}`);
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
  }
}

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
  const engineRef = useRef<StockfishEngine | null>(null);
  const historyRef = useRef<string[]>(["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]);
  const historyIdxRef = useRef(0);

  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [squares, setSquares] = useState<Record<string, any>>({});
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [setupMode, setSetupMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [boardWidth, setBoardWidth] = useState(600);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [engineEnabled, setEngineEnabled] = useState(false);
  const [engineDepth, setEngineDepth] = useState(15);
  const [engineEval, setEngineEval] = useState<EngineEval>({ depth: 0, score: "0.00", bestMove: "", pv: [], loading: false });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [fenInput, setFenInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Resize observer
  useEffect(() => {
    if (!boardContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setBoardWidth(entry.contentRect.width);
    });
    observer.observe(boardContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize engine
  useEffect(() => {
    const engine = new StockfishEngine();
    engineRef.current = engine;
    return () => { engine.destroy(); };
  }, []);

  // Analyse whenever FEN changes and engine is enabled
  const runAnalysis = useCallback((currentFen: string) => {
    if (!engineEnabled || !engineRef.current) return;
    setEngineEval(prev => ({ ...prev, loading: true }));

    engineRef.current.evaluate(currentFen, engineDepth, (line: string) => {
      // Parse info lines
      if (line.startsWith("info") && line.includes("score")) {
        const depthMatch = line.match(/depth (\d+)/);
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const pvMatch = line.match(/ pv (.+)/);

        const depth = depthMatch ? parseInt(depthMatch[1]) : 0;
        let score = "0.00";

        if (mateMatch) {
          const m = parseInt(mateMatch[1]);
          score = m > 0 ? `M${m}` : `-M${Math.abs(m)}`;
        } else if (cpMatch) {
          const cp = parseInt(cpMatch[1]);
          const pawn = cp / 100;
          score = pawn >= 0 ? `+${pawn.toFixed(2)}` : pawn.toFixed(2);
        }

        const pv = pvMatch ? pvMatch[1].trim().split(" ").slice(0, 5) : [];

        setEngineEval(prev => ({ ...prev, depth, score, pv, loading: false }));
      }

      if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const best = parts[1] || "";
        setEngineEval(prev => ({ ...prev, bestMove: best, loading: false }));
      }
    });
  }, [engineEnabled, engineDepth]);

  useEffect(() => {
    if (engineEnabled) {
      runAnalysis(fen);
    } else {
      engineRef.current?.stop();
      setEngineEval({ depth: 0, score: "0.00", bestMove: "", pv: [], loading: false });
    }
  }, [fen, engineEnabled, runAnalysis]);

  const updateBoard = (newFen?: string) => {
    const f = newFen || game.current.fen();
    setFen(f);
    setFenInput(f);
    // Track history
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(f);
    historyIdxRef.current = historyRef.current.length - 1;
  };

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
      setMoveHistory(prev => [...prev, move.san]);
      updateBoard();
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

  const handleUndo = () => {
    game.current.undo();
    setMoveHistory(prev => prev.slice(0, -1));
    const f = game.current.fen();
    setFen(f);
    setFenInput(f);
    setSquares({});
  };

  const handleLoadFen = () => {
    try {
      const g = new Chess(fenInput);
      game.current = g;
      setFen(g.fen());
      setSquares({});
      setMoveHistory([]);
    } catch {
      alert("Invalid FEN string");
    }
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fen);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const scoreColor = () => {
    if (engineEval.score.startsWith("M")) return "text-emerald-500";
    if (engineEval.score.startsWith("-M")) return "text-red-500";
    const val = parseFloat(engineEval.score);
    if (val > 1) return "text-emerald-600";
    if (val < -1) return "text-red-500";
    return "text-gray-700";
  };

  return (
    <CRMShellLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <MousePointer2 className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Analysis Board</h2>
            <p className="text-xs text-gray-500">Stockfish-powered analysis · right-click squares to annotate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {/* Board */}
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

          {/* Right Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* Board Controls */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={() => { game.current.reset(); setFen(game.current.fen()); setMoveHistory([]); setSquares({}); setFenInput(""); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                  <RotateCcw size={16} /> Reset
                </button>
                <button onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                  <ArrowUpDown size={16} /> Flip
                </button>
                <button onClick={handleUndo}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                  <ChevronLeft size={16} /> Undo
                </button>
              </div>
              <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null); }}
                className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm ${setupMode ? "bg-red-600 text-white shadow-lg" : "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/20"}`}>
                <Settings size={16} /> {setupMode ? "Exit Setup Mode" : "Edit Board Position"}
              </button>
            </div>

            {/* Setup Palette */}
            {setupMode && (
              <div className="border-t pt-3">
                <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool}
                  onClear={() => { game.current.clear(); updateBoard(); }}
                  onReset={() => { game.current.reset(); updateBoard(); }} />
              </div>
            )}

            {/* FEN Input/Output */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FEN Position</span>
                <button onClick={handleCopyFen} className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 hover:text-indigo-700">
                  <Copy size={10} /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <textarea
                value={fenInput}
                onChange={e => setFenInput(e.target.value)}
                className="w-full text-[10px] font-mono p-2 bg-white border border-gray-200 rounded-lg outline-none resize-none"
                rows={2}
                placeholder="Paste FEN here..."
              />
              <button onClick={handleLoadFen} className="mt-1.5 w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">
                Load FEN
              </button>
            </div>

            {/* Stockfish Engine Panel */}
            <div className={`rounded-xl border p-4 transition-all ${engineEnabled ? "border-emerald-200 bg-emerald-50/40" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className={engineEnabled ? "text-emerald-600" : "text-gray-400"} />
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Stockfish Engine</span>
                </div>
                <button
                  onClick={() => setEngineEnabled(e => !e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${engineEnabled ? "bg-emerald-600 text-white shadow-md" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                >
                  {engineEnabled ? <Zap size={12} /> : <ZapOff size={12} />}
                  {engineEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {engineEnabled && (
                <>
                  {/* Depth slider */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                      <span>Search Depth</span><span>{engineDepth}</span>
                    </div>
                    <input type="range" min={5} max={20} value={engineDepth}
                      onChange={e => setEngineDepth(parseInt(e.target.value))}
                      className="w-full accent-emerald-600" />
                  </div>

                  {/* Eval bar */}
                  <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className={`text-2xl font-black ${scoreColor()}`}>
                        {engineEval.loading ? "..." : engineEval.score}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">Depth {engineEval.depth}</span>
                    </div>
                    {/* Visual eval bar */}
                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden">
                      {(() => {
                        let whitePct = 50;
                        if (!engineEval.score.includes("M")) {
                          const val = parseFloat(engineEval.score);
                          whitePct = Math.min(95, Math.max(5, 50 + val * 8));
                        } else if (engineEval.score.startsWith("M")) {
                          whitePct = 95;
                        } else {
                          whitePct = 5;
                        }
                        return <div className="h-full bg-white transition-all duration-500 rounded-full" style={{ width: `${whitePct}%` }} />;
                      })()}
                    </div>
                    <div className="flex justify-between text-[9px] font-bold mt-0.5 text-gray-500">
                      <span>White</span><span>Black</span>
                    </div>
                  </div>

                  {/* Best move */}
                  {engineEval.bestMove && (
                    <div className="bg-white rounded-xl border border-gray-100 p-3 mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Best Move</span>
                      <span className="font-black text-indigo-700 text-base">{engineEval.bestMove}</span>
                    </div>
                  )}

                  {/* PV line */}
                  {engineEval.pv.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Principal Variation</span>
                      <div className="flex flex-wrap gap-1">
                        {engineEval.pv.map((move, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                            {move}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!engineEnabled && (
                <p className="text-xs text-gray-400 text-center py-2">Toggle ON to start Stockfish analysis</p>
              )}
            </div>

            {/* Move History */}
            {moveHistory.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-36 overflow-y-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Move History</span>
                <div className="flex flex-wrap gap-1">
                  {moveHistory.map((move, i) => (
                    <span key={i} className="text-xs font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700">
                      {Math.floor(i / 2) + 1}{i % 2 === 0 ? "." : "..."}{move}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRMShellLayout>
  );
}

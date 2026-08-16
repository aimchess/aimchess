"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import CRMShellLayout from "@/components/crm/crm-shell";
import { useSession } from "next-auth/react";
import { BoardSetupPalette } from "./BoardSetupPalette";
import {
    Puzzle, Folder, FileText, ChevronRight, Plus, Trash2,
    ArrowLeft, RotateCcw, Play, Copy, Loader2, MoreVertical,
    FolderInput, X, Star, CheckSquare, Square, Pencil,
    HelpCircle, Filter, Layers,
} from "lucide-react";

type Tool = { type: string; color: "w" | "b" } | "TRASH" | null;

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[150] backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-800 shrink-0">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto text-slate-300 text-sm">{children}</div>
            </div>
        </div>
    );
};

// ====== PUZZLE CREATOR ======
type PuzzleSubtype = "STANDARD" | "PLACEMENT" | "SEQUENCE" | "TARGETS";

interface SequenceStep {
  square: string;
  type: "plus" | "minus";
}

interface TargetStep {
  square: string;
  num: number;
}

interface PuzzleCreatorProps {
  folderId?: string;
  existingPuzzle?: any;
  onBack: () => void;
  batches: Array<{ id: string; name: string }>;
}

const cleanPgnText = (pgnText: string): string => {
  let result = "";
  let curlyDepth = 0;
  let parenDepth = 0;
  
  for (let i = 0; i < pgnText.length; i++) {
    const char = pgnText[i];
    if (char === '{') {
      curlyDepth++;
    } else if (char === '}') {
      if (curlyDepth > 0) curlyDepth--;
    } else if (char === '(') {
      parenDepth++;
    } else if (char === ')') {
      if (parenDepth > 0) parenDepth--;
    } else {
      if (curlyDepth === 0 && parenDepth === 0) {
        result += char;
      }
    }
  }
  
  return result
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\$\d+/g, "")
    .replace(/\d+\.+\s*/g, "")
    .trim();
};

function PuzzleCreator({ folderId = "root", existingPuzzle, onBack, batches }: PuzzleCreatorProps) {
  const game = useRef(new Chess());
  const [description, setDescription] = useState("");
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [manualFen, setManualFen] = useState(fen);
  const [moves, setMoves] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"SETUP" | "RECORD">("SETUP");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [stars, setStars] = useState<string[]>([]);
  const [initialStars, setInitialStars] = useState<string[]>([]);
  const [puzzleSubtype, setPuzzleSubtype] = useState<PuzzleSubtype>("STANDARD");
  const [sequence, setSequence] = useState<SequenceStep[]>([]);
  const [targets, setTargets] = useState<TargetStep[]>([]);
  const [capturedSetupFen, setCapturedSetupFen] = useState<string | null>(null);

  // Additional Fields matching standard Puzzle Schema (stored inside JSON data)
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [assignedBatch, setAssignedBatch] = useState("All Batches");
  const [solutionHint, setSolutionHint] = useState("");

  // PGN Import State & Logic
  const [importPgnText, setImportPgnText] = useState("");

  const handleImportPgn = async () => {
    if (!importPgnText.trim()) {
      alert("Please enter some PGN notation first.");
      return;
    }
    try {
      const pgnBlock = importPgnText.trim();
      const pgnGames = pgnBlock.split(/(?=\[Event\s+)/gi).filter(Boolean);
      
      if (pgnGames.length > 1) {
        if (!confirm(`Detected ${pgnGames.length} puzzles. Do you want to batch import all of them directly?`)) {
          return;
        }

        const puzzlesToSave = [];
        for (let i = 0; i < pgnGames.length; i++) {
          const gameText = pgnGames[i].trim();
          const tempGame = new Chess();

          const fenRegex = /\[FEN\s+"([^"]+)"\]/i;
          const fenMatch = gameText.match(fenRegex);
          const startingFen = fenMatch && fenMatch[1] 
            ? fenMatch[1] 
            : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

          try {
            tempGame.load(startingFen);
          } catch (e) {
            console.warn(`Skip puzzle ${i+1}: Invalid FEN layout`);
            continue;
          }

          const movesText = cleanPgnText(gameText);

          const rawMoves = movesText
            .split(/\s+/)
            .filter((m) => m && !["1-0", "0-1", "1/2-1/2", "*"].includes(m));

          const loadedMoves: string[] = [];
          let isGameValid = true;
          for (const move of rawMoves) {
            try {
              const cleanMove = move.replace(/[!?]/g, "");
              const result = tempGame.move(cleanMove);
              if (result) {
                loadedMoves.push(result.san);
              } else {
                isGameValid = false;
                break;
              }
            } catch (err) {
              isGameValid = false;
              break;
            }
          }

          if (!isGameValid) {
            console.warn(`Skip puzzle ${i+1}: Invalid moves`);
            continue;
          }

          let gameTitle = `Tactical Puzzle #${i + 1}`;
          const eventRegex = /\[Event\s+"([^"]+)"\]/i;
          const eventMatch = gameText.match(eventRegex);
          if (eventMatch && eventMatch[1] && eventMatch[1] !== "?") {
            gameTitle = eventMatch[1];
          } else {
            const whiteRegex = /\[White\s+"([^"]+)"\]/i;
            const whiteMatch = gameText.match(whiteRegex);
            if (whiteMatch && whiteMatch[1] && whiteMatch[1] !== "?") {
              gameTitle = whiteMatch[1];
            }
          }

          puzzlesToSave.push({
            type: "PUZZLE",
            title: gameTitle,
            fen: startingFen,
            solution: loadedMoves.join(" "),
            folderId: folderId && folderId !== "root" ? folderId : null,
            data: {
              subtype: puzzleSubtype,
              description: description || `Imported Tactical Puzzle (${level})`,
              level,
              assignedBatch,
              solutionHint,
              targetFen: null,
              stars: [],
              sequence: [],
              targets: []
            }
          });
        }

        if (puzzlesToSave.length === 0) {
          alert("No valid puzzles could be parsed.");
          return;
        }

        const promises = puzzlesToSave.map(payload => 
          fetch("/api/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        );
        
        const results = await Promise.all(promises);
        const successes = results.filter(r => r.ok).length;

        alert(`Successfully batch imported ${successes} of ${puzzlesToSave.length} puzzles!`);
        onBack();
        return;
      }

      // Single puzzle flow
      const tempGame = new Chess();
      const singleGameText = pgnGames[0].trim();
      const fenRegex = /\[FEN\s+"([^"]+)"\]/i;
      const fenMatch = singleGameText.match(fenRegex);
      const startingFen = fenMatch && fenMatch[1] 
        ? fenMatch[1] 
        : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      tempGame.load(startingFen);

      const movesText = cleanPgnText(singleGameText);

      const rawMoves = movesText
        .split(/\s+/)
        .filter((m) => m && !["1-0", "0-1", "1/2-1/2", "*"].includes(m));

      const loadedMoves: string[] = [];
      for (const move of rawMoves) {
        try {
          const cleanMove = move.replace(/[!?]/g, "");
          const result = tempGame.move(cleanMove);
          if (result) {
            loadedMoves.push(result.san);
          } else {
            throw new Error(`Illegal move: ${move}`);
          }
        } catch (moveErr: any) {
          alert(`Move validation failed at "${move}": ${moveErr.message}`);
          return;
        }
      }

      const eventRegex = /\[Event\s+"([^"]+)"\]/i;
      const eventMatch = singleGameText.match(eventRegex);
      if (eventMatch && eventMatch[1] && eventMatch[1] !== "?") {
        setTitle(eventMatch[1]);
      } else {
        const whiteRegex = /\[White\s+"([^"]+)"\]/i;
        const whiteMatch = singleGameText.match(whiteRegex);
        if (whiteMatch && whiteMatch[1] && whiteMatch[1] !== "?") {
          setTitle(whiteMatch[1]);
        }
      }

      safeLoadFen(startingFen);
      setCapturedSetupFen(startingFen);
      setMoves(loadedMoves);
      setMode("RECORD");
    } catch (e: any) {
      alert("Error parsing PGN: " + e.message);
    }
  };

  const safeLoadFen = (newFen: string) => {
    try {
      game.current.load(newFen);
      setFen(newFen);
      setManualFen(newFen);
      return true;
    } catch (e) {
      console.error("Invalid FEN:", newFen, e);
      return false;
    }
  };

  const boardStyles = useMemo(() => {
    const s: any = {};
    stars.forEach((sq) => {
      s[sq] = {
        backgroundImage:
          'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZDcwMCIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjIiPjxwb2x5Z29uIHBvaW50cz0iMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcgMTcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMiIvPjwvc3ZnPg==")',
        backgroundPosition: "center",
        backgroundSize: "50%",
        backgroundRepeat: "no-repeat",
      };
    });
    sequence.forEach((item) => {
      const icon =
        item.type === "plus"
          ? "PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgNVYxOU01IDEyaDE0IiBzdHJva2U9IiMyMmM1NWUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
          : "PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSAxMmgxNCIgc3Ryb2tlPSIjZWY0NDQ0IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==";
      s[item.square] = {
        backgroundImage: `url("data:image/svg+xml;base64,${icon}")`,
        backgroundPosition: "center",
        backgroundSize: "45%",
        backgroundRepeat: "no-repeat",
        backgroundColor: moves.includes(item.square) ? "rgba(34, 197, 94, 0.25)" : "transparent",
      };
    });
    targets.forEach((item) => {
      const isReached = moves.includes(item.square);
      const color = isReached ? "#22c55e" : "#3b82f6";
      const svg = btoa(
        `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="38" fill="${color}" stroke="white" stroke-width="8"/><text x="50" y="68" font-family="Arial, sans-serif" font-size="52" fill="white" text-anchor="middle" font-weight="bold">${item.num}</text></svg>`
      );
      s[item.square] = {
        backgroundImage: `url("data:image/svg+xml;base64,${svg}")`,
        backgroundPosition: "center",
        backgroundSize: "75%",
        backgroundRepeat: "no-repeat",
      };
    });
    if (selectedSquare) {
      s[selectedSquare] = {
        ...s[selectedSquare],
        backgroundColor: "rgba(251, 191, 36, 0.5)",
      };
    }
    return s;
  }, [stars, sequence, targets, moves, selectedSquare]);

  useEffect(() => {
    if (existingPuzzle) {
      setTitle(existingPuzzle.title || "");
      const data = existingPuzzle.data || {};
      setDescription(data.description || "");
      setLevel(data.level || "BEGINNER");
      setAssignedBatch(data.assignedBatch || "All Batches");
      setSolutionHint(data.solutionHint || "");
      setPuzzleSubtype(data.subtype || "STANDARD");
      
      let loadedFen = existingPuzzle.fen;
      let cleanMoves: string[] = [];

      if (existingPuzzle.solution) {
        cleanMoves = existingPuzzle.solution.split(" ");
      }

      if (!loadedFen) {
        loadedFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      }

      safeLoadFen(loadedFen);
      
      if (data.stars) {
        setInitialStars(data.stars);
        setStars(data.stars);
      }
      if (data.sequence) setSequence(data.sequence);
      if (data.targets) setTargets(data.targets);
      
      if (cleanMoves.length > 0) {
        setMoves(cleanMoves);
      }

      setCapturedSetupFen(data.targetFen || loadedFen);
      setMode("RECORD");
    }
  }, [existingPuzzle]);

  const updateBoard = () => {
    setFen(game.current.fen());
  };

  const toggleTurn = (color: "w" | "b") => {
    if (mode !== "SETUP") return;
    const parts = fen.split(" ");
    if (parts.length >= 2) {
      parts[1] = color;
      safeLoadFen(parts.join(" "));
    }
  };

  const toggleMode = () => {
    setSelectedSquare(null);
    if (mode === "SETUP") {
      setCapturedSetupFen(fen);
      setInitialStars([...stars]);
      setMoves([]);
      setMode("RECORD");
      setSelectedTool(null);
    } else {
      if (capturedSetupFen) safeLoadFen(capturedSetupFen);
      setMode("SETUP");
    }
  };

  const onSquareClick = (square: string) => {
    const s = square.toLowerCase();
    if (mode === "SETUP" || (mode === "RECORD" && puzzleSubtype === "PLACEMENT")) {
      if (!selectedTool) return;
      setStars((prev) => prev.filter((item) => item !== s));
      setSequence((prev) => prev.filter((item) => item.square !== s));
      setTargets((prev) => prev.filter((item) => item.square !== s));
      if (selectedTool === "TRASH") {
        game.current.remove(s as any);
      } else if (selectedTool === "PLUS") {
        setSequence((prev) => [...prev, { square: s, type: "plus" }]);
      } else if (selectedTool === "MINUS") {
        setSequence((prev) => [...prev, { square: s, type: "minus" }]);
      } else if (selectedTool === "TARGET") {
        setTargets((prev) => [...prev, { square: s, num: prev.length + 1 }]);
      } else if (typeof selectedTool === "object" && selectedTool !== null) {
        game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, s as any);
      }
      updateBoard();
      return;
    }
    if (mode === "RECORD" && puzzleSubtype === "SEQUENCE") {
      const marker = sequence.find((item) => item.square === s);
      if (marker) setMoves((prev) => (prev.includes(s) ? prev.filter((m) => m !== s) : [...prev, s]));
      return;
    }

    if (selectedSquare) {
      const src = selectedSquare.toLowerCase();
      const tgt = s;

      if (src === tgt) {
        setSelectedSquare(null);
        return;
      }

      const targetPiece = game.current.get(tgt as any);
      if (targetPiece && targetPiece.color === game.current.turn()) {
        setSelectedSquare(square);
        return;
      }

      const p = game.current.get(src as any);
      const pieceStr = p ? `${p.color}${p.type.toUpperCase()}` : "";

      onPieceDrop(selectedSquare, square, pieceStr);
      setSelectedSquare(null);
    } else {
      const p = game.current.get(s as any);
      if (p && p.color === game.current.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const onPieceDrop = (source: string, target: string, piece: string): boolean => {
    const src = source.toLowerCase();
    const tgt = target.toLowerCase();
    if (mode === "RECORD" && puzzleSubtype === "SEQUENCE") return false;
    if (mode === "SETUP" || (mode === "RECORD" && puzzleSubtype === "PLACEMENT")) {
      const p = game.current.get(src as any);
      if (!p) return false;
      game.current.remove(src as any);
      game.current.put(p, tgt as any);
      updateBoard();
      return true;
    }
    if (mode === "RECORD" && puzzleSubtype === "TARGETS") {
      const nextTarget = targets[moves.length];
      if (nextTarget && tgt === nextTarget.square) {
        const p = game.current.get(src as any);
        if (p) {
          game.current.remove(src as any);
          game.current.put(p, tgt as any);
          setMoves((prev) => [...prev, tgt]);
          updateBoard();
          return true;
        }
      }
      return false;
    }
    if (mode === "RECORD" && stars.includes(tgt)) {
      setStars((prev) => prev.filter((s) => s !== tgt));
      const p = game.current.get(src as any);
      if (p) {
        game.current.remove(src as any);
        game.current.put(p, tgt as any);
        setMoves((prev) => [...prev, `${src}-${tgt}`]);
        updateBoard();
        return true;
      }
    }
    if (mode === "RECORD" && puzzleSubtype === "STANDARD") {
      try {
        const isPromotion = game.current.get(src as any)?.type === "p" && (tgt.endsWith("8") || tgt.endsWith("1"));
        const promotionPiece = isPromotion ? (["q", "r", "b", "n"].includes(piece[1]?.toLowerCase()) ? piece[1].toLowerCase() : "q") : undefined;
        const move = game.current.move({ from: src, to: tgt, promotion: promotionPiece });
        if (move) {
          setMoves((prev) => [...prev, move.san]);
          updateBoard();
          return true;
        }
      } catch (e) {}
    }
    return false;
  };

  const getTurnFromFen = (fenString: string): "w" | "b" => {
    try {
      return (fenString.trim().split(/\s+/)[1] || "w") as "w" | "b";
    } catch {
      return "w";
    }
  };

  const savePuzzle = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    let payload: any = {
      type: "PUZZLE",
      title: title.trim(),
      fen: puzzleSubtype === "PLACEMENT" ? fen : (capturedSetupFen || fen),
      solution: puzzleSubtype === "PLACEMENT" ? "PLACEMENT_TASK" : moves.join(" "),
      folderId: folderId && folderId !== "root" ? folderId : null,
      data: {
        subtype: puzzleSubtype,
        description: description.trim(),
        level,
        assignedBatch,
        solutionHint,
        targetFen: puzzleSubtype === "PLACEMENT" ? capturedSetupFen : null,
        stars: puzzleSubtype === "PLACEMENT" ? [] : initialStars,
        sequence: puzzleSubtype === "PLACEMENT" ? [] : sequence,
        targets: puzzleSubtype === "PLACEMENT" ? [] : targets
      }
    };
    if (existingPuzzle) {
      payload.id = existingPuzzle.id;
    }

    try {
      const res = await fetch("/api/content", {
        method: existingPuzzle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Task Saved Successfully!");
        onBack();
      } else {
        alert("Failed to save task");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving task");
    }
  };

  const deletePuzzle = async () => {
    if (!existingPuzzle?.id) return;
    if (!confirm("Are you sure you want to permanently delete this puzzle?")) return;
    try {
      const res = await fetch("/api/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existingPuzzle.id, type: "PUZZLE" })
      });
      if (res.ok) {
        alert("Puzzle deleted successfully!");
        onBack();
      } else {
        alert("Failed to delete puzzle");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting puzzle");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl h-full min-h-[600px] text-white">
      <div className="lg:col-span-5 flex flex-col items-center">
        <div
          className={`w-full max-w-[450px] border-4 rounded-3xl shadow-2xl overflow-hidden transition-colors ${
            mode === "RECORD" ? "border-emerald-500/80" : "border-blue-500/80"
          }`}
        >
          <Chessboard
            position={fen}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            onSquareRightClick={(s) => {
              if (mode === "SETUP") {
                const sq = s.toLowerCase();
                setStars((prev) => (prev.includes(sq) ? prev.filter((x) => x !== sq) : [...prev, sq]));
              }
            }}
            customSquareStyles={boardStyles}
            customDarkSquareStyle={{ backgroundColor: "#769656" }}
            customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
          />
        </div>
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-mono w-full break-all text-slate-400 uppercase select-all">
          FEN: {fen}
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-2.5 rounded-full transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-white">{existingPuzzle ? "Edit Task" : "New Task"}</h2>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                {mode === "SETUP" ? "Step 1: Setup Layout" : "Step 2: Define Solution"}
              </p>
            </div>
          </div>
          {mode === "SETUP" && (
            <select
              className="bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500"
              value={puzzleSubtype}
              onChange={(e) => setPuzzleSubtype(e.target.value as PuzzleSubtype)}
            >
              <option value="STANDARD">Standard Tactics</option>
              <option value="PLACEMENT">Piece Placement</option>
              <option value="SEQUENCE">Sequence (Signs)</option>
              <option value="TARGETS">Target Squares</option>
            </select>
          )}
          {existingPuzzle && (
            <button
              onClick={deletePuzzle}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-bold text-xs bg-rose-950/30 border border-rose-900/30 px-3 py-1.5 rounded-xl transition-all"
            >
              <Trash2 size={15} /> Delete Puzzle
            </button>
          )}
        </div>

        <div className="space-y-6">
          {(mode === "SETUP" || puzzleSubtype === "PLACEMENT") && (
            <BoardSetupPalette
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              onClear={() => {
                game.current.clear();
                updateBoard();
              }}
              onReset={() => {
                game.current.reset();
                updateBoard();
              }}
              onClearArrows={() => {}}
              showSpecialTools={puzzleSubtype === "SEQUENCE" || puzzleSubtype === "TARGETS"}
            />
          )}

          {mode === "SETUP" ? (
            <div className="space-y-6">
              {/* PGN Import Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Import PGN Notation</span>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Paste your PGN moves here (e.g. 1. e4 e5 2. Nf3 Nc6...)"
                  value={importPgnText}
                  onChange={(e) => setImportPgnText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleImportPgn}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Load & Parse PGN
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Side to Move</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTurn("w")}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                        getTurnFromFen(fen) === "w"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      White
                    </button>
                    <button
                      onClick={() => toggleTurn("b")}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                        getTurnFromFen(fen) === "b"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      Black
                    </button>
                  </div>
                </div>
                <div className="bg-blue-950/20 p-3.5 rounded-xl border border-blue-900/30 text-[10px] text-blue-300 flex items-center gap-3">
                  <Star size={16} className="shrink-0 text-blue-400" />
                  <span>
                    <b>Right-click</b> squares for Stars. Use <b>Target Tool</b> for numbered targets.
                  </span>
                </div>
              </div>
              <button
                onClick={toggleMode}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:brightness-110 transition-all"
              >
                Next: {puzzleSubtype === "PLACEMENT" ? "Define Starting Position" : "Record Solution"}{" "}
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
              <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-900/30">
                <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2 mb-2">
                  <Play size={18} className="text-emerald-400" />{" "}
                  {puzzleSubtype === "PLACEMENT" ? "Student Starting Position" : "Solution Recording"}
                </h3>
                <p className="text-[11px] text-slate-400 italic">
                  {puzzleSubtype === "PLACEMENT"
                    ? "Edit this board to show the starting position the student will see."
                    : puzzleSubtype === "TARGETS"
                    ? `Place pieces on targets in order. Remaining: ${targets.length - moves.length}`
                    : "Make the moves on the chessboard in the correct order to record them."}
                </p>
                {puzzleSubtype !== "PLACEMENT" && (
                  <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs min-h-[40px] shadow-inner uppercase tracking-wider text-emerald-400 break-all">
                    {moves.join(" ") || "No moves recorded yet..."}
                  </div>
                )}
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Puzzle Title *</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500"
                    placeholder="Puzzle Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tactical Instructions / Description</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                    rows={3}
                    placeholder="Tactical instructions or description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Difficulty Tier</label>
                    <select
                      value={level}
                      onChange={(e: any) => setLevel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="BEGINNER">BEGINNER</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                      <option value="ADVANCED">ADVANCED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Grant Access to Batch</label>
                    <select
                      value={assignedBatch}
                      onChange={(e) => setAssignedBatch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="All Batches">All Batches (Public)</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Solution Hint (Optional)</label>
                  <input
                    type="text"
                    placeholder="Look for tactical deflection on f7..."
                    value={solutionHint}
                    onChange={(e) => setSolutionHint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={toggleMode}
                    className="px-6 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={savePuzzle}
                    disabled={!title.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-extrabold shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    Save Final Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
    const { data: session, status } = useSession();
    const role = (session?.user as any)?.role;

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
    const [batches, setBatches] = useState<any[]>([]);

    // Filters state
    const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");
    const [batchFilter, setBatchFilter] = useState<string>("ALL");

    useEffect(() => {
        fetch("/api/classes")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setBatches(data);
            })
            .catch(console.error);
    }, []);

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

    const filteredPuzzles = useMemo(() => {
        return content.puzzles.filter((p) => {
            const level = p.data?.level || "BEGINNER";
            const matchTier = difficultyFilter === "ALL" ? true : level === difficultyFilter;
            
            const pBatch = p.data?.assignedBatch || "All Batches";
            const matchBatch = batchFilter === "ALL" ? true : pBatch.toLowerCase() === batchFilter.toLowerCase();
            
            return matchTier && matchBatch;
        });
    }, [content.puzzles, difficultyFilter, batchFilter]);

    const filteredMCQs = useMemo(() => {
        return content.mcqs;
    }, [content.mcqs]);

    const ItemCard = ({ item, type }: { item: any; type: "FOLDER" | "PUZZLE" | "MCQ" }) => {
        const [showMenu, setShowMenu] = useState(false);
        const isSelected = selectedItems.has(item.id);
        
        const level = item.data?.level || "BEGINNER";
        const batch = item.data?.assignedBatch || "All Batches";
        const subtype = item.data?.subtype || "STANDARD";
        
        return (
            <div 
                className={`relative group rounded-3xl border-2 p-5 flex flex-col justify-between cursor-pointer transition-all duration-350 hover:-translate-y-1 hover:shadow-xl min-h-[160px]
                    ${isSelected 
                        ? "bg-slate-900 border-blue-500 shadow-blue-500/5 text-white" 
                        : type === "FOLDER" 
                            ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-white" 
                            : type === "MCQ"
                                ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 text-white"
                                : "bg-slate-900/60 border-slate-800 hover:border-blue-500/40 text-white"
                    }`}
                onClick={() => { 
                    if (selectedItems.size > 0) toggleSelection(item.id); 
                    else if (type === "FOLDER") setBreadcrumbs([...breadcrumbs, item]); 
                }}
            >
                {/* Checkbox selector */}
                <div className="absolute top-4 left-4 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}>
                    {isSelected ? (
                        <div className="w-5 h-5 rounded-md bg-blue-600 border border-blue-500 flex items-center justify-center text-white">
                            <CheckSquare size={14} className="stroke-[3]" />
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-md border border-slate-800 bg-slate-950 hover:border-slate-650 transition-colors" />
                    )}
                </div>

                {/* Top Actions Row */}
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
                        className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                        <div 
                            className="absolute right-0 top-8 bg-slate-950 border border-slate-800 rounded-2xl w-36 z-20 py-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            {type === "PUZZLE" && (
                                <button 
                                    onClick={() => { setEditingPuzzle(item); setView("CREATE_PUZZLE"); }} 
                                    className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                                >
                                    <Pencil size={12} className="text-blue-400" /> Edit Task
                                </button>
                            )}
                            {type === "MCQ" && (
                                <button 
                                    onClick={() => { setEditingMCQ(item); setView("CREATE_MCQ"); }} 
                                    className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                                >
                                    <Pencil size={12} className="text-emerald-400" /> Edit MCQ
                                </button>
                            )}
                            <button 
                                onClick={() => prepareMove(item, type)} 
                                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                            >
                                <FolderInput size={12} className="text-amber-400" /> Move Asset
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id, type)} 
                                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-rose-950/30 text-rose-455 flex items-center gap-2"
                            >
                                <Trash2 size={12} className="text-rose-400" /> Delete
                            </button>
                        </div>
                    )}
                    {showMenu && <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />}
                </div>

                {/* Content Section */}
                <div className="pt-4 flex flex-col items-start w-full">
                    {type === "FOLDER" ? (
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-3">
                            <Folder className="w-5 h-5 text-indigo-400" />
                        </div>
                    ) : type === "MCQ" ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-3">
                            <HelpCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-3">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                    )}

                    <h4 className="font-extrabold text-white text-sm tracking-wide leading-snug break-words w-full pr-6 line-clamp-2">
                        {type === "FOLDER" ? item.name : type === "MCQ" ? item.question : item.title}
                    </h4>
                </div>

                {/* Bottom Metadata Section */}
                <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between w-full">
                    {type === "FOLDER" ? (
                        <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] text-indigo-400 font-extrabold bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-500/20">
                                Folder
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                                {item._count?.puzzles || 0} Puzzles {item._count?.mcqs > 0 ? `, ${item._count.mcqs} MCQs` : ""}
                            </span>
                        </div>
                    ) : type === "MCQ" ? (
                        <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/20">
                            Multiple Choice
                        </span>
                    ) : (
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${
                            level === "BEGINNER"
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20"
                                : level === "INTERMEDIATE"
                                ? "bg-amber-950/60 text-amber-400 border-amber-500/20"
                                : "bg-purple-950/60 text-purple-400 border-purple-500/20"
                        }`}>
                            {level}
                        </span>
                    )}

                    {type === "PUZZLE" && (
                        <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider">
                            {subtype.replace("_", " ")}
                        </span>
                    )}

                    {type === "MCQ" && (
                        <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider">
                            {item.options?.length || 4} Choices
                        </span>
                    )}
                </div>
            </div>
        );
    };

    if (view === "CREATE_PUZZLE") {
        const parent = breadcrumbs[breadcrumbs.length - 1];
        return (
            <CRMShellLayout>
                <PuzzleCreator 
                    folderId={parent?.id || "root"} 
                    existingPuzzle={editingPuzzle} 
                    batches={batches}
                    onBack={() => { setView("BROWSE"); setRefreshTrigger((p) => p + 1); setEditingPuzzle(null); }} 
                />
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

    if (status === "loading") {
        return (
            <CRMShellLayout>
                <div className="flex justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                </div>
            </CRMShellLayout>
        );
    }

    if (role === "STUDENT") {
        return (
            <CRMShellLayout>
                <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
                    <span className="text-5xl mb-4">🚫</span>
                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-slate-450 max-w-md text-sm">You do not have permission to view or manage puzzles. Only coaches and administrators can create or edit puzzles.</p>
                </div>
            </CRMShellLayout>
        );
    }

    if (!currentStage) {
        return (
            <CRMShellLayout>
                <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 text-white font-sans">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 border border-indigo-400/20">
                            <Layers className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">Tactical Training Curriculum</h2>
                            <p className="text-sm text-slate-400">Select a difficulty tier to manage practices, puzzles, and quizzes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "BEGINNER", desc: "Basic rules, piece captures, and simple 1-move mates.", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/10", icon: "♟️" },
                            { name: "INTERMEDIATE", desc: "Tactical motifs, forks, pins, and 2-move checkmates.", color: "from-sky-500 to-indigo-600", shadow: "shadow-sky-500/10", icon: "♞" },
                            { name: "ADVANCED", desc: "Complex combinations, endgame strategies, and deep calculations.", color: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/10", icon: "♜" },
                            { name: "EXPERT", desc: "Master-level puzzles, subtle positional play, and defense.", color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/10", icon: "♛" }
                        ].map((stage) => (
                            <button
                                key={stage.name}
                                onClick={() => setCurrentStage(stage.name)}
                                className={`h-64 group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl transition-all duration-300 flex flex-col items-start p-6 text-left hover:-translate-y-1.5 shadow-lg ${stage.shadow}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
                                <div className="text-4xl mb-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-850 group-hover:scale-110 transition-transform">
                                    {stage.icon}
                                </div>
                                <h3 className="text-lg font-black tracking-wider uppercase text-white group-hover:text-sky-400 transition-colors">
                                    {stage.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed flex-grow">
                                    {stage.desc}
                                </p>
                                <div className="w-full pt-4 border-t border-slate-850 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-white transition-colors">
                                    <span>Browse Drills</span>
                                    <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </CRMShellLayout>
        );
    }

    return (
        <CRMShellLayout>
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 min-h-[600px] flex flex-col text-white font-sans">
                {/* Header Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full font-bold text-xs">
                        <button 
                            onClick={() => { setCurrentStage(null); setBreadcrumbs([]); }} 
                            className="text-slate-450 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Levels
                        </button>
                        <ChevronRight size={14} className="text-slate-600" />
                        <span className="text-blue-400 font-extrabold bg-blue-950/50 px-2.5 py-1 rounded-xl border border-blue-500/20 uppercase tracking-wider">
                            {currentStage}
                        </span>
                        {breadcrumbs.map((b, i) => (
                            <React.Fragment key={b.id}>
                                <ChevronRight size={14} className="text-slate-600" />
                                <button 
                                    onClick={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))} 
                                    className="text-slate-300 hover:text-white transition-colors"
                                >
                                    {b.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    {selectedItems.size > 0 && (
                        <button 
                            onClick={handleBulkDelete} 
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-900/10"
                        >
                            <Trash2 size={14} /> Wipe Selected ({selectedItems.size})
                        </button>
                    )}
                </div>

                {/* Filter and Creation Panel */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Level Selector tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((tier) => (
                            <button
                                key={tier}
                                onClick={() => setDifficultyFilter(tier)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    difficultyFilter === tier
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-850"
                                }`}
                            >
                                {tier === "ALL" ? "All Levels" : tier}
                            </button>
                        ))}
                    </div>

                    {/* Batch filter select */}
                    <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-850 text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-450" />
                        <span className="text-slate-450 font-bold">Batch:</span>
                        <select
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-slate-950 text-white">All Batches</option>
                            {batches.map((b) => (
                                <option key={b.id} value={b.name} className="bg-slate-950 text-white">
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-auto">
                    {/* Add folder tile */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[160px] group transition-all duration-300 hover:border-indigo-500/40">
                        <div className="w-full">
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-2">New Folder</span>
                            <input 
                                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 outline-none p-2.5 rounded-xl text-xs font-bold text-white transition-all"
                                placeholder="Folder Name..." 
                                value={newFolderName} 
                                onChange={(e) => setNewFolderName(e.target.value)} 
                                onKeyDown={(e) => e.key === "Enter" && createFolder()} 
                            />
                        </div>
                        <button 
                            onClick={createFolder} 
                            disabled={!newFolderName} 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl disabled:opacity-30 transition-all shadow-md mt-4"
                        >
                            Create Folder
                        </button>
                    </div>

                    {content.folders.map((f) => <ItemCard key={f.id} item={f} type="FOLDER" />)}
                    {filteredPuzzles.map((p) => <ItemCard key={p.id} item={p} type="PUZZLE" />)}
                    {filteredMCQs.map((m) => <ItemCard key={m.id} item={m} type="MCQ" />)}
                </div>

                {/* Creator Footer buttons */}
                <div className="border-t border-slate-800 pt-6 mt-6 flex justify-end gap-4">
                    <button 
                        onClick={() => { setEditingMCQ(null); setView("CREATE_MCQ"); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2 hover:-translate-y-0.5 transition-all font-bold text-xs uppercase tracking-wider"
                    >
                        <Plus size={16} /> New MCQ Quiz
                    </button>
                    <button 
                        onClick={() => { setEditingPuzzle(null); setView("CREATE_PUZZLE"); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 flex items-center gap-2 hover:-translate-y-0.5 transition-all font-bold text-xs uppercase tracking-wider"
                    >
                        <Plus size={16} /> New PGN Puzzle
                    </button>
                </div>

                {/* Move modal */}
                <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Relocate Asset">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Target Folder</p>
                        <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-2xl divide-y divide-slate-850 bg-slate-900">
                            {availableFolders.map((folder) => (
                                <button 
                                    key={folder.id} 
                                    onClick={() => handleMoveSubmit(folder.id)}
                                    className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-350 hover:text-white flex items-center gap-3 text-xs font-bold transition-all"
                                >
                                    <Folder size={16} className="text-indigo-400" />
                                    <span>{folder.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
            </div>
        </CRMShellLayout>
    );
}

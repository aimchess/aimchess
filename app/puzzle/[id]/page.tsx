"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, PieceSymbol, Color } from "chess.js";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  SkipForward,
  ArrowRight,
  Trophy,
  Palette,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface PuzzleData {
  stars?: string[];
}

interface Puzzle {
  id: string;
  fen: string;
  solution: string;
  stage: string;
  title: string;
  description?: string;
  data?: PuzzleData | string;
}

export default function PuzzlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const puzzleId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const context = searchParams.get("context") || null;
  const folderId = searchParams.get("folderId") || null;
  const stage = searchParams.get("stage") || null;

  // Active puzzle state to avoid component unmount and sidebar reloading
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string | null>(puzzleId || null);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [nextPuzzleId, setNextPuzzleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Roster Lists and Progress Stats
  const [allPuzzles, setAllPuzzles] = useState<any[]>([]);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Game Play State
  const [game, setGame] = useState(new Chess());
  const [currentFen, setCurrentFen] = useState("start");
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const [stars, setStars] = useState<string[]>([]);
  const [hintSquares, setHintSquares] = useState<Record<string, React.CSSProperties>>({});
  const [statusState, setStatusState] = useState<"IDLE" | "CORRECT" | "WRONG" | "COMPLETED">("IDLE");
  const [moveFeedback, setMoveFeedback] = useState<string | null>(null);

  // Board Theme Selector
  const [boardTheme, setBoardTheme] = useState<"emerald" | "wood" | "midnight">("emerald");

  const [containerWidth, setContainerWidth] = useState(400);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial URL param to local state
  useEffect(() => {
    if (puzzleId) {
      setCurrentPuzzleId(puzzleId);
    }
  }, [puzzleId]);

  // Resize Observer for responsive board width
  useEffect(() => {
    if (!boardContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.min(entry.contentRect.width, 420));
      }
    });
    resizeObserver.observe(boardContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Fetch Solved Progress and Roster List (runs ONCE on load/session change)
  useEffect(() => {
    const studentId = (session?.user as any)?.id;
    if (!studentId) return;

    const fetchAllData = async () => {
      setLoadingList(true);
      try {
        // 1. Fetch solved puzzle progress
        const progRes = await fetch(`/api/progress?studentId=${studentId}`);
        if (progRes.ok) {
          const progData = await progRes.json();
          const solved = progData
            .filter((p: any) => p.type === 'PUZZLE' && p.isSolved)
            .map((p: any) => p.puzzleId);
          setSolvedIds(solved);
        }

        // 2. Fetch context list of puzzles
        if (context === "todo") {
          const assignRes = await fetch(`/api/assignments?studentId=${studentId}`);
          if (assignRes.ok) {
            const assignments = await assignRes.json();
            const puzzlesList = assignments
              .filter((a: any) => a.puzzle)
              .map((a: any) => a.puzzle);
            setAllPuzzles(puzzlesList);
          }
        } else if (folderId) {
          const contentRes = await fetch(`/api/content?parentId=${folderId}`);
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            setAllPuzzles(contentData.puzzles || []);
          }
        } else if (stage) {
          const contentRes = await fetch(`/api/content?stage=${stage}`);
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            setAllPuzzles(contentData.puzzles || []);
          }
        }
      } catch (err) {
        console.error("Error loading roster:", err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchAllData();
  }, [session, folderId, context, stage]);

  // Load Puzzle Detail from local list or API
  const getSafeGame = (fenString: string) => {
    const g = new Chess();
    g.clear();
    try {
      g.load(fenString);
    } catch (e) {
      const [placement] = fenString.split(' ');
      const rows = placement.split('/');
      rows.forEach((row, rIdx) => {
        let cIdx = 0;
        for (const char of row) {
          if (/\d/.test(char)) {
            cIdx += parseInt(char);
          } else {
            const square = String.fromCharCode(97 + cIdx) + (8 - rIdx);
            const color = char === char.toUpperCase() ? 'w' : 'b';
            const type = char.toLowerCase();
            g.put({ type: type as PieceSymbol, color: color as Color }, square as any);
            cIdx++;
          }
        }
      });
    }
    return g;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }
    if (status !== "authenticated" || !currentPuzzleId) return;

    setError(null);
    setHintSquares({});
    setMoveFeedback(null);

    const loadPuzzle = async () => {
      try {
        // Look up details locally to avoid network refetches
        const found = allPuzzles.find((p) => p.id === currentPuzzleId);
        let data: Puzzle;
        if (found) {
          data = found;
        } else {
          const res = await fetch(`/api/puzzles/${currentPuzzleId}`);
          if (!res.ok) throw new Error("Puzzle not found.");
          data = await res.json();
        }

        let parsedData: PuzzleData = {};
        if (typeof data.data === "string") {
          try { parsedData = JSON.parse(data.data); } catch (e) { }
        } else if (typeof data.data === "object" && data.data !== null) {
          parsedData = data.data as PuzzleData;
        }
        setStars(parsedData.stars && Array.isArray(parsedData.stars) ? parsedData.stars : []);

        const newGame = getSafeGame(data.fen);
        setGame(newGame);
        setCurrentFen(data.fen);

        setOrientation(data.fen.includes(" w ") ? "white" : "black");

        setPuzzle(data);
        const parsedMoves = data.solution.trim() ? data.solution.trim().split(/\s+/) : [];
        setSolutionMoves(parsedMoves);
        setMoveIndex(0);

        if (newGame.isGameOver() || parsedMoves.length === 0) {
          setStatusState("COMPLETED");
          setMoveFeedback("🎉 Position is stalemate/checkmate! Puzzle solved.");
          
          const studentId = (session?.user as any)?.id;
          if (studentId) {
            fetch("/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId, puzzleId: currentPuzzleId, isCorrect: true, wrongMove: null }),
            });
          }
          setSolvedIds((prev) => prev.includes(data.id) ? prev : [...prev, data.id]);

          // Auto-redirect to next unsolved puzzle after 2.5 seconds
          const currentIdx = allPuzzles.findIndex(p => p.id === data.id);
          if (currentIdx !== -1) {
            let nextUnsolvedIdx = -1;
            for (let i = currentIdx + 1; i < allPuzzles.length; i++) {
              if (!solvedIds.includes(allPuzzles[i].id) && allPuzzles[i].id !== data.id) {
                nextUnsolvedIdx = i;
                break;
              }
            }
            if (nextUnsolvedIdx === -1) {
              for (let i = 0; i < currentIdx; i++) {
                if (!solvedIds.includes(allPuzzles[i].id) && allPuzzles[i].id !== data.id) {
                  nextUnsolvedIdx = i;
                  break;
                }
              }
            }
            if (nextUnsolvedIdx !== -1) {
              const nextId = allPuzzles[nextUnsolvedIdx].id;
              setTimeout(() => {
                selectPuzzle(nextId);
              }, 2500);
            }
          }
        } else {
          setStatusState("IDLE");
        }

        // Determine Next Puzzle ID
        const currentIdx = allPuzzles.findIndex(p => p.id === currentPuzzleId);
        if (currentIdx !== -1 && currentIdx + 1 < allPuzzles.length) {
          setNextPuzzleId(allPuzzles[currentIdx + 1].id);
        } else {
          let url = "";
          if (context === "todo") url = `/api/assignments/next?currentId=${currentPuzzleId}`;
          else if (folderId) url = `/api/content/next?folderId=${folderId}&currentId=${currentPuzzleId}`;

          if (url) {
            try {
              const nextRes = await fetch(url);
              if (nextRes.ok) {
                const nextData = await nextRes.json();
                setNextPuzzleId(nextData?.id || nextData?.nextId || (Array.isArray(nextData) && nextData[0]?.id) || null);
              }
            } catch (e) { }
          }
        }

        // Fetch Assignment Info
        if (context === "todo") {
          try {
            const studentId = (session?.user as any)?.id;
            if (studentId) {
              const assignRes = await fetch(`/api/assignments?studentId=${studentId}`);
              if (assignRes.ok) {
                const allAssigns = await assignRes.json();
                const thisAssign = allAssigns.find((a: any) => a.puzzleId === currentPuzzleId && !a.isCompleted);
                if (thisAssign) {
                  setAssignment(thisAssign);
                  if (thisAssign.dueDate && new Date() > new Date(thisAssign.dueDate)) {
                    toast.error("Deadline Passed! You cannot complete this assignment.");
                  }
                }
              }
            }
          } catch (e) { }
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load puzzle");
      }
    };

    loadPuzzle();
  }, [status, currentPuzzleId, allPuzzles]);

  // Navigate to alternative puzzle in the context (updates state silently)
  const selectPuzzle = (targetId: string) => {
    setCurrentPuzzleId(targetId);

    const query = new URLSearchParams();
    if (context) query.set("context", context);
    if (folderId) query.set("folderId", folderId);
    if (stage) query.set("stage", stage);
    const newUrl = `/puzzle/${targetId}?${query.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  };

  const handleNext = () => {
    if (nextPuzzleId) {
      selectPuzzle(nextPuzzleId);
    } else {
      router.push(context === "todo" ? "/crm/student-todo" : "/crm/student-library");
    }
  };

  const handleSkip = () => handleNext();

  const handleHint = () => {
    if (statusState === "COMPLETED" || moveIndex >= solutionMoves.length) return;
    const correctMoveStr = solutionMoves[moveIndex];
    let fromSquare = "";

    if (correctMoveStr.includes("-")) {
      fromSquare = correctMoveStr.split("-")[0];
    } else {
      try {
        const temp = getSafeGame(currentFen);
        const move = temp.move(correctMoveStr);
        if (move) fromSquare = move.from;
      } catch (e) { }
    }

    if (fromSquare) {
      setHintSquares({ [fromSquare]: { backgroundColor: "rgba(255, 255, 0, 0.5)" } });
      toast.info("Piece to move highlighted!");
    } else {
      toast.warning("Cannot determine hint.");
    }
  };

  const isGeometryValid = (piece: string, from: string, to: string) => {
    const type = piece[1].toLowerCase();
    const x1 = from.charCodeAt(0), y1 = parseInt(from[1]);
    const x2 = to.charCodeAt(0), y2 = parseInt(to[1]);
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);

    if (type === 'n') return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
    if (type === 'r') return dx === 0 || dy === 0;
    if (type === 'b') return dx === dy;
    if (type === 'q') return dx === 0 || dy === 0 || dx === dy;
    if (type === 'k') return dx <= 1 && dy <= 1;
    if (type === 'p') return (piece[0] === 'w' ? (y2 > y1) : (y2 < y1)) && dx <= 1 && dy <= 2;

    return false;
  };

  const onDrop = (from: string, to: string, piece: string) => {
    if (statusState === "COMPLETED" || statusState === "WRONG") return false;

    // Deadline Check
    if (assignment?.dueDate && new Date() > new Date(assignment.dueDate)) {
      toast.error("Deadline Passed! Assignment cannot be completed.");
      return false;
    }

    const gameCopy = getSafeGame(currentFen);
    let validMove = false;
    let newFen = "";
    let moveObject: any = null;

    try {
      const move = gameCopy.move({ from, to, promotion: "q" });
      if (move) {
        validMove = true;
        newFen = gameCopy.fen();
        moveObject = move;
      }
    } catch (e) { }

    if (!validMove && isGeometryValid(piece, from, to)) {
      validMove = true;
      gameCopy.remove(from as any);
      gameCopy.put({ type: piece[1].toLowerCase() as PieceSymbol, color: piece[0] as Color }, to as any);
      newFen = gameCopy.fen();
    }

    if (!validMove) {
      setMoveFeedback("⚠️ Invalid move. That is not a legal chess move.");
      return false;
    }

    const expected = solutionMoves[moveIndex];

    const isCustomMoveCorrect = (pc: string, fr: string, t: string, exp: string) => {
      const normExpected = exp.replace(/[+#x=]/g, "").toLowerCase();
      if (normExpected === `${fr}${t}` || normExpected === `${fr}-${t}`) {
        return true;
      }
      const type = pc[1].toLowerCase();
      const isPawn = type === 'p';
      if (!isPawn) {
        const pieceChar = type.toLowerCase();
        if (normExpected === `${pieceChar}${t}`) {
          return true;
        }
        if (normExpected === `${pieceChar}${fr}${t}` || normExpected === `${pieceChar}${fr[0]}${t}` || normExpected === `${pieceChar}${fr[1]}${t}`) {
          return true;
        }
      } else {
        if (normExpected === t) {
          return true;
        }
        const fromFile = fr[0];
        if (normExpected === `${fromFile}${t}`) {
          return true;
        }
      }
      return false;
    };

    const isCorrect =
      (moveObject && moveObject.san === expected) ||
      expected === `${from}-${to}` ||
      expected === `${from}${to}` ||
      isCustomMoveCorrect(piece, from, to, expected);

    if (isCorrect) {
      setGame(gameCopy);
      setCurrentFen(newFen);

      if (stars.includes(to)) {
        setStars((prev) => prev.filter((s) => s !== to));
      }

      setHintSquares({});
      handleCorrectStep(newFen, gameCopy);
      return true;
    } else {
      handleIncorrect(`${from}-${to}`);
      return false;
    }
  };

  const handleCorrectStep = (fenAfterMove: string, gameInstance: Chess) => {
    const nextIndex = moveIndex + 1;
    const isGameOverState = gameInstance.isGameOver();

    if (nextIndex >= solutionMoves.length || isGameOverState) {
      setStatusState("COMPLETED");
      setMoveFeedback("🎉 EXCELLENT! Position is stalemate/checkmate. Puzzle Solution Verified!");
      saveProgress(true, null);
      toast.success("Puzzle Completed! 🎉");

      // Mark solved locally
      if (currentPuzzleId) {
        setSolvedIds((prev) => prev.includes(currentPuzzleId) ? prev : [...prev, currentPuzzleId]);
        
        // Auto-redirect to next unsolved puzzle after 2.5 seconds
        const currentIdx = allPuzzles.findIndex(p => p.id === currentPuzzleId);
        if (currentIdx !== -1) {
          let nextUnsolvedIdx = -1;
          for (let i = currentIdx + 1; i < allPuzzles.length; i++) {
            if (!solvedIds.includes(allPuzzles[i].id) && allPuzzles[i].id !== currentPuzzleId) {
              nextUnsolvedIdx = i;
              break;
            }
          }
          if (nextUnsolvedIdx === -1) {
            for (let i = 0; i < currentIdx; i++) {
              if (!solvedIds.includes(allPuzzles[i].id) && allPuzzles[i].id !== currentPuzzleId) {
                nextUnsolvedIdx = i;
                break;
              }
            }
          }
          if (nextUnsolvedIdx !== -1) {
            const nextId = allPuzzles[nextUnsolvedIdx].id;
            setTimeout(() => {
              selectPuzzle(nextId);
            }, 2500);
          }
        }
      }
      return;
    }

    setMoveIndex(nextIndex);
    setStatusState("CORRECT");
    setMoveFeedback("🎉 Correct move! Keep going.");

    const reply = solutionMoves[nextIndex];

    if (stars.length === 0 && reply && !reply.includes("-")) {
      setTimeout(() => {
        const g = getSafeGame(fenAfterMove);
        try {
          g.move(reply);
          const replyFen = g.fen();
          setGame(g);
          setCurrentFen(replyFen);
          setMoveIndex(nextIndex + 1);
          
          if (g.isGameOver()) {
            setStatusState("COMPLETED");
            setMoveFeedback("🎉 EXCELLENT! Position is stalemate/checkmate. Puzzle Solution Verified!");
            saveProgress(true, null);
            toast.success("Puzzle Completed! 🎉");
            
            if (currentPuzzleId) {
              setSolvedIds((prev) => prev.includes(currentPuzzleId) ? prev : [...prev, currentPuzzleId]);
              
              const currentIdx = allPuzzles.findIndex(p => p.id === currentPuzzleId);
              if (currentIdx !== -1) {
                let nextUnsolvedIdx = -1;
                for (let i = currentIdx + 1; i < allPuzzles.length; i++) {
                  if (!solvedIds.includes(allPuzzles[i].id) && allPuzzles[i].id !== currentPuzzleId) {
                    nextUnsolvedIdx = i;
                    break;
                  }
                }
                if (nextUnsolvedIdx === -1) {
                  for (let i = 0; i < currentIdx; i++) {
                    if (!solvedIds.includes(allPuzzles[i].id) && allPuzzles[i].id !== currentPuzzleId) {
                      nextUnsolvedIdx = i;
                      break;
                    }
                  }
                }
                if (nextUnsolvedIdx !== -1) {
                  const nextId = allPuzzles[nextUnsolvedIdx].id;
                  setTimeout(() => {
                    selectPuzzle(nextId);
                  }, 2500);
                }
              }
            }
            return;
          }
        } catch (e) { }
        setStatusState("IDLE");
      }, 500);
    } else {
      setStatusState("IDLE");
    }
  };

  const handleIncorrect = (wrongSan: string) => {
    setStatusState("WRONG");
    setMoveFeedback("❌ Incorrect move. Try another continuation!");
    toast.error("Wrong Move!");
    saveProgress(false, wrongSan);
    setTimeout(() => setStatusState("IDLE"), 1500);
  };

  const saveProgress = (isCorrect: boolean, wrongMove: string | null) => {
    const studentId = (session?.user as any)?.id;
    if (!studentId || !currentPuzzleId) return;
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, puzzleId: currentPuzzleId, isCorrect, wrongMove }),
    });
  };

  const resetPuzzle = () => {
    if (!puzzle) return;
    const newGame = getSafeGame(puzzle.fen);

    setGame(newGame);
    setCurrentFen(puzzle.fen);
    setMoveIndex(0);
    setStatusState("IDLE");
    setHintSquares({});
    setMoveFeedback(null);

    let parsedData: PuzzleData = {};
    try { parsedData = typeof puzzle.data === 'string' ? JSON.parse(puzzle.data) : puzzle.data || {}; } catch { }
    setStars(parsedData.stars || []);
  };

  const getCustomBoardColors = () => {
    switch (boardTheme) {
      case "wood":
        return { dark: "#b58863", light: "#f0d9b5" };
      case "midnight":
        return { dark: "#8ca2ad", light: "#dee3e6" };
      case "emerald":
      default:
        return { dark: "#769656", light: "#eeeed2" };
    }
  };

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    stars.forEach((square) => {
      styles[square] = {
        backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZDcwMCIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjMiPjxwb2x5Z29uIHBvaW50cz0iMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMiIvPjwvc3ZnPg==")',
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "60%",
      };
    });
    Object.entries(hintSquares).forEach(([square, style]) => {
      styles[square] = { ...styles[square], ...style };
    });
    return styles;
  }, [stars, hintSquares]);

  const playedMoves = useMemo(() => {
    return solutionMoves.slice(0, moveIndex);
  }, [solutionMoves, moveIndex]);

  if (!puzzle) {
    return (
      <CRMShellLayout>
        <div className="flex justify-center py-20 bg-slate-950 rounded-3xl border border-slate-800 animate-pulse">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      </CRMShellLayout>
    );
  }

  return (
    <CRMShellLayout>
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 min-h-[600px] flex flex-col text-white font-sans">
        {/* Top Student Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Library
            </button>
            <div>
              <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider rounded border border-indigo-500/30">
                {puzzle.stage} Stage
              </span>
              <h1 className="text-lg font-black text-white mt-1">{puzzle.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!loadingList && allPuzzles.length > 0 && (
              <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {allPuzzles.filter(p => solvedIds.includes(p.id)).length} / {allPuzzles.length} Solved
              </span>
            )}
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              Skip Puzzle <SkipForward className="h-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Puzzle Board & Sidebar Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Chessboard Display */}
          <div className="lg:col-span-7 bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">


            {/* Turn Prompt Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider rounded border border-emerald-500/30">
                  {orientation === "white" ? "White" : "Black"} to Move
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">
                  {stars.length > 0
                    ? `Collect all remaining stars on the board!`
                    : `Find the correct sequence of moves to solve the tactical position.`}
                </h3>
              </div>
            </div>

            {/* Chessboard container wrapper */}
            <div className="relative max-w-md mx-auto p-4 rounded-3xl bg-slate-950 border border-slate-850 shadow-2xl">
              <div ref={boardContainerRef} className="w-full flex justify-center">
                <div className="rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner">
                  <Chessboard
                    position={currentFen}
                    onPieceDrop={onDrop}
                    boardOrientation={orientation}
                    boardWidth={containerWidth}
                    customDarkSquareStyle={{ backgroundColor: getCustomBoardColors().dark }}
                    customLightSquareStyle={{ backgroundColor: getCustomBoardColors().light }}
                    customSquareStyles={customSquareStyles}
                    animationDuration={200}
                  />
                </div>
              </div>
            </div>

            {/* Feedback Notification Box */}
            {moveFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-extrabold text-center flex items-center justify-center gap-2 border animate-in fade-in duration-205 ${
                  moveFeedback.includes("EXCELLENT") || moveFeedback.includes("Correct")
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/20"
                    : "bg-rose-950 text-rose-300 border-rose-500/20"
                }`}
              >
                {moveFeedback.includes("EXCELLENT") || moveFeedback.includes("Correct") ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{moveFeedback}</span>
              </div>
            )}

            {/* Active Control Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={handleHint}
                className="px-4 py-2.5 bg-amber-950 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 hover:bg-amber-900/60 transition-colors flex items-center gap-1.5"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" /> Coach Hint
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetPuzzle}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Board
                </button>
                {statusState === "COMPLETED" && (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:bg-indigo-500 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
                  >
                    Next Puzzle <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {puzzle.description && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 text-xs text-slate-400 leading-relaxed font-medium">
                💡 <strong>Puzzle Notes:</strong> {puzzle.description}
              </div>
            )}
          </div>

          {/* Right Sidebar: Active Puzzles Roster List & Played Moves */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Played moves list */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h3 className="font-extrabold text-white text-xs tracking-wider uppercase">📜 Played Move Sequence</h3>
              {playedMoves.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 font-mono text-xs text-amber-300 animate-in fade-in duration-200">
                  {playedMoves.map((mv, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-850">
                      {i + 1}. {mv}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Make your first chess move to begin tracing steps.</p>
              )}
            </div>

            {/* Folder / Stage Puzzle Selection Roster */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-xs tracking-wider uppercase">📂 Practice Roster</h3>
                <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                  {context === "todo" ? "Assignments" : "Curriculum"}
                </span>
              </div>

              {loadingList ? (
                <div className="text-center py-6 text-slate-500 text-xs font-bold">
                  Loading available practices...
                </div>
              ) : allPuzzles.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-bold">
                  No other puzzles found in this section.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {allPuzzles.map((p, idx) => {
                    const isActive = p.id === currentPuzzleId;
                    const isSolved = solvedIds.includes(p.id);
                    return (
                      <button
                        key={p.id || idx}
                        onClick={() => selectPuzzle(p.id)}
                        className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between gap-3 ${
                          isActive
                            ? "bg-indigo-950/60 border-indigo-500 text-white font-bold shadow-lg"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-0.5 truncate flex-1">
                          <span className="text-[9px] font-extrabold uppercase text-amber-400 block">
                            Puzzle #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white block truncate">
                            {p.title}
                          </span>
                        </div>

                        {isSolved ? (
                          <span className="text-[10px] font-extrabold text-emerald-400 shrink-0 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            ✓ Solved
                          </span>
                        ) : isActive ? (
                          <span className="text-[10px] font-extrabold text-indigo-400 shrink-0 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 shrink-0 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                            Solve
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Piece identification guide */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h3 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" /> Board Setup Guide
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Verify that you are playing the matching pieces matching your orientation. When playing White, you start from the bottom ranks and move upwards.
              </p>
            </div>

          </div>
        </div>
      </div>
    </CRMShellLayout>
  );
}
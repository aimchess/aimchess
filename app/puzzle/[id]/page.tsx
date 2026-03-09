

// "use client";
// import { useSession } from "next-auth/react";
// import { useRouter, useParams, useSearchParams } from "next/navigation";
// import { useEffect, useState, useRef, useMemo } from "react";
// import { Chessboard } from "react-chessboard";
// import { Chess, PieceSymbol, Color } from "chess.js";
// import {
//   ArrowLeft,
//   CheckCircle,
//   XCircle,
//   Lightbulb,
//   RotateCcw,
//   Play,
//   Loader2,
//   SkipForward,
//   ArrowRight,
// } from "lucide-react";
// import { toast } from "sonner";

// interface PuzzleData {
//   stars?: string[];
// }

// interface Puzzle {
//   id: string;
//   fen: string;
//   solution: string;
//   stage: string;
//   title: string;
//   description?: string;
//   data?: PuzzleData | string;
// }

// export default function PuzzlePage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();

//   const puzzleId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
//   const context = searchParams.get("context") || null;
//   const folderId = searchParams.get("folderId") || null;

//   const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
//   const [nextPuzzleId, setNextPuzzleId] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Game State
//   const [game, setGame] = useState(new Chess());
//   const [currentFen, setCurrentFen] = useState("start");
//   const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
//   const [moveIndex, setMoveIndex] = useState(0);
//   const [orientation, setOrientation] = useState<"white" | "black">("white");

//   const [stars, setStars] = useState<string[]>([]);
//   const [hintSquares, setHintSquares] = useState<Record<string, React.CSSProperties>>({});

//   const [statusState, setStatusState] =
//     useState<"IDLE" | "CORRECT" | "WRONG" | "COMPLETED">("IDLE");

//   const [containerWidth, setContainerWidth] = useState(500);
//   const boardContainerRef = useRef<HTMLDivElement>(null);

//   // Resize Observer
//   useEffect(() => {
//     if (!boardContainerRef.current) return;
//     const resizeObserver = new ResizeObserver(() => {
//       setContainerWidth(boardContainerRef.current!.offsetWidth);
//     });
//     resizeObserver.observe(boardContainerRef.current);
//     return () => resizeObserver.disconnect();
//   }, []);

//   // --- HELPER: Safe Board Loading ---
//   const getSafeGame = (fen: string) => {
//     const g = new Chess();
//     g.clear();
//     try {
//       g.load(fen);
//     } catch (e) {
//       // Manual setup for "illegal" boards (e.g. puzzles without kings)
//       const [placement] = fen.split(' ');
//       const rows = placement.split('/');
//       rows.forEach((row, rIdx) => {
//         let cIdx = 0;
//         for (const char of row) {
//           if (/\d/.test(char)) {
//             cIdx += parseInt(char);
//           } else {
//             const square = String.fromCharCode(97 + cIdx) + (8 - rIdx);
//             const color = char === char.toUpperCase() ? 'w' : 'b';
//             const type = char.toLowerCase();
//             g.put({ type: type as PieceSymbol, color: color as Color }, square as any);
//             cIdx++;
//           }
//         }
//       });
//     }
//     return g;
//   };

//   // Load Puzzle
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/api/auth/signin");
//       return;
//     }
//     if (status !== "authenticated" || !puzzleId) return;

//     setError(null);
//     setHintSquares({}); 

//     const loadPuzzle = async () => {
//       try {
//         const res = await fetch(`/api/puzzles/${puzzleId}`);
//         if (!res.ok) throw new Error("Puzzle not found.");

//         const data: Puzzle = await res.json();

//         // Parse Stars
//         let parsedData: PuzzleData = {};
//         if (typeof data.data === "string") {
//             try { parsedData = JSON.parse(data.data); } catch (e) {}
//         } else if (typeof data.data === "object" && data.data !== null) {
//             parsedData = data.data as PuzzleData;
//         }
//         setStars(parsedData.stars && Array.isArray(parsedData.stars) ? parsedData.stars : []);

//         // Load Game State
//         const newGame = getSafeGame(data.fen);
//         setGame(newGame);
//         setCurrentFen(data.fen); 

//         // Determine Orientation based on Side to Move
//         if (data.fen.includes(" w ")) setOrientation("white");
//         else if (data.fen.includes(" b ")) setOrientation("black");

//         setPuzzle(data);
//         setSolutionMoves(data.solution.trim().split(" "));
//         setMoveIndex(0);
//         setStatusState("IDLE");

//         // Fetch Next Puzzle ID
//         let url = "";
//         if (context === "todo") url = `/api/assignments/next?currentId=${puzzleId}`;
//         else if (folderId) url = `/api/content/next?folderId=${folderId}&currentId=${puzzleId}`;

//         if (url) {
//             try {
//                 const nextRes = await fetch(url);
//                 if (nextRes.ok) {
//                     const nextData = await nextRes.json();
//                     setNextPuzzleId(nextData?.id || nextData?.nextId || (Array.isArray(nextData) && nextData[0]?.id) || null);
//                 }
//             } catch (e) {}
//         }

//       } catch (err: any) {
//         console.error(err);
//         setError(err.message || "Failed to load puzzle");
//       }
//     };

//     loadPuzzle();
//   }, [status, puzzleId, folderId, context, router]);

//   const handleNext = () => {
//     if (nextPuzzleId) {
//       const query = new URLSearchParams();
//       if (context) query.set("context", context);
//       if (folderId) query.set("folderId", folderId);
//       router.push(`/puzzle/${nextPuzzleId}?${query.toString()}`);
//     } else {
//       router.push("/learn");
//     }
//   };

//   const handleSkip = () => handleNext();

//   const handleHint = () => {
//     if (statusState === "COMPLETED" || moveIndex >= solutionMoves.length) return;
//     const correctMoveStr = solutionMoves[moveIndex];
//     let fromSquare = "";

//     if (correctMoveStr.includes("-")) {
//         fromSquare = correctMoveStr.split("-")[0];
//     } else {
//         try {
//             const temp = getSafeGame(currentFen);
//             const move = temp.move(correctMoveStr); // Chess.js can parse SAN "Nf3"
//             if (move) fromSquare = move.from;
//         } catch(e) {}
//     }

//     if (fromSquare) {
//       setHintSquares({ [fromSquare]: { backgroundColor: "rgba(255, 255, 0, 0.5)" } });
//       toast.info("Piece to move highlighted!");
//     } else {
//       toast.warning("Cannot determine hint.");
//     }
//   };

//   const isGeometryValid = (piece: string, from: string, to: string) => {
//     const type = piece[1].toLowerCase(); 
//     const x1 = from.charCodeAt(0), y1 = parseInt(from[1]);
//     const x2 = to.charCodeAt(0), y2 = parseInt(to[1]);
//     const dx = Math.abs(x1 - x2);
//     const dy = Math.abs(y1 - y2);

//     if (type === 'n') return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
//     if (type === 'r') return dx === 0 || dy === 0;
//     if (type === 'b') return dx === dy;
//     if (type === 'q') return dx === 0 || dy === 0 || dx === dy;
//     if (type === 'k') return dx <= 1 && dy <= 1;
//     if (type === 'p') return (piece[0] === 'w' ? (y2 > y1) : (y2 < y1)) && dx <= 1 && dy <= 2; 

//     return false;
//   };

//   // --- MAIN MOVE VALIDATION LOGIC ---
//   const onDrop = (from: string, to: string, piece: string) => {
//     if (statusState === "COMPLETED" || statusState === "WRONG") return false;

//     const gameCopy = getSafeGame(currentFen);
//     let validMove = false;
//     let newFen = "";
//     let moveObject: any = null; // Store move details (specifically for SAN)

//     // 1. Try Standard Chess Move
//     try {
//         const move = gameCopy.move({ from, to, promotion: "q" });
//         if (move) {
//             validMove = true;
//             newFen = gameCopy.fen();
//             moveObject = move; // Important: Capture the chess.js move object
//         }
//     } catch (e) {}

//     // 2. Try Custom Move (if standard illegal but geometry ok, for star puzzles)
//     if (!validMove) {
//         if (isGeometryValid(piece, from, to)) {
//             validMove = true;
//             gameCopy.remove(from as any);
//             gameCopy.put({ type: piece[1].toLowerCase() as PieceSymbol, color: piece[0] as Color }, to as any);
//             newFen = gameCopy.fen();
//         }
//     }

//     if (!validMove) return false;

//     // 3. Check Solution against Expected
//     const expected = solutionMoves[moveIndex];

//     // Logic: 
//     // - Check 1: Does the SAN match? (e.g. expected="Nf3", moveObject.san="Nf3")
//     // - Check 2: Does coordinate match? (e.g. expected="g1-f3", current="g1-f3")
//     const isCorrect = 
//         (moveObject && moveObject.san === expected) || 
//         expected === `${from}-${to}` || 
//         expected === `${from}${to}`;

//     if (isCorrect) {
//         setGame(gameCopy);
//         setCurrentFen(newFen);

//         // Remove Star if landed on
//         if (stars.includes(to)) {
//             setStars((prev) => prev.filter((s) => s !== to));
//         }

//         setHintSquares({}); 
//         handleCorrectStep(newFen);
//         return true;
//     } else {
//         handleIncorrect(`${from}-${to}`);
//         return false;
//     }
//   };

//   const handleCorrectStep = (fenAfterMove: string) => {
//     const nextIndex = moveIndex + 1;

//     if (nextIndex >= solutionMoves.length) {
//         setStatusState("COMPLETED");
//         saveProgress(true, null);
//         toast.success("Puzzle Completed! 🎉");
//         return;
//     }

//     setMoveIndex(nextIndex);
//     setStatusState("CORRECT");

//     const reply = solutionMoves[nextIndex];

//     // Auto-play opponent move ONLY IF no stars remaining (assuming star puzzles are manual)
//     if (stars.length === 0 && reply && !reply.includes("-")) {
//          setTimeout(() => {
//             const g = getSafeGame(fenAfterMove);
//             try { 
//                 g.move(reply); 
//                 const replyFen = g.fen();
//                 setGame(g);
//                 setCurrentFen(replyFen);
//                 setMoveIndex(nextIndex + 1);
//             } catch (e) {
//                 // If standard move fails, maybe check custom? (Rare for opponent reply)
//             }
//             setStatusState("IDLE");
//          }, 500);
//     } else {
//         setStatusState("IDLE");
//     }
//   };

//   const handleIncorrect = (wrongSan: string) => {
//     setStatusState("WRONG");
//     toast.error("Wrong Move!");
//     saveProgress(false, wrongSan);
//     setTimeout(() => setStatusState("IDLE"), 500);
//   };

//   const saveProgress = (isCorrect: boolean, wrongMove: string | null) => {
//     const studentId = (session?.user as any)?.id;
//     if (!studentId) return;
//     fetch("/api/progress", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ studentId, puzzleId, isCorrect, wrongMove }),
//     });
//   };

//   const resetPuzzle = () => {
//     if (!puzzle) return;
//     const newGame = getSafeGame(puzzle.fen);

//     setGame(newGame);
//     setCurrentFen(puzzle.fen);
//     setMoveIndex(0);
//     setStatusState("IDLE");
//     setHintSquares({});

//     let parsedData: PuzzleData = {};
//     try { parsedData = typeof puzzle.data === 'string' ? JSON.parse(puzzle.data) : puzzle.data || {}; } catch {}
//     setStars(parsedData.stars || []);
//   };

//   const customSquareStyles = useMemo(() => {
//     const styles: Record<string, React.CSSProperties> = {};
//     // Add Stars
//     stars.forEach((square) => {
//       styles[square] = {
//         backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZDcwMCIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjMiPjxwb2x5Z29uIHBvaW50cz0iMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMiIvPjwvc3ZnPg==")',
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "60%",
//       };
//     });
//     // Add Hints
//     Object.entries(hintSquares).forEach(([square, style]) => {
//       styles[square] = { ...styles[square], ...style };
//     });
//     return styles;
//   }, [stars, hintSquares]);

//   if (!puzzle) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

//   return (
//     <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center">
//       <div className="w-full max-w-6xl space-y-8">
//         <div className="flex items-center justify-between">
//           <button onClick={() => router.back()} className="flex items-center gap-2 font-bold"><ArrowLeft /> Back</button>
//           <div className="text-center">
//             <h1 className="text-3xl font-extrabold">{puzzle.title}</h1>
//             <span className="inline-block mt-1 px-3 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-700 uppercase">
//                 {puzzle.stage}
//             </span>
//           </div>
//           <button onClick={handleSkip} className="flex items-center gap-2 font-bold text-gray-500">Skip <SkipForward/></button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="flex justify-center">
//             <div ref={boardContainerRef} className="w-full max-w-[550px] aspect-square rounded-xl shadow-2xl bg-white border-4 border-white">
//               <Chessboard
//                 position={currentFen}
//                 onPieceDrop={onDrop}
//                 boardOrientation={orientation}
//                 boardWidth={containerWidth}
//                 customDarkSquareStyle={{ backgroundColor: "#779556" }}
//                 customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
//                 customSquareStyles={customSquareStyles}
//                 animationDuration={200}
//               />
//             </div>
//           </div>

//           <div className="flex flex-col justify-center space-y-6 pt-4">
//             <div className={`p-6 rounded-2xl border-2 transition-all ${statusState === "COMPLETED" ? "bg-green-50 border-green-200" : statusState === "WRONG" ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
//                 <div className="flex items-center gap-4">
//                     {statusState === "COMPLETED" ? <CheckCircle className="h-10 w-10 text-green-600" /> : statusState === "WRONG" ? <XCircle className="h-10 w-10 text-red-600" /> : <Play className="h-10 w-10 text-blue-500" />}
//                     <div>
//                         <h2 className="text-xl font-bold">{statusState === "COMPLETED" ? "Solved!" : statusState === "WRONG" ? "Try Again" : `${orientation === 'white' ? 'White' : 'Black'} to Move`}</h2>
//                         <p className="text-sm text-gray-500">{stars.length > 0 ? `${stars.length} stars remaining` : "Find the best move"}</p>
//                     </div>
//                 </div>
//             </div>
//             {statusState !== "COMPLETED" ? (
//                 <div className="grid grid-cols-2 gap-4">
//                     <button onClick={resetPuzzle} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-white border hover:bg-gray-50"><RotateCcw/> Reset</button>
//                     <button onClick={handleHint} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-blue-50 border hover:bg-blue-100"><Lightbulb/> Hint</button>
//                 </div>
//             ) : (
//                 <button onClick={handleNext} className="w-full py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-2">Next <ArrowRight/></button>
//             )}
//             {puzzle.description && <div className="mt-4 p-4 bg-slate-100 rounded-xl text-sm">{puzzle.description}</div>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, PieceSymbol, Color } from "chess.js";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Play,
  Loader2,
  SkipForward,
  ArrowRight,
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

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [nextPuzzleId, setNextPuzzleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Game State
  const [game, setGame] = useState(new Chess());
  const [currentFen, setCurrentFen] = useState("start");
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const [stars, setStars] = useState<string[]>([]);
  const [hintSquares, setHintSquares] = useState<Record<string, React.CSSProperties>>({});

  const [statusState, setStatusState] =
    useState<"IDLE" | "CORRECT" | "WRONG" | "COMPLETED">("IDLE");

  const [containerWidth, setContainerWidth] = useState(500);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Resize Observer for responsive board
  useEffect(() => {
    if (!boardContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(boardContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // --- HELPER: Safe Board Loading ---
  const getSafeGame = (fen: string) => {
    const g = new Chess();
    g.clear();
    try {
      g.load(fen);
    } catch (e) {
      const [placement] = fen.split(' ');
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

  // Load Puzzle
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }
    if (status !== "authenticated" || !puzzleId) return;

    setError(null);
    setHintSquares({});

    const loadPuzzle = async () => {
      try {
        const res = await fetch(`/api/puzzles/${puzzleId}`);
        if (!res.ok) throw new Error("Puzzle not found.");

        const data: Puzzle = await res.json();

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
        setSolutionMoves(data.solution.trim().split(" "));
        setMoveIndex(0);
        setStatusState("IDLE");

        // Fetch Next Puzzle ID
        let url = "";
        if (context === "todo") url = `/api/assignments/next?currentId=${puzzleId}`;
        else if (folderId) url = `/api/content/next?folderId=${folderId}&currentId=${puzzleId}`;

        if (url) {
          try {
            const nextRes = await fetch(url);
            if (nextRes.ok) {
              const nextData = await nextRes.json();
              setNextPuzzleId(nextData?.id || nextData?.nextId || (Array.isArray(nextData) && nextData[0]?.id) || null);
            }
          } catch (e) { }
        }

        // Fetch Assignment Info if in TODO context
        if (context === "todo") {
          try {
            const studentId = (session?.user as any)?.id;
            if (studentId) {
              const assignRes = await fetch(`/api/assignments?studentId=${studentId}`);
              if (assignRes.ok) {
                const allAssigns = await assignRes.json();
                const thisAssign = allAssigns.find((a: any) => a.puzzleId === puzzleId && !a.isCompleted);
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
  }, [status, puzzleId, folderId, context, router]);

  const handleNext = () => {
    if (nextPuzzleId) {
      const query = new URLSearchParams();
      if (context) query.set("context", context);
      if (folderId) query.set("folderId", folderId);
      router.push(`/puzzle/${nextPuzzleId}?${query.toString()}`);
    } else {
      router.push("/crm/student-todo");
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

    if (!validMove) return false;

    const expected = solutionMoves[moveIndex];
    const isCorrect =
      (moveObject && moveObject.san === expected) ||
      expected === `${from}-${to}` ||
      expected === `${from}${to}`;

    if (isCorrect) {
      setGame(gameCopy);
      setCurrentFen(newFen);

      if (stars.includes(to)) {
        setStars((prev) => prev.filter((s) => s !== to));
      }

      setHintSquares({});
      handleCorrectStep(newFen);
      return true;
    } else {
      handleIncorrect(`${from}-${to}`);
      return false;
    }
  };

  const handleCorrectStep = (fenAfterMove: string) => {
    const nextIndex = moveIndex + 1;

    if (nextIndex >= solutionMoves.length) {
      setStatusState("COMPLETED");
      saveProgress(true, null);
      toast.success("Puzzle Completed! 🎉");
      return;
    }

    setMoveIndex(nextIndex);
    setStatusState("CORRECT");

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
        } catch (e) { }
        setStatusState("IDLE");
      }, 500);
    } else {
      setStatusState("IDLE");
    }
  };

  const handleIncorrect = (wrongSan: string) => {
    setStatusState("WRONG");
    toast.error("Wrong Move!");
    saveProgress(false, wrongSan);
    setTimeout(() => setStatusState("IDLE"), 500);
  };

  const saveProgress = (isCorrect: boolean, wrongMove: string | null) => {
    const studentId = (session?.user as any)?.id;
    if (!studentId) return;
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, puzzleId, isCorrect, wrongMove }),
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

    let parsedData: PuzzleData = {};
    try { parsedData = typeof puzzle.data === 'string' ? JSON.parse(puzzle.data) : puzzle.data || {}; } catch { }
    setStars(parsedData.stars || []);
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

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Increased top padding on larger screens for more space below navbar */}
      <div className="pt-8 pb-12 px-4 sm:pt-12 sm:px-6 lg:pt-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-lg font-semibold hover:text-orange-600 transition"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>

            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                {puzzle.title}
              </h1>
              <span className="inline-block mt-3 px-4 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 uppercase tracking-wider">
                {puzzle.stage}
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-600 hover:text-gray-900 transition sm:justify-end"
            >
              Skip <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Chessboard */}
            <div className="flex justify-center lg:justify-end">
              <div
                ref={boardContainerRef}
                className="w-full max-w-lg aspect-square rounded-2xl shadow-2xl overflow-hidden bg-white"
              >
                <Chessboard
                  position={currentFen}
                  onPieceDrop={onDrop}
                  boardOrientation={orientation}
                  boardWidth={containerWidth}
                  customDarkSquareStyle={{ backgroundColor: "#779556" }}
                  customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
                  customSquareStyles={customSquareStyles}
                  animationDuration={200}
                />
              </div>
            </div>

            {/* Controls & Info */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Status Card */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 ${statusState === "COMPLETED"
                  ? "bg-green-50 border-green-300"
                  : statusState === "WRONG"
                    ? "bg-red-50 border-red-300"
                    : "bg-white border-slate-200 shadow-lg"
                  }`}
              >
                <div className="flex items-center gap-5">
                  {statusState === "COMPLETED" ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  ) : statusState === "WRONG" ? (
                    <XCircle className="h-12 w-12 text-red-600" />
                  ) : (
                    <Play className="h-12 w-12 text-blue-600" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {statusState === "COMPLETED"
                        ? "Solved!"
                        : statusState === "WRONG"
                          ? "Try Again"
                          : `${orientation === "white" ? "White" : "Black"} to Move`}
                    </h2>
                    <p className="mt-1 text-lg text-gray-600">
                      {stars.length > 0 ? `${stars.length} star${stars.length > 1 ? 's' : ''} remaining` : "Find the best move"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {statusState !== "COMPLETED" ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={resetPuzzle}
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    <RotateCcw className="h-5 w-5" /> Reset
                  </button>
                  <button
                    onClick={handleHint}
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-blue-700 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition"
                  >
                    <Lightbulb className="h-5 w-5" /> Hint
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-5 px-6 rounded-xl font-bold text-xl bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition flex items-center justify-center gap-3 shadow-lg"
                >
                  Next Puzzle <ArrowRight className="h-6 w-6" />
                </button>
              )}

              {/* Description */}
              {puzzle.description && (
                <div className="p-5 bg-slate-100 rounded-xl text-gray-700 leading-relaxed">
                  {puzzle.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
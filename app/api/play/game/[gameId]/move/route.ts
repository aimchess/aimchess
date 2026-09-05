import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Chess } from "chess.js";
import { completeGame } from "@/lib/game";
import { calculateBotMove } from "@/lib/minimax";

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { move, fen, pgn } = await req.json();

        const game = await prisma.game.findUnique({
            where: { id: params.gameId }
        });

        if (!game) {
            return new NextResponse("Game not found", { status: 404 });
        }

        // Verify the user is a player
        if (game.whiteId !== currentUser.id && game.blackId !== currentUser.id) {
            return new NextResponse("Not a player in this game", { status: 403 });
        }

        // Check if game is already over
        const chess = new Chess();
        if (game.fen) chess.load(game.fen);
        const activeColor = chess.turn(); // 'w' or 'b' before move
        
        if (chess.isGameOver()) {
            return new NextResponse("Game is already over", { status: 400 });
        }

        // Apply the move to verify it
        try {
            chess.move(move);
        } catch (e) {
            return new NextResponse("Invalid move", { status: 400 });
        }

        const parts = (game.timeControl || "10+0").split("+");
        const initialMs = (parseInt(parts[0]) || 10) * 60 * 1000;
        const incrementMs = (parts[1] ? parseInt(parts[1]) : 0) * 1000;

        let whiteTimeLeft = game.whiteTimeLeft ?? initialMs;
        let blackTimeLeft = game.blackTimeLeft ?? initialMs;
        let lastMoveAt = game.lastMoveAt ? new Date(game.lastMoveAt) : null;
        const now = new Date();
        let timedOut = false;

        if (lastMoveAt && game.timeControl) {
            const elapsed = now.getTime() - lastMoveAt.getTime();

            if (activeColor === "w") {
                const timeLeft = whiteTimeLeft - elapsed;
                if (timeLeft <= 0) {
                    timedOut = true;
                    whiteTimeLeft = 0;
                } else {
                    whiteTimeLeft = timeLeft + incrementMs;
                }
            } else {
                const timeLeft = blackTimeLeft - elapsed;
                if (timeLeft <= 0) {
                    timedOut = true;
                    blackTimeLeft = 0;
                } else {
                    blackTimeLeft = timeLeft + incrementMs;
                }
            }
        }

        if (timedOut) {
            const updatedGame = await completeGame({
                gameId: params.gameId,
                winnerId: activeColor === "w" ? game.blackId : game.whiteId,
                result: activeColor === "w" ? "0-1" : "1-0",
                status: "COMPLETED",
                whiteTimeLeft,
                blackTimeLeft,
                lastMoveAt: now
            });
            return NextResponse.json(updatedGame);
        }

        // Determine if game is over after this move
        let status = "IN_PROGRESS";
        let result = null;
        let winnerId = null;

        if (chess.isCheckmate()) {
            status = "COMPLETED";
            if (chess.turn() === 'w') {
                result = "0-1";
                winnerId = game.blackId;
            } else {
                result = "1-0";
                winnerId = game.whiteId;
            }
        } else if (chess.isGameOver()) { // Draw, Stalemate, etc.
            status = "COMPLETED";
            result = "1/2-1/2";
        }

        let finalFen = chess.fen();
        let finalPgn = chess.pgn();

        // Server-side Bot reply
        if (game.isBot && status === "IN_PROGRESS") {
            try {
                const difficulty = game.botDifficulty || "BEGINNER";
                
                let madeRandomMove = false;
                if (difficulty === "BEGINNER" && Math.random() < 0.45) {
                    const moves = chess.moves({ verbose: true });
                    if (moves.length > 0) {
                        const randomMove = moves[Math.floor(Math.random() * moves.length)];
                        chess.move(randomMove);
                        madeRandomMove = true;
                    }
                } else if (difficulty === "INTERMEDIATE" && Math.random() < 0.15) {
                    const moves = chess.moves({ verbose: true });
                    if (moves.length > 0) {
                        const randomMove = moves[Math.floor(Math.random() * moves.length)];
                        chess.move(randomMove);
                        madeRandomMove = true;
                    }
                }

                if (madeRandomMove) {
                    finalFen = chess.fen();
                    finalPgn = chess.pgn();

                    // Re-evaluate game status
                    if (chess.isCheckmate()) {
                        status = "COMPLETED";
                        if (chess.turn() === 'w') {
                            result = "0-1";
                            winnerId = game.blackId; // Bot wins
                        } else {
                            result = "1-0";
                            winnerId = game.whiteId; // User wins
                        }
                    } else if (chess.isGameOver()) {
                        status = "COMPLETED";
                        result = "1/2-1/2";
                    }
                } else {
                    let depth = 8;
                    if (difficulty === "BEGINNER") depth = 2;
                    else if (difficulty === "INTERMEDIATE") depth = 5;
                    else if (difficulty === "ADVANCED") depth = 8;
                    else if (difficulty === "EXPERT") depth = 12;

                    let botMoved = false;
                    const encodedFen = encodeURIComponent(chess.fen());

                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout

                        const sfRes = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodedFen}&depth=${depth}`, {
                            headers: { 'Accept': 'application/json' },
                            cache: 'no-store',
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);

                        if (sfRes.ok) {
                            const sfData = await sfRes.json();
                            if (sfData.success && sfData.bestmove) {
                                const parts = sfData.bestmove.split(" ");
                                const bestMove = parts[1];
                                if (bestMove) {
                                    const from = bestMove.substring(0, 2);
                                    const to = bestMove.substring(2, 4);
                                    const promotion = bestMove.substring(4, 5) || undefined;
                                    
                                    chess.move({ from, to, promotion });
                                    botMoved = true;
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("Stockfish online API error/timeout, using local minimax fallback:", e);
                    }

                    // Fallback to local minimax engine if online engine failed or timed out
                    if (!botMoved) {
                        const fallbackMove = calculateBotMove(chess.fen(), difficulty as any);
                        if (fallbackMove) {
                            chess.move(fallbackMove);
                            botMoved = true;
                        }
                    }

                    if (botMoved) {
                        finalFen = chess.fen();
                        finalPgn = chess.pgn();

                        // Re-evaluate game status
                        if (chess.isCheckmate()) {
                            status = "COMPLETED";
                            if (chess.turn() === 'w') {
                                result = "0-1";
                                winnerId = game.blackId; // Bot wins
                            } else {
                                result = "1-0";
                                winnerId = game.whiteId; // User wins
                            }
                        } else if (chess.isGameOver()) {
                            status = "COMPLETED";
                            result = "1/2-1/2";
                        }
                    }
                }
            } catch (err) {
                console.error("Server-side bot calculation error:", err);
            }
        }

        if (status === "COMPLETED") {
            const updatedGame = await completeGame({
                gameId: params.gameId,
                winnerId,
                result,
                status,
                fen: finalFen,
                pgn: finalPgn,
                whiteTimeLeft,
                blackTimeLeft,
                lastMoveAt: now
            });
            return NextResponse.json(updatedGame);
        }

        const updatedGame = await prisma.game.update({
            where: { id: params.gameId },
            data: {
                fen: finalFen,
                pgn: finalPgn,
                status: "IN_PROGRESS",
                whiteTimeLeft,
                blackTimeLeft,
                lastMoveAt: now,
                drawOfferedBy: null
            },
            include: {
                white: { select: { id: true, name: true, email: true, role: true } },
                black: { select: { id: true, name: true, email: true, role: true } }
            }
        });

        return NextResponse.json(updatedGame);
    } catch (error) {
        console.error("Failed to make move:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Chess } from "chess.js";
import { completeGame } from "@/lib/game";
import { calculateBotMove } from "@/lib/minimax";

export async function GET(req: Request, { params }: { params: { gameId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let game = await prisma.game.findUnique({
            where: { id: params.gameId },
            include: {
                white: { select: { id: true, name: true, email: true, role: true } },
                black: { select: { id: true, name: true, email: true, role: true } }
            }
        });

        if (!game) {
            return new NextResponse("Game not found", { status: 404 });
        }

        // Self-healing check: if bot game is active and it's the bot's turn, trigger bot move automatically
        if (game.isBot && game.status === "IN_PROGRESS") {
            const chess = new Chess();
            if (game.fen) chess.load(game.fen);
            
            const isBotWhite = game.white?.email === "bot@aimchess.com" || game.white?.name?.includes("Bot");
            const isBotBlack = game.black?.email === "bot@aimchess.com" || game.black?.name?.includes("Bot");
            const activeColor = chess.turn();

            const isBotTurn = (activeColor === "w" && isBotWhite) || (activeColor === "b" && isBotBlack);

            if (isBotTurn && !chess.isGameOver()) {
                const difficulty = (game.botDifficulty || "BEGINNER") as any;
                const botMove = calculateBotMove(chess.fen(), difficulty);

                if (botMove) {
                    try {
                        chess.move(botMove);
                        let newStatus = "IN_PROGRESS";
                        let result: string | null = null;
                        let winnerId: string | null = null;

                        if (chess.isCheckmate()) {
                            newStatus = "COMPLETED";
                            winnerId = chess.turn() === "w" ? game.blackId : game.whiteId;
                            result = chess.turn() === "w" ? "0-1" : "1-0";
                        } else if (chess.isGameOver()) {
                            newStatus = "COMPLETED";
                            result = "1/2-1/2";
                        }

                        if (newStatus === "COMPLETED") {
                            await completeGame({
                                gameId: game.id,
                                winnerId,
                                result,
                                status: newStatus,
                                fen: chess.fen(),
                                pgn: chess.pgn()
                            });
                        } else {
                            await prisma.game.update({
                                where: { id: params.gameId },
                                data: {
                                    fen: chess.fen(),
                                    pgn: chess.pgn()
                                }
                            });
                        }

                        // Re-fetch updated game state
                        game = await prisma.game.findUnique({
                            where: { id: params.gameId },
                            include: {
                                white: { select: { id: true, name: true, email: true, role: true } },
                                black: { select: { id: true, name: true, email: true, role: true } }
                            }
                        });
                    } catch (err) {
                        console.error("Error executing self-healing bot move:", err);
                    }
                }
            }
        }

        // Process timeout if game is in progress and has timing information
        if (game && game.status === "IN_PROGRESS" && game.lastMoveAt && game.timeControl) {
            const chess = new Chess();
            if (game.fen) chess.load(game.fen);
            const activeColor = chess.turn(); // 'w' or 'b'
            
            const parts = (game.timeControl || "10+0").split("+");
            const initialMs = (parseInt(parts[0]) || 10) * 60 * 1000;
            const wTimeLeft = game.whiteTimeLeft ?? initialMs;
            const bTimeLeft = game.blackTimeLeft ?? initialMs;

            const now = new Date();
            const elapsed = now.getTime() - new Date(game.lastMoveAt).getTime();

            if (activeColor === 'w') {
                const timeLeft = wTimeLeft - elapsed;
                if (timeLeft <= 0) {
                    // White timed out, Black wins
                    await completeGame({
                        gameId: game.id,
                        winnerId: game.blackId,
                        result: "0-1",
                        status: "COMPLETED",
                        whiteTimeLeft: 0,
                        lastMoveAt: now
                    });
                    // Re-fetch completed game state
                    game = await prisma.game.findUnique({
                        where: { id: params.gameId },
                        include: {
                            white: { select: { id: true, name: true, email: true, role: true } },
                            black: { select: { id: true, name: true, email: true, role: true } }
                        }
                    });
                } else {
                    // Return adjusted remaining time dynamically
                    return NextResponse.json({
                        ...game,
                        whiteTimeLeft: timeLeft,
                        blackTimeLeft: bTimeLeft
                    });
                }
            } else {
                const timeLeft = bTimeLeft - elapsed;
                if (timeLeft <= 0) {
                    // Black timed out, White wins
                    await completeGame({
                        gameId: game.id,
                        winnerId: game.whiteId,
                        result: "1-0",
                        status: "COMPLETED",
                        blackTimeLeft: 0,
                        lastMoveAt: now
                    });
                    // Re-fetch completed game state
                    game = await prisma.game.findUnique({
                        where: { id: params.gameId },
                        include: {
                            white: { select: { id: true, name: true, email: true, role: true } },
                            black: { select: { id: true, name: true, email: true, role: true } }
                        }
                    });
                } else {
                    // Return adjusted remaining time dynamically
                    return NextResponse.json({
                        ...game,
                        whiteTimeLeft: wTimeLeft,
                        blackTimeLeft: timeLeft
                    });
                }
            }
        }

        return NextResponse.json(game);
    } catch (error) {
        console.error("Failed to fetch game:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

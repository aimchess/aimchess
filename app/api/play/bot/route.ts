import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Chess } from "chess.js";
import { calculateBotMove } from "@/lib/minimax";

export async function POST(req: Request) {
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

        const body = await req.json();
        const { difficulty, playAs } = body; // "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT", playAs: "white" | "black" | "random"

        // Find or create the system Bot user
        let botUser = await prisma.user.findUnique({
            where: { email: "bot@aimchess.com" }
        });

        if (!botUser) {
            botUser = await prisma.user.create({
                data: {
                    email: "bot@aimchess.com",
                    name: "AIM Chess Bot",
                    password: "bot-system-password-123",
                    role: "COACH",
                    aimRating: 1200
                }
            });
        }

        let userColor = playAs || "white";
        if (userColor === "random") {
            userColor = Math.random() < 0.5 ? "white" : "black";
        }

        const whiteId = userColor === "white" ? currentUser.id : botUser.id;
        const blackId = userColor === "white" ? botUser.id : currentUser.id;

        let initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        let initialPgn = "";

        if (whiteId === botUser.id) {
            let botMoved = false;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const res = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(initialFen)}&depth=5`, {
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.bestmove) {
                        const parts = data.bestmove.split(" ");
                        const bestMove = parts[1];
                        if (bestMove) {
                            const temp = new Chess();
                            const from = bestMove.substring(0, 2);
                            const to = bestMove.substring(2, 4);
                            temp.move({ from, to });
                            initialFen = temp.fen();
                            initialPgn = temp.pgn();
                            botMoved = true;
                        }
                    }
                }
            } catch (err) {
                console.error("Bot start move error:", err);
            }

            if (!botMoved) {
                const temp = new Chess();
                const fallbackMove = calculateBotMove(initialFen, (difficulty || "BEGINNER") as any);
                if (fallbackMove) {
                    temp.move(fallbackMove);
                    initialFen = temp.fen();
                    initialPgn = temp.pgn();
                }
            }
        }

        const game = await prisma.game.create({
            data: {
                whiteId,
                blackId,
                fen: initialFen,
                pgn: initialPgn,
                status: "IN_PROGRESS",
                isRated: false,
                isBot: true,
                botDifficulty: difficulty,
                timeControl: "10+0",
                whiteTimeLeft: 600000,
                blackTimeLeft: 600000,
                lastMoveAt: new Date()
            }
        });

        return NextResponse.json(game);
    } catch (error) {
        console.error("Bot game start error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

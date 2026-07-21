import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Chess } from "chess.js";
import { completeGame } from "@/lib/game";

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

        // Process timeout if game is in progress and has timing information
        if (game.status === "IN_PROGRESS" && game.lastMoveAt && game.timeControl) {
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

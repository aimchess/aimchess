import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Chess } from "chess.js";
import { completeGame } from "@/lib/game";

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

        let whiteTimeLeft = game.whiteTimeLeft;
        let blackTimeLeft = game.blackTimeLeft;
        let lastMoveAt = game.lastMoveAt ? new Date(game.lastMoveAt) : null;
        const now = new Date();
        let timedOut = false;

        if (lastMoveAt && game.timeControl) {
            const elapsed = now.getTime() - lastMoveAt.getTime();
            const parts = game.timeControl.split("+");
            const incrementMs = (parts[1] ? parseInt(parts[1]) : 0) * 1000;

            if (activeColor === "w") {
                const timeLeft = (game.whiteTimeLeft || 0) - elapsed;
                if (timeLeft <= 0) {
                    timedOut = true;
                    whiteTimeLeft = 0;
                } else {
                    whiteTimeLeft = timeLeft + incrementMs;
                }
            } else {
                const timeLeft = (game.blackTimeLeft || 0) - elapsed;
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

        if (status === "COMPLETED") {
            const updatedGame = await completeGame({
                gameId: params.gameId,
                winnerId,
                result,
                status,
                fen: chess.fen(),
                pgn: chess.pgn(),
                whiteTimeLeft,
                blackTimeLeft,
                lastMoveAt: now
            });
            return NextResponse.json(updatedGame);
        }

        const updatedGame = await prisma.game.update({
            where: { id: params.gameId },
            data: {
                fen: chess.fen(),
                pgn: chess.pgn(),
                status: "IN_PROGRESS",
                whiteTimeLeft,
                blackTimeLeft,
                lastMoveAt: now
            }
        });

        return NextResponse.json(updatedGame);
    } catch (error) {
        console.error("Failed to make move:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Chess } from "chess.js";

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
        
        if (chess.isGameOver()) {
            return new NextResponse("Game is already over", { status: 400 });
        }

        // Apply the move to verify it
        try {
            chess.move(move);
        } catch (e) {
            return new NextResponse("Invalid move", { status: 400 });
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

        const updatedGame = await prisma.game.update({
            where: { id: params.gameId },
            data: {
                fen: chess.fen(),
                pgn: chess.pgn(),
                status,
                result,
                winnerId
            }
        });

        // Tournament Scoring Logic
        if (status === "COMPLETED" && game.tournamentId) {
            if (winnerId) {
                // Winner gets 1 point
                await prisma.tournamentParticipant.update({
                    where: {
                        tournamentId_userId: {
                            tournamentId: game.tournamentId,
                            userId: winnerId
                        }
                    },
                    data: { score: { increment: 1 } }
                });
            } else {
                // Draw: both get 0.5 points
                await prisma.tournamentParticipant.update({
                    where: {
                        tournamentId_userId: {
                            tournamentId: game.tournamentId,
                            userId: game.whiteId
                        }
                    },
                    data: { score: { increment: 0.5 } }
                });
                await prisma.tournamentParticipant.update({
                    where: {
                        tournamentId_userId: {
                            tournamentId: game.tournamentId,
                            userId: game.blackId
                        }
                    },
                    data: { score: { increment: 0.5 } }
                });
            }
        }

        return NextResponse.json(updatedGame);
    } catch (error) {
        console.error("Failed to make move:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

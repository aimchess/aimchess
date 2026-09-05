import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
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

        const { action } = await req.json();
        if (!action || !["OFFER", "ACCEPT", "DECLINE"].includes(action)) {
            return new NextResponse("Invalid action", { status: 400 });
        }

        const game = await prisma.game.findUnique({
            where: { id: params.gameId }
        });

        if (!game) {
            return new NextResponse("Game not found", { status: 404 });
        }

        if (game.status !== "IN_PROGRESS") {
            return new NextResponse("Game is already over", { status: 400 });
        }

        // Verify current user is a player in this game
        if (game.whiteId !== currentUser.id && game.blackId !== currentUser.id) {
            return new NextResponse("Not a player in this game", { status: 403 });
        }

        const isWhite = currentUser.id === game.whiteId;
        const opponentId = isWhite ? game.blackId : game.whiteId;

        if (action === "OFFER") {
            // If the opponent already offered, this is an automatic acceptance
            if (game.drawOfferedBy && game.drawOfferedBy === opponentId) {
                const updatedGame = await completeGame({
                    gameId: game.id,
                    winnerId: null,
                    result: "1/2-1/2",
                    status: "COMPLETED",
                    lastMoveAt: new Date()
                });
                await prisma.game.update({
                    where: { id: game.id },
                    data: { drawOfferedBy: null }
                });
                return NextResponse.json({
                    message: "Draw accepted",
                    game: updatedGame
                });
            }

            // Otherwise, record the draw offer
            const updatedGame = await prisma.game.update({
                where: { id: game.id },
                data: { drawOfferedBy: currentUser.id },
                include: {
                    white: { select: { id: true, name: true, email: true, role: true } },
                    black: { select: { id: true, name: true, email: true, role: true } }
                }
            });
            return NextResponse.json({
                message: "Draw offered",
                game: updatedGame
            });
        }

        if (action === "ACCEPT") {
            if (!game.drawOfferedBy || game.drawOfferedBy !== opponentId) {
                return new NextResponse("No draw offer to accept", { status: 400 });
            }

            const updatedGame = await completeGame({
                gameId: game.id,
                winnerId: null,
                result: "1/2-1/2",
                status: "COMPLETED",
                lastMoveAt: new Date()
            });

            await prisma.game.update({
                where: { id: game.id },
                data: { drawOfferedBy: null }
            });

            return NextResponse.json({
                message: "Draw accepted",
                game: updatedGame
            });
        }

        if (action === "DECLINE") {
            if (!game.drawOfferedBy || game.drawOfferedBy !== opponentId) {
                return new NextResponse("No draw offer to decline", { status: 400 });
            }

            const updatedGame = await prisma.game.update({
                where: { id: game.id },
                data: { drawOfferedBy: null },
                include: {
                    white: { select: { id: true, name: true, email: true, role: true } },
                    black: { select: { id: true, name: true, email: true, role: true } }
                }
            });

            return NextResponse.json({
                message: "Draw offer declined",
                game: updatedGame
            });
        }

        return new NextResponse("Invalid request", { status: 400 });
    } catch (error) {
        console.error("Failed to manage draw option:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

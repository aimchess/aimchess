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
        const winnerId = isWhite ? game.blackId : game.whiteId;
        const result = isWhite ? "0-1" : "1-0";

        const updatedGame = await completeGame({
            gameId: game.id,
            winnerId,
            result,
            status: "COMPLETED",
            lastMoveAt: new Date()
        });

        return NextResponse.json({
            message: "Resigned successfully",
            game: updatedGame
        });
    } catch (error) {
        console.error("Failed to resign game:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

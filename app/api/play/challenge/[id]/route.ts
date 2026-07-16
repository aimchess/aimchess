import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

        const { status } = await req.json(); // "ACCEPTED" or "DECLINED"

        const challenge = await prisma.challenge.findUnique({
            where: { id: params.id }
        });

        if (!challenge) {
            return new NextResponse("Challenge not found", { status: 404 });
        }

        if (challenge.challengedId !== currentUser.id) {
            return new NextResponse("Not authorized", { status: 403 });
        }

        if (status === "ACCEPTED") {
            // Create a Game
            const game = await prisma.game.create({
                data: {
                    whiteId: challenge.challengerId, // Challenger gets white for now, could randomize
                    blackId: challenge.challengedId,
                    status: "IN_PROGRESS",
                    tournamentId: challenge.tournamentId,
                    isRated: challenge.isRated
                }
            });

            const updatedChallenge = await prisma.challenge.update({
                where: { id: params.id },
                data: { status, gameId: game.id }
            });

            return NextResponse.json({ challenge: updatedChallenge, game });
        } else {
            const updatedChallenge = await prisma.challenge.update({
                where: { id: params.id },
                data: { status }
            });
            return NextResponse.json({ challenge: updatedChallenge });
        }

    } catch (error) {
        console.error("Failed to update challenge:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

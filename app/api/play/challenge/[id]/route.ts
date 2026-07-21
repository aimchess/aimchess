import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
            const tc = challenge.timeControl || "10+0";
            const parts = tc.split("+");
            const minutes = parseInt(parts[0]) || 10;
            const ms = minutes * 60 * 1000;

            // Randomize White and Black assignment
            const isChallengerWhite = Math.random() < 0.5;
            const whiteId = isChallengerWhite ? challenge.challengerId : challenge.challengedId;
            const blackId = isChallengerWhite ? challenge.challengedId : challenge.challengerId;

            // Create a Game
            const game = await prisma.game.create({
                data: {
                    whiteId: whiteId,
                    blackId: blackId,
                    status: "IN_PROGRESS",
                    tournamentId: challenge.tournamentId,
                    isRated: challenge.isRated,
                    timeControl: tc,
                    whiteTimeLeft: ms,
                    blackTimeLeft: ms,
                    lastMoveAt: new Date()
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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const tournament = await prisma.tournament.findUnique({
            where: { id: params.id }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        if (tournament.status !== "UPCOMING") {
            return NextResponse.json({ message: "Tournament is not open for joining" }, { status: 400 });
        }

        const existingParticipant = await prisma.tournamentParticipant.findUnique({
            where: {
                tournamentId_userId: {
                    tournamentId: params.id,
                    userId: currentUser.id
                }
            }
        });

        if (existingParticipant) {
            return NextResponse.json({ message: "Already joined" }, { status: 400 });
        }

        const participant = await prisma.tournamentParticipant.create({
            data: {
                tournamentId: params.id,
                userId: currentUser.id
            }
        });

        return NextResponse.json(participant);
    } catch (error) {
        console.error("Failed to join tournament:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

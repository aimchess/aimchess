import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

        const { challengedId, timeControl, tournamentId } = await req.json();

        if (!challengedId) {
            return new NextResponse("Challenged ID is required", { status: 400 });
        }

        // Check if there's already a pending challenge between these two
        const existingChallenge = await prisma.challenge.findFirst({
            where: {
                challengerId: currentUser.id,
                challengedId: challengedId,
                status: "PENDING"
            }
        });

        if (existingChallenge) {
            return NextResponse.json({ message: "Challenge already pending", challenge: existingChallenge });
        }

        const challenge = await prisma.challenge.create({
            data: {
                challengerId: currentUser.id,
                challengedId: challengedId,
                timeControl: timeControl || "10+0",
                status: "PENDING",
                tournamentId: tournamentId || null
            }
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error("Failed to create challenge:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

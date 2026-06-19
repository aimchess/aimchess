import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
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

        const pendingChallenges = await prisma.challenge.findMany({
            where: {
                challengedId: currentUser.id,
                status: "PENDING"
            },
            include: {
                challenger: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        stage: true
                    }
                }
            }
        });

        const activeGame = await prisma.game.findFirst({
            where: {
                OR: [{ whiteId: currentUser.id }, { blackId: currentUser.id }],
                status: "IN_PROGRESS"
            },
            select: { id: true }
        });

        return NextResponse.json({ pendingChallenges, activeGameId: activeGame?.id || null });
    } catch (error) {
        console.error("Failed to fetch pending challenges:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

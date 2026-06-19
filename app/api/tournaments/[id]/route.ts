import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const tournament = await prisma.tournament.findUnique({
            where: { id: params.id },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, lastActiveAt: true } }
                    },
                    orderBy: {
                        score: 'desc'
                    }
                }
            }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error("Failed to fetch tournament details:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: { gameId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const game = await prisma.game.findUnique({
            where: { id: params.gameId },
            include: {
                white: { select: { id: true, name: true, role: true } },
                black: { select: { id: true, name: true, role: true } }
            }
        });

        if (!game) {
            return new NextResponse("Game not found", { status: 404 });
        }

        return NextResponse.json(game);
    } catch (error) {
        console.error("Failed to fetch game:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

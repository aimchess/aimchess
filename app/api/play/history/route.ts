import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const games = await prisma.game.findMany({
            where: {
                OR: [
                    { whiteId: user.id },
                    { blackId: user.id }
                ]
            },
            include: {
                white: { select: { id: true, name: true, email: true } },
                black: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(games);
    } catch (error) {
        console.error("Failed to fetch game history:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

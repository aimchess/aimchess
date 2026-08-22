import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

        const body = await req.json();
        const { difficulty, playAs } = body; // "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT", playAs: "white" | "black" | "random"

        // Find or create the system Bot user
        let botUser = await prisma.user.findUnique({
            where: { email: "bot@aimchess.com" }
        });

        if (!botUser) {
            botUser = await prisma.user.create({
                data: {
                    email: "bot@aimchess.com",
                    name: "AIM Chess Bot",
                    password: "bot-system-password-123",
                    role: "COACH",
                    aimRating: 1200
                }
            });
        }

        let userColor = playAs || "white";
        if (userColor === "random") {
            userColor = Math.random() < 0.5 ? "white" : "black";
        }

        const whiteId = userColor === "white" ? currentUser.id : botUser.id;
        const blackId = userColor === "white" ? botUser.id : currentUser.id;

        const game = await prisma.game.create({
            data: {
                whiteId,
                blackId,
                status: "IN_PROGRESS",
                isRated: false,
                isBot: true,
                botDifficulty: difficulty,
                timeControl: "10+0",
                whiteTimeLeft: 600000,
                blackTimeLeft: 600000,
                lastMoveAt: new Date()
            }
        });

        return NextResponse.json(game);
    } catch (error) {
        console.error("Bot game start error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

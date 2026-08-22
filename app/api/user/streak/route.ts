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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        
        let currentStreak = user.currentStreak;
        let bestStreak = user.bestStreak;
        let lastActiveDate = user.lastActiveDate;

        if (lastActiveDate) {
            const lastActiveStr = new Date(lastActiveDate).toISOString().split("T")[0];
            
            if (lastActiveStr === todayStr) {
                // Already updated today
                return NextResponse.json({ currentStreak, bestStreak, updated: false });
            }
            
            // Check if last active was yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastActiveStr === yesterdayStr) {
                currentStreak += 1;
            } else {
                currentStreak = 1; // Broke streak, reset to 1
            }
        } else {
            currentStreak = 1; // First active day
        }

        bestStreak = Math.max(bestStreak, currentStreak);

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                currentStreak,
                bestStreak,
                lastActiveDate: now
            }
        });

        return NextResponse.json({ currentStreak: updated.currentStreak, bestStreak: updated.bestStreak, updated: true });
    } catch (error) {
        console.error("Streak POST error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

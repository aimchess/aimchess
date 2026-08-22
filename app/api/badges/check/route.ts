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
            where: { email: session.user.email },
            include: {
                performanceReports: true
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const earnedBadgeTypes = new Set<string>();

        // 1. Homework Hero / Assignment Champion
        const totalAssignments = await prisma.assignment.count({ where: { studentId: user.id } });
        const completedAssignments = await prisma.assignment.count({ where: { studentId: user.id, isCompleted: true } });
        if (totalAssignments > 0 && completedAssignments === totalAssignments) {
            earnedBadgeTypes.add("HOMEWORK_HERO");
            earnedBadgeTypes.add("ASSIGNMENT_CHAMPION");
        }

        // 2. Puzzle Master
        const solvedPuzzles = await prisma.progress.count({ where: { studentId: user.id, isSolved: true } });
        const solvedMCQs = await prisma.mCQProgress.count({ where: { studentId: user.id, isCorrect: true } });
        const totalSolved = solvedPuzzles + solvedMCQs;
        if (totalSolved >= 10) {
            earnedBadgeTypes.add("PUZZLE_MASTER");
        }

        // 3. Tournament Warrior
        const tournamentParticipations = await prisma.tournamentParticipant.count({ where: { userId: user.id } });
        if (tournamentParticipations >= 2) {
            earnedBadgeTypes.add("TOURNAMENT_WARRIOR");
        }

        // 4. 100% Attendance
        const attendance = await prisma.attendance.findMany({
            where: { studentId: user.id }
        });
        if (attendance.length > 0) {
            const hasAbsence = attendance.some((a: any) => a.status === "ABSENT");
            if (!hasAbsence) {
                earnedBadgeTypes.add("ATTENDANCE_100");
            }
        }

        // 5. Monthly Gold Star
        const hasGoldReport = user.performanceReports.some((r: any) => r.award === "Gold Star Player");
        if (hasGoldReport) {
            earnedBadgeTypes.add("GOLD_STAR");
        }

        // 6. AIM Club Member
        if (user.aimRating >= 600) {
            earnedBadgeTypes.add("CLUB_MEMBER");
        }

        // 7. Winning Streak (3+ wins in a row)
        const games = await prisma.game.findMany({
            where: {
                OR: [
                    { whiteId: user.id },
                    { blackId: user.id }
                ],
                status: "COMPLETED"
            },
            orderBy: { createdAt: "desc" }
        });
        
        let streak = 0;
        let maxStreak = 0;
        for (const game of games) {
            if (game.winnerId === user.id) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else {
                streak = 0;
            }
        }
        if (maxStreak >= 3) {
            earnedBadgeTypes.add("WINNING_STREAK");
        }

        // Upsert earned badges in DB
        const badgePromises = Array.from(earnedBadgeTypes).map(badgeType =>
            prisma.earnedBadge.upsert({
                where: {
                    userId_badgeType: {
                        userId: user.id,
                        badgeType
                    }
                },
                update: {},
                create: {
                    userId: user.id,
                    badgeType
                }
            })
        );
        
        await Promise.all(badgePromises);

        const allBadges = await prisma.earnedBadge.findMany({
            where: { userId: user.id }
        });

        return NextResponse.json(allBadges);

    } catch (error) {
        console.error("Badges check error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

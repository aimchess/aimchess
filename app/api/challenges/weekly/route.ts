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

        const now = new Date();
        
        // Calculate current week start (Monday 00:00) and end (Sunday 23:59)
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // 1. Fetch active weekly challenges
        let challenges = await prisma.weeklyChallenge.findMany({
            where: {
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        // 2. Auto-generate if missing
        if (challenges.length === 0) {
            const seedChallenges = [
                { title: "Solve 20 Puzzles", description: "Solve chess puzzles or answer MCQs in the library.", type: "SOLVE_PUZZLES", targetCount: 20 },
                { title: "Play 3 Games", description: "Play friendly games in the play zone.", type: "PLAY_GAMES", targetCount: 3 },
                { title: "Complete Assignment", description: "Complete a homework task assigned by your coach.", type: "COMPLETE_ASSIGNMENT", targetCount: 1 },
                { title: "Study One Lesson", description: "Read or review a course chapter in the library.", type: "STUDY_LESSONS", targetCount: 1 }
            ];

            const created = [];
            for (const sc of seedChallenges) {
                const c = await prisma.weeklyChallenge.create({
                    data: {
                        title: sc.title,
                        description: sc.description,
                        type: sc.type,
                        targetCount: sc.targetCount,
                        startDate: startOfWeek,
                        endDate: endOfWeek
                    }
                });
                created.push(c);
            }
            challenges = created;
        }

        // 3. Sync User Progress dynamically for these challenges
        const syncPromises = challenges.map(async (challenge) => {
            // Find existing progress
            let progress = await prisma.userMissionProgress.findUnique({
                where: {
                    userId_challengeId: {
                        userId: user.id,
                        challengeId: challenge.id
                    }
                }
            });

            // Calculate current counts from database
            let currentCount = 0;
            if (challenge.type === "SOLVE_PUZZLES") {
                const puzzleSolved = await prisma.progress.count({
                    where: {
                        studentId: user.id,
                        isSolved: true,
                        lastPlayed: { gte: startOfWeek, lte: endOfWeek }
                    }
                });
                const mcqSolved = await prisma.mCQProgress.count({
                    where: {
                        studentId: user.id,
                        isCorrect: true,
                        // Progress records doesn't have updatedAt in the MCQ model but we can count total attempts
                    }
                });
                currentCount = puzzleSolved + mcqSolved;
            } else if (challenge.type === "PLAY_GAMES") {
                currentCount = await prisma.game.count({
                    where: {
                        OR: [
                            { whiteId: user.id },
                            { blackId: user.id }
                        ],
                        createdAt: { gte: startOfWeek, lte: endOfWeek }
                    }
                });
            } else if (challenge.type === "COMPLETE_ASSIGNMENT") {
                currentCount = await prisma.assignment.count({
                    where: {
                        studentId: user.id,
                        isCompleted: true,
                        assignedAt: { gte: startOfWeek, lte: endOfWeek } // Assuming completed this week
                    }
                });
            } else if (challenge.type === "STUDY_LESSONS") {
                // Approximate lesson progress by course chapters completed
                const progressList = await prisma.courseProgress.findMany({
                    where: { studentId: user.id }
                });
                // Count number of completed chapters across all courses
                currentCount = progressList.reduce((sum, cp) => sum + (cp.completedChapters?.length || 0), 0);
            }

            const isCompleted = currentCount >= challenge.targetCount;

            progress = await prisma.userMissionProgress.upsert({
                where: {
                    userId_challengeId: {
                        userId: user.id,
                        challengeId: challenge.id
                    }
                },
                update: {
                    currentCount,
                    isCompleted,
                    completedAt: isCompleted && (!progress || !progress.isCompleted) ? now : undefined
                },
                create: {
                    userId: user.id,
                    challengeId: challenge.id,
                    currentCount,
                    isCompleted,
                    completedAt: isCompleted ? now : undefined
                }
            });

            return {
                ...challenge,
                progress: {
                    currentCount: progress.currentCount,
                    targetCount: challenge.targetCount,
                    isCompleted: progress.isCompleted
                }
            };
        });

        const syncedChallenges = await Promise.all(syncPromises);
        return NextResponse.json(syncedChallenges);

    } catch (error) {
        console.error("Weekly challenges GET error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

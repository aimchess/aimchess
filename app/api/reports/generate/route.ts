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

        // Only ADMIN can generate reports
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (currentUser?.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { month, year } = await req.json();

        if (!month || !year) {
            return new NextResponse("Month and year required", { status: 400 });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Fetch all students
        const students = await prisma.user.findMany({
            where: { role: "STUDENT" }
        });

        const generatedReports = [];

        for (const student of students) {
            // Calculate Attendance Points (Max 40)
            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    studentId: student.id,
                    date: { gte: startDate, lte: endDate }
                }
            });

            const totalClasses = attendanceRecords.length;
            // Count PRESENT and LATE both as attended (LATE = came but late)
            const presentClasses = attendanceRecords.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
            // 10 pts per class attended, max 40 pts (4 classes)
            const attendancePoints = Math.min(presentClasses * 10, 40);

            // Calculate Homework Points (Max 20)
            // Assuming assignments assigned in this month
            const homeworks = await prisma.assignment.findMany({
                where: {
                    studentId: student.id,
                    assignedAt: { gte: startDate, lte: endDate }
                }
            });

            const totalHomeworks = homeworks.length;
            const completedHomeworks = homeworks.filter(h => h.isCompleted).length;
            const homeworkPoints = totalHomeworks > 0 ? Math.round((completedHomeworks / totalHomeworks) * 20) : 0;

            // Calculate Assignment Points (Max 20)
            // For now, we'll map this to MCQProgress or a similar proxy if there are no explicit "Monthly Assignments".
            // We'll give 20 if they completed at least 5 puzzles/mcqs this month.
            const puzzleProgress = await prisma.progress.count({
                where: {
                    studentId: student.id,
                    lastPlayed: { gte: startDate, lte: endDate },
                    isSolved: true
                }
            });
            const assignmentPoints = Math.min(20, puzzleProgress * 4); // 5 puzzles = 20 pts

            // Calculate Tournament Points (Max 20)
            const tournaments = await prisma.tournamentParticipant.count({
                where: {
                    userId: student.id,
                    joinedAt: { gte: startDate, lte: endDate }
                }
            });
            const tournamentPoints = Math.min(20, tournaments * 10); // 2 tournaments = 20 pts

            const totalPoints = attendancePoints + homeworkPoints + assignmentPoints + tournamentPoints;

            let award = null;
            if (totalPoints >= 90) award = "Gold Star Player";
            else if (totalPoints >= 80) award = "Silver Star Player";
            else if (totalPoints >= 70) award = "Bronze Star Player";

            // Upsert report
            const report = await prisma.performanceReport.upsert({
                where: {
                    studentId_month_year: {
                        studentId: student.id,
                        month,
                        year
                    }
                },
                update: {
                    attendancePoints,
                    homeworkPoints,
                    assignmentPoints,
                    tournamentPoints,
                    totalPoints,
                    award
                },
                create: {
                    studentId: student.id,
                    month,
                    year,
                    attendancePoints,
                    homeworkPoints,
                    assignmentPoints,
                    tournamentPoints,
                    totalPoints,
                    award
                }
            });

            generatedReports.push(report);
        }

        return NextResponse.json({ success: true, count: generatedReports.length });
    } catch (error) {
        console.error("Failed to generate reports:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

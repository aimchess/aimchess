import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Fetch reports with filters
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get("month") || "0");
        const year = parseInt(searchParams.get("year") || "0");
        const studentId = searchParams.get("studentId");

        const where: any = {};
        if (month) where.month = month;
        if (year) where.year = year;
        if (studentId) where.studentId = studentId;

        // If STUDENT, they can only fetch their own reports
        if ((session.user as any).role === "STUDENT") {
            where.studentId = (session.user as any).id;
        }

        const reports = await prisma.performanceReport.findMany({
            where,
            include: {
                student: {
                    select: { 
                        id: true,
                        name: true, 
                        email: true, 
                        stage: true, 
                        aimRating: true,
                        lichessUsername: true, 
                        lichessRapid: true, 
                        aimClub: true, 
                        aimLevel: true,
                        joiningDate: true
                    }
                }
            },
            orderBy: {
                totalPoints: 'desc'
            }
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Save or Update monthly report comments and scores
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "COACH")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            studentId,
            month,
            year,
            studentProgress,
            strengths,
            weaknesses,
            behavior,
            nextMonthFocus,
            recommendation,
            attendancePoints,
            homeworkPoints,
            assignmentPoints,
            tournamentPoints,
            award
        } = body;

        if (!studentId || !month || !year) {
            return new NextResponse("Missing required fields: studentId, month, year", { status: 400 });
        }

        const parsedMonth = parseInt(String(month));
        const parsedYear = parseInt(String(year));

        const attPoints = attendancePoints !== undefined ? parseFloat(String(attendancePoints)) : 0;
        const hwPoints = homeworkPoints !== undefined ? parseFloat(String(homeworkPoints)) : 0;
        const assignPoints = assignmentPoints !== undefined ? parseFloat(String(assignmentPoints)) : 0;
        const tournPoints = tournamentPoints !== undefined ? parseFloat(String(tournamentPoints)) : 0;

        const totalPoints = attPoints + hwPoints + assignPoints + tournPoints;

        // Auto award calculation if not provided
        let calcAward = award;
        if (!calcAward) {
            if (totalPoints >= 90) calcAward = "Gold Star Player";
            else if (totalPoints >= 80) calcAward = "Silver Star Player";
            else if (totalPoints >= 70) calcAward = "Bronze Star Player";
            else calcAward = "Participant";
        }

        const report = await prisma.performanceReport.upsert({
            where: {
                studentId_month_year: {
                    studentId,
                    month: parsedMonth,
                    year: parsedYear
                }
            },
            update: {
                attendancePoints: attPoints,
                homeworkPoints: hwPoints,
                assignmentPoints: assignPoints,
                tournamentPoints: tournPoints,
                totalPoints,
                award: calcAward,
                studentProgress: studentProgress || null,
                strengths: strengths || null,
                weaknesses: weaknesses || null,
                behavior: behavior || null,
                nextMonthFocus: nextMonthFocus || null,
                recommendation: recommendation || null
            },
            create: {
                studentId,
                month: parsedMonth,
                year: parsedYear,
                attendancePoints: attPoints,
                homeworkPoints: hwPoints,
                assignmentPoints: assignPoints,
                tournamentPoints: tournPoints,
                totalPoints,
                award: calcAward,
                studentProgress: studentProgress || null,
                strengths: strengths || null,
                weaknesses: weaknesses || null,
                behavior: behavior || null,
                nextMonthFocus: nextMonthFocus || null,
                recommendation: recommendation || null
            }
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Failed to save report:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

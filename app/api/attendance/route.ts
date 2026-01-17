import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch attendance for a specific class and date
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const classTimingId = searchParams.get("classTimingId");
        const dateStr = searchParams.get("date"); // YYYY-MM-DD

        if (!classTimingId || !dateStr) {
            return NextResponse.json({ error: "classTimingId and date are required" }, { status: 400 });
        }

        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                classTimingId,
                date: {
                    equals: date
                }
            },
            include: {
                student: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error("Attendance GET error:", error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}

// POST: Mark attendance for multiple students
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COACH')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { classTimingId, date: dateStr, records } = await req.json();

        if (!classTimingId || !dateStr || !Array.isArray(records)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        // Use a transaction to ensure all records are updated correctly
        const results = await prisma.$transaction(
            records.map((record: any) =>
                prisma.attendance.upsert({
                    where: {
                        studentId_classTimingId_date: {
                            studentId: record.studentId,
                            classTimingId,
                            date
                        }
                    },
                    update: {
                        status: record.status,
                        remarks: record.remarks
                    },
                    create: {
                        studentId: record.studentId,
                        classTimingId,
                        date,
                        status: record.status,
                        remarks: record.remarks
                    }
                })
            )
        );

        return NextResponse.json({ message: "Attendance marked successfully", count: results.length });
    } catch (error) {
        console.error("Attendance POST error:", error);
        return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
    }
}

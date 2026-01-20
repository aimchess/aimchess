import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch classes (filterable by coachId)
// app/api/classes/route.ts

// export async function GET(req: Request) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const coachId = searchParams.get("coachId");
//         const studentId = searchParams.get("studentId"); // Add this

//         const where: any = {};
//         if (coachId) where.coachId = coachId;
        
//         // Add this: If studentId is provided, only find classes where this student is enrolled
//         if (studentId) {
//             where.students = {
//                 some: { id: studentId }
//             };
//         }

//         const classes = await prisma.classTiming.findMany({
//             where,
//             include: {
//                 coach: { select: { id: true, name: true } },
//                 // Add this: include the student objects (or at least their IDs)
//                 students: { select: { id: true } }, 
//                 _count: { select: { students: true } }
//             },
//             orderBy: { createdAt: 'desc' }
//         });

//         return NextResponse.json(classes);
//     } catch (error) {
//         console.error("Classes GET error:", error);
//         return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
//     }
// }
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const coachId = searchParams.get("coachId");
        const studentId = searchParams.get("studentId");

        const where: any = {};
        if (coachId) where.coachId = coachId;
        
        if (studentId) {
            where.students = {
                some: { id: studentId }
            };
        }

        const classes = await prisma.classTiming.findMany({
            where,
            include: {
                coach: { select: { id: true, name: true } },
                // FIX: Add name and email to the select object
                students: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true 
                    } 
                }, 
                _count: { select: { students: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(classes);
    } catch (error) {
        console.error("Classes GET error:", error);
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}

// POST: Create a new class timing
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COACH')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, dayOfWeek, startTime, endTime, coachId, meetingLink } = await req.json();

        if (!name || !dayOfWeek || !startTime || !endTime || !coachId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newClass = await prisma.classTiming.create({
            data: {
                name,
                dayOfWeek,
                startTime,
                endTime,
                coachId,
                meetingLink
            }
        });

        return NextResponse.json(newClass);
    } catch (error) {
        console.error("Classes POST error:", error);
        return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
    }
}

// PUT: Update a class timing or enroll/unenroll students
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COACH')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, dayOfWeek, startTime, endTime, coachId, studentIds, meetingLink } = body;

        if (!id) {
            return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (dayOfWeek) updateData.dayOfWeek = dayOfWeek;
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (coachId) updateData.coachId = coachId;
        if (meetingLink !== undefined) updateData.meetingLink = meetingLink;

        if (studentIds) {
            updateData.students = {
                set: studentIds.map((sid: string) => ({ id: sid }))
            };
        }

        const updatedClass = await prisma.classTiming.update({
            where: { id },
            data: updateData,
            include: {
                students: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json(updatedClass);
    } catch (error) {
        console.error("Classes PUT error:", error);
        return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
    }
}

// DELETE: Remove a class timing
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
        }

        await prisma.classTiming.delete({ where: { id } });

        return NextResponse.json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error("Classes DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
    }
}

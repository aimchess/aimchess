import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ---------------------------------------------
// POST – Assign puzzle(s), MCQ(s) or Folder to a student
// ---------------------------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, itemId, type, puzzleId, dueDate, audioUrl } = body;

    const targetId = itemId || puzzleId;
    const targetType = type || 'PUZZLE';

    if (!studentId || !targetId) {
      return NextResponse.json({ error: "studentId and ID are required" }, { status: 400 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole !== "ADMIN" && userRole !== "COACH") {
      return NextResponse.json({ error: "Only coaches or admins can assign content" }, { status: 403 });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Invalid student" }, { status: 404 });
    }

    if (targetType === 'FOLDER') {
      const [puzzles, mcqs] = await Promise.all([
        prisma.puzzle.findMany({ where: { folderId: targetId }, select: { id: true } }),
        prisma.mCQ.findMany({ where: { folderId: targetId }, select: { id: true } })
      ]);

      if (puzzles.length === 0 && mcqs.length === 0) {
        return NextResponse.json({ message: "Folder is empty", count: 0 });
      }

      const assignmentsData = [
        ...puzzles.map((p: any) => ({
          studentId,
          puzzleId: p.id,
          assignedBy: userId,
          assignedAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          audioUrl: audioUrl || null
        })),
        ...mcqs.map((m: any) => ({
          studentId,
          mcqId: m.id,
          assignedBy: userId,
          assignedAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          audioUrl: audioUrl || null
        }))
      ];

      const result = await prisma.assignment.createMany({
        data: assignmentsData,
        skipDuplicates: true
      });

      return NextResponse.json({ message: "Folder assigned successfully", count: result.count });
    } else if (targetType === 'MCQ') {
      const mcq = await prisma.mCQ.findUnique({ where: { id: targetId } });
      if (!mcq) return NextResponse.json({ error: "MCQ not found" }, { status: 404 });

      const alreadyAssigned = await prisma.assignment.findFirst({
        where: { studentId, mcqId: targetId }
      });
      if (alreadyAssigned) return NextResponse.json({ error: "Already assigned" }, { status: 409 });

      const assignment = await prisma.assignment.create({
        data: {
          studentId,
          mcqId: targetId,
          assignedBy: userId,
          assignedAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          audioUrl: audioUrl || null
        }
      });
      return NextResponse.json(assignment);
    } else {
      const puzzle = await prisma.puzzle.findUnique({ where: { id: targetId } });
      if (!puzzle) return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });

      const alreadyAssigned = await prisma.assignment.findFirst({
        where: { studentId, puzzleId: targetId }
      });
      if (alreadyAssigned) return NextResponse.json({ error: "Already assigned" }, { status: 409 });

      const assignment = await prisma.assignment.create({
        data: {
          studentId,
          puzzleId: targetId,
          assignedBy: userId,
          assignedAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          audioUrl: audioUrl || null
        }
      });
      return NextResponse.json(assignment);
    }
  } catch (e) {
    console.error("Assignment POST error:", e);
    return NextResponse.json({ error: "Failed to assign homework" }, { status: 500 });
  }
}

// ---------------------------------------------
// GET – Get assignments for a specific student
// ---------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

    const assignments = await prisma.assignment.findMany({
      where: { studentId },
      include: {
        puzzle: true,
        mcq: true
      },
      orderBy: { assignedAt: "desc" }
    });
    return NextResponse.json(assignments);
  } catch (e) {
    console.error("Assignment GET error:", e);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }
}
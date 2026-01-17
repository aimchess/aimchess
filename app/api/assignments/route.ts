import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ---------------------------------------------
// POST – Assign puzzle(s) or Folder to a student
// ---------------------------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get input. Supports both new 'itemId/type' and legacy 'puzzleId'
    const body = await req.json();
    const { studentId, itemId, type, puzzleId, dueDate, audioUrl } = body;

    const targetId = itemId || puzzleId;
    const targetType = type || 'PUZZLE'; // Default to single puzzle

    // 1. Validate Input
    if (!studentId || !targetId) {
      return NextResponse.json(
        { error: "studentId and ID are required" },
        { status: 400 }
      );
    }

    // 2. Authorization Check
    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id; // We use ID to satisfy UUID column requirements

    if (userRole !== "ADMIN" && userRole !== "COACH") {
      return NextResponse.json(
        { error: "Only coaches or admins can assign puzzles" },
        { status: 403 }
      );
    }

    // 3. Verify Student
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Invalid student" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // SCENARIO A: BULK ASSIGN FOLDER
    // ---------------------------------------------------------
    if (targetType === 'FOLDER') {
      // Find all puzzles in this folder
      const puzzlesInFolder = await prisma.puzzle.findMany({
        where: { folderId: targetId },
        select: { id: true }
      });

      if (puzzlesInFolder.length === 0) {
        return NextResponse.json({ message: "Folder is empty", count: 0 });
      }

      // FIX: Use 'userId' (UUID) for assignedBy, not email
      const assignmentsData = puzzlesInFolder.map((p: any) => ({
        studentId,
        puzzleId: p.id,
        assignedBy: userId, // Must be UUID if DB column is UUID
        assignedAt: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        audioUrl: audioUrl || null
      }));

      // Bulk Insert
      const result = await prisma.assignment.createMany({
        data: assignmentsData,
        skipDuplicates: true
      });

      return NextResponse.json({
        message: "Folder assigned successfully",
        count: result.count
      });
    }

    // ---------------------------------------------------------
    // SCENARIO B: SINGLE PUZZLE ASSIGNMENT
    // ---------------------------------------------------------
    else {
      // Check puzzle exists
      const puzzle = await prisma.puzzle.findUnique({ where: { id: targetId } });
      if (!puzzle) {
        return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
      }

      // Check duplicate
      const alreadyAssigned = await prisma.assignment.findFirst({
        where: { studentId, puzzleId: targetId }
      });

      if (alreadyAssigned) {
        return NextResponse.json(
          { error: "This puzzle is already assigned" },
          { status: 409 }
        );
      }

      // Create Assignment
      const assignment = await prisma.assignment.create({
        data: {
          studentId,
          puzzleId: targetId,
          assignedBy: userId, // FIX: Use UUID
          assignedAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          audioUrl: audioUrl || null
        }
      });

      return NextResponse.json(assignment);
    }

  } catch (e) {
    console.error("Assignment POST error:", e);
    return NextResponse.json(
      { error: "Failed to assign homework. Check server logs." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------
// GET – Get assignments for a specific student
// ---------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID required" },
        { status: 400 }
      );
    }

    const assignments = await prisma.assignment.findMany({
      where: { studentId },
      include: {
        puzzle: true
      },
      orderBy: { assignedAt: "desc" }
    });

    return NextResponse.json(assignments);

  } catch (e) {
    console.error("Assignment GET error:", e);
    return NextResponse.json(
      { error: "Failed to load assignments" },
      { status: 500 }
    );
  }
}
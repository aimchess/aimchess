import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId, puzzleId, isCorrect, wrongMove } = await req.json();

    if (!studentId || !puzzleId) {
      return NextResponse.json(
        { error: "Missing studentId or puzzleId" },
        { status: 400 }
      );
    }

    // 1. Fetch existing progress if it exists
    const existing = await prisma.progress.findUnique({
      where: { studentId_puzzleId: { studentId, puzzleId } }
    });

    // Prepare mistake list
    let mistakesList: string[] = existing?.mistakes ? [...(existing.mistakes as string[])] : [];

    if (wrongMove && typeof wrongMove === "string") {
      mistakesList.push(wrongMove);
    }

    // 2. Upsert progress stats
    const progress = await prisma.progress.upsert({
      where: { studentId_puzzleId: { studentId, puzzleId } },
      update: {
        isSolved: isCorrect ? true : existing?.isSolved ?? false,
        attempts: { increment: 1 },
        mistakes: mistakesList,
        lastPlayed: new Date()
      },
      create: {
        studentId,
        puzzleId,
        isSolved: !!isCorrect,
        attempts: 1,
        mistakes: wrongMove ? [wrongMove] : []
      }
    });

    // 3. Mark assignment completed if solved (only if due date hasn't passed)
    if (isCorrect) {
      const assignments = await prisma.assignment.findMany({
        where: { studentId, puzzleId, isCompleted: false }
      });

      for (const assignment of assignments) {
        if (!assignment.dueDate || new Date() <= new Date(assignment.dueDate)) {
          await prisma.assignment.update({
            where: { id: assignment.id },
            data: { isCompleted: true }
          });
        }
      }
    }

    return NextResponse.json(progress);

  } catch (error) {
    console.error("Progress Error:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing studentId" },
        { status: 400 }
      );
    }

    const [puzzleProgress, mcqProgress] = await Promise.all([
      prisma.progress.findMany({
        where: { studentId },
        include: { puzzle: true },
        orderBy: { lastPlayed: "desc" }
      }),
      prisma.mCQProgress.findMany({
        where: { studentId },
        include: { mcq: true },
        orderBy: { id: "desc" } // MCQProgress doesn't have lastPlayed yet, but we can add it or use id
      })
    ]);

    // Combine and sort by date if possible
    const combined = [
      ...puzzleProgress.map((p: any) => ({ ...p, type: 'PUZZLE' })),
      ...mcqProgress.map((m: any) => ({ ...m, type: 'MCQ', isSolved: m.isCorrect, puzzle: { title: m.mcq.question } }))
    ].sort((a: any, b: any) => {
      const dateA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
      const dateB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(combined);

  } catch (error) {
    console.error("Progress Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 }
    );
  }
}

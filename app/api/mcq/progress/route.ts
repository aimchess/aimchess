import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId, mcqId, isCorrect } = await req.json();

    if (!studentId || !mcqId) {
      return NextResponse.json(
        { error: "Missing studentId or mcqId" },
        { status: 400 }
      );
    }

    const progress = await prisma.mCQProgress.upsert({
      where: {
        studentId_mcqId: { studentId, mcqId },
      },
      update: {
        isCorrect,
        attempts: { increment: 1 },
      },
      create: {
        studentId,
        mcqId,
        isCorrect,
        attempts: 1,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("MCQ Progress Error:", error);
    return NextResponse.json(
      { error: "Failed to save MCQ progress" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    const progress = await prisma.mCQProgress.findMany({
      where: { studentId },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("MCQ Progress Fetch Error:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}

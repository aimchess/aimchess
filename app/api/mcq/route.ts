import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const folderId = searchParams.get("folderId");

    const where: any = {};
    if (folderId) where.folderId = folderId;
    if (stage) where.stage = stage;

    const mcqs = await prisma.mCQ.findMany({
      where,
      include: { folder: true },
    });

    return NextResponse.json(mcqs);
  } catch (error) {
    console.error("GET /api/mcq error:", error);
    return NextResponse.json({ error: "Failed to fetch MCQs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { position, question, options, correctOptions, folderId, stage, explanation, puzzleId } = body;

    if (!position || !question || !options || !correctOptions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const mcq = await prisma.mCQ.create({
      data: {
        position,
        question,
        options,
        correctOptions,
        folderId,
        stage: stage || "BEGINNER",
        explanation,
        puzzleId,
      },
    });

    return NextResponse.json(mcq);
  } catch (error) {
    console.error("POST /api/mcq error:", error);
    return NextResponse.json({ error: "Failed to create MCQ" }, { status: 500 });
  }
}

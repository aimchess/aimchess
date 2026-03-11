import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const mcq = await prisma.mCQ.findUnique({
      where: { id: params.id },
    });

    if (!mcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
    }

    return NextResponse.json(mcq);
  } catch (error) {
    console.error("GET /api/mcq/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch MCQ" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { position, question, options, correctOptions, folderId, stage, explanation, puzzleId } = body;

    const mcq = await prisma.mCQ.update({
      where: { id: params.id },
      data: {
        position,
        question,
        options,
        correctOptions,
        folderId,
        stage,
        explanation,
        puzzleId,
      },
    });

    return NextResponse.json(mcq);
  } catch (error) {
    console.error("PUT /api/mcq/[id] error:", error);
    return NextResponse.json({ error: "Failed to update MCQ" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.mCQ.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "MCQ deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/mcq/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete MCQ" }, { status: 500 });
  }
}

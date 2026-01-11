import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, fen, solution, category, folderId } = body;

    // Validation
    if (!title || !fen || !solution || !folderId) {
      return NextResponse.json(
        { error: "title, fen, solution, and folderId are required" },
        { status: 400 }
      );
    }

    const puzzle = await prisma.puzzle.create({
      data: {
        title,
        fen,
        solution,
        category: category || null, // optional
        folderId,
      },
    });

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error("Puzzle Create Error:", error);
    return NextResponse.json(
      { error: "Failed to create puzzle" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/content/next?folderId=xxx&currentId=yyy
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const currentId = searchParams.get("currentId");

    if (!folderId || !currentId) {
      return NextResponse.json(
        { error: "folderId and currentId are required" },
        { status: 400 }
      );
    }

    // All puzzles in this folder, ordered by title (or id)
    const puzzles = await prisma.puzzle.findMany({
      where: {
        folderId,
      },
      orderBy: {
        title: "asc", // or id: "asc"
      },
      select: {
        id: true,
      },
    });

    if (!puzzles.length) {
      return NextResponse.json({ id: null });
    }

    const index = puzzles.findIndex((p: { id: string }) => p.id === currentId);

    if (index === -1) {
      return NextResponse.json({ id: null });
    }

    const nextPuzzle = puzzles[index + 1];

    return NextResponse.json({
      id: nextPuzzle ? nextPuzzle.id : null,
    });
  } catch (error) {
    console.error("Error fetching next folder puzzle:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

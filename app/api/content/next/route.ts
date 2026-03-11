import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/content/next?folderId=xxx&currentId=yyy
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const currentId = searchParams.get("currentId");
    const type = searchParams.get("type") || "PUZZLE"; // PUZZLE or MCQ

    if (!folderId || !currentId) {
      return NextResponse.json(
        { error: "folderId and currentId are required" },
        { status: 400 }
      );
    }

    let items: any[] = [];

    if (type === "MCQ") {
      items = await prisma.mCQ.findMany({
        where: { folderId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
    } else {
      items = await prisma.puzzle.findMany({
        where: { folderId },
        orderBy: { title: "asc" },
        select: { id: true },
      });
    }

    if (!items.length) {
      return NextResponse.json({ id: null });
    }

    const index = items.findIndex((p: { id: string }) => p.id === currentId);

    if (index === -1) {
      return NextResponse.json({ id: null });
    }

    const nextItem = items[index + 1];

    return NextResponse.json({
      id: nextItem ? nextItem.id : null,
    });
  } catch (error) {
    console.error("Error fetching next item:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const stage = searchParams.get("stage");

    const whereClause: any = {};

    // If inside a specific folder
    if (parentId && parentId !== "root") {
      whereClause.parentId = parentId;
    }
    // If browsing a stage root (Beginner / Intermediate / Advanced)
    else if (stage) {
      whereClause.stage = stage;
      whereClause.parentId = null;
    }

    const folders = await prisma.folder.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { children: true, puzzles: true },
        },
      },
    });

    // Load puzzles only inside a real folder
    const puzzles =
      parentId && parentId !== "root"
        ? await prisma.puzzle.findMany({
            where: { folderId: parentId },
          })
        : [];

    return NextResponse.json({ folders, puzzles });
  } catch (error) {
    console.error("GET /folders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders or puzzles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // parentId === "" should be treated as null
    const parentId =
      body.parentId && body.parentId.trim() !== "" ? body.parentId : null;

    const folder = await prisma.folder.create({
      data: {
        name: body.name,
        stage: parentId ? null : body.stage || null, // stage only applies to root folders
        parentId,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("POST /folders error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}

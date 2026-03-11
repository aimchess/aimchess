import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. GET: Fetch Folders and Puzzles
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const parentId = searchParams.get("parentId");

    // --- FETCH FOLDERS ---
    const whereClause: any = {};

    if (parentId && parentId !== "root") {
      // Subfolders
      whereClause.parentId = parentId;
    } else if (stage) {
      // Root folders within a stage
      whereClause.stage = stage;
      whereClause.parentId = null;
    }

    const folders = await prisma.folder.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    // --- FETCH PUZZLES ---
    let puzzles = [];
    let mcqs = [];
    // Only fetch puzzles and mcqs if we are inside a specific folder (parentId exists)
    if (parentId && parentId !== "root") {
      puzzles = await prisma.puzzle.findMany({
        where: { folderId: parentId },
        orderBy: { title: "asc" },
      });
      mcqs = await prisma.mCQ.findMany({
        where: { folderId: parentId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ folders, puzzles, mcqs });
  } catch (error) {
    console.error("GET /content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// 2. POST: Create Folder or Puzzle
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    // --- CREATE FOLDER ---
    if (body.type === "FOLDER") {
      if (!body.name) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }

      const folder = await prisma.folder.create({
        data: {
          name: body.name,
          stage: body.stage || null,
          parentId: body.parentId === "root" ? null : body.parentId,
        },
      });

      return NextResponse.json(folder);
    }

    // --- CREATE PUZZLE ---
    if (body.type === "PUZZLE") {
      if (!body.title || !body.fen || !body.solution) {
        return NextResponse.json(
          { error: "Missing puzzle details" },
          { status: 400 }
        );
      }

      // Handle folder association
      let folderId = body.folderId || body.parentId;
      if (folderId === "root") folderId = null;

      const puzzle = await prisma.puzzle.create({
        data: {
          title: body.title,
          fen: body.fen,
          solution: body.solution,
          folderId: folderId,
          // Store stars and metadata
          data: body.data ?? {},
        },
      });

      return NextResponse.json(puzzle);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("POST /content error:", error);
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}

// 3. PUT: Update Puzzle (Edit Functionality)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, type, title, fen, solution, data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // --- UPDATE PUZZLE ---
    if (type === "PUZZLE") {
      const updatedPuzzle = await prisma.puzzle.update({
        where: { id },
        data: {
          title,
          fen,
          solution,
          // Update stars/metadata
          data: data ?? {}, 
        },
      });
      return NextResponse.json(updatedPuzzle);
    }

    // --- UPDATE FOLDER (Optional, if needed later) ---
    if (type === "FOLDER") {
        // Logic for renaming folders if needed
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (error) {
    console.error("PUT /content error:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

// 4. DELETE: Remove Folder or Puzzle or MCQ
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json(
        { error: "ID and Type required" },
        { status: 400 }
      );
    }

    if (type === "FOLDER") {
      // Prisma usually handles cascade delete if configured in schema.
      // Otherwise, you might need to delete puzzles inside first.
      await prisma.folder.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Folder deleted",
      });
    }

    if (type === "PUZZLE") {
      await prisma.puzzle.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Puzzle deleted",
      });
    }

    if (type === "MCQ") {
      await prisma.mCQ.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "MCQ deleted",
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /content error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete item. Ensure folders are empty before deleting.",
      },
      { status: 500 }
    );
  }
}
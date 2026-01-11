import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure this path matches your project
import prisma from "@/lib/prisma";

// ----------------------------------------------------------------
// 1. GET - Fetch a single puzzle by ID (Fixes the 405 Error)
// ----------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const puzzleId = params.id;

    const puzzle = await prisma.puzzle.findUnique({
      where: { id: puzzleId },
    });

    if (!puzzle) {
      return NextResponse.json(
        { error: "Puzzle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error("Error fetching puzzle:", error);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------
// 2. PUT - Update a puzzle (Admin only)
// ----------------------------------------------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure session exists and role is ADMIN
    // Note: Adjust checks if you want Coaches to edit too
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const puzzleId = params.id;
    if (!puzzleId) {
      return NextResponse.json(
        { error: "Puzzle ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Only allow valid puzzle fields to be updated
    const allowedFields = ["title", "fen", "solution", "category", "folderId"];
    const updateData: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const puzzle = await prisma.puzzle.update({
      where: { id: puzzleId },
      data: updateData,
    });

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error("Error updating puzzle:", error);
    return NextResponse.json(
      { error: "Failed to update puzzle" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------
// 3. DELETE - Remove a puzzle (Admin only)
// ----------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const puzzleId = params.id;
    if (!puzzleId) {
      return NextResponse.json(
        { error: "Puzzle ID required" },
        { status: 400 }
      );
    }

    await prisma.puzzle.delete({
      where: { id: puzzleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting puzzle:", error);
    return NextResponse.json(
      { error: "Failed to delete puzzle" },
      { status: 500 }
    );
  }
}
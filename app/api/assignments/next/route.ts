import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/assignments/next?currentId=123
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentId = searchParams.get("currentId");

    if (!currentId) {
      return NextResponse.json(
        { error: "currentId is required" },
        { status: 400 }
      );
    }

    // All assignments ordered by assignedAt
    const assignments = await prisma.assignment.findMany({
      orderBy: {
        assignedAt: "asc",
      },
      select: {
        id: true,
      },
    });

    if (!assignments.length) {
      return NextResponse.json({ id: null });
    }

    const index = assignments.findIndex((a: { id: string }) => a.id === currentId);

    if (index === -1) {
      return NextResponse.json({ id: null });
    }

    const nextAssignment = assignments[index + 1];

    return NextResponse.json({
      id: nextAssignment ? nextAssignment.id : null,
    });
  } catch (error) {
    console.error("Error fetching next assignment:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

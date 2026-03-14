import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all students and their solved puzzles count
    const leaderboard = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        stage: true,
        _count: {
          select: {
            puzzleProgress: {
              where: {
                isSolved: true,
              },
            },
          },
        },
      },
      orderBy: {
        puzzleProgress: {
          _count: "desc",
        },
      },
    });

    const formattedLeaderboard = leaderboard.map((user: any) => ({
      id: user.id,
      name: user.name,
      photoUrl: user.photoUrl,
      stage: user.stage,
      solvedCount: user._count.puzzleProgress,
    }));

    return NextResponse.json(formattedLeaderboard);
  } catch (error) {
    console.error("[LEADERBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

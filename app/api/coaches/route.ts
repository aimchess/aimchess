import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const coaches = await prisma.user.findMany({
      where: { role: "COACH" },
      include: {
        students: true,        // Include linked students
      },
      orderBy: {
        name: "asc",           // Optional: sort coaches alphabetically
      },
    });

    return NextResponse.json(coaches);
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}

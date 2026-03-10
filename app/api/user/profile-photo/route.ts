import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { photoUrl } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { photoUrl },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PROFILE_PHOTO_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

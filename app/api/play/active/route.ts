import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // 1. Update current user's lastActiveAt
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { lastActiveAt: new Date() },
        });

        // 2. Fetch all other users active in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const activeUsers = await prisma.user.findMany({
            where: {
                id: { not: currentUser.id },
                lastActiveAt: { gte: fiveMinutesAgo },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
            orderBy: {
                lastActiveAt: 'desc'
            }
        });

        return NextResponse.json(activeUsers);
    } catch (error) {
        console.error("Failed to fetch active players:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

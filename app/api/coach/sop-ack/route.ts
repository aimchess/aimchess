import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Fetch current coach's SOP acknowledgment status
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                role: true,
                sopAcknowledged: true,
                sopAcknowledgedAt: true
            }
        });

        if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to fetch SOP status:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Acknowledge the Coach Retention SOP
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                sopAcknowledged: true,
                sopAcknowledgedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                role: true,
                sopAcknowledged: true,
                sopAcknowledgedAt: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to acknowledge SOP:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

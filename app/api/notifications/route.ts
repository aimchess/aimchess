import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: currentUser.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("[NOTIFICATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { id } = await req.json();

        if (id) {
            const updated = await prisma.notification.update({
                where: { id },
                data: { isRead: true }
            });
            return NextResponse.json(updated);
        } else {
            // Mark all as read
            const updated = await prisma.notification.updateMany({
                where: { userId: currentUser.id, isRead: false },
                data: { isRead: true }
            });
            return NextResponse.json(updated);
        }
    } catch (error) {
        console.error("[NOTIFICATIONS_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

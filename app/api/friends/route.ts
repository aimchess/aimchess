import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: List all friends (Accepted & Pending)
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

        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { senderId: currentUser.id },
                    { receiverId: currentUser.id }
                ]
            }
        });

        const friendList = [];
        for (const f of friendships) {
            const isSender = f.senderId === currentUser.id;
            const friendId = isSender ? f.receiverId : f.senderId;
            
            const friendInfo = await prisma.user.findUnique({
                where: { id: friendId },
                select: { id: true, name: true, email: true, role: true, aimRating: true }
            });

            if (friendInfo) {
                friendList.push({
                    friendshipId: f.id,
                    friend: friendInfo,
                    status: f.status,
                    isSender
                });
            }
        }

        return NextResponse.json(friendList);
    } catch (error) {
        console.error("Failed to fetch friends:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Send or accept friend request
export async function POST(req: Request) {
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

        const body = await req.json();
        const { targetEmail, action, friendshipId } = body;

        // 1. If action is ACCEPT / DECLINE
        if (action && friendshipId) {
            const friendship = await prisma.friendship.findUnique({
                where: { id: friendshipId }
            });
            if (!friendship) return new NextResponse("Friendship not found", { status: 404 });

            if (action === "ACCEPT") {
                await prisma.friendship.update({
                    where: { id: friendshipId },
                    data: { status: "ACCEPTED" }
                });
            } else {
                await prisma.friendship.delete({
                    where: { id: friendshipId }
                });
            }
            return NextResponse.json({ success: true });
        }

        // 2. Otherwise send request by targetEmail
        if (!targetEmail) {
            return new NextResponse("Target email required", { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { email: targetEmail }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (targetUser.id === currentUser.id) {
            return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
        }

        // Check existing request
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: currentUser.id, receiverId: targetUser.id },
                    { senderId: targetUser.id, receiverId: currentUser.id }
                ]
            }
        });

        if (existing) {
            if (existing.senderId === targetUser.id && existing.status === "PENDING") {
                // Auto accept if target already sent a request
                const updated = await prisma.friendship.update({
                    where: { id: existing.id },
                    data: { status: "ACCEPTED" }
                });
                return NextResponse.json({ friendship: updated, autoAccepted: true });
            }
            return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
        }

        const newFriendship = await prisma.friendship.create({
            data: {
                senderId: currentUser.id,
                receiverId: targetUser.id,
                status: "PENDING"
            }
        });

        return NextResponse.json({ friendship: newFriendship, success: true });
    } catch (error) {
        console.error("Failed to add friend:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

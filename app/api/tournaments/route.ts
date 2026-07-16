import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const tournaments = await prisma.tournament.findMany({
            include: {
                participants: {
                    select: { userId: true, score: true }
                }
            },
            orderBy: {
                startDate: 'desc'
            }
        });

        return NextResponse.json(tournaments);
    } catch (error) {
        console.error("Failed to fetch tournaments:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (currentUser?.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { title, description, startDate, timeControl, totalRounds, pairingSystem } = await req.json();

        if (!title || !startDate) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const tournament = await prisma.tournament.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                timeControl: timeControl || "10+0",
                totalRounds: totalRounds ? parseInt(totalRounds) : 4,
                pairingSystem: pairingSystem || "Swiss",
                status: "UPCOMING"
            }
        });

        // Notify all students
        try {
            const students = await prisma.user.findMany({
                where: { role: "STUDENT" }
            });
            if (students.length > 0) {
                await prisma.notification.createMany({
                    data: students.map(student => ({
                        userId: student.id,
                        title: "New Tournament",
                        message: `A new tournament "${title}" (${timeControl || '10+0'}) has been scheduled for ${new Date(startDate).toLocaleDateString()}.`
                    }))
                });
            }
        } catch (err) {
            console.error("Failed to send tournament notifications:", err);
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error("Failed to create tournament:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

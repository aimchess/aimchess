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

        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get("month") || "0");
        const year = parseInt(searchParams.get("year") || "0");

        if (!month || !year) {
            return new NextResponse("Month and year required", { status: 400 });
        }

        const reports = await prisma.performanceReport.findMany({
            where: {
                month,
                year
            },
            include: {
                student: {
                    select: { name: true, email: true, stage: true }
                }
            },
            orderBy: {
                totalPoints: 'desc'
            }
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

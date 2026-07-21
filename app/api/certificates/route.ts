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

        let certificates;
        if (currentUser.role === "ADMIN" || currentUser.role === "COACH") {
            // Coach/Admin sees all certificates
            certificates = await prisma.certificate.findMany({
                include: {
                    student: { select: { id: true, name: true, role: true, aimRating: true, highestAimRating: true, aimLevel: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        } else {
            // Student sees only theirs
            certificates = await prisma.certificate.findMany({
                where: { studentId: currentUser.id },
                include: {
                    student: { select: { id: true, name: true, role: true, aimRating: true, highestAimRating: true, aimLevel: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        }

        return NextResponse.json(certificates);
    } catch (error) {
        console.error("[CERTIFICATES_GET]", error);
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

        if (!currentUser || currentUser.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { studentId, type, clubName } = await req.json();

        if (!studentId || !type) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const certificate = await prisma.certificate.create({
            data: {
                studentId,
                type,
                clubName,
                status: "PENDING"
            }
        });

        // Notify student (Requirement 16)
        await prisma.notification.create({
            data: {
                userId: studentId,
                title: "New Certificate Available",
                message: `An admin has generated a new ${type.replace('_', ' ')} certificate for you. Check your profile to claim it!`
            }
        });

        return NextResponse.json(certificate);
    } catch (error) {
        console.error("[CERTIFICATES_POST]", error);
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

        if (!currentUser || currentUser.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { certificateId, status } = await req.json();

        if (!certificateId || !status) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const updated = await prisma.certificate.update({
            where: { id: certificateId },
            data: {
                status,
                issuedAt: status === "ISSUED" ? new Date() : undefined
            }
        });

        if (status === "ISSUED") {
            try {
                await prisma.notification.create({
                    data: {
                        userId: updated.studentId,
                        title: "Certificate Issued!",
                        message: `🎉 Congratulations! Your AIM Rating Club Certificate is now available for download.`
                    }
                });
            } catch (err) {
                console.error("Failed to send issuance notification:", err);
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[CERTIFICATES_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

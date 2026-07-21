import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { certificateId } = await req.json();
        if (!certificateId) {
            return new NextResponse("Certificate ID required", { status: 400 });
        }

        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId }
        });

        if (!certificate) {
            return new NextResponse("Certificate not found", { status: 404 });
        }

        const updatedCert = await prisma.certificate.update({
            where: { id: certificateId },
            data: {
                status: "ISSUED",
                issuedAt: new Date()
            }
        });

        return NextResponse.json(updatedCert);
    } catch (error) {
        console.error("[CLAIM_CERTIFICATE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

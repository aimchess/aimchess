import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch payments
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const status = searchParams.get("status");

        const where: any = {};
        if (studentId) where.studentId = studentId;
        if (status) where.status = status;

        // Students can only see their own payments
        if ((session.user as any).role === 'STUDENT') {
            where.studentId = (session.user as any).id;
        }

        const payments = await prisma.feePayment.findMany({
            where,
            include: {
                student: { select: { id: true, name: true, email: true } }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Payments GET error:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

// POST: Record a new payment
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
        }

        const { amount, date, status, method, remarks, studentId } = await req.json();

        if (!amount || !studentId || !method) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const payment = await prisma.feePayment.create({
            data: {
                amount: parseFloat(amount),
                date: date ? new Date(date) : new Date(),
                status: status || 'COMPLETED',
                method,
                remarks,
                studentId
            }
        });

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Payments POST error:", error);
        return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }
}

// PUT: Update payment status or details
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, amount, date, status, method, remarks } = body;

        if (!id) {
            return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (date) updateData.date = new Date(date);
        if (status) updateData.status = status;
        if (method) updateData.method = method;
        if (remarks !== undefined) updateData.remarks = remarks;

        const updatedPayment = await prisma.feePayment.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedPayment);
    } catch (error) {
        console.error("Payments PUT error:", error);
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }
}

// DELETE: Remove a payment record
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
        }

        await prisma.feePayment.delete({ where: { id } });

        return NextResponse.json({ message: "Payment record deleted" });
    } catch (error) {
        console.error("Payments DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
    }
}

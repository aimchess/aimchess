import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { studentEmail: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
        { referenceNo: { contains: search, mode: 'insensitive' } },
        { aimStudentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const applications = await prisma.admissionApplication.findMany({
      where: whereClause,
      include: {
        coach: {
          select: { id: true, name: true, email: true },
        },
        user: {
          select: { id: true, aimStudentId: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const coaches = await prisma.user.findMany({
      where: { role: 'COACH' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ applications, coaches });
  } catch (error: any) {
    console.error('Error fetching admin admissions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admissions' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = params;
    const { adminNotes } = await req.json().catch(() => ({}));

    const application = await prisma.admissionApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNotes: adminNotes || 'Rejected by Admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admission application ${application.referenceNo} set to REJECTED.`,
    });
  } catch (error: any) {
    console.error('Error rejecting admission:', error);
    return NextResponse.json({ error: error.message || 'Failed to reject admission' }, { status: 500 });
  }
}

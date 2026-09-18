import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOfficialWelcomeEmail } from '@/lib/welcome-email';

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

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { coach: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 });
    }

    if (!application.aimStudentId) {
      return NextResponse.json(
        { error: 'Cannot resend welcome email. Application is not yet approved or lacks an AIM Student ID.' },
        { status: 400 }
      );
    }

    await sendOfficialWelcomeEmail({
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      aimStudentId: application.aimStudentId,
      packageName: application.packageName,
      packageType: application.packageType,
      totalClasses: application.totalClasses,
      coachName: application.coach?.name,
    });

    await prisma.admissionApplication.update({
      where: { id },
      data: { welcomeEmailSent: true },
    });

    return NextResponse.json({
      success: true,
      message: `Welcome email resent successfully to ${application.studentEmail}.`,
    });
  } catch (error: any) {
    console.error('Error resending welcome email:', error);
    return NextResponse.json({ error: error.message || 'Failed to resend welcome email' }, { status: 500 });
  }
}

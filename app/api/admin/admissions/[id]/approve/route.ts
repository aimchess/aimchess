import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAIMStudentId } from '@/lib/id-generator';
import { sendOfficialWelcomeEmail } from '@/lib/welcome-email';
import bcrypt from 'bcryptjs';

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
    const body = await req.json().catch(() => ({}));
    const { coachId, adminNotes } = body;

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { coach: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 });
    }

    if (application.status === 'APPROVED' && application.userId) {
      return NextResponse.json({
        message: 'Application is already approved and user account is active.',
        aimStudentId: application.aimStudentId,
      });
    }

    // 1. Generate unique AIM Student ID
    const aimStudentId = await generateAIMStudentId();

    // Determine password (user-created or temporary)
    let rawPassword = 'AimChess@2026!';
    if (application.paymentNotes && application.paymentNotes.includes('User Created Password: ')) {
      const match = application.paymentNotes.match(/User Created Password: (.*)/);
      if (match && match[1]) {
        rawPassword = match[1].trim();
      }
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const assignedCoachId = coachId || application.coachId || null;

    // Check if user account with this email already exists
    let user = await prisma.user.findUnique({
      where: { email: application.studentEmail.toLowerCase() },
    });

    if (!user) {
      // Create new student User account
      user = await prisma.user.create({
        data: {
          email: application.studentEmail.toLowerCase(),
          password: hashedPassword,
          name: application.studentName,
          role: 'STUDENT',
          stage: application.stage || 'BEGINNER',
          status: 'ACTIVE',
          aimStudentId,
          parentName: application.parentName,
          parentPhone: application.parentPhone,
          address: application.address,
          country: application.country || 'India',
          birthDate: application.birthDate,
          packageName: application.packageName,
          packageTotalClasses: application.totalClasses || 12,
          packageStartDate: new Date(),
          coachId: assignedCoachId,
        },
      });
    } else {
      // Update existing user account with AIM Student ID and package details
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          aimStudentId,
          stage: application.stage || user.stage,
          packageName: application.packageName,
          packageTotalClasses: application.totalClasses || 12,
          coachId: assignedCoachId || user.coachId,
          parentName: application.parentName || user.parentName,
          parentPhone: application.parentPhone || user.parentPhone,
        },
      });
    }

    // Update assigned coach info if coachId provided
    let coachName = application.coach?.name;
    if (assignedCoachId) {
      const coach = await prisma.user.findUnique({
        where: { id: assignedCoachId },
        select: { name: true },
      });
      if (coach) coachName = coach.name;
    }

    // Update Admission Application record
    await prisma.admissionApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        aimStudentId,
        userId: user.id,
        coachId: assignedCoachId,
        approvedAt: new Date(),
        adminNotes: adminNotes || application.adminNotes,
        welcomeEmailSent: true,
      },
    });

    // Send official welcome email to student
    await sendOfficialWelcomeEmail({
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      aimStudentId,
      packageName: application.packageName,
      packageType: application.packageType,
      totalClasses: application.totalClasses,
      loginPassword: rawPassword !== 'AimChess@2026!' ? undefined : 'AimChess@2026!',
      coachName,
    });

    return NextResponse.json({
      success: true,
      aimStudentId,
      userId: user.id,
      message: `Admission approved! AIM Student ID ${aimStudentId} created and welcome email dispatched to ${application.studentEmail}.`,
    });
  } catch (error: any) {
    console.error('Error approving admission:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve admission' }, { status: 500 });
  }
}

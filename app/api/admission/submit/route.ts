import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReferenceNumber } from '@/lib/id-generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      studentName,
      studentEmail,
      studentPhone,
      birthDate,
      address,
      country = 'India',
      parentName,
      parentPhone,
      parentEmail,
      stage = 'BEGINNER',
      packageId,
      packageName,
      packageType = 'GROUP',
      totalClasses = 12,
      amount,
      admissionFee = 0,
      currency = 'INR',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentNotes,
      customPassword,
    } = body;

    if (!studentName || !studentEmail || !studentPhone || !parentName || !parentPhone || !packageName || !amount) {
      return NextResponse.json({ error: 'Missing required admission fields.' }, { status: 400 });
    }

    const referenceNo = generateReferenceNumber();

    const application = await prisma.admissionApplication.create({
      data: {
        referenceNo,
        studentName,
        studentEmail: studentEmail.toLowerCase().trim(),
        studentPhone,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        country,
        parentName,
        parentPhone,
        parentEmail: parentEmail ? parentEmail.toLowerCase().trim() : null,
        stage: stage as any,
        packageId,
        packageName,
        packageType: packageType as any,
        totalClasses: parseInt(String(totalClasses), 10) || 12,
        amount: parseFloat(String(amount)),
        admissionFee: parseFloat(String(admissionFee || 0)),
        currency,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentNotes: paymentNotes || (customPassword ? `User Created Password: ${customPassword}` : null),
        status: 'UNDER_REVIEW',
      },
    });

    return NextResponse.json({
      success: true,
      referenceNo: application.referenceNo,
      applicationId: application.id,
      status: application.status,
      message: 'Application and payment submitted successfully! Profile is currently under review by AIM Admin.',
    });
  } catch (error: any) {
    console.error('Error submitting admission application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit admission application' },
      { status: 500 }
    );
  }
}

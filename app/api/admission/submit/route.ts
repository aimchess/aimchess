import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReferenceNumber } from '@/lib/id-generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      applicationId,
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
      isPrePayment = false,
    } = body;

    if (!studentName || !studentEmail || !studentPhone || !parentName || !parentPhone || !packageName || !amount) {
      return NextResponse.json({ error: 'Missing required admission fields.' }, { status: 400 });
    }

    const trimmedEmail = studentEmail.toLowerCase().trim();
    const finalStatus = isPrePayment ? 'PENDING_PAYMENT' : 'UNDER_REVIEW';

    // 1. If updating an existing pre-payment application (e.g. after user completes payment)
    if (applicationId) {
      const existing = await prisma.admissionApplication.findUnique({ where: { id: applicationId } });
      if (existing) {
        const updated = await prisma.admissionApplication.update({
          where: { id: applicationId },
          data: {
            packageId,
            packageName,
            packageType: packageType as any,
            totalClasses: parseInt(String(totalClasses), 10) || 12,
            amount: parseFloat(String(amount)),
            admissionFee: parseFloat(String(admissionFee || 0)),
            currency,
            razorpayOrderId: razorpayOrderId || existing.razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || existing.razorpayPaymentId,
            razorpaySignature: razorpaySignature || existing.razorpaySignature,
            paymentNotes: paymentNotes || (customPassword ? `User Created Password: ${customPassword}` : existing.paymentNotes),
            status: isPrePayment ? existing.status : 'UNDER_REVIEW',
          },
        });

        return NextResponse.json({
          success: true,
          referenceNo: updated.referenceNo,
          applicationId: updated.id,
          status: updated.status,
          message: isPrePayment
            ? 'Enquiry details updated.'
            : 'Payment received! Profile is currently under review by AIM Admin.',
        });
      }
    }

    // 2. Check if an application already exists for this email with PENDING_PAYMENT status
    const existingPending = await prisma.admissionApplication.findFirst({
      where: {
        studentEmail: trimmedEmail,
        status: 'PENDING_PAYMENT',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPending) {
      const updated = await prisma.admissionApplication.update({
        where: { id: existingPending.id },
        data: {
          studentName,
          studentPhone,
          birthDate: birthDate ? new Date(birthDate) : existingPending.birthDate,
          address,
          country,
          parentName,
          parentPhone,
          parentEmail: parentEmail ? parentEmail.toLowerCase().trim() : existingPending.parentEmail,
          stage: stage as any,
          packageId,
          packageName,
          packageType: packageType as any,
          totalClasses: parseInt(String(totalClasses), 10) || existingPending.totalClasses,
          amount: parseFloat(String(amount)),
          admissionFee: parseFloat(String(admissionFee || 0)),
          currency,
          razorpayOrderId: razorpayOrderId || existingPending.razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId || existingPending.razorpayPaymentId,
          razorpaySignature: razorpaySignature || existingPending.razorpaySignature,
          paymentNotes: paymentNotes || (customPassword ? `User Created Password: ${customPassword}` : existingPending.paymentNotes),
          status: isPrePayment ? 'PENDING_PAYMENT' : 'UNDER_REVIEW',
        },
      });

      return NextResponse.json({
        success: true,
        referenceNo: updated.referenceNo,
        applicationId: updated.id,
        status: updated.status,
        message: isPrePayment
          ? 'Enquiry details saved.'
          : 'Payment received! Profile is currently under review by AIM Admin.',
      });
    }

    // 3. Otherwise, create a new application record
    const referenceNo = generateReferenceNumber();

    const application = await prisma.admissionApplication.create({
      data: {
        referenceNo,
        studentName,
        studentEmail: trimmedEmail,
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
        status: finalStatus as any,
      },
    });

    return NextResponse.json({
      success: true,
      referenceNo: application.referenceNo,
      applicationId: application.id,
      status: application.status,
      message: isPrePayment
        ? 'Enquiry pre-saved successfully before payment.'
        : 'Application and payment submitted successfully! Profile is currently under review by AIM Admin.',
    });
  } catch (error: any) {
    console.error('Error submitting admission application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit admission application' },
      { status: 500 }
    );
  }
}

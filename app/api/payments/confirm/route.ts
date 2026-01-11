import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Get Razorpay details from frontend
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id) {
       return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // 2. Find the PENDING payment record using the Order ID
    // Note: Ensure your Prisma schema has an 'orderId' field with @unique
    const payment = await prisma.payment.findUnique({
      where: { orderId: razorpay_order_id } 
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment order not found' },
        { status: 404 }
      )
    }

    // 3. Security Checks
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - payment belongs to different user' },
        { status: 403 }
      )
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      )
    }

    // 4. Verify Signature (Replacing Stripe Intent check)
    if (!DEMO_MODE) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex')

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Invalid payment signature. Potential fraud attempt.' },
          { status: 400 }
        )
      }
    }

    const purchasedStage = payment.stage

    // 5. Database Transaction (Keep your exact business logic)
    await prisma.$transaction(async (tx: any) => {
      // Update Payment to COMPLETED and save the Razorpay Payment ID
      await tx.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'COMPLETED',
          paymentId: razorpay_payment_id // Storing the actual txn ID
        }
      })

      // Create/Update Enrollment
      await tx.enrollment.upsert({
        where: {
          userId_stage: {
            userId: session.user.id,
            stage: purchasedStage
          }
        },
        update: {},
        create: {
          userId: session.user.id,
          stage: purchasedStage
        }
      })

      // Calculate New Stage (Your original logic preserved)
      let newUserStage = session.user.stage
      if (purchasedStage === 'BEGINNER' && newUserStage === 'NONE') {
        newUserStage = 'BEGINNER'
      } else if (purchasedStage === 'INTERMEDIATE' && (newUserStage === 'NONE' || newUserStage === 'BEGINNER')) {
        newUserStage = 'INTERMEDIATE'
      } else if (purchasedStage === 'ADVANCED') {
        newUserStage = 'ADVANCED'
      }

      // Update User
      await tx.user.update({
        where: { id: session.user.id },
        data: { stage: newUserStage }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
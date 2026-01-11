// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2025-10-29.clover'
// })

// const STAGE_PRICES: { [key: string]: number } = {
//   BEGINNER: 49.99,
//   INTERMEDIATE: 99.99,
//   ADVANCED: 149.99
// }

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const { stage, amount } = await req.json()

//     if (!STAGE_PRICES[stage]) {
//       return NextResponse.json(
//         { error: 'Invalid stage' },
//         { status: 400 }
//       )
//     }

//     if (amount !== STAGE_PRICES[stage]) {
//       return NextResponse.json(
//         { error: 'Invalid amount for this stage' },
//         { status: 400 }
//       )
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount * 100),
//       currency: 'usd',
//       metadata: {
//         userId: session.user.id,
//         stage
//       }
//     })

//     const payment = await prisma.payment.create({
//       data: {
//         userId: session.user.id,
//         stage,
//         amount,
//         currency: 'usd',
//         status: 'PENDING',
//         stripePaymentId: paymentIntent.id
//       }
//     })

//     return NextResponse.json({
//       clientSecret: paymentIntent.client_secret,
//       paymentId: payment.id
//     })
//   } catch (error) {
//     console.error('Error creating payment:', error)
//     return NextResponse.json(
//       { error: 'Failed to create payment' },
//       { status: 500 }
//     )
//   }
// }

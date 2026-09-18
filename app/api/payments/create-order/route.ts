import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const stagePricing: Record<string, number> = {
  BEGINNER: 4999,
  INTERMEDIATE: 9999,
  ADVANCED: 14999,
  EXPERT: 19999,
};

export async function GET() {
  return NextResponse.json({ status: 'active' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const stage = (body.stage || 'BEGINNER').toUpperCase();
    const amount = stagePricing[stage] || 4999;
    const currency = body.currency || 'INR';

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: 'Razorpay API credentials not configured in environment.' },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount, // amount in smallest currency unit (paise)
      currency,
      receipt: `order_${Date.now()}_${stage.toLowerCase()}`,
      notes: {
        stage,
      },
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}

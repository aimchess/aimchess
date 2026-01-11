import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Database logic here: Update user's status to 'paid'
      // await db.user.update(...)
      return NextResponse.json({ message: "Payment verified", success: true });
    } else {
      return NextResponse.json({ message: "Invalid signature", success: false }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 });
  }
}
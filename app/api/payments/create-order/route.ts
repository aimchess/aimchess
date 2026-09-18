import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

// Fallback pricing map if DB lookup is not available
const packagePricingMap: Record<string, { price: number; admissionFee: number }> = {
  'pkg-group-beginner-w1': { price: 800, admissionFee: 300 },
  'pkg-group-beginner-w2': { price: 1500, admissionFee: 300 },
  'pkg-group-inter-w1': { price: 900, admissionFee: 300 },
  'pkg-group-inter-w2': { price: 1700, admissionFee: 300 },
  'pkg-oto-starter': { price: 3000, admissionFee: 0 },
  'pkg-oto-silver': { price: 5600, admissionFee: 0 },
  'pkg-oto-gold': { price: 11200, admissionFee: 0 },
  'pkg-oto-diamond': { price: 16500, admissionFee: 0 },
  // Stage fallbacks
  'BEGINNER': { price: 800, admissionFee: 300 },
  'INTERMEDIATE': { price: 900, admissionFee: 300 },
  'ADVANCED': { price: 11200, admissionFee: 0 },
  'EXPERT': { price: 16500, admissionFee: 0 },
};

export async function GET() {
  return NextResponse.json({ status: 'active' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { packageId, stage, customAmount, currency = 'INR' } = body;

    let finalAmountINR = 1100; // Default ₹800 + ₹300 admission fee

    if (customAmount && typeof customAmount === 'number' && customAmount > 0) {
      finalAmountINR = customAmount;
    } else if (packageId) {
      try {
        const pkg = await prisma.coursePackage.findUnique({ where: { id: packageId } });
        if (pkg) {
          finalAmountINR = pkg.priceINR + (pkg.admissionFeeINR || 0);
        } else if (packagePricingMap[packageId]) {
          const map = packagePricingMap[packageId];
          finalAmountINR = map.price + map.admissionFee;
        }
      } catch {
        if (packagePricingMap[packageId]) {
          const map = packagePricingMap[packageId];
          finalAmountINR = map.price + map.admissionFee;
        }
      }
    } else if (stage) {
      const mapKey = String(stage).toUpperCase();
      if (packagePricingMap[mapKey]) {
        const map = packagePricingMap[mapKey];
        finalAmountINR = map.price + map.admissionFee;
      }
    }

    // Convert to paise for Razorpay INR (e.g. ₹1100 = 110000 paise)
    const amountInPaise = Math.round(finalAmountINR * 100);

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
      amount: amountInPaise,
      currency,
      receipt: `order_${Date.now()}_${(packageId || stage || 'package').toLowerCase()}`,
      notes: {
        packageId: packageId || 'custom',
        stage: stage || 'BEGINNER',
        amountINR: finalAmountINR,
      },
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({
      ...order,
      calculatedAmountINR: finalAmountINR,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}


// export const runtime = "nodejs";

// import { NextResponse } from 'next/server';
// import Razorpay from 'razorpay';
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// const PRICES = {
//   BEGINNER: 4999,
//   INTERMEDIATE: 9999,
//   ADVANCED: 14999,
// };

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { stage } = await req.json();

//     if (!stage || !PRICES[stage as keyof typeof PRICES]) {
//       return NextResponse.json({ error: 'Invalid course stage' }, { status: 400 });
//     }

//     // ✔ MOVE Razorpay creation inside POST
//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID!,       // ✔ fixed
//       key_secret: process.env.RAZORPAY_KEY_SECRET!,
//     });

//     const amount = PRICES[stage as keyof typeof PRICES];

//     const order = await razorpay.orders.create({
//       amount,
//       currency: "USD",
//       receipt: `receipt_${session.user.email}_${Date.now()}`,
//     });

//     return NextResponse.json(order);
//   } catch (error: any) {
//     console.error("Razorpay Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Default initial packages to fallback to if database has no custom packages yet
const DEFAULT_PACKAGES = [
  {
    id: 'pkg-group-beginner',
    name: 'Beginner Group Session',
    type: 'GROUP',
    stage: 'BEGINNER',
    totalClasses: 12,
    priceINR: 4999,
    priceUSD: 79,
    description: 'Perfect for beginners learning rules, basic tactics, piece development, and simple checkmates.',
    features: [
      '12 Interactive Group Classes',
      'Batch size max 6 students',
      'Personalized puzzle assignments',
      'Weekly tournament participation',
      'AIM Certificate of Completion'
    ],
    isActive: true,
  },
  {
    id: 'pkg-group-intermediate',
    name: 'Intermediate Group Session',
    type: 'GROUP',
    stage: 'INTERMEDIATE',
    totalClasses: 24,
    priceINR: 9999,
    priceUSD: 149,
    description: 'Designed for players looking to master middle-game strategy, openings, and endgame fundamentals.',
    features: [
      '24 Interactive Group Classes',
      'Batch size max 6 students',
      'Advanced strategy & opening book',
      'Monthly performance scorecard',
      'Live rated match challenges'
    ],
    isActive: true,
  },
  {
    id: 'pkg-one-on-one-pro',
    name: '1-on-1 Personal Master Coaching',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 12,
    priceINR: 14999,
    priceUSD: 249,
    description: 'Dedicated 1-on-1 private coaching sessions with senior AIM chess masters tailored to your rating.',
    features: [
      '12 Private 1-on-1 Coaching Sessions',
      'Deep game analysis & customized study plan',
      'Lichess/FIDE rating growth blueprint',
      'Priority scheduling & dedicated coach support',
      'AIM Master Certificate'
    ],
    isActive: true,
  }
];

export async function GET() {
  try {
    const packages = await prisma.coursePackage.findMany({
      where: { isActive: true },
      orderBy: { priceINR: 'asc' },
    });

    if (!packages || packages.length === 0) {
      return NextResponse.json({ packages: DEFAULT_PACKAGES, isDefault: true });
    }

    return NextResponse.json({ packages, isDefault: false });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    // Fallback to defaults on error
    return NextResponse.json({ packages: DEFAULT_PACKAGES, isDefault: true });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, stage, totalClasses, priceINR, priceUSD, description, features } = body;

    if (!name || !totalClasses || !priceINR) {
      return NextResponse.json({ error: 'Missing required package fields' }, { status: 400 });
    }

    const newPackage = await prisma.coursePackage.create({
      data: {
        name,
        type: type || 'GROUP',
        stage: stage || 'BEGINNER',
        totalClasses: parseInt(totalClasses, 10),
        priceINR: parseFloat(priceINR),
        priceUSD: parseFloat(priceUSD || 0),
        description,
        features: features || [],
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error: any) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: error.message || 'Failed to create package' }, { status: 500 });
  }
}

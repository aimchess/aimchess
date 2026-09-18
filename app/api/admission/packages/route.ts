import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Default initial packages to fallback to if database has no custom packages yet
// Official AIM Chess Academy India Pricing Packages (Group Classes have ₹300 Admission Fee, 1-on-1 are Exempt)
const DEFAULT_PACKAGES = [
  // --- GROUP CLASSES ---
  {
    id: 'pkg-group-beginner-w1',
    name: 'Beginner Level - Weekly 1 Class',
    type: 'GROUP',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 800,
    admissionFeeINR: 300,
    priceUSD: 15,
    admissionFeeUSD: 5,
    description: 'Weekly 1 Class – 4 Classes/Month for Beginner Level students.',
    features: [
      '4 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Certificate of Completion'
    ],
    isActive: true,
  },
  {
    id: 'pkg-group-beginner-w2',
    name: 'Beginner Level - Weekly 2 Classes',
    type: 'GROUP',
    stage: 'BEGINNER',
    totalClasses: 8,
    priceINR: 1500,
    admissionFeeINR: 300,
    priceUSD: 25,
    admissionFeeUSD: 5,
    description: 'Weekly 2 Classes – 8 Classes/Month for Beginner Level students.',
    features: [
      '8 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Certificate of Completion'
    ],
    isActive: true,
  },
  {
    id: 'pkg-group-inter-w1',
    name: 'Intermediate & Advanced - Weekly 1 Class',
    type: 'GROUP',
    stage: 'INTERMEDIATE',
    totalClasses: 4,
    priceINR: 900,
    admissionFeeINR: 300,
    priceUSD: 18,
    admissionFeeUSD: 5,
    description: 'Weekly 1 Class – 4 Classes/Month for Intermediate & Advanced Level students.',
    features: [
      '4 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Advanced Strategy & Analysis'
    ],
    isActive: true,
  },
  {
    id: 'pkg-group-inter-w2',
    name: 'Intermediate & Advanced - Weekly 2 Classes',
    type: 'GROUP',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 1700,
    admissionFeeINR: 300,
    priceUSD: 30,
    admissionFeeUSD: 5,
    description: 'Weekly 2 Classes – 8 Classes/Month for Intermediate & Advanced Level students.',
    features: [
      '8 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Advanced Strategy & Analysis'
    ],
    isActive: true,
  },

  // --- ONE-TO-ONE CLASSES ---
  {
    id: 'pkg-oto-starter',
    name: 'Starter - 1-on-1 Coaching (4 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 3000,
    admissionFeeINR: 0,
    priceUSD: 50,
    admissionFeeUSD: 0,
    description: '4 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '4 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Customized Study Plan & Game Analysis'
    ],
    isActive: true,
  },
  {
    id: 'pkg-oto-silver',
    name: 'Silver - 1-on-1 Coaching (8 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 5600,
    admissionFeeINR: 0,
    priceUSD: 90,
    admissionFeeUSD: 0,
    description: '8 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '8 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Deep Game Analysis & Opening Repertoire'
    ],
    isActive: true,
  },
  {
    id: 'pkg-oto-gold',
    name: 'Gold - 1-on-1 Coaching (16 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 16,
    priceINR: 11200,
    admissionFeeINR: 0,
    priceUSD: 180,
    admissionFeeUSD: 0,
    description: '16 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '16 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Priority Coach Scheduling & Master Support'
    ],
    isActive: true,
  },
  {
    id: 'pkg-oto-diamond',
    name: 'Diamond - 1-on-1 Coaching (24 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 24,
    priceINR: 16500,
    admissionFeeINR: 0,
    priceUSD: 250,
    admissionFeeUSD: 0,
    description: '24 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '24 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Full Grandmaster Preparation & Tournament Prep'
    ],
    isActive: true,
  },
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
    const { name, type, stage, totalClasses, priceINR, admissionFeeINR, priceUSD, admissionFeeUSD, description, features } = body;

    if (!name || !totalClasses || priceINR === undefined) {
      return NextResponse.json({ error: 'Missing required package fields' }, { status: 400 });
    }

    const defaultAdmissionFee = (type || 'GROUP') === 'GROUP' ? 300 : 0;

    const newPackage = await prisma.coursePackage.create({
      data: {
        name,
        type: type || 'GROUP',
        stage: stage || 'BEGINNER',
        totalClasses: parseInt(totalClasses, 10),
        priceINR: parseFloat(priceINR),
        admissionFeeINR: parseFloat(admissionFeeINR !== undefined ? admissionFeeINR : defaultAdmissionFee),
        priceUSD: parseFloat(priceUSD || 0),
        admissionFeeUSD: parseFloat(admissionFeeUSD || 0),
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


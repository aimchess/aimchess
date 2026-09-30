import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Default initial packages to fallback to if database has no custom packages yet
// Official AIM Chess Academy Pricing Packages (India, UAE AED, and Global USD)
const DEFAULT_PACKAGES = [
  // --- 1-TO-1 PREMIUM COACHING (MOST POPULAR) ---
  {
    id: 'pkg-oto-4',
    name: '1-to-1 Premium Coaching (4 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 3000,
    admissionFeeINR: 0,
    priceUSD: 50,
    admissionFeeUSD: 0,
    priceAED: 149,
    admissionFeeAED: 0,
    tag: 'MOST POPULAR',
    tagline: 'Personalised | 60 Minutes',
    subtext: '100% Focus on Your Child • Tailored Plan for Faster Progress',
    description: '4 Personalised 1-on-1 coaching sessions (60 mins each) with dedicated FIDE rated coach.',
    features: [
      '4 Personalised 1-on-1 Sessions (60 mins)',
      '100% Focus & Custom Tailored Study Plan',
      'Live Interactive Zoom Classes & Recordings',
      'AIM Student Portal Access & Homework',
      'Weekly Tournaments & Progress Tracking'
    ],
    isActive: true,
  },
  {
    id: 'pkg-oto-8',
    name: '1-to-1 Premium Coaching (8 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 5600,
    admissionFeeINR: 0,
    priceUSD: 90,
    admissionFeeUSD: 0,
    priceAED: 279,
    admissionFeeAED: 0,
    tag: 'MOST POPULAR',
    tagline: 'Personalised | 60 Minutes',
    subtext: '100% Focus on Your Child • Tailored Plan for Faster Progress',
    description: '8 Personalised 1-on-1 coaching sessions (60 mins each) for rapid tactical & strategic improvement.',
    features: [
      '8 Personalised 1-on-1 Sessions (60 mins)',
      'Deep Game Analysis & Opening Repertoire',
      'Live Interactive Zoom Classes & Recordings',
      'AIM Student Portal Access & Homework',
      'Weekly Tournaments & Progress Tracking'
    ],
    isActive: true,
  },
  {
    id: 'pkg-oto-16',
    name: '1-to-1 Premium Coaching (16 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 16,
    priceINR: 11200,
    admissionFeeINR: 0,
    priceUSD: 180,
    admissionFeeUSD: 0,
    priceAED: 499,
    admissionFeeAED: 0,
    tag: 'MOST POPULAR',
    tagline: 'Personalised | 60 Minutes',
    subtext: '100% Focus on Your Child • Tailored Plan for Faster Progress',
    description: '16 Personalised 1-on-1 coaching sessions (60 mins each) with comprehensive tournament prep.',
    features: [
      '16 Personalised 1-on-1 Sessions (60 mins)',
      'Advanced Positional & Endgame Mastery',
      'Live Interactive Zoom Classes & Recordings',
      'AIM Student Portal Access & Homework',
      'Weekly Tournaments & Progress Tracking'
    ],
    isActive: true,
  },
  {
    id: 'pkg-oto-24',
    name: '1-to-1 Premium Coaching (24 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 24,
    priceINR: 16500,
    admissionFeeINR: 0,
    priceUSD: 250,
    admissionFeeUSD: 0,
    priceAED: 699,
    admissionFeeAED: 0,
    tag: 'MOST POPULAR',
    tagline: 'Personalised | 60 Minutes',
    subtext: '100% Focus on Your Child • Tailored Plan for Faster Progress',
    description: '24 Personalised 1-on-1 coaching sessions (60 mins each) for master preparation and rating milestones.',
    features: [
      '24 Personalised 1-on-1 Sessions (60 mins)',
      'Full Grandmaster Preparation & Repertoire',
      'Live Interactive Zoom Classes & Recordings',
      'AIM Student Portal Access & Homework',
      'Weekly Tournaments & Progress Tracking'
    ],
    isActive: true,
  },

  // --- BUDDY COACHING (MAX 2 STUDENTS) ---
  {
    id: 'pkg-buddy-4',
    name: 'Buddy Coaching (4 Classes)',
    type: 'BUDDY',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 2200,
    admissionFeeINR: 0,
    priceUSD: 35,
    admissionFeeUSD: 0,
    priceAED: 99,
    admissionFeeAED: 0,
    tag: 'SEMI-PRIVATE',
    tagline: 'Semi-Private (Max 2) | 60 Minutes',
    subtext: 'Learn Together, Grow Together • Best for Siblings & Friends',
    description: '4 Semi-Private Coaching Sessions for 2 students (60 minutes each). Learn together with sibling or friend.',
    features: [
      '4 Semi-Private Sessions (Max 2 Students)',
      '60 Minutes Live Interactive Zoom Classes',
      'Learn Together & Healthy Friendly Sparring',
      'Class Recordings After Each Session',
      'AIM Student Portal Access & Homework'
    ],
    isActive: true,
  },
  {
    id: 'pkg-buddy-8',
    name: 'Buddy Coaching (8 Classes)',
    type: 'BUDDY',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 4200,
    admissionFeeINR: 0,
    priceUSD: 65,
    admissionFeeUSD: 0,
    priceAED: 189,
    admissionFeeAED: 0,
    tag: 'SEMI-PRIVATE',
    tagline: 'Semi-Private (Max 2) | 60 Minutes',
    subtext: 'Learn Together, Grow Together • Best for Siblings & Friends',
    description: '8 Semi-Private Coaching Sessions for 2 students (60 minutes each).',
    features: [
      '8 Semi-Private Sessions (Max 2 Students)',
      '60 Minutes Live Interactive Zoom Classes',
      'Interactive Tactics & Strategy Drills',
      'Class Recordings After Each Session',
      'AIM Student Portal Access & Homework'
    ],
    isActive: true,
  },
  {
    id: 'pkg-buddy-16',
    name: 'Buddy Coaching (16 Classes)',
    type: 'BUDDY',
    stage: 'ADVANCED',
    totalClasses: 16,
    priceINR: 7900,
    admissionFeeINR: 0,
    priceUSD: 120,
    admissionFeeUSD: 0,
    priceAED: 349,
    admissionFeeAED: 0,
    tag: 'SEMI-PRIVATE',
    tagline: 'Semi-Private (Max 2) | 60 Minutes',
    subtext: 'Learn Together, Grow Together • Best for Siblings & Friends',
    description: '16 Semi-Private Coaching Sessions for 2 students (60 minutes each).',
    features: [
      '16 Semi-Private Sessions (Max 2 Students)',
      '60 Minutes Live Interactive Zoom Classes',
      'Advanced Strategy & Tactical Puzzles',
      'Class Recordings After Each Session',
      'Weekly Tournaments & Puzzle Competitions'
    ],
    isActive: true,
  },
  {
    id: 'pkg-buddy-24',
    name: 'Buddy Coaching (24 Classes)',
    type: 'BUDDY',
    stage: 'ADVANCED',
    totalClasses: 24,
    priceINR: 11500,
    admissionFeeINR: 0,
    priceUSD: 170,
    admissionFeeUSD: 0,
    priceAED: 499,
    admissionFeeAED: 0,
    tag: 'SEMI-PRIVATE',
    tagline: 'Semi-Private (Max 2) | 60 Minutes',
    subtext: 'Learn Together, Grow Together • Best for Siblings & Friends',
    description: '24 Semi-Private Coaching Sessions for 2 students (60 minutes each).',
    features: [
      '24 Semi-Private Sessions (Max 2 Students)',
      '60 Minutes Live Interactive Zoom Classes',
      'Complete Mastery Curriculum & Tournament Prep',
      'Class Recordings After Each Session',
      'Weekly Tournaments & Progress Tracking'
    ],
    isActive: true,
  },

  // --- PREMIUM SMALL GROUP CLASSES (MAX 4 STUDENTS) ---
  {
    id: 'pkg-group-4',
    name: 'Premium Small Group (4 Classes / Month)',
    type: 'GROUP',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 800,
    admissionFeeINR: 300,
    priceUSD: 15,
    admissionFeeUSD: 5,
    priceAED: 99,
    admissionFeeAED: 0,
    tag: 'AFFORDABLE & EFFECTIVE',
    tagline: 'Level-Matched Batch (Max 4) | 60 Minutes',
    subtext: 'More Interaction, More Fun • Affordable & Effective',
    description: '4 Interactive Small Group Sessions per month (Max 4 students). Level-matched batch.',
    features: [
      '4 Interactive Small Group Classes / Month',
      'Max 4 Students per Level-Matched Batch',
      'Live Zoom Classes & Post-Session Recordings',
      'AIM Student Portal Access & Homework',
      'Weekly Tournaments & Puzzle Competitions'
    ],
    isActive: true,
  },
  {
    id: 'pkg-group-8',
    name: 'Premium Small Group (8 Classes / Month)',
    type: 'GROUP',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 1500,
    admissionFeeINR: 300,
    priceUSD: 25,
    admissionFeeUSD: 5,
    priceAED: 179,
    admissionFeeAED: 0,
    tag: 'AFFORDABLE & EFFECTIVE',
    tagline: 'Level-Matched Batch (Max 4) | 60 Minutes',
    subtext: 'More Interaction, More Fun • Affordable & Effective',
    description: '8 Interactive Small Group Sessions per month (2 classes/week). Max 4 students.',
    features: [
      '8 Interactive Small Group Classes / Month',
      'Max 4 Students per Level-Matched Batch',
      'Live Zoom Classes & Post-Session Recordings',
      'AIM Student Portal Access & Homework',
      'Weekly Tournaments & Puzzle Competitions'
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

    // Merge in any missing AED fields if database records were saved earlier without AED fields
    const mergedPackages = packages.map((pkg) => {
      const defaultMatch = DEFAULT_PACKAGES.find((d) => d.id === pkg.id || (d.name === pkg.name && d.type === pkg.type));
      return {
        ...pkg,
        priceAED: (pkg as any).priceAED || defaultMatch?.priceAED || (pkg.priceUSD ? Math.round(pkg.priceUSD * 3.67) : 99),
        admissionFeeAED: (pkg as any).admissionFeeAED ?? (defaultMatch?.admissionFeeAED || 0),
        tag: defaultMatch?.tag,
        tagline: defaultMatch?.tagline,
        subtext: defaultMatch?.subtext,
      };
    });

    return NextResponse.json({ packages: mergedPackages, isDefault: false });
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
    const { name, type, stage, totalClasses, priceINR, admissionFeeINR, priceUSD, admissionFeeUSD, priceAED, admissionFeeAED, description, features } = body;

    if (!name || !totalClasses || priceINR === undefined) {
      return NextResponse.json({ error: 'Missing required package fields' }, { status: 400 });
    }

    const defaultAdmissionFeeINR = (type || 'GROUP') === 'GROUP' ? 300 : 0;
    const defaultAdmissionFeeUSD = (type || 'GROUP') === 'GROUP' ? 5 : 0;

    const newPackage = await prisma.coursePackage.create({
      data: {
        name,
        type: type || 'GROUP',
        stage: stage || 'BEGINNER',
        totalClasses: parseInt(totalClasses, 10),
        priceINR: parseFloat(priceINR),
        admissionFeeINR: parseFloat(admissionFeeINR !== undefined ? admissionFeeINR : defaultAdmissionFeeINR),
        priceUSD: parseFloat(priceUSD || 0),
        admissionFeeUSD: parseFloat(admissionFeeUSD !== undefined ? admissionFeeUSD : defaultAdmissionFeeUSD),
        priceAED: parseFloat(priceAED || (priceUSD ? String(Math.round(parseFloat(priceUSD) * 3.67)) : '99')),
        admissionFeeAED: parseFloat(admissionFeeAED || 0),
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


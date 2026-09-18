'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PackageDetails {
  id: string
  name: string
  type: 'GROUP' | 'ONE_ON_ONE'
  stage: string
  totalClasses: number
  priceINR: number
  admissionFeeINR: number
  description: string
  features: string[]
}

const packageFallbackMap: Record<string, PackageDetails> = {
  'pkg-group-beginner-w1': {
    id: 'pkg-group-beginner-w1',
    name: 'Beginner Level - Weekly 1 Class',
    type: 'GROUP',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 800,
    admissionFeeINR: 300,
    description: 'Weekly 1 Class – 4 Classes/Month for Beginner Level students.',
    features: [
      '4 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'AIM Certificate of Completion'
    ]
  },
  'pkg-group-beginner-w2': {
    id: 'pkg-group-beginner-w2',
    name: 'Beginner Level - Weekly 2 Classes',
    type: 'GROUP',
    stage: 'BEGINNER',
    totalClasses: 8,
    priceINR: 1500,
    admissionFeeINR: 300,
    description: 'Weekly 2 Classes – 8 Classes/Month for Beginner Level students.',
    features: [
      '8 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'AIM Certificate of Completion'
    ]
  },
  'pkg-group-inter-w1': {
    id: 'pkg-group-inter-w1',
    name: 'Intermediate & Advanced - Weekly 1 Class',
    type: 'GROUP',
    stage: 'INTERMEDIATE',
    totalClasses: 4,
    priceINR: 900,
    admissionFeeINR: 300,
    description: 'Weekly 1 Class – 4 Classes/Month for Intermediate & Advanced Level students.',
    features: [
      '4 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Advanced Strategy & Analysis'
    ]
  },
  'pkg-group-inter-w2': {
    id: 'pkg-group-inter-w2',
    name: 'Intermediate & Advanced - Weekly 2 Classes',
    type: 'GROUP',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 1700,
    admissionFeeINR: 300,
    description: 'Weekly 2 Classes – 8 Classes/Month for Intermediate & Advanced Level students.',
    features: [
      '8 Interactive Group Classes / Month',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Advanced Strategy & Analysis'
    ]
  },
  'pkg-oto-starter': {
    id: 'pkg-oto-starter',
    name: 'Starter - 1-on-1 Coaching (4 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'BEGINNER',
    totalClasses: 4,
    priceINR: 3000,
    admissionFeeINR: 0,
    description: '4 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '4 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Customized Study Plan & Game Analysis'
    ]
  },
  'pkg-oto-silver': {
    id: 'pkg-oto-silver',
    name: 'Silver - 1-on-1 Coaching (8 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'INTERMEDIATE',
    totalClasses: 8,
    priceINR: 5600,
    admissionFeeINR: 0,
    description: '8 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '8 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Deep Game Analysis & Opening Repertoire'
    ]
  },
  'pkg-oto-gold': {
    id: 'pkg-oto-gold',
    name: 'Gold - 1-on-1 Coaching (16 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 16,
    priceINR: 11200,
    admissionFeeINR: 0,
    description: '16 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '16 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Priority Coach Scheduling & Master Support'
    ]
  },
  'pkg-oto-diamond': {
    id: 'pkg-oto-diamond',
    name: 'Diamond - 1-on-1 Coaching (24 Classes)',
    type: 'ONE_ON_ONE',
    stage: 'ADVANCED',
    totalClasses: 24,
    priceINR: 16500,
    admissionFeeINR: 0,
    description: '24 Private 1-on-1 Coaching Sessions (60 minutes each). No admission fee.',
    features: [
      '24 Personal 1-on-1 Coaching Sessions (60 mins)',
      'Weekly Student Portal Tournament',
      'AIM Rating Development',
      'Portal Practice & Learning Support',
      'Full Grandmaster Preparation & Tournament Prep'
    ]
  }
}

export default function PackageCheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()

  const targetId = (params.stage as string) || 'pkg-group-beginner-w1'
  const [pkg, setPkg] = useState<PackageDetails | null>(packageFallbackMap[targetId] || packageFallbackMap['pkg-group-beginner-w1'])
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadPackage() {
      try {
        const res = await fetch('/api/admission/packages')
        const data = await res.json()
        if (data.packages && Array.isArray(data.packages)) {
          const match = data.packages.find((p: any) => p.id === targetId || p.stage?.toUpperCase() === targetId.toUpperCase())
          if (match) {
            setPkg({
              id: match.id,
              name: match.name,
              type: match.type || 'GROUP',
              stage: match.stage || 'BEGINNER',
              totalClasses: match.totalClasses || 4,
              priceINR: match.priceINR || 800,
              admissionFeeINR: match.type === 'GROUP' ? (match.admissionFeeINR ?? 300) : 0,
              description: match.description || '',
              features: match.features || []
            })
          }
        }
      } catch (err) {
        console.error('Error loading package details:', err)
      }
    }
    loadPackage()
  }, [targetId])

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    )
  }

  const admissionFee = pkg.type === 'GROUP' ? (pkg.admissionFeeINR ?? 300) : 0
  const totalPayable = pkg.priceINR + admissionFee

  const handlePayment = async () => {
    setProcessing(true)

    const isScriptLoaded = await loadRazorpayScript()
    if (!isScriptLoaded) {
      alert('Failed to load Razorpay payment SDK. Please check your connection.')
      setProcessing(false)
      return
    }

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, currency: 'INR' })
      })

      const orderData = await response.json()
      if (!response.ok) {
        throw new Error(orderData.error || 'Error creating Razorpay order')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TdA1PKIjJ6LEWm',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AIM Chess Academy',
        description: `Enrollment: ${pkg.name}`,
        image: '/aim-logo.jpeg',
        order_id: orderData.id,
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#0284c7',
        },
        handler: async function (res: any) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/learn')
          }, 2500)
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment Error:', error)
      alert(error.message || 'Could not initiate payment. Please try again.')
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-slate-600 text-sm mb-4">
            You have successfully enrolled in <strong className="text-slate-900">{pkg.name}</strong>.
          </p>
          <p className="text-xs text-slate-400">Redirecting to learning portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/payment"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            All India Payment Links
          </Link>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            🇮🇳 Razorpay Direct Pay
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 p-6 md:p-8 text-white text-center">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full border border-sky-400/30 mb-2">
              {pkg.type === 'GROUP' ? '🟡 GROUP CLASS' : '👤 1-ON-1 CLASS'} • {pkg.stage} LEVEL
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">{pkg.name}</h1>
            <p className="text-xs text-slate-300 mt-1">{pkg.description}</p>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700">Official Fee Breakdown</h3>
              <div className="flex justify-between items-center text-xs text-slate-600 pt-1">
                <span>Course Tuition Fee ({pkg.totalClasses} Classes):</span>
                <span className="font-bold text-slate-900">₹{pkg.priceINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>One-Time Admission Fee:</span>
                <span className="font-bold text-emerald-600">
                  {admissionFee > 0 ? `+₹${admissionFee}` : '₹0 (Exempt)'}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-800">Total Payable Amount:</span>
                <span className="text-3xl font-black text-sky-700">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Package Features:</h4>
              <ul className="space-y-2.5">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pay Button */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-6 text-base font-bold transition-all shadow-lg shadow-sky-600/20"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting to Razorpay...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{totalPayable.toLocaleString('en-IN')} via Razorpay
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted Payment via Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
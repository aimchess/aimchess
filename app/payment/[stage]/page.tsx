'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

// 1. Helper to load Razorpay Script securely
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// 2. Type definition for Window
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  
  // Ensure stage matches the keys in stageInfo (BEGINNER, INTERMEDIATE, ADVANCED)
  const stage = (params.stage as string)?.toUpperCase() || 'BEGINNER'
  
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/payment/' + stage)
    }
  }, [status, router, stage])

  const stageInfo: { [key: string]: { name: string; price: number; features: string[] } } = {
    BEGINNER: {
      name: 'Beginner',
      price: 4999, // 49.99
      features: [
        'Access to 50+ beginner puzzles',
        'Learn fundamental chess concepts',
        'Opening principles and tactics',
        'Endgame basics',
        'Progress tracking'
      ]
    },
    INTERMEDIATE: {
      name: 'Intermediate',
      price: 9999, // 99.99
      features: [
        'Access to 100+ intermediate puzzles',
        'Advanced tactical patterns',
        'Positional understanding',
        'Middlegame strategies',
        'All beginner content included'
      ]
    },
    ADVANCED: {
      name: 'Advanced',
      price: 14999, // 149.99
      features: [
        'Access to 150+ advanced puzzles',
        'Master-level tactics',
        'Complex endgames',
        'Opening repertoire building',
        'All previous content included',
        'Priority support'
      ]
    }
  }

  const currentStage = stageInfo[stage] || stageInfo.BEGINNER
  const displayPrice = (currentStage.price / 100).toFixed(2)

  const handlePayment = async () => {
    setProcessing(true)

    // Step A: Load the SDK
    const isScriptLoaded = await loadRazorpayScript()
    if (!isScriptLoaded) {
      alert('Failed to load payment SDK. Please check your internet connection.')
      setProcessing(false)
      return
    }

    try {
      // Step B: Create Order on Backend
      // SECURITY NOTE: We do NOT send the 'amount' here. The backend calculates it based on 'stage'.
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }) 
      })

      const orderData = await response.json()

      if (!response.ok) {
        throw new Error(orderData.error || 'Error creating order')
      }

      // Step C: Configure Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Chess Platform",
        description: `${currentStage.name} Course Enrollment`,
        order_id: orderData.id, // Order ID from backend
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#769656',
        },
        // Step D: Handle Payment Success
        handler: async function (response: any) {
          try {
            // Call the CONFIRM endpoint to verify signature and update DB
            const verifyRes = await fetch('/api/payments/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json()
              throw new Error(errorData.error || 'Verification failed')
            }

            // Success!
            setSuccess(true)
            setTimeout(() => {
              router.push('/learn')
              router.refresh() // Refresh to update server components (like locked/unlocked content)
            }, 2500)

          } catch (err: any) {
            console.error('Verification Error:', err)
            alert(err.message || 'Payment successful but verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
          }
        }
      }

      // Step E: Open the Payment Modal
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
      
      paymentObject.on('payment.failed', function (response: any){
        console.error(response.error)
        alert("Payment failed: " + response.error.description)
        setProcessing(false)
      })

    } catch (error: any) {
      console.error('Payment initialization error:', error)
      alert(error.message || 'Could not initiate payment. Please try again.')
      setProcessing(false)
    }
  }

  // --- Render Views ---

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#769656]" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            You have successfully enrolled in the {currentStage.name} course.
          </p>
          <p className="text-sm text-gray-400">Redirecting to learning area...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enroll in {currentStage.name}
          </h1>
          <p className="text-lg text-gray-600">
            Secure your spot and start improving today
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#769656] to-[#5C1F1C] p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">{currentStage.name} Level</h2>
            <div className="text-5xl font-bold mt-4">
              ${displayPrice}
              <span className="text-lg font-medium opacity-80 ml-2">/ one-time</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">What's included:</h3>
            <ul className="space-y-4 mb-8">
              {currentStage.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#769656] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="border-t pt-8 space-y-4">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-[#769656] hover:bg-[#5a7442] text-white py-6 text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> 
                    Processing...
                  </span>
                ) : (
                  `Pay $${displayPrice} & Start Learning`
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                 <span>🔒 Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
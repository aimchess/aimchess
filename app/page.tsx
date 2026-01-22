"use client";

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Your existing components
import { HeroSection } from "@/components/hero-section"
import  StudentSuccessAndTestimonials  from "@/components/testimonials-section"
import { StatsSection } from "@/components/stats-section"
import WhyChessBento from "@/components/why"
import { CoursesSection } from "@/components/courses-section"
import { AchievementsSection } from "@/components/achievements-section"
import { FaqSection } from "@/components/faq-section"
import { WhyChooseUs } from "@/components/why-choose-us"
import { HomeCTA } from "@/components/home-cta"
import SuccessStories from "@/components/sucessstory";

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role

      // Redirect based on role
      if (role === 'ADMIN') router.push('/admin')
      else if (role === 'COACH') router.push('/coach')
      else if (role === 'STUDENT') router.push('/learn')
      else router.push('/learn') // Fallback
    }
  }, [status, session, router])

  // 1. While checking auth status, show a loading spinner
  //    This prevents the Landing Page from "flashing" for logged-in users
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  // 2. If NOT logged in (Unauthenticated), show the Landing Page
  return (
    <div className="min-h-screen py-0">
      <main>
        <HeroSection />
        <WhyChooseUs />
        <CoursesSection />
        <AchievementsSection />
        <StudentSuccessAndTestimonials />
        <SuccessStories/>
        {/* <StatsSection /> */}
        <WhyChessBento/>
        <FaqSection />
        <HomeCTA />
      </main>
    </div>
  )
}
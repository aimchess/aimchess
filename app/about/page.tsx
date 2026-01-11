"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Target,
  Scale,
  Gem,
  Heart,
  Crown,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import Link from "next/link";
import { AchievementsSection } from "@/components/achievements-section";
import { FaqSection } from "@/components/faq-section";
import Image from "next/image";

// Foundation Items Config
const foundationItems = [
  {
    icon: Brain,
    title: "Clear Concepts",
    desc: "We break down complex grandmaster ideas into simple, digestible concepts that stick.",
    gradient: "from-[#FFDA44] to-[#F4A261]",
    iconBg: "bg-white",
    iconColor: "text-[#2D2A26]",
  },
  {
    icon: Target,
    title: "Real Improvement",
    desc: "We don't just play; we train. Verify your skills through rated tournaments and consistent rating gains.",
    gradient: "from-[#5C1F1C] to-[#8B3A35]",
    iconBg: "bg-[#FFDA44]",
    iconColor: "text-[#5C1F1C]",
    isLight: false,
  },
  {
    icon: Scale,
    title: "Step by Step",
    desc: "A structured curriculum that ensures you never feel lost or overwhelmed.",
    gradient: "from-[#2A9D8F] to-[#264653]",
    iconBg: "bg-white",
    iconColor: "text-[#2A9D8F]",
    isLight: false,
  },
  {
    icon: Gem,
    title: "Confidence",
    desc: "Building self-assurance through solving problems and winning games.",
    gradient: "from-[#E76F51] to-[#D35836]",
    iconBg: "bg-white",
    iconColor: "text-[#E76F51]",
    isLight: false,
  },
  {
    icon: Heart,
    title: "Supportive Community",
    desc: "A place where mistakes are celebrated as learning opportunities, and every player supports one another.",
    gradient: "from-[#264653] to-[#1A2F38]",
    iconBg: "bg-[#E76F51]",
    iconColor: "text-white",
    isLight: false,
    colSpan: "md:col-span-2"
  }
];
const dummyImages = [
  "/image.jpg", "/image1.jpg", "/image13.jpg",
  "/image3.jpg", "/image4.jpg", "/image5.jpg",
  "/image6.jpg", "/image7.jpg", "/image13.jpg",
  "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
];

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2D2A26] selection:bg-[#FFDA44]/30">

      {/* 1. HERO: The Manifesto - Bold, Editorial Style */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background "Film Strip" Effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden select-none">
          <div className="grid grid-cols-4 gap-4 transform -rotate-12 scale-110">
            {dummyImages.slice(0, 8).map((src, i) => (
              <div key={i} className="aspect-square relative grayscale">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#E76F51] mb-4 block">
              More than just a game
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-6 leading-tight tracking-tight">
              Master the <span className="italic font-serif text-[#E76F51]">Minds</span>
            </h1>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              We don't just teach pieces moving on a board. We teach logic, resilience, and the art of pure thinking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. MISSION: The Split Layout */}
      <section id="mission" className="py-12 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Sticky Text Side */}
          <div className="lg:sticky lg:top-32 h-fit space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-[#E76F51]"></div>
                <span className="text-sm font-bold uppercase tracking-wider text-[#E76F51]">Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-[#2D2A26] leading-tight mb-8">
                To Create <br />
                <span className="italic font-serif text-[#E76F51]">Thinking</span> Players.
              </h2>
              <p className="text-lg text-[#5C5852] leading-relaxed mb-6">
                Most academies teach you ‘what’ to move. At Royal Look, we obsess over ‘why’. We are building a generation of players who understand that every move has a consequence, and every position holds a possibility.
              </p>
              <p className="text-lg text-[#5C5852] leading-relaxed">
                Whether you are 6 or 60, our structured path takes you from absolute beginner to confident competitor, one pure move at a time.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#E6E0D4]">
              <div>
                <h3 className="text-4xl font-extrabold text-[#2D2A26] mb-1">600+</h3>
                <p className="text-sm text-[#5C5852] uppercase font-bold tracking-wide">Active Students</p>
              </div>
              <div>
                <h3 className="text-4xl font-extrabold text-[#2D2A26] mb-1">50+</h3>
                <p className="text-sm text-[#5C5852] uppercase font-bold tracking-wide">Expert Coaches</p>
              </div>
            </div>
          </div>

          {/* Visual Side - Overlapping Images */}
          <div className="relative h-[600px] w-full hidden lg:block">
            <motion.div
              style={{ y }}
              className="absolute top-0 right-0 w-3/4 h-[400px] rounded-[2rem] overflow-hidden shadow-2xl z-10 border-8 border-white"
            >
              <img src="/image13.jpg" alt="Chess Focus" className="w-full h-full object-cover" />
            </motion.div>

            <div className="absolute bottom-0 left-0 w-2/3 h-[350px] rounded-[2rem] overflow-hidden shadow-2xl z-20 border-8 border-white">
              <img src="/image14.jpg" alt="Child Learning" className="w-full h-full object-cover" />
            </div>

            {/* Floating Icon */}
            <div className="absolute bottom-1/4 right-10 bg-[#FFDA44] p-6 rounded-2xl shadow-xl z-30">
              <Crown className="w-10 h-10 text-[#2D2A26]" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUNDERS SECTION */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFDA44]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E76F51]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-widest text-[#E76F51] mb-4 block">The Visionary</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] mb-4">
              Meet the <span className="text-[#E76F51]">Founder</span>
            </h2>
            <div className="h-1.5 w-24 bg-[#FFDA44] mx-auto rounded-full" />
          </div>

          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#FDFBF7] to-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-[#E6E0D4] relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFDA44]/5 rounded-full blur-2xl" />

            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              {/* Image */}
              <div className="w-full lg:w-1/3 flex-shrink-0">
                <div className="relative">
                  <div className="aspect-square max-w-[400px] mx-auto rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                    <img src="/image3.jpg" alt="Founder" className="w-full h-full object-cover" />
                  </div>
                  {/* Decorative Badge */}
                  <div className="absolute -bottom-4 -right-4 lg:right-auto lg:-left-4 bg-[#5C1F1C] text-white p-4 rounded-2xl shadow-lg">
                    <Crown className="w-8 h-8 text-[#FFDA44]" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-[#2D2A26] mb-2">
                  Grandmaster Rajesh Kumar
                </h3>
                <p className="text-[#E76F51] font-bold uppercase tracking-wide text-sm mb-6">
                  Founder & Chief Coach
                </p>

                <div className="space-y-4 text-[#5C5852] leading-relaxed mb-8">
                  <p>
                    Founded Royal Look Academy with a simple yet powerful belief: that chess is not just for the gifted, but for the persistent.
                  </p>
                  <p>
                    With over <strong className="text-[#2D2A26]">20 years</strong> of competitive experience and coaching the national team, he brings a depth of understanding that transforms how students perceive the game.
                  </p>
                </div>

                {/* Quote */}
                <div className="bg-[#5C1F1C] text-white p-6 rounded-2xl relative">
                  <div className="absolute -top-3 left-6 text-[#FFDA44] text-5xl font-serif">"</div>
                  <p className="font-serif italic text-lg pl-6">
                    Chess is life in miniature. Every move teaches patience, every game builds character.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-[#FFDA44]/10 rounded-xl">
                    <p className="text-2xl font-black text-[#2D2A26]">20+</p>
                    <p className="text-xs font-bold text-[#5C5852] uppercase">Years Exp</p>
                  </div>
                  <div className="text-center p-4 bg-[#E76F51]/10 rounded-xl">
                    <p className="text-2xl font-black text-[#2D2A26]">1000+</p>
                    <p className="text-xs font-bold text-[#5C5852] uppercase">Students</p>
                  </div>
                  <div className="text-center p-4 bg-[#2A9D8F]/10 rounded-xl">
                    <p className="text-2xl font-black text-[#2D2A26]">50+</p>
                    <p className="text-xs font-bold text-[#5C5852] uppercase">Champions</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. PILLARS: The Foundation (Colored Cards) */}
      <section className="py-24 px-6 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-bold uppercase tracking-wider text-[#E76F51] mb-2 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#2D2A26] mb-6">
              The <span className="text-[#E76F51]">Foundation</span>
            </h2>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto font-light">
              Built on unshakeable pillars designed to guarantee improvement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundationItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`${item.colSpan || ''}`}
                >
                  <div className={`h-full bg-gradient-to-br ${item.gradient} rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}>
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                      <div className={`${item.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className={`w-8 h-8 ${item.iconColor}`} />
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 ${item.isLight === false ? 'text-white' : 'text-[#2D2A26]'}`}>{item.title}</h3>
                      <p className={`leading-relaxed text-base ${item.isLight === false ? 'text-white/80' : 'text-[#2D2A26]/80'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. JOURNEY: Zigzag Layout */}
      <section className="py-32 px-6 overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="text-sm font-bold uppercase tracking-wider text-[#E76F51]">Since 2010</span>
          <h2 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mt-4">The Journey</h2>
        </div>

        <div className="max-w-6xl mx-auto space-y-32">
          {[
            {
              year: "2010",
              title: "The Spark",
              desc: "Founded with a single board and a simple vision in a small garage.",
              image: "/image1.jpg"
            },
            {
              year: "2014",
              title: "The Expansion",
              desc: "Moved to our first dedicated center. The family grew to 100 students.",
              image: "/image6.jpg"
            },
            {
              year: "2018",
              title: "Going Digital",
              desc: "Breaking barriers. Launched online coaching globally to reach students everywhere.",
              image: "/image7.jpg"
            },
            {
              year: "2023",
              title: "The Future",
              desc: "Integrating AI learning and grandmaster mentorship as we look ahead.",
              image: "/image10.jpg"
            }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>

              {/* Text Side */}
              <div className="flex-1 space-y-6">
                <div className="text-7xl font-black text-[#E6E0D4] leading-none">{item.year}</div>
                <h3 className="text-4xl font-bold text-[#2D2A26]">{item.title}</h3>
                <p className="text-xl text-[#5C5852] leading-relaxed max-w-md">{item.desc}</p>
              </div>

              {/* Image Side */}
              <div className="flex-1 w-full">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          ))}
        </div>
      </section >

      {/* 6. ACHIEVEMENTS SECTION (Shared) */}
      < AchievementsSection />

      {/* 7. FAQ SECTION (Shared) */}
      < FaqSection />

      {/* 8. CTA: Full Width Impact */}
      < section className="relative py-22 bg-[#FDFBF7] text-[#2D2A26] overflow-hidden border-t border-[#E6E0D4]" >
        {/* Background Ambient Effects */}
        < div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFDA44]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E76F51]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div >

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            Your Move, <br />
            <span className="text-[#E76F51]">Champion.</span>
          </h2>
          <p className="text-xl text-[#5C5852] mb-12 max-w-2xl mx-auto">
            Join the academy that builds masters. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link href="/contact">
              <Button className="h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-bold hover:bg-[#E76F51] hover:text-white transition-all duration-300 shadow-2xl hover:shadow-[#E76F51]/20">
                Book Free Trial
              </Button>
            </Link>
            <span className="text-[#5C5852] font-medium hidden sm:block">or</span>
            <Link href="/courses" className="text-lg font-bold text-[#2D2A26] border-b-2 border-[#2D2A26]/20 hover:text-[#E76F51] hover:border-[#E76F51] transition-colors pb-1">
              View Curriculum
            </Link>
          </div>
        </div>
      </section >

    </div >
  );
}
"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { 
  Brain, Target, Scale, Gem, Heart, Crown, 
  TrendingUp, Award, Quote 
} from "lucide-react";
import Link from "next/link";
import { AchievementsSection } from "@/components/achievements-section";
import { FaqSection } from "@/components/faq-section";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
    desc: "We don't just play; we train. Verify your skills through rated tournaments and consistent gains.",
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
    colSpan: "md:col-span-2 lg:col-span-1"
  }
];

const dummyImages = [
  "/image.jpg", "/image1.jpg", "/image13.jpg",
  "/image3.jpg", "/image4.jpg", "/image5.jpg",
  "/image6.jpg", "/image7.jpg", "/image13.jpg",
];

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2D2A26] selection:bg-[#FFDA44]/30 overflow-x-hidden">

      {/* 1. HERO: The Manifesto */}
      <section className="relative pt-24 md:pt-40 pb-16 md:pb-24 px-4 text-center overflow-hidden">
        {/* Background "Film Strip" Effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transform -rotate-12 scale-125 md:scale-110">
            {dummyImages.map((src, i) => (
              <div key={i} className="aspect-square relative grayscale">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-4 block">
              More than just a game
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#2D2A26] mb-6 leading-[1.1] tracking-tighter">
              Master the <br />
              <span className="italic font-serif text-[#E76F51]">Minds</span>
            </h1>
            <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-medium">
              We don&apos;t just teach pieces moving on a board. We teach logic, resilience, and the art of pure thinking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. MISSION: Split Layout */}
      <section id="mission" className="py-12 md:py-24 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text Side */}
          <div className="lg:sticky lg:top-32 h-fit space-y-8 text-center lg:text-left">
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="w-12 h-[2px] bg-[#E76F51] hidden lg:block"></div>
                <span className="text-xs md:text-sm font-black uppercase tracking-widest text-[#E76F51]">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#2D2A26] leading-[1.1] mb-6 md:mb-8">
                To Create <br className="hidden md:block" />
                <span className="italic font-serif text-[#E76F51]">Thinking</span> Players.
              </h2>
              <div className="space-y-4 text-base md:text-lg text-[#5C5852] leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                <p>
                  Most academies teach you &lsquo;what&rsquo; to move. At Royal Rook, we obsess over &lsquo;why&rsquo;. We are building a generation of players who understand that every move has a consequence.
                </p>
                <p>
                  Whether you are 6 or 60, our structured path takes you from absolute beginner to confident competitor, one pure move at a time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#E6E0D4] max-w-md mx-auto lg:mx-0">
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-[#2D2A26] mb-1">600+</h3>
                <p className="text-[10px] text-[#5C5852] uppercase font-black tracking-widest">Active Students</p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-[#2D2A26] mb-1">50+</h3>
                <p className="text-[10px] text-[#5C5852] uppercase font-black tracking-widest">Expert Coaches</p>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full mt-10 lg:mt-0">
            <motion.div
              style={{ y: typeof window !== 'undefined' && window.innerWidth > 1024 ? y : 0 }}
              className="absolute top-0 right-0 w-[85%] lg:w-3/4 h-[250px] sm:h-[350px] lg:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl z-10 border-4 md:border-8 border-white"
            >
              <Image src="/image13.jpg" alt="Chess Focus" fill className="object-cover" />
            </motion.div>

            <div className="absolute bottom-0 left-0 w-[80%] lg:w-2/3 h-[220px] sm:h-[300px] lg:h-[350px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl z-20 border-4 md:border-8 border-white">
              <Image src="/image14.jpg" alt="Child Learning" fill className="object-cover" />
            </div>

            <div className="absolute bottom-1/4 right-0 md:right-10 bg-[#FFDA44] p-4 md:p-6 rounded-2xl shadow-xl z-30 transform scale-75 md:scale-100">
              <Crown className="w-8 h-8 md:w-10 md:h-10 text-[#2D2A26]" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUNDER SECTION */}
      <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E76F51] mb-3 block">The Visionary</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-4">
              Meet the <span className="text-[#E76F51]">Founder</span>
            </h2>
            <div className="h-1.5 w-20 bg-[#FFDA44] mx-auto rounded-full" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#FDFBF7] to-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-[#E6E0D4] relative"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative z-10">
              <div className="w-full lg:w-1/3 flex-shrink-0">
                <div className="relative">
                  <div className="aspect-square max-w-[320px] md:max-w-[400px] mx-auto rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                    <Image src="/image3.jpg" alt="Founder" fill className="object-cover" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#5C1F1C] text-white p-3 md:p-4 rounded-2xl shadow-lg">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-[#FFDA44]" />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl md:text-4xl font-black text-[#2D2A26] mb-2">
                  Prashant 
                </h3>
                <p className="text-[#E76F51] font-black uppercase tracking-widest text-[10px] md:text-xs mb-6">
                  Founder & Chief Coach
                </p>

                <div className="space-y-4 text-sm md:text-base text-[#5C5852] font-medium leading-relaxed mb-8 max-w-2xl">
                  <p>
                    Founded Royal Rook Academy with a simple yet powerful belief: that chess is not just for the gifted, but for the persistent.
                  </p>
                  <p>
                    With over <strong className="text-[#2D2A26]">10 years</strong> of experience, he brings a depth of understanding that transforms how students perceive the game.
                  </p>
                </div>

                <div className="bg-[#2D2A26] text-white p-6 md:p-8 rounded-[1.5rem] relative mb-10">
                   <Quote className="absolute -top-4 left-6 text-[#FFDA44] w-10 h-10 opacity-20" />
                   <p className="font-serif italic text-base md:text-xl leading-relaxed">
                    &quot;Chess is life in miniature. Every move teaches patience, and every game builds a stronger character.&quot;
                   </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: "10+", lab: "Years Exp", bg: "bg-[#FFDA44]/10" },
                    { val: "600+", lab: "Students", bg: "bg-[#E76F51]/10" },
                    { val: "50+", lab: "Tournament Wins", bg: "bg-[#2A9D8F]/10" }
                  ].map((stat, i) => (
                    <div key={i} className={`text-center p-4 rounded-2xl ${stat.bg}`}>
                      <p className="text-xl md:text-2xl font-black text-[#2D2A26]">{stat.val}</p>
                      <p className="text-[8px] md:text-[10px] font-black text-[#5C5852] uppercase tracking-widest">{stat.lab}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. PILLARS */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E76F51] mb-2 block">Our Philosophy</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-4">
              The <span className="text-[#E76F51]">Foundation</span>
            </h2>
            <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto font-medium opacity-80">
              Built on unshakeable pillars designed to guarantee intellectual growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {foundationItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${item.colSpan || ''} h-full`}
                >
                  <div className={`h-full bg-gradient-to-br ${item.gradient} rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-xl relative overflow-hidden group`}>
                    <div className="relative z-10">
                      <div className={`${item.iconBg} w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110`}>
                        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${item.iconColor}`} />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-black mb-3 ${item.isLight === false ? 'text-white' : 'text-[#2D2A26]'}`}>{item.title}</h3>
                      <p className={`text-sm md:text-base font-medium leading-relaxed ${item.isLight === false ? 'text-white/80' : 'text-[#2D2A26]/80'}`}>
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

      {/* 5. JOURNEY */}
      <section className="py-20 md:py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#E76F51]">Since 2015</span>
          <h2 className="text-4xl md:text-7xl font-black text-[#2D2A26] mt-4 tracking-tighter">The Journey</h2>
        </div>

        <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">
          {[
            { y: "2015", t: "The Spark", d: "Founded with a single board and a simple vision to spread chess awareness.", img: "/image1.jpg" },
            { y: "2018", t: "Growth Phase", d: "Expanded to multiple batches as the word of our methodology spread.", img: "/image6.jpg" },
            { y: "2021", t: "Going Digital", d: "Launched online coaching globally to reach students across different timezones.", img: "/image7.jpg" },
            { y: "2024", t: "The Future", d: "Integrating advanced training modules as we build the next gen of masters.", img: "/image10.jpg" }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col lg:flex-row items-center gap-10 md:gap-16 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="text-5xl md:text-8xl font-black text-[#E6E0D4] leading-none">{item.y}</div>
                <h3 className="text-2xl md:text-4xl font-black text-[#2D2A26]">{item.t}</h3>
                <p className="text-base md:text-xl text-[#5C5852] leading-relaxed font-medium max-w-md mx-auto lg:mx-0">{item.d}</p>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[#FDFBF7]">
                  <Image src={item.img} alt={item.t} fill className="object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 & 7. SHARED SECTIONS */}
      <AchievementsSection />
      <FaqSection />

      {/* 8. CTA */}
      <section className="relative py-20 md:py-32 bg-[#FDFBF7] text-[#2D2A26] border-t border-[#E6E0D4]" >
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
            Your Move, <br />
            <span className="text-[#E76F51]">Champion.</span>
          </h2>
          <p className="text-base md:text-xl text-[#5C5852] mb-12 max-w-2xl mx-auto font-medium">
            Join the academy that builds masters. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button className="w-full h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-bold hover:bg-[#E76F51] transition-all shadow-xl">
                Book Free Trial
              </Button>
            </Link>
            <Link href="/courses" className="text-lg font-black text-[#2D2A26] border-b-2 border-[#2D2A26]/20 hover:text-[#E76F51] hover:border-[#E76F51] transition-colors pb-1 uppercase tracking-widest text-xs md:text-sm">
              View Curriculum
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
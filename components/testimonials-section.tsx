"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Quote, MessageCircle, Star,
  ShieldCheck, Trophy, Medal, Zap, Presentation, Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Narayanaswami K",
    role: "",
    achievement: "Parent Success",
    text: "The dedication and commitment of Praveen Sir makes this academy stand out. It's situated in a clam and quiet residential area. The well lit and ventilated class room with super enthusiastic kids adds to the charm of the accademy. Recently they have introduced Online classes as well. Wishing the academy all success!",
    image: "/nara.png",
  },
  {
    id: 2,
    name: "Manju Biju",
    role: "",
    achievement: "Tournament Wins",
    text: "Hi I am abhivanth ob.It's been 8 months in royal chess academy..The coach is supportive and good teaching and also disciplined person..I am really happy to improve my skills in royal chess academy 😊😊",
    image: "/mmm.png",
  },
  {
    id: 3,
    name: "Meenakshi Venkateshwaran",
    role: "Parent",
    achievement: "Fundamentals",
    text: "Excellent chess academy with a fantastic coach! The training sessions were engaging, informative, and tailored to individual needs. The coach's expertise and passion for chess are evident, and their teaching style made complex concepts easy to understand. We've seen significant improvement in my son's game since joining. Highly recommend!",
    image: "/mmm.png",
  },
  {
    id: 4,
    name: "Ashima ajayan",
    role: "Parent",
    achievement: "Strategic Thinking",
    text: "My son has been studying chess class for the last 3 months.I've seen a significant improvement and confidence in his game.The classes are well-structured and the instructor provides personalised feedback.I highly recommended this class to improve their chess skills. It's been a wonderful experience.",
    image: "/aaa.png",
  },
];

const successStats = [
  {
    label: "Active Students",
    value: "100+",
    description: "Mentored across various levels from beginners to advanced players.",
    icon: <Users className="w-6 h-6 text-[#FFDA44]" />
  },
  {
    label: "Success Rate",
    value: "95%",
    description: "Of our students report higher confidence and better strategic thinking.",
    icon: <Trophy className="w-6 h-6 text-[#FFDA44]" />
  },
  {
    label: "Experience",
    value: "10+ Yrs",
    description: "Dedicated to nurturing young minds through professional chess coaching.",
    icon: <Medal className="w-6 h-6 text-[#FFDA44]" />
  }
];

export default function StudentSuccessAndTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 800);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const currentProfile = testimonials[currentIndex];

  return (
    <div className="overflow-x-hidden" style={{ backgroundColor: "#FDFBF7" }}>
      {/* --- SECTION 1: WHY OUR STUDENTS SUCCEED --- */}
      <section className="relative w-full py-6 overflow-hidden border-b border-[#E6E0D4]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#E76F51]/[0.05] rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-24">

            {/* Left: Content - Reordered for Mobile (Order 2) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10 mb-6">
                <ShieldCheck className="w-4 h-4 text-[#E76F51]" />
                <span className="text-[10px] font-black tracking-[0.2em] text-[#E76F51] uppercase">Proven Mentorship</span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] leading-[1.1] mb-6 md:mb-8">
                Why Parents Trust <br className="hidden md:block" />
                <span className="text-[#E76F51]">Our Academy</span>
              </h2>

              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-[#5C5852] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                <p>
                  We don&apos;t just teach chess; we build
                  <span className="text-[#2D2A26] font-bold"> character, discipline, and strategic thinking </span>
                  that helps children excel in life and competitions.
                </p>
                <p className="hidden md:block">
                  Our curriculum focuses on building strong fundamentals, ensuring every child develops a deep understanding of the game at their own pace.
                </p>
                <p className="bg-white p-5 md:p-6 rounded-2xl border-l-4 border-[#FFDA44] shadow-sm text-left">
                  From building confidence to achieving <span className="text-[#E76F51] font-bold">tournament success</span>, our personalized approach makes learning fun and effective.
                </p>
              </div>

              <div className="mt-8 md:mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/contact" className="w-full sm:w-auto">
                  <button className="w-full h-14 px-8 rounded-2xl bg-[#E76F51] hover:bg-[#cf5d42] text-white font-bold text-lg shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                    Book a Free Demo
                    <Presentation className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Image - Reordered for Mobile (Order 1) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2 px-4 md:px-0"
            >
              <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white">
                <Image
                  src="/image7.jpg"
                  alt="Chess coaching session"
                  width={800}
                  height={800}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/40 to-transparent" />
              </div>

              {/* Floating Stat Card - Calibrated for small screens */}
              <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 z-20 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-[#E6E0D4] max-w-[170px] md:max-w-[240px]">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <Zap className="text-[#FFDA44] w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xl md:text-2xl font-black text-[#2D2A26]">Focus</span>
                </div>
                <p className="text-[10px] md:text-xs font-bold text-[#5C5852] uppercase tracking-widest leading-tight">
                  Improved concentration in 100% of students.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {successStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-[#E6E0D4] hover:border-[#E76F51]/20 transition-all group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#FDFBF7] shadow-sm flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <h4 className="text-3xl md:text-4xl font-black text-[#2D2A26] mb-1">{stat.value}</h4>
                <p className="text-[10px] font-black text-[#E76F51] uppercase tracking-[0.2em] mb-2 md:mb-3">{stat.label}</p>
                <p className="text-[#5C5852] text-xs md:text-sm font-medium leading-relaxed italic">{stat.description}</p>
              </motion.div>
            ))}
          </div> */}
        </div>
      </section>

      {/* --- SECTION 2: TESTIMONIALS --- */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: "#FDFBF7" }}>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-[#FFDA44]/[0.1] rounded-full blur-[60px] md:blur-[80px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl">

          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10 mb-4"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#E76F51]" />
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-[#2D2A26] uppercase">
                Real Stories
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] leading-[1.2] tracking-tight"
            >
              Loved by our <br />
              <span className="relative inline-block text-[#E76F51]">
                Parent Community
                <span className="absolute -bottom-1 left-0 w-full h-1.5 md:h-2 bg-[#FFDA44]/30 -z-10 rounded-full" />
              </span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">

            {/* --- LEFT: The Card Slider --- */}
            <div className="lg:col-span-7 relative min-h-[450px] sm:min-h-[500px] md:min-h-[520px] w-full flex items-center justify-center lg:justify-start perspective-1000 order-1">
              {/* Stack Decorations - Only on tablets/desktop for cleanliness */}
              <div className="hidden sm:block absolute top-6 left-6 w-[90%] md:w-full max-w-lg h-full bg-[#E76F51]/5 rounded-[2rem] md:rounded-[3rem] border border-[#E76F51]/10 transform rotate-3 z-0" />
              <div className="hidden sm:block absolute top-3 left-3 w-[95%] md:w-full max-w-lg h-full bg-white rounded-[2rem] md:rounded-[3rem] border border-[#E6E0D4] transform rotate-1 shadow-xl z-10" />

              <div className="relative w-full max-w-lg h-full z-20">
                <AnimatePresence mode="wait">
                  {!isAnimating && (
                    <motion.div
                      key={currentProfile.id}
                      initial={{ opacity: 0, scale: 0.95, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 100, rotate: 5 }}
                      className="w-full h-full bg-white rounded-[2rem] md:rounded-[3rem] border border-[#E6E0D4] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-14 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute -top-4 -right-4 bg-[#FDFBF7] p-6 md:p-10 rounded-bl-[2rem] md:rounded-bl-[4rem] text-[#FFDA44]">
                        <Quote className="w-6 h-6 md:w-10 md:h-10 opacity-20 fill-current" />
                      </div>

                      <div className="relative z-10">
                        <div className="mb-4 md:mb-8">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="px-2.5 py-1 bg-[#FFDA44] rounded-md text-[9px] md:text-[10px] font-black text-[#2D2A26] uppercase tracking-widest">
                              {currentProfile.achievement}
                            </div>
                          </div>
                          <h3 className="text-xl md:text-3xl font-black text-[#2D2A26] leading-none">
                            {currentProfile.name}
                          </h3>
                          <p className="text-[#E76F51] font-bold text-xs mt-1 uppercase tracking-wider">{currentProfile.role}</p>
                          <div className="w-12 md:w-16 h-1 bg-[#FFDA44] rounded-full mt-3" />
                        </div>
                        <p className="text-[#5C5852] text-base md:text-xl font-semibold italic leading-relaxed">
                          &quot;{currentProfile.text}&quot;
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#E6E0D4]">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="relative w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border-2 border-[#FFDA44] shadow-lg">
                            <Image
                              src={currentProfile.image}
                              alt={currentProfile.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] md:text-[10px] font-black text-[#2D2A26] uppercase tracking-widest leading-none">Verified Parent</p>
                            <div className="flex text-[#FFDA44] gap-0.5 mt-1.5">
                              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="md:w-3 md:h-3" fill="currentColor" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flying Plane Trajectory Calibrated for Mobile */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1.1, 0.7],
                        x: [0, 80, 400], // Reduced horizontal sweep for mobile
                        y: [0, -50, -200],
                        rotate: [0, -15, -45],
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 w-16 h-16 md:w-32 md:h-32 z-[60] pointer-events-none origin-center"
                      style={{ marginLeft: "-2rem", marginTop: "-2rem" }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#E76F51] drop-shadow-xl">
                        <path d="M2 12l20-9-9 20-2-9-9-2zm2.5-1l6.5 2.2 2.2 6.5 6.7-14.9-15.4 6.2z" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* --- RIGHT: Content & Controls --- */}
            <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left order-2">
              <h3 className="text-xl md:text-4xl font-black text-[#2D2A26] mb-4 md:mb-6 leading-tight uppercase px-4 md:px-0">
                Voices of our <br className="hidden md:block" />
                <span className="text-[#E76F51]">Growing Family</span>
              </h3>

              <p className="text-[#5C5852] text-sm md:text-xl font-medium mb-8 md:mb-10 leading-relaxed px-6 lg:px-0">
                Join hundreds of parents who have seen their children flourish through our dedicated chess mentorship programs.
              </p>

              <div className="flex gap-4 justify-center lg:justify-start">
                <button
                  onClick={handlePrev}
                  disabled={isAnimating}
                  className="group w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-3xl bg-white border border-[#E6E0D4] shadow-xl flex items-center justify-center text-[#2D2A26] hover:bg-[#E76F51] hover:text-white transition-all active:scale-95 disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="group w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-3xl bg-[#E76F51] shadow-[0_15px_30px_rgba(231,111,81,0.2)] flex items-center justify-center text-white hover:bg-[#cf5d42] transition-all active:scale-95 disabled:opacity-30"
                >
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
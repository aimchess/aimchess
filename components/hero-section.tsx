"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Star, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const sliderImages = [
  "/image5.jpg",
  "/image6.jpg",
  "/image4.jpg",
  "/image.jpg",
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % sliderImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-screen bg-[#FDFBF7] flex items-center justify-center overflow-hidden py-12 md:py-10">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-[#f8f4ec] -skew-x-12 translate-x-32 hidden lg:block -z-0" />
      <div className="absolute top-10 left-5 md:top-20 md:left-10 w-32 h-32 md:w-64 md:h-64 bg-yellow-400/10 rounded-full blur-3xl -z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE CONTENT - Order 2 on mobile, 1 on desktop */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 order-2 lg:order-1">
            
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E6E0D4]"
            >
              <Star className="w-4 h-4 md:w-5 md:h-5 text-[#E76F51] fill-current" />
              <span className="text-[10px] md:text-sm font-black text-[#2D2A26] tracking-widest uppercase">
                Certified FIDE Coaches
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-[#2D2A26] tracking-tight">
              <span className="text-[#E76F51]">Master</span> the Game,<br />
              Conquer the <span className="relative inline-block">
                Board
                <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-[#FFDA44]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-[#5C5852] max-w-lg leading-relaxed font-semibold">
              Join the world&apos;s best chess academy. Learn from Elite Coaches, compete in tournaments, and elevate your strategic thinking.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 md:px-10 py-6 md:py-7 text-base md:text-lg font-black rounded-full bg-[#FFDA44] text-[#2D2A26] hover:bg-[#ffcd1f] hover:scale-105 transition-all duration-300 shadow-xl shadow-yellow-400/20 border-2 border-[#2D2A26]/5"
                >
                  Start Learning Now
                </Button>
              </Link>
            </div>

            {/* Optional Stats Row (Uncommented for visual balance) */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4 w-full max-w-xs md:max-w-md">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-[#E76F51]/10 rounded-xl">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-[#E76F51]" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#2D2A26]">30+</div>
                  <div className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest">Years Experience</div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-[#FFDA44]/20 rounded-xl">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[#bda030]" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#2D2A26]">120+</div>
                  <div className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest">Wins</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE VISUALS - Order 1 on mobile, 2 on desktop */}
          <div className="relative flex justify-center lg:justify-end items-center order-1 lg:order-2">
            
            {/* Floating Crown */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-6 right-10 md:right-20 pointer-events-none z-30"
            >
              <Crown className="w-10 h-10 md:w-16 md:h-16 text-[#FFDA44] drop-shadow-lg fill-[#FFDA44]" />
            </motion.div>

            {/* Main Image Container */}
            <div className="relative w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[420px] h-[350px] sm:h-[400px] lg:h-[480px] z-20">
              
              {/* Image Frame */}
              <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl bg-[#2D2A26]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={sliderImages[currentIndex]}
                      alt="Chess Academy Training"
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 300px, 420px"
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/60 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Floating Banner */}
              <div className="absolute -bottom-4 -right-2 sm:-right-8 bg-[#E76F51] text-white py-2 px-4 md:py-3 md:px-6 rounded-xl shadow-xl z-40 flex items-center gap-2 md:gap-3">
                <div className="bg-white/20 p-1.5 md:p-2 rounded-full">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-black opacity-90 tracking-widest uppercase leading-none">Global Standard</span>
                  <span className="text-sm md:text-lg font-black uppercase tracking-wide leading-none mt-0.5 md:mt-1">Coaching</span>
                </div>
              </div>

              {/* Back Glow Effect */}
              <div className="absolute -inset-4 bg-[#FFDA44] rounded-[3rem] blur-3xl opacity-20 -z-10"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
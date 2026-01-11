"use client";

import { Button } from "@/components/ui/button";
import { Users, Trophy, Star, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// IMAGES FOR SLIDER
const sliderImages = [
  "/image1.jpg",
  "/image6.jpg",
  "/image4.jpg",
  "/image.jpg",
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-change images every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] bg-[#FDFBF7] flex items-center justify-center overflow-hidden py-22 font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-[#f8f4ec] -skew-x-12 translate-x-32 hidden lg:block -z-0" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -z-0" />

      <div className="container max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* LEFT SIDE CONTENT */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-fade-in-up">

            {/* Top Badge */}
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E6E0D4] transform hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5 text-[#E76F51] fill-current" />
              <span className="text-sm font-bold text-[#2D2A26] tracking-wide uppercase">Certified FIDE Coaches</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-extrabold leading-[1.1] text-[#2D2A26] tracking-tight">
              <span className="text-[#E76F51]">Master</span> the Game,<br />
              Conquer the <span className="relative inline-block">
                Board
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FFDA44]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-[#5C5852] max-w-lg leading-relaxed font-medium">
              Join the world&apos;s best chess academy. Learn from Grandmasters, compete in tournaments, and elevate your strategic thinking.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 py-7 text-lg font-bold rounded-full bg-[#FFDA44] text-[#2D2A26] hover:bg-[#ffcd1f] hover:scale-105 transition-all duration-300 shadow-xl shadow-yellow-400/20 border-2 border-[#2D2A26]/5"
                >
                  Start Learning Now
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-6 pt-4 w-full max-w-xs lg:max-w-md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#E76F51]/10 rounded-xl">
                  <Users className="w-6 h-6 text-[#E76F51]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#2D2A26]">600+</div>
                  <div className="text-sm text-gray-500 font-medium">Active Students</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFDA44]/20 rounded-xl">
                  <Trophy className="w-6 h-6 text-[#bda030]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#2D2A26]">120+</div>
                  <div className="text-sm text-gray-500 font-medium">Tournaments</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE VISUALS */}
          <div className="relative flex justify-center lg:justify-end items-center h-full min-h-[500px] animate-fade-in-up delay-100">

            {/* Decorative Floating Icons */}
            <div className="absolute top-0 right-10 lg:right-20 animate-bounce-gentle z-30 pointer-events-none">
              <Crown className="w-16 h-16 text-[#FFDA44] drop-shadow-lg fill-[#FFDA44]" />
            </div>
            <div className="absolute bottom-20 left-0 lg:left-10 animate-float z-30 pointer-events-none">
              <div className="bg-white p-4 rounded-2xl shadow-xl border border-[#E6E0D4] transform -rotate-6">
                <Trophy className="w-12 h-12 text-[#E76F51]" />
              </div>
            </div>

            {/* Main Image Container */}
            <div className="relative w-80 h-[40px] sm:w-96 sm:h-[400px] lg:w-[420px] lg:h-[480px] z-20">
              {/* Image Frame */}
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-[#2D2A26]">
                {sliderImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Chess Academy"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: index === currentIndex ? 1 : 0 }}
                  />
                ))}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/80 via-transparent to-transparent"></div>
              </div>

              {/* "World Champion" Style Banner */}
              <div className="absolute bottom-8 -right-4 sm:-right-12 bg-[#E76F51] text-white py-3 px-6 sm:px-8 rounded-lg shadow-xl transform rotate-0 sm:rotate-0 z-40 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold opacity-90 tracking-wider uppercase">World Class</span>
                  <span className="text-lg font-black uppercase tracking-wide leading-none">Coaching</span>
                </div>
              </div>

              {/* Back Glow */}
              <div className="absolute -inset-4 bg-[#FFDA44] rounded-[3rem] blur-2xl opacity-20 -z-10 animate-pulse-glow"></div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

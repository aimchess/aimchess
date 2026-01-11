"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Star,
  Users,
  Calendar,
  Target,
  Brain,
  Award,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Brand Colors
const primaryColor = "#5C1F1C";
const accentColor = "#FFC727";

function ThreeDCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      className={`transform-gpu transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

export default function CoachesPage() {
  const coaches = [
    {
      id: 1,
      name: "Arjun Malhotra",
      title: "Head Coach & Grandmaster",
      image: "/demo/coach-1.jpg",
      specialization: ["Middlegame Strategy", "Endgame Precision", "Opening Repertoire"],
      achievements: ["FIDE Grandmaster", "ELO 2580", "20+ Years Coaching"],
      experience: "20+ Years",
      students: "320+",
      bio: "Former national champion with 5 gold medals. Trains India’s top U-18 talents. Known for deep positional understanding and custom opening labs.",
      level: "Advanced",
      date: "2025-11-20",
    },
    {
      id: 2,
      name: "Priya Sharma",
      title: "Senior Coach & Women’s Chess Director",
      image: "/demo/coach-2.jpg",
      specialization: ["Tactical Combinations", "Psychological Prep", "Women’s Chess"],
      achievements: ["International Master", "ELO 2420", "National Women’s Champion 2022"],
      experience: "14+ Years",
      students: "210+",
      bio: "Runs the 'Rising Queens' program. Coached 8 girls to WIM/WFM titles. Expert in dynamic Sicilian and French Defense systems.",
      level: "Intermediate",
      date: "2025-11-22",
    },
    {
      id: 3,
      name: "Vikram Desai",
      title: "Junior Coach & Online Chess Expert",
      image: "/demo/coach-3.jpg",
      specialization: ["Beginner to 2000", "AI Training Tools", "Lichess/Chess.com Mastery"],
      achievements: ["FIDE Master", "ELO 2380", "Lichess Coach of the Year 2024"],
      experience: "10+ Years",
      students: "180+",
      bio: "Pioneer in AI-assisted coaching. Uses Stockfish, Leela, and Lichess Studies. Runs 60+ weekly online group sessions.",
      level: "Beginner",
      date: "2025-11-25",
    },
    {
      id: 4,
      name: "Neha Kapoor",
      title: "Assistant Coach & Tactics Specialist",
      image: "/demo/coach-4.jpg",
      specialization: ["Pattern Recognition", "Puzzle Drills", "Blitz & Bullet"],
      achievements: ["FIDE Rated 2290", "Asian Rapid Champion 2023", "7+ Years"],
      experience: "7+ Years",
      students: "140+",
      bio: "Students solve 120 puzzles/day. Average ELO gain: 380 in 6 months. Runs weekend 'Tactics Marathon' with live commentary.",
      level: "Intermediate",
      date: "2025-11-28",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section - Responsive */}
      <section
        className="relative py-30 sm:py-28 md:py-36 lg:py-40 text-white overflow-hidden"
        style={{
          backgroundImage: 'url("/coachbg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <Badge
            className="mb-3 text-xs sm:mb-4 sm:text-sm md:mb-6 md:text-lg"
            style={{ backgroundColor: accentColor, color: primaryColor }}
          >
            Meet Our Team
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 sm:mb-4 md:mb-6 leading-tight">
            Our Expert Coaches
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-10 opacity-90">
            Learn from titled players and proven mentors who’ve trained national champions.
          </p>
        </div>
      </section>

      {/* Coaches Grid - Responsive 3D Glass Cards */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {coaches.map((coach, i) => (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <ThreeDCard className="h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
                  <div
                    className="bg-gradient-to-br from-[#5C1F1C] to-[#8B4513] p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl h-full"
                  >
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl h-full overflow-hidden flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72">
                        <Image
                          src={coach.image}
                          alt={coach.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <Badge className="bg-gradient-to-r from-[#FFC727] to-[#FFD700] text-[#5C1F1C] font-bold text-xs sm:text-sm">
                            {coach.title.split(" ")[0]}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-6 flex-1 flex flex-col">
                        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold mb-1 text-[#5C1F1C] line-clamp-1">
                          {coach.name}
                        </h3>
                        <p className="text-[#FFC727] font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 line-clamp-1">
                          {coach.title}
                        </p>

                        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-4">
                          {coach.bio}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="text-center bg-gradient-to-br from-[#5C1F1C]/10 to-[#8B4513]/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#5C1F1C]/20">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-[#5C1F1C]" />
                            <p className="text-xs font-medium text-gray-600">Experience</p>
                            <p className="font-bold text-[#5C1F1C] text-sm sm:text-base lg:text-lg">{coach.experience}</p>
                          </div>
                          <div className="text-center bg-gradient-to-br from-[#8B4513]/10 to-[#A0522D]/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#5C1F1C]/20">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-[#5C1F1C]" />
                            <p className="text-xs font-medium text-gray-600">Students</p>
                            <p className="font-bold text-[#5C1F1C] text-sm sm:text-base lg:text-lg">{coach.students}</p>
                          </div>
                        </div>

                        {/* Specializations */}
                        <div className="mb-4 sm:mb-6">
                          <h4 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-[#FFC727]">
                            <Target className="w-4 h-4 sm:w-5 sm:h-5" /> Specializations
                          </h4>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {coach.specialization.map((spec, idx) => (
                              <Badge
                                key={idx}
                                className="bg-[#5C1F1C]/10 text-[#5C1F1C] border-[#5C1F1C]/20 text-xs"
                              >
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="mb-4 sm:mb-6">
                          <h4 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-[#FFC727]">
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> Key Achievements
                          </h4>
                          <div className="space-y-1.5 sm:space-y-2">
                            {coach.achievements.map((ach, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-700">
                                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C1F1C]" />
                                <span>{ach}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Link href="/contact" className="block mt-auto">
                          <Button
                            className="w-full bg-gradient-to-r from-[#FFC727] to-[#FFD700] text-[#5C1F1C] font-bold text-sm sm:text-base py-5 sm:py-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:shadow-yellow-500/40 transform hover:scale-105 transition-all duration-300"
                          >
                            Book Trial <ArrowRight className="ml-1.5 w-4 h-4 sm:ml-2 sm:w-5 sm:h-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ThreeDCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Responsive */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 sm:mb-12 lg:mb-16" style={{ color: primaryColor }}>
            Why Choose Our Coaches?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Star,
                title: "Proven Track Record",
                description: "Coached 3 national champions and 50+ titled players. Average student ELO gain: 350+.",
              },
              {
                icon: Brain,
                title: "Personalized Training",
                description: "Custom lesson plans, AI analysis, and weekly progress reports for every student.",
              },
              {
                icon: Trophy,
                title: "Tournament Ready",
                description: "Mock tournaments, psychological prep, and opening books tailored to your opponents.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-white/90 backdrop-blur-md border border-[#5C1F1C]/10 hover:border-[#5C1F1C]/30 p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-5 lg:mb-6 bg-[#5C1F1C]/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4" style={{ color: primaryColor }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 lg:mb-8" style={{ color: primaryColor }}>
            Ready to Start Learning?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
            Book a <strong className="text-[#5C1F1C]">free trial session</strong> with any coach. First 30 minutes on us.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#FFC727] to-[#FFD700] text-[#5C1F1C] px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 text-base sm:text-lg lg:text-xl font-bold rounded-full shadow-2xl hover:shadow-yellow-500/40 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Book Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
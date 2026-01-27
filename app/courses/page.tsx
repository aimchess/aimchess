"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  X,
  Check,
  Clock,
  Users,
  Brain,
  Zap,
  Star as StarIcon,
  Sparkles,
  Target
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CoursesSection } from "@/components/courses-section";

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const courses = [
    {
      id: "beginner",
      level: "Level 1: The Foundation",
      elo: "0 - 800 ELO",
      title: "Beginner Mastery",
      color: "text-[#2A9D8F]",
      bgColor: "bg-[#2A9D8F]",
      lightBg: "bg-[#2A9D8F]/10",
      description: "Stop guessing. Start thinking. Learn the correct way to view the board and calculate simple moves.",
      features: ["Board Vision", "Basic Tactics", "Opening Principles"],
      image: "/image1.jpg",
      topics: [
        "The Language of Chess (Notation)",
        "Piece Power & Movement",
        "The 3 Golden Rules of Opening",
        "Basic Checkmates (Ladder, Queen)",
        "Tactical Vision: Forks & Pins"
      ],
      schedule: "Mon & Wed, 4 PM",
      duration: "3 Months"
    },
    {
      id: "intermediate",
      level: "Level 2: The Tactician",
      elo: "800 - 1400 ELO",
      title: "Tactical Warfare",
      color: "text-[#E76F51]",
      bgColor: "bg-[#E76F51]",
      lightBg: "bg-[#E76F51]/10",
      description: "Games at this level are won by tactics. We make blunders a thing of the past through pattern recognition.",
      features: ["Calculation", "Pattern Recognition", "Endgame Basics"],
      image: "/image6.jpg",
      topics: [
        "Advanced Combinations",
        "The Art of Attack",
        "Positional Understanding",
        "King Safety & Weak Squares",
        "Rook Endgames"
      ],
      schedule: "Tue & Thu, 5 PM",
      duration: "4 Months"
    },
    {
      id: "advanced",
      level: "Level 3: The Strategist",
      elo: "1400+ ELO",
      title: "Strategic Depth",
      color: "text-[#FFDA44]",
      bgColor: "bg-[#FFDA44]",
      lightBg: "bg-[#FFDA44]/20",
      description: "Master deep planning, prophylaxis, and tournament psychology to compete at the highest levels.",
      features: ["Opening Repertoire", "Complex Endgames", "Psychology"],
      image: "/image4.jpg",
      topics: [
        "Grandmaster Opening Prep",
        "Minority Attacks & Pawn Storms",
        "Prophylaxis (Preventing Play)",
        "Complex Endgame Studies",
        "Tournament Psychology"
      ],
      schedule: "Sat & Sun, 10 AM",
      duration: "6 Months"
    }
  ];

  const dummyImages = ["/image.jpg", "/image1.jpg", "/image13.jpg", "/image3.jpg", "/image4.jpg", "/image5.jpg", "/image6.jpg", "/image7.jpg"];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 overflow-x-hidden">

      {/* 1. HERO */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transform -rotate-12 scale-125 md:scale-110">
            {dummyImages.map((src, i) => (
              <div key={i} className="aspect-square relative grayscale">
                <Image src={src} alt="" fill className="object-cover" priority={i < 4} />
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-4 block">
              Curriculum Roadmap
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-[#2D2A26] mb-6 leading-[1.1] tracking-tight">
              Choose Your <br className="md:hidden" /> <span className="italic font-serif text-[#E76F51]">Battlefield</span>
            </h1>
            <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-medium">
              A structured path from learning the rules to breaking them like a Master. Select your level to begin.
            </p>
          </motion.div>
        </div>
      </section>

      <CoursesSection/>

      {/* 3. PHILOSOPHY */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
              <Image src="/image5.jpg" alt="Teaching" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
                <div className="bg-white/95 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-white/20 shadow-xl">
                  <p className="font-serif italic text-lg md:text-xl text-[#2D2A26]">&quot;We do not teach you to memorize. We teach you to understand the logic.&quot;</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10">
              <Sparkles className="w-3 h-3 text-[#E76F51]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E76F51]">Our Philosophy</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#2D2A26] leading-tight">
              Why We <span className="text-[#E76F51]">Train</span> Differently
            </h2>
            <div className="space-y-6 md:space-y-8">
              {[
                { icon: Brain, title: "Logic Over Rote", desc: "Know the 'why' behind every move. We build understanding, not just memory." },
                { icon: Zap, title: "Active Learning", desc: "No passive lectures. You solve, you play, and you analyze in every single class." },
                { icon: Target, title: "Personalized Goals", desc: "Whether local wins or FIDE ratings, we tailor the path to your ambition." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 md:gap-6">
                  <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] flex items-center justify-center border border-[#E6E0D4] flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#E76F51]" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-[#2D2A26] mb-1">{item.title}</h4>
                    <p className="text-sm md:text-base text-[#5C5852] font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUCCESS */}
      <section className="py-16 md:py-24 px-4 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#E76F51]">Proven Results</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#2D2A26] mt-2 mb-4 md:mb-6">
            Why Our Students <span className="text-[#E76F51]">Succeed</span>
          </h2>
          <p className="text-base md:text-xl text-[#5C5852] font-medium">A systematic approach to building chess intuition.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: "Structured Roadmap", desc: "Step-by-step curriculum ensures no gaps in your game knowledge." },
            { title: "Weekly Events", desc: "Internal tournaments to test skills under real clock pressure." },
            { title: "Game Analysis", desc: "Coaches review your tournament games to find recurring mistakes." },
            { title: "Mental Toughness", desc: "Psychology training for handling pressure and time trouble." }
          ].map((item, i) => (
            <Card key={i} className="p-6 md:p-8 bg-white border-[#E6E0D4] hover:shadow-xl hover:border-[#E76F51] transition-all rounded-[2rem] text-center group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFDA44]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <StarIcon className="w-5 h-5 text-[#2D2A26]" />
              </div>
              <h3 className="text-base md:text-lg font-black text-[#2D2A26] mb-3 uppercase tracking-tight">{item.title}</h3>
              <p className="text-xs md:text-sm text-[#5C5852] font-medium leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-20 md:py-32 px-4 bg-white border-t border-[#E6E0D4]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-7xl font-black text-[#2D2A26] mb-8 leading-tight tracking-tighter">
            Ready to make <br />
            your <span className="text-[#E76F51]">Move?</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button className="w-full h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-black hover:bg-[#E76F51] transition-all shadow-xl">
                Enroll Now
              </Button>
            </Link>
            <Link href="/contact" className="text-base md:text-lg font-black text-[#2D2A26] border-b-2 border-[#2D2A26]/10 hover:text-[#E76F51] hover:border-[#E76F51] transition-colors pb-1 uppercase tracking-widest">
              Free Evaluation
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FDFBF7] border-none p-0">
          {selectedCourse && (
            <div className="flex flex-col lg:flex-row min-h-full">
              {/* Top/Left Image */}
              <div className="w-full lg:w-2/5 relative h-64 lg:h-auto shrink-0">
                <Image src={selectedCourse.image} alt={selectedCourse.title} fill className="object-cover" />
                <div className={`absolute inset-0 opacity-40 mix-blend-multiply ${selectedCourse.bgColor}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white pr-6">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{selectedCourse.level}</p>
                  <h2 className="text-3xl font-black leading-tight tracking-tight">{selectedCourse.title}</h2>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 p-6 md:p-10 lg:p-12 relative">
                <button onClick={() => setSelectedCourse(null)} className="absolute top-4 right-4 p-2 bg-black/5 rounded-full hover:bg-black/10">
                  <X className="w-5 h-5 text-[#2D2A26]" />
                </button>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-xs font-black text-[#5C5852] uppercase tracking-widest">
                    <Clock className="w-4 h-4 text-[#E76F51]" /> {selectedCourse.duration}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-[#5C5852] uppercase tracking-widest">
                    <Users className="w-4 h-4 text-[#E76F51]" /> {selectedCourse.schedule}
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="text-lg font-black text-[#2D2A26] mb-4 uppercase tracking-widest border-b border-[#E6E0D4] pb-2">Full Syllabus</h3>
                  <ul className="grid grid-cols-1 gap-3">
                    {selectedCourse.topics.map((topic: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm md:text-base font-medium text-[#5C5852]">
                        <Check className={`w-4 h-4 mt-1 flex-shrink-0 ${selectedCourse.color}`} />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/contact" className="block mt-auto">
                  <Button className={`w-full py-7 text-lg font-black text-white ${selectedCourse.bgColor} hover:brightness-95 rounded-2xl shadow-xl transition-all`}>
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
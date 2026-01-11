"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Target,
  Trophy,
  ArrowRight,
  X,
  Check,
  Clock,
  Users,
  Brain,
  Zap,
  Star as StarIcon
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

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
      description: "Stop guessing. Start thinking. Learn the correct way to view the board.",
      features: ["Board Vision", "Basic Tactics", "Opening Principles"],
      image: "/chess-academy-instructor-teaching-students.jpg",
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
      description: "Games are won by tactics. Blunders vanish here.",
      features: ["Calculation", "Pattern Recognition", "Endgame Basics"],
      image: "/chess-tournament.png",
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
      description: "Deep plans. Prophylaxis. Tournament psychology.",
      features: ["Opening Repertoire", "Complex Endgames", "Psychology"],
      image: "/chess-simultaneous.jpg",
      topics: [
        "Grandmaster Opening Prep",
        "Minority Attacks & Pawn Storms",
        "Prophylaxis (Preventing Counterplay)",
        "Complex Endgame Studies",
        "Tournament Psychology"
      ],
      schedule: "Sat & Sun, 10 AM",
      duration: "6 Months"
    }
  ];


  const dummyImages = [
    "/image.jpg", "/image1.jpg", "/image13.jpg",
    "/image3.jpg", "/image4.jpg", "/image5.jpg",
    "/image6.jpg", "/image7.jpg", "/image13.jpg",
    "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20">

      {/* 1. HERO */}
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
              Curriculum Roadmap
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-6 leading-tight tracking-tight">
              Choose Your <span className="italic font-serif text-[#E76F51]">Battlefield</span>
            </h1>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              A structured path from learning the rules to breaking them like a Master. Select your starting point.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. COURSES GRID (Unified View) */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedCourse(course)}
                className="cursor-pointer group h-full"
              >
                <div className="bg-white rounded-[2rem] border border-[#E6E0D4] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col relative">
                  {/* Top Color Bar */}
                  <div className={`h-2 w-full ${course.bgColor}`} />

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={`${course.lightBg} ${course.color} hover:${course.lightBg} border-none font-bold`}>
                        {course.elo}
                      </Badge>
                      <div className={`p-2 rounded-full ${course.lightBg} group-hover:scale-110 transition-transform`}>
                        <ArrowRight className={`w-5 h-5 ${course.color}`} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-extrabold text-[#2D2A26] mb-3 group-hover:text-[#E76F51] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-[#5C5852] text-sm leading-relaxed mb-6 flex-1">
                      {course.description}
                    </p>

                    <div className="space-y-3 pt-6 border-t border-[#E6E0D4]">
                      {course.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-[#2D2A26]/80 font-medium">
                          <Check className={`w-4 h-4 ${course.color}`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#FDFBF7] text-center border-t border-[#E6E0D4] group-hover:bg-[#E76F51] transition-colors">
                    <span className="text-sm font-bold text-[#5C5852] group-hover:text-white uppercase tracking-wider transition-colors">View Details</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TEACHING PHILOSOPHY */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
              <Image src="/image5.jpg" alt="Teaching Philosophy" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <p className="font-serif italic text-xl text-[#2D2A26]">"We do not teach you to memorize. We teach you to understand."</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <span className="text-sm font-bold uppercase tracking-wider text-[#E76F51]">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#2D2A26]">
              Why We <span className="text-[#E76F51]">Train</span> Differently
            </h2>
            <div className="space-y-6">
              {[
                { icon: Brain, title: "Logic Over Rote", desc: "Most build memory we build understanding. Know the 'why' behind every move." },
                { icon: Zap, title: "Active Learning", desc: "No passive lectures. You solve, you play, you analyze in every single class." },
                { icon: Target, title: "Personalized Goals", desc: "Whether you want to beat your dad or become a GM, we tailor the path." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] flex items-center justify-center border border-[#E6E0D4] flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#E76F51]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#2D2A26] mb-1">{item.title}</h4>
                    <p className="text-[#5C5852]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STUDENT SUCCESS */}
      <section className="py-24 px-6 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-[#E76F51]">Proven Results</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2D2A26] mt-2 mb-6">
            Why Our Students <span className="text-[#E76F51]">Succeed</span>
          </h2>
          <p className="text-xl text-[#5C5852]">It's not magic. It's a system designed for growth.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Structured Curriculum", desc: "Step-by-step formatting ensures no gaps in knowledge." },
            { title: "Regular Tournaments", desc: "Weekly practice events to test new skills under pressure." },
            { title: "Expert Analysis", desc: "Coaches review your games to find and fix recurring mistakes." },
            { title: "Psychological Training", desc: "Learn to handle pressure, time trouble, and defeat." }
          ].map((item, i) => (
            <Card key={i} className="p-8 bg-white border-[#E6E0D4] hover:shadow-xl hover:border-[#E76F51] transition-all rounded-[2rem] text-center group">
              <div className="w-12 h-12 bg-[#FFDA44]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <StarIcon className="w-6 h-6 text-[#2D2A26]" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2A26] mb-3">{item.title}</h3>
              <p className="text-[#5C5852] text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-32 px-6 bg-white border-t border-[#E6E0D4]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-8 leading-tight tracking-tight">
            Ready to make your <br />
            <span className="text-[#E76F51]">Move?</span>
          </h2>
          <p className="text-xl text-[#5C5852] mb-12 max-w-2xl mx-auto">
            The board is set. The pieces are waiting. Your journey to mastery begins with a single step.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/contact">
              <Button className="h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-bold hover:bg-[#E76F51] hover:text-white transition-all duration-300 shadow-2xl hover:shadow-[#E76F51]/20">
                Enroll Now
              </Button>
            </Link>
            <span className="text-[#5C5852] font-medium hidden sm:block">or</span>
            <Link href="/contact" className="text-lg font-bold text-[#2D2A26] border-b-2 border-[#2D2A26]/20 hover:text-[#E76F51] hover:border-[#E76F51] transition-colors pb-1">
              Book Free Evaluation
            </Link>
          </div>
        </div>
      </section>

      {/* COURSE MODAL */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FDFBF7] border-none p-0">
          {selectedCourse && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Side */}
              <div className="w-full md:w-1/3 relative h-64 md:h-auto">
                <Image
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 opacity-40 mix-blend-multiply ${selectedCourse.bgColor}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white p-4">
                  <p className="text-sm font-bold uppercase opacity-80 mb-2">{selectedCourse.level}</p>
                  <h2 className="text-3xl font-extrabold leading-tight">{selectedCourse.title}</h2>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#5C5852]">
                    <Clock className="w-4 h-4" /> {selectedCourse.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#5C5852]">
                    <Users className="w-4 h-4" /> {selectedCourse.schedule}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#2D2A26] mb-4">Curriculum</h3>
                  <ul className="space-y-3">
                    {selectedCourse.topics.map((topic: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-[#5C5852]">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${selectedCourse.bgColor}`} />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/contact" className="block">
                  <Button className={`w-full py-6 text-lg font-bold text-white ${selectedCourse.bgColor} hover:opacity-90`}>
                    Enroll in Course
                  </Button>
                </Link>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-50 text-white md:text-[#2D2A26]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
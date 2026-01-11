"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Target, Trophy, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const courses = [
  {
    level: "Beginner",
    icon: BookOpen,
    color: "text-[#2A9D8F]",
    bgLight: "bg-[#2A9D8F]/10",
    border: "border-[#2A9D8F]/20",
    gradient: "from-[#2A9D8F] to-[#264653]",
    title: "Foundations",
    description: "From zero knowledge to playing full games confidently.",
    topics: [
      "Introduction to pieces",
      "Movement & Capturing",
      "Checkmate & Castling",
      "Golden Opening Rules",
      "En Passant",
    ],
  },
  {
    level: "Intermediate",
    icon: Target,
    color: "text-[#E76F51]",
    bgLight: "bg-[#E76F51]/10",
    border: "border-[#E76F51]/20",
    gradient: "from-[#E76F51] to-[#D9381E]",
    title: "Tactical Mastery",
    description: "Master tactics, spot patterns, and stop blundering.",
    topics: [
      "Forks, Pins, & Skewers",
      "Discovered Attacks",
      "Eliminating Defenders",
      "Mate in Two Patterns",
      "King + Rook Endgames",
    ],
  },
  {
    level: "Advanced",
    icon: Trophy,
    color: "text-[#FFC727]",
    textColor: "text-[#B4860B]",
    bgLight: "bg-[#FFDA44]/15",
    border: "border-[#FFDA44]/30",
    gradient: "from-[#FFDA44] to-[#FCA311]",
    title: "Strategic Depth",
    description: "Tournament-ready chess with deep planning.",
    topics: [
      "Complex Openings",
      "Breaching Defences",
      "Pawn Structures",
      "X-Ray & Interference",
      "GM Mini-Plans",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export function CoursesSection() {
  return (
    <section className="relative w-full bg-[#FDFBF7] py-16 md:py-24 font-sans overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-[#E76F51]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#FFDA44]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* --- Header Section --- */}
      <div className="relative px-4 text-center z-10 mb-12 md:mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-[#E6E0D4] mb-6 md:mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
          <span className="text-[10px] md:text-sm font-black text-[#2D2A26] tracking-widest uppercase">Learning Path</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-[#2D2A26] mb-4 md:mb-6 leading-tight"
        >
          Three Levels. <br className="md:block" />
          <span className="text-[#E76F51] relative inline-block">
            One Clear Path.
            <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-[#FFDA44] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-medium"
        >
          A structured roadmap designed to take you from beginner to champion.
        </motion.p>
      </div>

      {/* --- Course Cards --- */}
      <div className="container max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course, i) => {
            const Icon = course.icon;
            const isAdvanced = course.level === "Advanced";
            const currentTextColor = isAdvanced ? (course.textColor || "text-gray-900") : course.color;

            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                className="group flex flex-col h-full"
              >
                <div className="bg-white rounded-[2rem] shadow-lg border border-[#E6E0D4] overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl">
                  
                  {/* Card Header */}
                  <div className={`h-32 md:h-40 relative bg-gradient-to-br ${course.gradient} p-6 flex flex-col justify-between`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="bg-white/20 backdrop-blur-md p-2.5 md:p-3 rounded-2xl border border-white/30 shadow-inner">
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <span className="text-white font-black text-[9px] md:text-[10px] tracking-[0.15em] uppercase bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl md:text-2xl font-black text-[#2D2A26] mb-2 md:mb-3">
                      {course.title}
                    </h3>
                    <p className="text-[#5C5852] mb-6 text-sm md:text-base font-bold leading-relaxed opacity-80">
                      {course.description}
                    </p>

                    {/* Highlights List */}
                    <div className={`rounded-2xl p-5 md:p-6 mb-8 flex-grow ${course.bgLight} ${course.border} border`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAdvanced ? "bg-[#B4860B]" : course.color.replace('text-', 'bg-')}`} />
                        <p className={`font-black text-[10px] md:text-xs uppercase tracking-widest ${isAdvanced ? "text-[#B4860B]" : course.color}`}>
                          Curriculum
                        </p>
                      </div>
                      <ul className="space-y-2.5 md:space-y-3">
                        {course.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start text-xs md:text-sm text-[#2D2A26] font-bold">
                            <CheckCircle2 className={`w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 ${isAdvanced ? "text-[#B4860B]" : course.color}`} />
                            <span className="leading-tight opacity-90">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      className={`w-full rounded-xl py-6 font-black text-sm md:text-base border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                        i === 2 
                        ? 'bg-[#FFDA44] text-[#2D2A26] border-[#FFDA44] hover:bg-[#ffcd1f]' 
                        : 'bg-white text-[#2D2A26] border-[#E6E0D4] hover:border-[#E76F51]'
                      }`}
                    >
                      Explore Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subtle Floating Decor */}
      <div className="hidden lg:block absolute bottom-12 right-12 animate-bounce opacity-20">
        <Crown className="w-12 h-12 text-[#FFDA44]" />
      </div>
    </section>
  );
}
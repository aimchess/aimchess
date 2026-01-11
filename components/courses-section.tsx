"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Target, Trophy, CheckCircle2, Crown, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const primaryColor = "#5C1F1C"; // Deep Warm Red
const accentColor = "#FFDA44";  // Golden Yellow
const bgWarm = "#FDFBF7";       // Warm Cream

const courses = [
  {
    level: "Beginner",
    icon: BookOpen,
    color: "text-[#2A9D8F]", // Teal
    bgLight: "bg-[#2A9D8F]/10",
    border: "border-[#2A9D8F]/20",
    gradient: "from-[#2A9D8F] to-[#264653]",
    title: "Foundations",
    description: "From zero knowledge to playing full games confidently.",
    topics: [
      "Introduction to board & pieces",
      "Piece Movements & Capturing",
      "Checkmate & Castling",
      "The Golden Rules of Opening",
      "Special moves: En Passant",
    ],
  },
  {
    level: "Intermediate",
    icon: Target,
    color: "text-[#E76F51]", // Burnt Orange
    bgLight: "bg-[#E76F51]/10",
    border: "border-[#E76F51]/20",
    gradient: "from-[#E76F51] to-[#D9381E]",
    title: "Tactical Mastery",
    description: "Master tactics, spot patterns, and stop blundering.",
    topics: [
      "Forks, Pins, & Skewers",
      "Discovered Attacks",
      "Eliminating the Defender",
      "Mate in Two Patterns",
      "Basic Endgames (King + Rook)",
    ],
  },
  {
    level: "Advanced",
    icon: Trophy,
    color: "text-[#FFC727]", // Golden Yellow (darker text for contrast)
    textColor: "text-[#B4860B]", // Dark Golden Rod for text
    bgLight: "bg-[#FFDA44]/15",
    border: "border-[#FFDA44]/30",
    gradient: "from-[#FFDA44] to-[#FCA311]",
    title: "Strategic Depth",
    description: "Tournament-ready chess with deep planning.",
    topics: [
      "Complex Openings",
      "Breaching King Defences",
      "Pawn Structures & Majorities",
      "X-Ray Attacks & Interference",
      "Grandmaster Mini-Plans",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      type: "spring",
      stiffness: 50,
    },
  }),
  hover: {
    y: -15,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function CoursesSection() {
  return (
    <section className="relative w-full bg-[#FDFBF7] pb-12 font-sans overflow-hidden">

      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E76F51]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFDA44]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* --- Header Section --- */}
      <div className="relative pt-24 pb-20 px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E6E0D4] mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#E76F51]" />
          <span className="text-sm font-bold text-[#2D2A26] tracking-wide uppercase">Structured Learning Path</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] mb-6 leading-tight"
        >
          Three Levels. <br className="hidden md:block" />
          <span className="text-[#E76F51] relative inline-block">
            One Clear Path.
            {/* Underline decoration */}
            <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#FFDA44] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed"
        >
          We have structured the chaos of chess into a step-by-step roadmap designed to take you from beginner to champion.
        </motion.p>
      </div>

      {/* --- Course Cards --- */}
      <div className="container max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, i) => {
            const Icon = course.icon;
            const isAdvanced = course.level === "Advanced";
            const textColor = isAdvanced ? (course.textColor || "text-gray-900") : course.color;

            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, margin: "-100px" }}
                variants={cardVariants}
                className="group h-full"
              >
                <div className="bg-white rounded-[2rem] shadow-xl hover:shadow-2xl hover:shadow-[#E76F51]/10 transition-all duration-300 overflow-hidden flex flex-col h-full border border-[#E6E0D4] relative">

                  {/* Card Header Image/Gradient Area */}
                  <div className={`h-40 relative overflow-hidden bg-gradient-to-br ${course.gradient} p-6 flex flex-col justify-between`}>
                    {/* Decorative Patterns */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />

                    <div className="flex justify-between items-start relative z-10">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-white font-bold text-xs tracking-wider uppercase bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-[#2D2A26] mb-3 group-hover:text-[#E76F51] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-[#5C5852] mb-6 text-sm leading-relaxed font-medium">
                      {course.description}
                    </p>

                    {/* Topics List */}
                    <div className={`rounded-2xl p-6 mb-8 flex-grow ${course.bgLight} ${course.border} border`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAdvanced ? "bg-[#B4860B]" : course.color}`} />
                        <p className={`font-bold text-xs uppercase tracking-wider ${isAdvanced ? "text-[#B4860B]" : course.color}`}>
                          Curriculum Highlights
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {course.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start text-sm text-[#2D2A26]/80">
                            <CheckCircle2 className={`w-4 h-4 mr-3 mt-0.5 flex-shrink-0 ${isAdvanced ? "text-[#B4860B]" : course.color}`} />
                            <span className="leading-tight">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full rounded-xl py-6 text-base font-bold shadow-md hover:shadow-lg transition-transform duration-300 group-hover:scale-[1.02] border-2 border-transparent hover:border-${course.level === 'Advanced' ? '[#FFDA44]' : '[#E76F51]'}`}
                      style={{
                        backgroundColor: i === 2 ? '#FFDA44' : '#FDFBF7',
                        color: i === 2 ? '#2D2A26' : '#2D2A26',
                        border: i === 2 ? 'none' : '2px solid #E6E0D4'
                      }}
                    >
                      Explore Course
                      <ArrowRight className={`w-4 h-4 ml-2 transition-transform group-hover:translate-x-1`} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Decor */}
      <div className="hidden lg:block absolute bottom-20 right-10 animate-bounce-gentle opacity-50">
        <Crown className="w-16 h-16 text-[#FFDA44]" />
      </div>
    </section>
  );
}
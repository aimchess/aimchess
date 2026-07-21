"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Quote, Target, Trophy, GraduationCap, BookOpen, Lightbulb } from "lucide-react";

const COACHES = [
  {
    name: "Fadil C Basheer",
    title: "Arena Candidate Master",
    subTitle: "FIDE Rated Coach & Arena Candidate Master",
    image: "/fadil.jpeg", // Update with actual image path
    badge: "ACM",
    description: [
      <>Fadil C Basheer is a distinguished FIDE-rated player and <strong className="text-[#2D2A26] font-black">Arena Candidate Master</strong> known for his structured and strategic approach to chess education. As a Certified School Instructor, he specializes in nurturing young talent through a systematic training regimen rooted in positional chess strategy.</>,
      <>Having served as the <span className="text-[#2D2A26] font-bold underline decoration-[#FFDA44] decoration-4">Coach of the Kerala Under-17 Teams</span> (2024 & 2025), he brings advanced preparation methods to the table. His coaching philosophy centers on strategic clarity, long-term planning, and building the mental resilience required for high-stakes tournament play.</>
    ],
    quote: "Chess is not just about the moves we make, but the clarity of the plan behind them. My goal is to build players who can navigate complexity with calmness and precision.",
    stats: [
      { val: "State Coach", lab: "Kerala U-17 (24-25)", icon: <Target className="w-5 h-5 text-[#E76F51]" /> },
      { val: "Certified", lab: "School Instructor", icon: <GraduationCap className="w-5 h-5 text-[#2D2A26]" /> },
      { val: "Positional", lab: "Strategy Expert", icon: <Award className="w-5 h-5 text-[#bda030]" /> }
    ]
  },
  {
    name: "Harishankar V M",
    title: "FIDE Rated Coach",
    subTitle: "Expert Strategist & Opening Specialist",
    image: "/hari.jpeg", // Update with actual image path
    badge: "FIDE",
    description: [
      <>Harishankar is a FIDE-rated chess coach with <strong className="text-[#2D2A26] font-black">over a decade of competitive experience</strong>. His primary strength lies in deep opening preparation and the ability to translate opening ideas into coherent strategic middlegame plans.</>,
      <>His coaching approach emphasises <span className="text-[#2D2A26] font-bold underline decoration-[#FFDA44] decoration-4">conceptual understanding over rote memorisation</span>, guiding players to understand the purpose behind each move while developing structured thinking and long-term planning skills.</>
    ],
    quote: "True mastery of an opening isn't about memorizing lines; it's about understanding the strategic soul of the resulting positions.",
    stats: [
      { val: "10+ Years", lab: "Competitive Exp", icon: <Trophy className="w-5 h-5 text-[#E76F51]" /> },
      { val: "Opening Prep", lab: "Deep Analysis", icon: <BookOpen className="w-5 h-5 text-[#2D2A26]" /> },
      { val: "Conceptual", lab: "Logic-Based Learning", icon: <Award className="w-5 h-5 text-[#bda030]" /> }
    ]
  }
];

export function CoachProfile() {
  return (
    <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFDA44]/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E76F51]/5 rounded-full blur-3xl -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#E76F51] mb-3 block">
            Expert Guidance & Strategic Mastery
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-4">
            Meet Our <span className="text-[#E76F51]">Coaches</span>
          </h2>
          <div className="h-1.5 w-20 bg-[#FFDA44] mx-auto rounded-full" />
        </div>

        <div className="space-y-16 md:space-y-24">
          {COACHES.map((coach, index) => (
            <motion.div
              key={coach.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#FDFBF7] to-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-[#E6E0D4] relative"
            >
              <div className={`flex flex-col lg:items-start gap-8 md:gap-16 relative z-10 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                
                {/* Image Side */}
                <div className="w-full lg:w-[40%] flex-shrink-0">
                  <div className="relative">
                    <div className="aspect-[4/5] w-full max-w-[350px] md:max-w-full mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                      <Image 
                        src={coach.image}
                        alt={coach.name} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -bottom-6 -right-2 md:-right-6 bg-[#5C1F1C] text-white p-4 md:p-5 rounded-2xl shadow-xl flex items-center gap-3">
                      <Trophy className="w-8 h-8 md:w-10 md:h-10 text-[#FFDA44]" />
                      <div>
                        <p className="text-xl md:text-2xl font-black leading-none">{coach.badge}</p>
                        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">FIDE Rated</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 text-center lg:text-left pt-4 lg:pt-0">
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-2">
                      {coach.name}
                    </h3>
                    <p className="text-[#E76F51] font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                      {coach.subTitle}
                    </p>
                  </div>

                  <div className="space-y-5 text-sm md:text-lg text-[#5C5852] leading-relaxed font-medium mb-8">
                    {coach.description.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Quote Block */}
                  <div className="bg-[#2D2A26] text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] relative mb-10 overflow-hidden group">
                    <Quote className="absolute -top-2 -left-2 text-[#FFDA44] w-12 h-12 md:w-16 md:h-16 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    <p className="font-serif italic text-base md:text-xl leading-relaxed relative z-10">
                      &quot;{coach.quote}&quot;
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {coach.stats.map((stat, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-sm">
                        {stat.icon}
                        <div>
                          <p className="font-black text-lg text-[#2D2A26] leading-none">{stat.val}</p>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mt-1">{stat.lab}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
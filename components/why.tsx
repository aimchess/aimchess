"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Target, Lightbulb, Zap, BookOpen, Sparkles, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Memory Power",
    description: "Chess trains the brain to retain complex patterns and sequences, building a 'mental library' that lasts a lifetime.",
    color: "#E76F51", // Coral
    // On large screens spans 2 columns, on mobile spans 1
    gridClass: "lg:col-span-2 md:col-span-2 col-span-1",
  },
  {
    icon: Target,
    title: "Logic",
    description: "Anticipate moves and calculate outcomes with precision.",
    color: "#2A9D8F", // Teal
    gridClass: "col-span-1",
  },
  {
    icon: Zap,
    title: "Deep Focus",
    description: "In an age of distractions, chess teaches children the superpower of sustained concentration.",
    color: "#FFDA44", // Yellow
    gridClass: "col-span-1",
  },
  {
    icon: BookOpen,
    title: "Academic Edge",
    description: "Proven to boost scores in Math and Reading through improved problem-solving skills.",
    color: "#2D2A26", // Dark Slate
    gridClass: "col-span-1",
  },
  {
    icon: Lightbulb,
    title: "Creative Strategy",
    description: "Every game is a blank canvas. We teach kids to paint their victory with innovative and unexpected tactical plans.",
    color: "#F4A261", // Sandy Orange
    gridClass: "lg:col-span-1 md:col-span-2 col-span-1",
  },
];

export default function WhyChessBento() {
  return (
    <section className="py-16 md:py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Centered Header */}
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10 mb-4"
          >
            <Sparkles className="w-3 h-3 text-[#E76F51]" />
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-[#2D2A26] uppercase">Cognitive Development</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-[#2D2A26] leading-tight"
          >
            Building <span className="text-[#E76F51]">Brilliant Minds</span> <br className="hidden md:block" />
            Through Chess
          </motion.h2>
          <div className="h-1.5 w-16 md:w-24 bg-[#FFDA44] mx-auto mt-6 rounded-full" />
        </div>

        {/* Improved Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isDark = benefit.color === "#2D2A26" || benefit.color === "#1A5F5F";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden p-6 md:p-8 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5 ${benefit.gridClass}`}
                style={{ backgroundColor: benefit.color }}
              >
                {/* Content Top */}
                <div className="flex-grow">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isDark ? 'text-white' : 'text-[#2D2A26]'}`} />
                  </div>

                  <h3 className={`text-xl md:text-2xl font-black tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>
                    {benefit.title}
                  </h3>
                  <p className={`text-sm md:text-base font-bold leading-relaxed mb-6 ${isDark ? 'text-white/80' : 'text-[#2D2A26]/80'}`}>
                    {benefit.description}
                  </p>
                </div>

                {/* Footer Section - Properly Formatted */}
                <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between group/btn cursor-pointer">
                  <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-[#2D2A26]/60'}`}>
                    Explore Skill
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover/btn:translate-x-1 ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-[#2D2A26]'}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Subtle Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* Mobile-Friendly Stat Bar */}
        {/* <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 py-8 border-t border-black/5 flex flex-wrap justify-around gap-6 text-center"
        >
          <div>
            <span className="block text-2xl md:text-3xl font-black text-[#E76F51]">100%</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5C5852]">Engagement</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-[#FFDA44]">40%</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5C5852]">Memory Boost</span>
          </div>
          <div className="hidden sm:block">
            <span className="block text-2xl md:text-3xl font-black text-[#2A9D8F]">Global</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5C5852]">Standard Curriculum</span>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
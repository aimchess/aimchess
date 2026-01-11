"use client";

import { motion } from "framer-motion";
import { Brain, Target, Lightbulb, Zap, BookOpen, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Memory Power",
    description: "Chess requires remembering moves, patterns, and strategies, significantly boosting memory retention.",
    color: "#E76F51",
  },
  {
    icon: Target,
    title: "Logical Thinking",
    description: "Players analyze positions and anticipate moves, fostering critical logical reasoning skills.",
    color: "#2A9D8F",
  },
  {
    icon: Zap,
    title: "Focus & Concentration",
    description: "The intense focus required helps children block out distractions and maintain mental clarity.",
    color: "#FFDA44",
  },
  {
    icon: Lightbulb,
    title: "Creativity",
    description: "Chess sparks creativity as players envision strategic possibilities and devise innovative plans.",
    color: "#F4A261",
  },
  {
    icon: BookOpen,
    title: "Academic Performance",
    description: "Studies show chess players perform better in math, reading, and problem-solving at school.",
    color: "#264653",
  },
];

export function WhyChessForKids() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E76F51]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFDA44]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E6E0D4] mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#E76F51]" />
            <span className="text-sm font-bold text-[#2D2A26] tracking-wide uppercase">Benefits of Chess</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] mb-6 leading-tight"
          >
            Why Chess <span className="text-[#E76F51]">For Kids?</span>
          </motion.h2>
          <div className="h-1.5 w-24 bg-[#FFDA44] mx-auto rounded-full mb-6" />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#5C5852] text-lg max-w-2xl mx-auto"
          >
            More than just a game, chess is a powerful tool for intellectual growth and life skills.
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group ${index === benefits.length - 1 ? "md:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="h-full bg-white rounded-[2rem] p-8 border border-[#E6E0D4] shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-500 relative overflow-hidden">
                  {/* Accent Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-[2rem]"
                    style={{ backgroundColor: benefit.color }}
                  />

                  {/* Hover Gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${benefit.color}40, transparent)` }}
                  />

                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${benefit.color}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: benefit.color }} />
                    </div>

                    <h3 className="text-xl font-bold text-[#2D2A26] mb-3 group-hover:text-[#5C1F1C] transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-[#5C5852] leading-relaxed text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
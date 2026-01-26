"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Quote, CheckCircle2 } from "lucide-react";

export function FounderSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFDA44]/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E76F51]/5 rounded-full blur-3xl -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#E76F51] mb-3 block">
            The Visionary Behind the Academy
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-4">
            Meet the <span className="text-[#E76F51]">Founder</span>
          </h2>
          <div className="h-1.5 w-20 bg-[#FFDA44] mx-auto rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#FDFBF7] to-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-[#E6E0D4] relative"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 md:gap-16 relative z-10">
            
            {/* Image Side */}
            <div className="w-full lg:w-[40%] flex-shrink-0">
              <div className="relative">
                <div className="aspect-[4/5] w-full max-w-[350px] md:max-w-full mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                  <Image 
                    src="/founder.jpeg" 
                    alt="Praveen Kumar - Founder of Royal Rooks" 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                {/* Floating Experience Badge */}
                <div className="absolute -bottom-6 -right-2 md:-right-6 bg-[#5C1F1C] text-white p-4 md:p-5 rounded-2xl shadow-xl flex items-center gap-3">
                  <Award className="w-8 h-8 md:w-10 md:h-10 text-[#FFDA44]" />
                  <div>
                    <p className="text-xl md:text-2xl font-black leading-none">30+</p>
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">Years Exp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 text-center lg:text-left pt-4 lg:pt-0">
              <div className="mb-6 md:mb-8">
                <h3 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-2">
                  Praveen Kumar
                </h3>
                <p className="text-[#E76F51] font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                  Founder & Chief Coach
                </p>
              </div>

              <div className="space-y-5 text-sm md:text-lg text-[#5C5852] leading-relaxed font-medium mb-8">
                <p>
                  With over four decades of deep involvement in chess, Praveen Kumar brings a rare blend of experience, insight, and practical coaching wisdom to the academy. Having devoted more than 30 years to playing, studying, and teaching the game, he has personally coached over <strong className="text-[#2D2A26] font-black">1,000+ students</strong> across different age groups.
                </p>
                <p>
                  His coaching philosophy focuses on building <span className="text-[#2D2A26] font-bold underline decoration-[#FFDA44] decoration-4">strong fundamentals</span>, disciplined thinking, and long-term skill development. Under his guidance, students learn to think strategically and stay resilient under pressure.
                </p>
              </div>

              {/* Quote Block */}
              <div className="bg-[#2D2A26] text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] relative mb-10 overflow-hidden group">
                <Quote className="absolute -top-2 -left-2 text-[#FFDA44] w-12 h-12 md:w-16 md:h-16 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <p className="font-serif italic text-base md:text-xl leading-relaxed relative z-10">
                  &quot;The academy reflects the belief that consistent training, correct guidance, and passion for the game matter far more than titles alone.&quot;
                </p>
              </div>

              {/* Verified Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { val: "1000+", lab: "Students Coached", color: "text-[#E76F51]" },
                  { val: "30+ Yrs", lab: "Deep Involvement", color: "text-[#2D2A26]" },
                  { val: "Elite", lab: "Training Method", color: "text-[#bda030]" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-sm">
                    <CheckCircle2 className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
                    <div>
                      <p className={`font-black text-lg ${stat.color} leading-none`}>{stat.val}</p>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mt-1">{stat.lab}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
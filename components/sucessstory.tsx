"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Trophy, Rocket, Target } from "lucide-react";
import Image from "next/image";

const successStories = [
  {
    id: 1,
    student: "FAYE",
    parent: "Janina Budi",
    title: "Resilience & Growth",
    story: "Transformed from a shy beginner into a confident player who views every failure as a lesson. Now handles high-pressure matches with incredible poise.",
    image: "/image102.jpg",
    cardBg: "#E76F51", // Coral
    textColor: "text-white",
    icon: <Target className="w-5 h-5 text-white/80" />,
  },
  {
    id: 2,
    student: "JAY",
    parent: "Jayasree Chettipilli",
    title: "Tournament Champion",
    story: "By focusing on fun, Jay unlocked natural talent. This stress-free approach led to a massive skill boost and multiple tournament victories this year.",
    image: "/image102.jpg",
    cardBg: "#FFDA44", // Yellow
    textColor: "text-[#2D2A26]",
    icon: <Trophy className="w-5 h-5 text-[#2D2A26]/80" />,
  },
  {
    id: 3,
    student: "ANANYA",
    parent: "Shanthi",
    title: "Strategic Mastery",
    story: "Developed a disciplined, calm style of play. Her strategic planning has seen her ranking rise consistently against much more experienced opponents.",
    image: "/image102.jpg",
    cardBg: "#1A5F5F", // Academy Green
    textColor: "text-white",
    icon: <Rocket className="w-5 h-5 text-white/80" />,
  },
];

export default function SuccessStories() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Centered Heading */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[#E76F51]/10 text-[#E76F51] text-[10px] font-black uppercase tracking-[0.3em]"
          >
            Milestones
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-[#2D2A26]"
          >
            Real Student <span className="text-[#E76F51]">Success</span>
          </motion.h2>
          <div className="h-1.5 w-20 bg-[#FFDA44] mx-auto mt-6 rounded-full" />
        </div>

        {/* 3-in-a-row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {successStories.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="flex rounded-[2rem] overflow-hidden shadow-2xl h-full min-h-[320px]"
              style={{ backgroundColor: item.cardBg }}
            >
              {/* LEFT: Vertical Pill Image (Jeff Bezos Style) */}
              <div className="w-[35%] relative m-3.5 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0 bg-black/10">
                <Image
                  src={item.image}
                  alt={item.student}
                  fill
                  className="object-cover"
                />
              </div>

              {/* RIGHT: Content Area */}
              <div className={`w-[65%] p-6 md:p-8 flex flex-col justify-between ${item.textColor}`}>
                <div>
                  <Quote className="w-8 h-8 mb-4 opacity-40 fill-current" />
                  
                  <div className="flex items-center gap-2 mb-3">
                    {item.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                      {item.title}
                    </span>
                  </div>

                  <p className="text-sm md:text-base font-bold leading-relaxed italic line-clamp-4">
                    "{item.story}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-current/10">
                  <h4 className="font-black text-lg tracking-tighter leading-none">
                    {item.student}
                  </h4>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                    Parent: {item.parent}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
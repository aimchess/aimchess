"use client";

import { useEffect, useState } from "react";
import { Users, Award, GraduationCap, Gamepad2, Star, Trophy } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const bgWarm = "#FDFBF7";
const primaryColor = "#5C1F1C"; // Dark Red
const accentGold = "#FFDA44";   // Golden Yellow

const slideshowImages = [
  "/image5.jpg",
  "/image7.jpg",
  "/image11.jpg",
  "/image13.jpg",
];

const stats = [
  {
    value: "1000",
    label: "Happy Students",
    suffix: "+",
    icon: Users,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    value: "50",
    label: "Tournament Champions",
    suffix: "+",
    icon: Award,
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    value: "15",
    label: "FIDE Rated Coaches",
    suffix: "+",
    icon: GraduationCap,
    gradient: "from-orange-400 to-red-500",
  },
  {
    value: "2000",
    label: "Training Games",
    suffix: "+",
    icon: Gamepad2,
    gradient: "from-yellow-500 to-orange-600",
  },
];

export function StatsSection() {
  const [currentImage, setCurrentImage] = useState(0);

  // Auto change image
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slideshowImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden font-sans" style={{ backgroundColor: bgWarm }}>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#5C1F1C] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#FFDA44] rounded-full blur-3xl" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* LEFT SIDE: Stats Grid */}
          <div className="order-2 lg:order-1">
            <div className="text-center lg:text-left mb-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E6E0D4] mb-4"
              >
                <Trophy className="w-4 h-4 text-[#E76F51]" />
                <span className="text-sm font-bold text-[#2D2A26] tracking-wide uppercase">Proven Excellence</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-5xl font-extrabold text-[#2D2A26] mb-4 leading-tight"
              >
                Our <span className="text-[#E76F51]">Achievements</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-[#5C5852] text-lg max-w-md mx-auto lg:mx-0"
              >
                Join thousands of students who have transformed their game with our world-class coaching methods.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(92, 31, 28, 0.3)" }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#5C1F1C] relative overflow-hidden rounded-[2rem] p-6 lg:p-8 border border-[#FFDA44]/20 shadow-xl group"
                  >
                    {/* Inner Glow */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFDA44] rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />

                    <div className={`w-14 h-14 mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-3xl lg:text-4xl font-black text-white mb-1">
                        {stat.value}<span className="text-[#FFDA44]">{stat.suffix}</span>
                      </h3>
                      <p className="text-white/80 font-medium text-sm lg:text-base">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Image Presentation */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md h-[450px] sm:h-[500px]"
            >
              {/* Main Frame */}
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-[#2D2A26] z-20">
                {slideshowImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt="Academy Highlights"
                    fill
                    className={`object-cover transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#5C1F1C]/80 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Text in Image */}
                <div className="absolute bottom-8 left-8 right-8 text-center text-white z-30">
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-[#FFDA44] fill-[#FFDA44]" />)}
                  </div>
                  <p className="font-bold text-lg tracking-wide uppercase">Top Rated Academy</p>
                </div>
              </div>

              {/* Decorative Elements behind frame */}
              <div className="absolute -inset-4 bg-[#5C1F1C] rounded-[3rem] -z-10 opacity-10 blur-xl animate-pulse-glow" />
              <div className="absolute top-10 -right-8 z-30 animate-bounce-gentle">
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#E6E0D4] flex items-center gap-3">
                  <div className="bg-[#E76F51]/10 p-2 rounded-lg">
                    <Award className="w-6 h-6 text-[#E76F51]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Experience</p>
                    <p className="text-lg font-black text-[#2D2A26]">10+ Years</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

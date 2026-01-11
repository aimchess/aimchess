"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

// Brand theme colors
const primaryColor = "#5C1F1C";
const accentColor = "#FFC727";
const white = "#FFFFFF";
const boardWhite = "#f0d9b5";
const boardBrown = "#b58863";
const fontFamily = "'Poppins', 'Montserrat', 'Nunito', sans-serif";

export function CTASection() {
  const stats = [
    { value: "1000+", label: "Students Trained" },
    { value: "50+", label: "National Titles" },
    { value: "15+", label: "FIDE Coaches" },
    { value: "2000+", label: "Training Games" },
  ];

  const badges = ["USA", "FIDE", "100%", "GM"];

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <section
        className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
        style={{ backgroundColor: white, fontFamily }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* LEFT: Product Pack */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <motion.div
                className="relative animate-float"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Main Pack */}
                <div className="relative">
                  <div
                    className="rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-6 pt-6 sm:pt-8 shadow-2xl"
                    style={{
                      width: "280px",
                      maxWidth: "100%",
                      background: `linear-gradient(to bottom, ${accentColor}, #e5b31e)`,
                    }}
                  >
                    <div className="text-center mb-3 sm:mb-4">
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter">
                        CHESS
                      </h3>
                      <p className="text-xs text-white/90 uppercase tracking-widest mt-1">
                        PURE ACADEMY
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 mb-3 sm:mb-4">
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-white text-xs font-bold">
                        {stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <div className="text-sm sm:text-base lg:text-lg">{stat.value}</div>
                            <div className="text-[10px] sm:text-xs">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chess Packets */}
                    <div className="flex justify-center gap-1 -mb-5 sm:-mb-6 relative z-10">
                      {[primaryColor, accentColor, boardBrown, boardWhite].map((color, i) => (
                        <motion.div
                          key={i}
                          className="w-12 h-16 sm:w-14 sm:h-20 lg:w-16 lg:h-24 rounded-t-lg shadow-lg transform transition-transform duration-300 hover:rotate-0"
                          style={{
                            backgroundColor: color,
                            transform: `rotate(${i % 2 === 0 ? -8 : 8}deg) translateY(${i * 3}px)`,
                            color: color === accentColor || color === boardWhite ? primaryColor : white,
                          }}
                          whileHover={{ y: -4, rotate: 0 }}
                        >
                          <div className="flex items-center justify-center h-full font-bold text-lg sm:text-xl lg:text-2xl">
                            {i === 0 ? "C" : i === 1 ? "P" : i === 2 ? "A" : <Star className="w-5 h-5 sm:w-6 sm:h-6" />}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Label */}
                  <div
                    className="text-center py-2 sm:py-3 rounded-b-2xl sm:rounded-b-3xl -mt-1 shadow-xl"
                    style={{
                      background: `linear-gradient(to right, ${boardBrown}, ${boardWhite})`,
                      color: primaryColor,
                    }}
                  >
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                      CHESS MASTERY PACK
                    </p>
                    <p className="text-[10px] sm:text-xs opacity-80">Beginner to Grandmaster</p>
                  </div>
                </div>

                {/* Floating Badges */}
                <motion.div
                  className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg"
                  style={{ backgroundColor: primaryColor, color: white }}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  ZERO EXCUSES
                </motion.div>

                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 flex gap-1 flex-wrap">
                  {badges.map((t, i) => (
                    <motion.div
                      key={i}
                      className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow"
                      style={{ backgroundColor: primaryColor, color: white }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {t}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Hero Text + CTA */}
            <motion.div
              className="text-[#5C1F1C] text-center lg:text-left order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
                Stay Sharp.
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-90">
                A world-class chess training system designed to elevate anyone from beginner to master.
                Perfect for students, professionals, and lifelong learners.
              </p>

              <Button
                size="lg"
                className="font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 sm:gap-3 group mx-auto lg:mx-0"
                style={{ backgroundColor: accentColor, color: primaryColor }}
              >
                Get Yours
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
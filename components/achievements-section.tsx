"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Star, Crown, Sparkles, TrendingUp } from "lucide-react";

export function AchievementsSection() {
    const achievements = [
        {
            icon: Trophy,
            count: "50+",
            label: "Tournament Wins",
            description: "State & National level victories",
            gradient: "from-[#FFDA44] via-[#F4A261] to-[#E76F51]",
        },
        {
            icon: Crown,
            count: "3",
            label: "Elite Coaches",
            description: "Produced by our academy",
            gradient: "from-[#E76F51] via-[#D35836] to-[#5C1F1C]",
        },
        {
            icon: Medal,
            count: "30+",
            label: "Years Experience",
            description: "Journey of Excellence",
            gradient: "from-[#2A9D8F] via-[#21867A] to-[#264653]",
        },
        {
            icon: Star,
            count: "95%",
            label: "Success Rate",
            description: "Improvement in 6 months",
            gradient: "from-[#F4A261] via-[#E9C46A] to-[#FFDA44]",
        },
    ];

    return (
        <section className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: "#FDFBF7" }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235C1F1C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Decorative Elements - Responsive Blur Blobs */}
            <div className="absolute top-0 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-[#FFDA44]/10 rounded-full blur-2xl md:blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-40 md:w-80 h-40 md:h-80 bg-[#E76F51]/10 rounded-full blur-2xl md:blur-3xl" />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center space-x-2 bg-white px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-md border border-[#E6E0D4] mb-6"
                    >
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#E76F51]" />
                        <span className="text-[10px] md:text-sm font-black text-[#2D2A26] tracking-widest uppercase">Proven Excellence</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-[#2D2A26] mb-4 md:mb-6 leading-tight"
                    >
                        Our <span className="text-[#E76F51]">Achievements</span>
                    </motion.h2>
                    <div className="h-1.5 w-16 md:w-24 bg-[#FFDA44] mx-auto rounded-full mb-6" />

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-base md:text-lg text-[#5C5852] max-w-2xl mx-auto font-medium"
                    >
                        Numbers that reflect our commitment to building the grandmasters of tomorrow.
                    </motion.p>
                </div>

                {/* Achievement Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {achievements.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="h-full"
                            >
                                <motion.div
                                    whileHover={{
                                        y: -10,
                                        scale: 1.02,
                                    }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="group relative h-full"
                                >
                                    {/* Card */}
                                    <div className={`relative h-full bg-gradient-to-br ${item.gradient} rounded-[2rem] p-6 md:p-8 shadow-xl overflow-hidden`}>
                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full pointer-events-none" />

                                        {/* Decorative Circles */}
                                        <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full" />
                                        <div className="absolute -bottom-8 -left-8 w-20 md:w-24 h-20 md:h-24 bg-black/10 rounded-full" />

                                        <div className="relative z-10 text-center">
                                            {/* Icon Container */}
                                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:rotate-6 transition-all duration-300">
                                                <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                            </div>

                                            {/* Count */}
                                            <h3 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-md">
                                                {item.count}
                                            </h3>

                                            {/* Label */}
                                            <h4 className="text-base md:text-lg font-black text-white/95 mb-1 md:mb-2 uppercase tracking-tight">
                                                {item.label}
                                            </h4>

                                            {/* Description */}
                                            <p className="text-xs md:text-sm text-white/80 font-medium">
                                                {item.description}
                                            </p>

                                            {/* Bottom Accent */}
                                            <div className="mt-5 md:mt-6 h-1 w-10 mx-auto bg-white/30 rounded-full group-hover:w-16 transition-all duration-300" />
                                        </div>
                                    </div>

                                    {/* Back Shadow Layer */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-[2rem] -z-10 blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12 md:mt-16 px-4"
                >
                    <p className="text-[#5C5852] font-bold text-sm md:text-base mb-6">Join the ranks of our successful students</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 bg-[#5C1F1C] text-white px-8 py-4 rounded-full font-black text-sm md:text-base hover:bg-[#E76F51] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                        Start Your Journey
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
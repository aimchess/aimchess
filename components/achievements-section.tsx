"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Star, Crown, Sparkles, TrendingUp } from "lucide-react";
import Image from "next/image";

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
            label: "Grandmasters",
            description: "Produced by our academy",
            gradient: "from-[#E76F51] via-[#D35836] to-[#5C1F1C]",
        },
        {
            icon: Medal,
            count: "100+",
            label: "Rated Players",
            description: "FIDE rated students",
            gradient: "from-[#2A9D8F] via-[#21867A] to-[#264653]",
        },
        {
            icon: Star,
            count: "100%",
            label: "Success Rate",
            description: "Improvement in 6 months",
            gradient: "from-[#F4A261] via-[#E9C46A] to-[#FFDA44]",
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#FDFBF7" }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235C1F1C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFDA44]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#E76F51]/10 rounded-full blur-3xl" />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center space-x-2 bg-white px-5 py-2.5 rounded-full shadow-lg border border-[#E6E0D4] mb-6"
                    >
                        <TrendingUp className="w-5 h-5 text-[#E76F51]" />
                        <span className="text-sm font-bold text-[#2D2A26] tracking-wide uppercase">Proven Excellence</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] mb-6"
                    >
                        Our <span className="text-[#E76F51]">Achievements</span>
                    </motion.h2>
                    <div className="h-1.5 w-24 bg-[#FFDA44] mx-auto rounded-full mb-6" />

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[#5C5852] max-w-2xl mx-auto"
                    >
                        Numbers that reflect our commitment to building champions.
                    </motion.p>
                </div>

                {/* Achievement Cards - Staggered Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {achievements.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.5 }}
                                className="h-full"
                            >
                                <motion.div
                                    whileHover={{
                                        y: -12,
                                        rotateY: 5,
                                        rotateX: 5,
                                    }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="group relative h-full"
                                    style={{ perspective: "1000px" }}
                                >
                                    {/* Card */}
                                    <div className={`relative h-full bg-gradient-to-br ${item.gradient} rounded-[2.5rem] p-8 shadow-xl overflow-hidden`}>
                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"
                                            style={{ transition: "transform 0.7s ease-in-out, opacity 0.3s" }} />

                                        {/* Decorative Circle */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full" />

                                        <div className="relative z-10 text-center">
                                            {/* Icon Container */}
                                            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                                                <Icon className="w-10 h-10 text-white" />
                                            </div>

                                            {/* Count */}
                                            <motion.h3
                                                className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-lg"
                                                initial={{ scale: 1 }}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                {item.count}
                                            </motion.h3>

                                            {/* Label */}
                                            <h4 className="text-lg font-bold text-white/95 mb-2">{item.label}</h4>

                                            {/* Description */}
                                            <p className="text-sm text-white/70">{item.description}</p>

                                            {/* Bottom Accent */}
                                            <div className="mt-6 h-1 w-12 mx-auto bg-white/30 rounded-full group-hover:w-20 transition-all duration-300" />
                                        </div>
                                    </div>

                                    {/* Shadow Layer */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-[2.5rem] -z-10 blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
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
                    transition={{ delay: 0.6 }}
                    className="text-center mt-16"
                >
                    <p className="text-[#5C5852] mb-4">Join the ranks of our successful students</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-[#5C1F1C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#E76F51] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        <Sparkles className="w-5 h-5" />
                        Start Your Journey
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

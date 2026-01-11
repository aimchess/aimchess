"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Star,
    Medal,
    Crown,
    Filter,
    Calendar as CalendarIcon,
    Users,
    Lightbulb,
    Target,
    ArrowRight,
    Brain,
    Sparkles
} from "lucide-react";
import { AchievementsSection } from "@/components/achievements-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Card } from "@/components/ui/card";

export default function AchievementsPage() {
    const dummyImages = [
        "/image.jpg", "/image1.jpg", "/image13.jpg",
        "/image3.jpg", "/image4.jpg", "/image5.jpg",
        "/image6.jpg", "/image7.jpg", "/image13.jpg",
        "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20">

            {/* 1. HERO */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
                {/* Background "Film Strip" Effect */}
                <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden select-none">
                    <div className="grid grid-cols-4 gap-4 transform -rotate-12 scale-110">
                        {dummyImages.slice(0, 8).map((src, i) => (
                            <div key={i} className="aspect-square relative grayscale">
                                <Image src={src} alt="" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#E76F51] mb-4 block">
                            Excellence & Glory
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-6 leading-tight tracking-tight">
                            Hall of <span className="italic font-serif text-[#E76F51]">Fame</span>
                        </h1>
                        <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
                            Celebrating the triumphs, milestones, and hard-earned victories of our students and coaches.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. SHARED ACHIEVEMENTS SECTION (Stats) */}
            <AchievementsSection />

            {/* 3. MENTORSHIP SECTION: The Master's Path */}
            <section className="py-32 px-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E76F51] rounded-full blur-[150px]" />
                </div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
                    <div className="w-full lg:w-1/2 space-y-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-6 block">Individual Excellence</span>
                            <h2 className="text-5xl md:text-6xl font-extrabold text-[#2D2A26] leading-tight">
                                Mentorship of <br />
                                <span className="text-[#E76F51]">Grandmasters</span>
                            </h2>
                            <div className="h-2 w-24 bg-[#FFDA44] rounded-full mt-6" />
                        </motion.div>

                        <p className="text-xl text-[#5C5852] leading-relaxed max-w-xl">
                            Our achievements are a direct reflection of our coaching philosophy. We don't just teach moves; we cultivate champions through personalized, deep-dive mentorship that transforms raw talent into strategic dominance.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { icon: Crown, title: "1-on-1 GM sessions", desc: "Direct learning from Grandmasters." },
                                { icon: Target, title: "Customized Repertoire", desc: "Openings built for your style." },
                                { icon: Brain, title: "Psychological Prep", desc: "Mental toughness for tournaments." },
                                { icon: Sparkles, title: "Game Analysis", desc: "Engine-backed move reviews." },
                            ].map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D4] flex items-center justify-center text-[#E76F51] shadow-sm">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-[#2D2A26]">{item.title}</h4>
                                    <p className="text-sm text-[#5C5852]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-[12px] border-[#FDFBF7] shadow-2xl">
                            <Image src="/image5.jpg" alt="Mentorship" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#5C1F1C]/40 to-transparent" />

                            {/* Floating Card */}
                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FFDA44] flex items-center justify-center text-[#5C1F1C]">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-[#5C5852]">Success Rate</p>
                                        <p className="text-2xl font-black text-[#2D2A26]">100% Guaranteed</p>
                                    </div>
                                </div>
                                <p className="text-[#5C5852] text-sm font-medium italic">"Every student receives a personalized development plan updated weekly."</p>
                            </div>
                        </div>

                        {/* Decorative circle */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFDA44] rounded-full -z-10 blur-2xl opacity-30" />
                    </motion.div>
                </div>
            </section>

            {/* 4. LEARNING ENVIRONMENT: Where Growth Happens */}
            <section className="py-32 px-6 bg-[#FDFBF7] relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-6 block">The Academy Environment</span>
                            <h2 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26]">
                                Where <span className="text-[#E76F51]">Growth</span> Happens
                            </h2>
                            <p className="text-lg text-[#5C5852] mt-6 max-w-2xl mx-auto">
                                We believe the right environment is 50% of the training. Our academy is designed to inspire focus and simulate elite tournament conditions.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: Users,
                                title: "Peer Collaboration",
                                desc: "A vibrant ecosystem where students challenge, debate, and grow together.",
                                bg: "bg-[#FFDA44]/5",
                                borderColor: "border-[#FFDA44]/20",
                                iconColor: "text-[#FFDA44]"
                            },
                            {
                                icon: Lightbulb,
                                title: "Deep Analysis Hub",
                                desc: "Advanced DGT boards and engine-backed analysis stations for tactical precision.",
                                bg: "bg-[#E76F51]/5",
                                borderColor: "border-[#E76F51]/20",
                                iconColor: "text-[#E76F51]"
                            },
                            {
                                icon: Target,
                                title: "Tournament Arena",
                                desc: "Professional chess environment simulated to build resilience under clock pressure.",
                                bg: "bg-[#2A9D8F]/5",
                                borderColor: "border-[#2A9D8F]/20",
                                iconColor: "text-[#2A9D8F]"
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -15 }}
                                className="group h-full"
                            >
                                <div className={`h-full p-10 bg-white rounded-[3rem] border-2 transition-all duration-500 overflow-hidden relative shadow-sm group-hover:shadow-2xl ${item.borderColor} group-hover:border-transparent`}>
                                    {/* Hover Reveal Background */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.bg}`} />

                                    <div className="relative z-10">
                                        <div className={`w-20 h-20 rounded-[2rem] bg-[#FDFBF7] border border-[#E6E0D4] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white transition-all duration-500 shadow-md`}>
                                            <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#2D2A26] mb-4">{item.title}</h3>
                                        <p className="text-[#5C5852] font-medium leading-relaxed group-hover:text-[#2D2A26] transition-colors">
                                            {item.desc}
                                        </p>

                                        <div className="mt-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E76F51] opacity-0 group-hover:opacity-100 transition-all">
                                            <span>Explore Facility</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. REVIEWS SECTION (Shared) */}
            <TestimonialsSection />

            {/* 7. CTA SECTION */}
            <section className="relative py-22 bg-[#FDFBF7] text-[#2D2A26] overflow-hidden border-t border-[#E6E0D4]">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFDA44]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E76F51]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                        Join the <br />
                        <span className="text-[#E76F51]">Winners Circle.</span>
                    </h2>
                    <p className="text-xl text-[#5C5852] mb-12 max-w-2xl mx-auto">
                        Your trophy is waiting. The journey to the podium starts with one decision.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/contact">
                            <Button className="h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-bold hover:bg-[#E76F51] hover:text-white transition-all duration-300 shadow-2xl hover:shadow-[#E76F51]/20">
                                Start Training
                            </Button>
                        </Link>
                        <span className="text-[#5C5852] font-medium hidden sm:block">or</span>
                        <Link href="/courses" className="text-lg font-bold text-[#2D2A26] border-b-2 border-[#2D2A26]/20 hover:text-[#E76F51] hover:border-[#E76F51] transition-colors pb-1">
                            View Curriculum
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}

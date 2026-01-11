"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Medal,
    Crown,
    Users,
    Lightbulb,
    Target,
    ArrowRight,
    Brain,
    Sparkles
} from "lucide-react";
import { AchievementsSection } from "@/components/achievements-section";
import StudentSuccessAndTestimonials from "@/components/testimonials-section";
import { Card } from "@/components/ui/card";
import SuccessStories from "@/components/sucessstory";

export default function AchievementsPage() {
    const dummyImages = [
        "/image.jpg", "/image1.jpg", "/image13.jpg",
        "/image3.jpg", "/image4.jpg", "/image5.jpg",
        "/image6.jpg", "/image7.jpg", "/image13.jpg",
        "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 overflow-x-hidden">

            {/* 1. HERO */}
            <section className="relative pt-24 md:pt-40 pb-16 md:pb-24 px-4 text-center overflow-hidden">
                {/* Background "Film Strip" Effect - Responsive Grid */}
                <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden select-none">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transform -rotate-12 scale-125 md:scale-110">
                        {dummyImages.slice(0, 8).map((src, i) => (
                            <div key={i} className="aspect-square relative grayscale">
                                <Image src={src} alt="" fill className="object-cover" priority={i < 4} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-4 block">
                            Excellence & Glory
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-[#2D2A26] mb-6 leading-[1.1] tracking-tight">
                            Hall of <span className="italic font-serif text-[#E76F51]">Fame</span>
                        </h1>
                        <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-medium">
                            Celebrating the triumphs, milestones, and hard-earned victories of our students and coaches.
                        </p>
                    </motion.div>
                </div>
            </section>
            <SuccessStories/>

            {/* 2. SHARED ACHIEVEMENTS SECTION (Stats) */}
            <AchievementsSection />

            {/* 3. MENTORSHIP SECTION */}
            <section className="py-16 md:py-32 px-4 md:px-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 right-0 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-[#E76F51] rounded-full blur-[100px] md:blur-[150px]" />
                </div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
                    {/* Text Side - Order 2 on Mobile */}
                    <div className="w-full lg:w-1/2 space-y-8 md:space-y-10 order-2 lg:order-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#E76F51] mb-4 block">Individual Excellence</span>
                            <h2 className="text-3xl md:text-6xl font-black text-[#2D2A26] leading-tight">
                                Mentorship of <br className="hidden md:block" />
                                <span className="text-[#E76F51]">Grandmasters</span>
                            </h2>
                            <div className="h-1.5 w-20 bg-[#FFDA44] rounded-full mt-6 mx-auto lg:mx-0" />
                        </motion.div>

                        <p className="text-base md:text-xl text-[#5C5852] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                            We cultivate champions through personalized mentorship that transforms talent into strategic dominance.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 text-left">
                            {[
                                { icon: Crown, title: "1-on-1 GM sessions", desc: "Direct learning from masters." },
                                { icon: Target, title: "Customized Repertoire", desc: "Openings built for your style." },
                                { icon: Brain, title: "Psychological Prep", desc: "Mental toughness training." },
                                { icon: Sparkles, title: "Game Analysis", desc: "Engine-backed move reviews." },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2 md:space-y-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#FDFBF7] border border-[#E6E0D4] flex items-center justify-center text-[#E76F51] shadow-sm">
                                        <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <h4 className="font-black text-[#2D2A26] text-sm md:text-base">{item.title}</h4>
                                    <p className="text-xs md:text-sm text-[#5C5852] font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Side - Order 1 on Mobile */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 relative order-1 lg:order-2"
                    >
                        <div className="relative aspect-square sm:aspect-video lg:aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-[12px] border-[#FDFBF7] shadow-2xl">
                            <Image src="/image5.jpg" alt="Mentorship" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/40 to-transparent" />

                            {/* Floating Card - Repositioned for small screens */}
                            <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-10 p-4 md:p-8 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl border border-white/20">
                                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FFDA44] flex items-center justify-center text-[#5C1F1C]">
                                        <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#5C5852]">Success Rate</p>
                                        <p className="text-lg md:text-2xl font-black text-[#2D2A26]">100% Focused</p>
                                    </div>
                                </div>
                                <p className="text-[#5C5852] text-[10px] md:text-sm font-bold italic leading-tight">
                                    Every student receives a personalized development plan.
                                </p>
                            </div>
                        </div>
                        {/* Decorative background blob */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFDA44] rounded-full -z-10 blur-2xl opacity-20" />
                    </motion.div>
                </div>
            </section>

            {/* 4. LEARNING ENVIRONMENT */}
            <section className="py-16 md:py-32 px-4 md:px-6 bg-[#FDFBF7] relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12 md:mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-4 md:mb-6 block">The Academy Environment</span>
                            <h2 className="text-3xl md:text-6xl lg:text-7xl font-black text-[#2D2A26] leading-tight tracking-tight">
                                Where <span className="text-[#E76F51]">Growth</span> Happens
                            </h2>
                            <p className="text-base md:text-lg text-[#5C5852] mt-6 max-w-2xl mx-auto font-medium">
                                We believe the right environment is half the training. Our academy is designed to inspire focus and simulate elite tournament conditions.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
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
                                title: "Analysis Hub",
                                desc: "Engine-backed analysis stations for tactical precision and game review.",
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
                                whileHover={{ y: -10 }}
                                className="group h-full"
                            >
                                <div className={`h-full p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border-2 transition-all duration-500 overflow-hidden relative shadow-sm hover:shadow-2xl ${item.borderColor} hover:border-transparent`}>
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.bg}`} />

                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-[#FDFBF7] border border-[#E6E0D4] flex items-center justify-center mb-6 md:mb-10 group-hover:scale-110 group-hover:bg-white transition-all duration-500 shadow-md`}>
                                            <item.icon className={`w-7 h-7 md:w-10 md:h-10 ${item.iconColor}`} />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-[#2D2A26] mb-4">{item.title}</h3>
                                        <p className="text-sm md:text-base font-bold text-[#5C5852] leading-relaxed">
                                            {item.desc}
                                        </p>

                                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E76F51]">
                                            <span>Explore Facility</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. REVIEWS SECTION */}
            <StudentSuccessAndTestimonials/>

            {/* 7. CTA SECTION */}
            <section className="relative py-20 md:py-32 bg-[#FDFBF7] text-[#2D2A26] overflow-hidden border-t border-[#E6E0D4]">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#FFDA44]/10 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#E76F51]/10 rounded-full blur-[80px] md:blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                        Join the <br className="md:hidden" />
                        <span className="text-[#E76F51]">Winners Circle.</span>
                    </h2>
                    <p className="text-base md:text-xl text-[#5C5852] mb-10 md:mb-12 max-w-2xl mx-auto font-medium">
                        Your trophy is waiting. The journey to the podium starts with one decision.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button className="w-full h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-bold hover:bg-[#E76F51] transition-all duration-300 shadow-2xl">
                                Start Training
                            </Button>
                        </Link>
                        <Link href="/courses" className="text-sm md:text-lg font-black text-[#2D2A26] border-b-2 border-[#2D2A26]/20 hover:text-[#E76F51] hover:border-[#E76F51] transition-colors pb-1 uppercase tracking-widest">
                            View Curriculum
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
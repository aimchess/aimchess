"use client";

import { motion } from "framer-motion";
import { CheckCircle, Users, Award, Clock, Globe, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function WhyChooseUs() {
    const mainFeatures = [
        {
            icon: Users,
            title: "Expert Coaching",
            description: "FIDE-rated coaches and titled players with 10+ years of experience guide every lesson.",
        },
        {
            icon: Award,
            title: "Proven Results",
            description: "50+ tournament wins and 3 Grandmasters produced by our academy.",
        },
        {
            icon: Clock,
            title: "Flexible Schedule",
            description: "Morning, evening & weekend batches. Online and offline options available.",
        },
    ];

    const checkpoints = [
        "Personalized training plans",
        "Small batch sizes (max 6)",
        "Progress tracking dashboard",
        "Tournament preparation",
        "Parent progress reports",
        "Free trial session",
    ];

    return (
        <section className="py-24 px-6 bg-[#FDFBF7] overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FFDA44]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#E76F51]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Content */}
                    <div className="order-2 lg:order-1">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-sm font-bold uppercase tracking-widest text-[#E76F51] mb-4 block"
                        >
                            The Royal Look Advantage
                        </motion.span>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-[#2D2A26] mb-6 leading-tight"
                        >
                            Why Parents <span className="text-[#E76F51]">Trust Us</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-[#5C5852] mb-10 leading-relaxed"
                        >
                            We combine world-class coaching with a nurturing environment where every child can thrive and discover their potential.
                        </motion.p>

                        {/* Main Features */}
                        <div className="space-y-6 mb-10">
                            {mainFeatures.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-[#FFDA44]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFDA44] transition-colors">
                                            <Icon className="w-6 h-6 text-[#2D2A26]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#2D2A26] mb-1">{item.title}</h3>
                                            <p className="text-[#5C5852] text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link href="/about" className="inline-flex items-center gap-2 text-[#E76F51] font-bold hover:underline group">
                                Learn More About Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right: Visual Card */}
                    <div className="order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Main Image Card */}
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                                <Image src="/image5.jpg" alt="Chess Training" fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/60 to-transparent" />

                                {/* Overlay Badge */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-xl">
                                    <div className="grid grid-cols-2 gap-3">
                                        {checkpoints.map((point, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2A9D8F] flex-shrink-0" />
                                                <span className="text-xs font-medium text-[#2D2A26]">{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Accent Elements */}
                            <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#FFDA44] rounded-2xl -z-10 rotate-6" />
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#E76F51] rounded-2xl -z-10 -rotate-6" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

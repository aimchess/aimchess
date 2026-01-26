"use client";

import { motion } from "framer-motion";
import { CheckCircle, Users, Award, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function WhyChooseUs() {
    const mainFeatures = [
        {
            icon: Users,
            title: "Expert Coaching",
            description: "FIDE-rated coaches and titled players with 30+ years of experience guide every lesson.",
        },
        {
            icon: Award,
            title: "Proven Results",
            description: "50+ tournament wins and 3 Elite Coaches produced by our academy.",
        },
        {
            icon: Clock,
            title: "Flexible Schedule",
            description: "Morning, evening & weekend batches. Online and offline options available.",
        },
    ];

    const checkpoints = [
        "Personalized training",
        "Small Online batches (max 6)",
        "Progress dashboard",
        "Tournament prep",
        "Parent reports",
        "Free trial session",
    ];

    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#FDFBF7] overflow-hidden relative">
            {/* Decorative Elements - Hidden or sized down on mobile to prevent layout shifts */}
            <div className="absolute top-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[#FFDA44]/10 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-[#E76F51]/10 rounded-full blur-[50px] md:blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Responsive Grid: Image top on mobile, Right on Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Visual Card - Comes first on mobile for visual engagement */}
                    <div className="order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Main Image Card */}
                            <div className="relative aspect-square sm:aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                                <Image
                                    src="/image5.jpg"
                                    alt="Chess Training"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/70 via-transparent to-transparent" />

                                {/* Overlay Badge - Responsive Grid inside */}
                                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                                        {checkpoints.map((point, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#2A9D8F] flex-shrink-0" />
                                                <span className="text-[10px] md:text-xs font-bold text-[#2D2A26]">{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Accent Elements - Scaled for mobile */}
                            <div className="absolute -top-3 -left-3 w-12 h-12 md:w-20 md:h-20 bg-[#FFDA44] rounded-xl md:rounded-2xl -z-10 rotate-6" />
                            <div className="absolute -bottom-3 -right-3 w-10 h-10 md:w-16 md:h-16 bg-[#E76F51] rounded-xl md:rounded-2xl -z-10 -rotate-6" />
                        </motion.div>
                    </div>

                    {/* Content Area */}
                    <div className="order-2 lg:order-1 text-center lg:text-left">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-[#E76F51] mb-4 block"
                        >
                            The Royal Rooks Advantage
                        </motion.span>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2D2A26] mb-6 leading-tight"
                        >
                            Why Parents <span className="text-[#E76F51]">Trust Us</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-base md:text-lg text-[#5C5852] mb-8 md:mb-10 leading-relaxed font-medium"
                        >
                            We combine world-class coaching with a nurturing environment where every child can thrive and discover their potential.
                        </motion.p>

                        {/* Main Features List */}
                        <div className="space-y-6 md:space-y-8 mb-10 text-left">
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
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#FFDA44]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFDA44] transition-colors">
                                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#2D2A26]" />
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold text-[#2D2A26] mb-1">{item.title}</h3>
                                            <p className="text-[#5C5852] text-xs md:text-sm leading-relaxed font-medium">{item.description}</p>
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
                            <Link
                                href="/about"
                                className="inline-flex items-center gap-2 text-[#E76F51] font-black text-sm md:text-base hover:underline group"
                            >
                                Learn More About Us
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    HelpCircle,
    Sparkles,
    Users,
    Award,
    Clock,
    Target,
    BookOpen,
    MessageCircle,
    Phone
} from "lucide-react";

const faqData = [
    {
        question: "What is the best age to start chess?",
        answer: "We recommend starting as early as 5-6 years old. This is when cognitive development is rapid, and children can easily grasp logic and pattern recognition. However, it's never too late to learn!",
        icon: <Users className="w-6 h-6" />,
        color: "bg-[#FFDA44]/20",
        iconBg: "bg-[#FFDA44]",
        iconColor: "text-[#5C1F1C]"
    },
    {
        question: "Do you offer online classes?",
        answer: "Yes! We have a robust online training platform with live interactive sessions, grandmaster webinars, and digital homework. We train students from over 15 countries.",
        icon: <Target className="w-6 h-6" />,
        color: "bg-[#E76F51]/10",
        iconBg: "bg-[#E76F51]",
        iconColor: "text-white"
    },
    {
        question: "How long does it take to get a FIDE rating?",
        answer: "Typically, with consistent training (2-3 times/week) and regular tournament participation, a dedicated student can achieve an initial FIDE rating within 12-18 months.",
        icon: <Award className="w-6 h-6" />,
        color: "bg-[#2A9D8F]/10",
        iconBg: "bg-[#2A9D8F]",
        iconColor: "text-white"
    },
    {
        question: "Is trial class available?",
        answer: "Absolutely. We offer a free 30-minute assessment and trial session to gauge the student's level and recommend the right course.",
        icon: <Sparkles className="w-6 h-6" />,
        color: "bg-[#5C1F1C]/10",
        iconBg: "bg-[#5C1F1C]",
        iconColor: "text-white"
    },
    {
        question: "What is the student-to-coach ratio?",
        answer: "For group classes, we maintain a strict 8:1 ratio to ensure personal attention. For elite batches, it's 4:1. One-on-one coaching is also available.",
        icon: <BookOpen className="w-6 h-6" />,
        color: "bg-[#F4A261]/20",
        iconBg: "bg-[#F4A261]",
        iconColor: "text-[#5C1F1C]"
    },
];

export function FaqSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1F1C] text-white text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <HelpCircle size={14} className="text-[#FFDA44]" />
                        Parent Help Desk
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] tracking-tight">
                        Common <span className="text-[#E76F51]">Questions</span>
                    </h2>
                    <div className="h-1.5 w-24 bg-[#FFDA44] mx-auto rounded-full mt-4" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left: Video Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-24"
                    >
                        <div className="relative">
                            {/* Shadow Layer */}
                            <div className="absolute inset-0 bg-[#5C1F1C] rounded-[2rem] translate-x-3 translate-y-3 -z-10" />

                            {/* Video Container */}
                            <div className="relative aspect-square bg-white rounded-[2rem] border-4 border-[#5C1F1C] overflow-hidden shadow-xl">
                                <video
                                    src="/video.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />

                                {/* Badge */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="p-4 bg-white/90 backdrop-blur-sm border border-[#E6E0D4] rounded-xl flex items-center gap-3">
                                        <Sparkles size={18} className="text-[#E76F51]" />
                                        <p className="text-[#2D2A26] font-bold text-xs uppercase tracking-widest">
                                            Royal Rooks Training
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: FAQ Accordions */}
                    <div className="space-y-4">
                        {faqData.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group rounded-[1.5rem] border-2 transition-all duration-300 ${faq.color} ${activeIndex === idx
                                    ? "border-[#5C1F1C] shadow-[6px_6px_0px_#5C1F1C]"
                                    : "border-transparent hover:border-[#E6E0D4]"
                                    }`}
                            >
                                <button
                                    onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                                    className="w-full p-5 lg:p-6 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform ${activeIndex === idx ? "scale-110" : ""
                                                } ${faq.iconBg} ${faq.iconColor}`}
                                        >
                                            {faq.icon}
                                        </div>
                                        <h4 className="text-base lg:text-lg font-bold text-[#2D2A26]">
                                            {faq.question}
                                        </h4>
                                    </div>

                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${activeIndex === idx
                                            ? "bg-[#5C1F1C] text-white rotate-180"
                                            : "bg-white text-[#5C5852]"
                                            }`}
                                    >
                                        <ChevronDown size={18} />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {activeIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-5 pb-5 lg:pl-[4.5rem] lg:pr-6 lg:pb-6">
                                                <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
                                                    <p className="text-[#5C5852] leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

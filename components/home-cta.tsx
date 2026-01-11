"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomeCTA() {
    return (
        <section className="relative py-20 md:py-32 bg-[#FDFBF7] overflow-hidden">
            {/* Animated Background Elements - Responsive sizing */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-[5%] md:left-[10%] w-16 h-16 md:w-24 md:h-24 bg-[#FFDA44]/20 rounded-full blur-xl"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 right-[5%] md:right-[15%] w-24 h-24 md:w-40 md:h-40 bg-[#E76F51]/10 rounded-full blur-2xl md:blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#2A9D8F]/5 rounded-full blur-[60px] md:blur-[100px]"
                />
            </div>

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 bg-[#FFDA44]/20 px-4 py-2 rounded-full mb-6 md:mb-8"
                >
                    <Sparkles className="w-4 h-4 text-[#E76F51]" />
                    <span className="text-[10px] md:text-xs font-black text-[#2D2A26] tracking-[0.2em] uppercase">Free Trial Available</span>
                </motion.div>

                {/* Heading - Scaled for Mobile */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#2D2A26] mb-6 md:mb-8 leading-[1.1] tracking-tight"
                >
                    Ready to Become a <br className="hidden sm:block" />
                    <motion.span
                        className="text-[#E76F51]"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Chess Champion?
                    </motion.span>
                </motion.h2>

                {/* Paragraph */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-base md:text-xl text-[#5C5852] mb-10 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
                >
                    Join hundreds of students who transformed their thinking. Your first lesson is completely free.
                </motion.p>

                {/* Actions - Stacks on Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                    <Link href="/contact" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto h-16 px-10 rounded-full bg-[#2D2A26] text-white text-lg font-bold hover:bg-[#E76F51] transition-all duration-300 shadow-2xl hover:shadow-[#E76F51]/20 group">
                            Book Free Trial
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    
                    <Link 
                        href="/courses" 
                        className="text-base md:text-lg font-black text-[#2D2A26] border-b-2 border-[#2D2A26]/10 hover:text-[#E76F51] hover:border-[#E76F51] transition-all pb-1 uppercase tracking-widest"
                    >
                        Explore Courses
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
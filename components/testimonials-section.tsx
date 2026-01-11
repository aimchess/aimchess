"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Janina Budi",
    role: "Faye's Mother",
    rating: 5,
    content: "Prashant has been a fantastic chess coach for our son over three years—patient, kind, and dedicated. He builds trust, provides honest feedback, and teaches that true progress comes from dedication and learning from failures.",
    image: "/demo-priya.jpg",
  },
  {
    id: 2,
    name: "Jayasree Chettipilli",
    role: "Mother of Rhea and Jay",
    rating: 5,
    content: "Patient and friendly, he makes learning fun—especially for playful Jay—while focusing on enjoyment over winning. With milestone treats and genuine encouragement, he's boosted their confidence and skills, leading to tournament wins!",
    image: "/demo-rohan.jpg",
  },
  {
    id: 3,
    name: "Shanthi",
    role: "Parent",
    rating: 5,
    content: "An excellent chess coach who focuses on building strong fundamentals. My child looks forward to every class and has shown improvement in focus, planning, and decision-making. His teaching style is calm, disciplined, and motivating.",
    image: "/demo-ananya.jpg",
  },
  {
    id: 4,
    name: "Praveen",
    role: "Parent",
    rating: 5,
    content: "Patient, knowledgeable, and explains concepts in a very clear and structured way. My child's understanding of chess, especially strategic thinking, has improved noticeably. We truly appreciate his dedication.",
    image: "/demo-ananya.jpg",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const getVisibleTestimonials = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      items.push({ ...testimonials[index], displayIndex: i });
    }
    return items;
  };

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-10 w-40 h-40 bg-[#FFDA44]/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-64 h-64 bg-[#E76F51]/5 rounded-full blur-3xl" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E6E0D4] mb-6"
          >
            <MessageCircle className="w-4 h-4 text-[#E76F51]" />
            <span className="text-sm font-bold text-[#2D2A26] tracking-wide uppercase">Real Stories</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] mb-6"
          >
            Parent <span className="text-[#E76F51]">Success Stories</span>
          </motion.h2>
          <div className="h-1.5 w-24 bg-[#FFDA44] mx-auto rounded-full mb-6" />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#5C5852] text-lg max-w-2xl mx-auto"
          >
            Hear from parents who have experienced the transformative power of Royal Look Academy.
          </motion.p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white rounded-full shadow-lg border border-[#E6E0D4] items-center justify-center text-[#2D2A26] hover:bg-[#FFDA44] hover:border-[#FFDA44] transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white rounded-full shadow-lg border border-[#E6E0D4] items-center justify-center text-[#2D2A26] hover:bg-[#FFDA44] hover:border-[#FFDA44] transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {getVisibleTestimonials().map((testimonial) => (
                <motion.div
                  key={`${testimonial.id}-${currentIndex}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, delay: testimonial.displayIndex * 0.1 }}
                  className="h-full"
                >
                  <div className="h-full bg-white rounded-[2rem] p-8 border border-[#E6E0D4] shadow-sm hover:shadow-xl hover:border-transparent hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 text-[#FFDA44]/20 group-hover:text-[#FFDA44]/40 transition-colors">
                      <Quote className="w-16 h-16 fill-current" />
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#FFDA44] text-[#FFDA44]" />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 mb-8">
                      <p className="text-[#5C5852] leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-6 border-t border-[#E6E0D4]">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#FFDA44]">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2D2A26]">{testimonial.name}</h4>
                        <p className="text-xs text-[#E76F51] font-bold uppercase tracking-wide">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden justify-center gap-4 mt-8">
            <button onClick={prevSlide} className="w-12 h-12 bg-white rounded-full shadow-lg border border-[#E6E0D4] flex items-center justify-center active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextSlide} className="w-12 h-12 bg-white rounded-full shadow-lg border border-[#E6E0D4] flex items-center justify-center active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                  ? "bg-[#E76F51] w-8"
                  : "bg-[#E6E0D4] hover:bg-[#FFDA44]"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
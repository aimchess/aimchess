"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Trophy, Users, BookOpen, Maximize2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Brand Colors
const primaryColor = "#5C1F1C";
const accentColor = "#FFDA44";

const galleryCategories = [
  { id: "all", name: "All Moments" },
  { id: "tournaments", name: "Tournaments" },
  { id: "certificate", name: "Awards" },
  { id: "events", name: "Events" },
];

const dummyImages = [
  "/image.jpg", "/image1.jpg", "/image13.jpg",
  "/image3.jpg", "/image4.jpg", "/image5.jpg",
  "/image6.jpg", "/image7.jpg", "/image13.jpg",
  "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
];

const galleryImages = [
  { id: 1, src: dummyImages[0], category: "tournaments", title: "Victory Moment", desc: "" },
  { id: 2, src: dummyImages[1], category: "tournaments", title: "Focus & Strategy", desc: "" },
  { id: 3, src: dummyImages[2], category: "tournaments", title: "The Winning Move", desc: "" },
  { id: 4, src: dummyImages[3], category: "certificate", title: "Certification Ceremony", desc: "" },
  { id: 5, src: dummyImages[4], category: "certificate", title: "Award Recognition", desc: "" },
  { id: 6, src: dummyImages[5], category: "certificate", title: "Master Achievement", desc: "" },
  { id: 7, src: dummyImages[6], category: "events", title: "Academy Gathering", desc: "" },
  { id: 8, src: dummyImages[7], category: "events", title: "Summer Training", desc: "" },
  { id: 9, src: dummyImages[8], category: "events", title: "Grandmaster Session", desc: "" },
  { id: 10, src: dummyImages[9], category: "events", title: "Prize Distribution", desc: "" },
  { id: 11, src: dummyImages[10], category: "events", title: "Game Analysis", desc: "" },
  { id: 12, src: dummyImages[11], category: "events", title: "Special Guest", desc: "" },
  { id: 13, src: dummyImages[12], category: "events", title: "Community Event", desc: "" },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[0] | null>(null);

  const filteredImages = selectedCategory === "all"
    ? galleryImages
    : galleryImages.filter((img) => img.category === selectedCategory);

  const openLightbox = (image: typeof galleryImages[0]) => setSelectedImage(image);
  const closeLightbox = () => setSelectedImage(null);

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % filteredImages.length
      : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20">

      {/* 1. HERO: The Exhibition Entrance */}
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
              The Collection
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-6 leading-tight tracking-tight">
              Captured <span className="italic font-serif text-[#E76F51]">Brilliance</span>
            </h1>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              Every move tells a story. Explore the moments that define our journey, from quiet concentration to championship glory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTERS: The Curator's Tab */}
      <section className="sticky top-0 z-40 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#E6E0D4]">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex justify-center min-w-max gap-8 md:gap-12 py-6">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="relative py-2 group"
              >
                <span className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors duration-300 ${selectedCategory === category.id ? "text-[#2D2A26]" : "text-[#5C5852]/60 hover:text-[#E76F51]"
                  }`}>
                  {category.name}
                </span>
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E76F51]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOSAIC: The Living Wall */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            layout
            className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="break-inside-avoid group cursor-pointer relative"
                  onClick={() => openLightbox(image)}
                >
                  <div className="bg-white p-2 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="relative overflow-hidden rounded-xl bg-[#2D2A26]">
                      <Image
                        src={image.src}
                        alt={image.title}
                        width={800}
                        height={600}
                        className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white">
                            <Maximize2 className="w-5 h-5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Caption Card style */}
                    <div className="pt-4 pb-2 px-2">
                      <p className="text-xs font-bold text-[#E76F51] uppercase tracking-wider mb-1">
                        {galleryCategories.find(c => c.id === image.category)?.name}
                      </p>
                      <h3 className="text-lg font-bold text-[#2D2A26] line-clamp-1 group-hover:text-[#E76F51] transition-colors">
                        {image.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20 text-[#5C5852]">
              <p className="text-xl">No moments found in this collection.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. LIGHTBOX: Focus Mode */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2A26]/98 backdrop-blur-xl p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Content Container */}
            <div
              className="relative w-full max-w-7xl h-full flex flex-col md:flex-row items-center gap-8 md:gap-12"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Image Area */}
              <div className="relative flex-1 w-full h-[60vh] md:h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full h-full max-h-[85vh]"
                >
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    fill
                    className="object-contain"
                  />
                </motion.div>

                {/* Nav Arrows */}
                <button onClick={() => navigateImage('prev')} className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all hover:scale-110">
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button onClick={() => navigateImage('next')} className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all hover:scale-110">
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Info Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full md:w-[350px] bg-white rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-1 bg-[#E76F51]" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#E76F51]">
                    {galleryCategories.find(c => c.id === selectedImage.category)?.name}
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold text-[#2D2A26] mb-4 leading-tight">
                  {selectedImage.title}
                </h2>
                <p className="text-[#5C5852] leading-relaxed mb-8">
                  {selectedImage.desc}
                </p>

                <div className="pt-8 border-t border-[#E6E0D4] flex justify-between items-center">
                  <span className="text-xs font-bold text-[#5C5852]/50 uppercase tracking-widest">
                    Royal Look Gallery
                  </span>
                  <Button variant="ghost" size="icon" className="text-[#2D2A26] hover:bg-[#FDFBF7]">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Brand Colors
const THEME = {
  primary: "#5C1F1C",
  accent: "#FFDA44",
  bg: "#FDFBF7",
  charcoal: "#2D2A26",
  coral: "#E76F51"
};

const galleryCategories = [
  { id: "all", name: "All Moments" },
  { id: "tournaments", name: "Tournaments" },
  { id: "certificate", name: "Awards" },
  { id: "events", name: "Events" },
];

// Using the same dummy image array
const dummyImages = [
  "/image.jpg", "/image13.jpg", "/image3.jpg", "/image4.jpg", "/image5.jpg",
  "/image6.jpg", "/image7.jpg", "/image14.jpg", "/image9.jpg", "/image10.jpg",
  "/image11.jpg", "/image15.jpg", "/image1.jpg"
];

const galleryImages = [
  { id: 1, src: dummyImages[0], category: "tournaments", title: "Prodigy in Action", desc: "A young student demonstrating intense focus and calculation during her championship match." },
  { id: 2, src: dummyImages[1], category: "events", title: "The Prize Table", desc: "Rewards awaiting our champions at the grand finale of the Royal Rooks tournament series." },
  { id: 3, src: dummyImages[2], category: "events", title: "Inaugural Ceremony", desc: "Distinguished guests and grandmasters gathered to launch our annual chess festival." },
  { id: 4, src: dummyImages[3], category: "events", title: "Wisdom Shared", desc: "Guest speaker delivering a motivational talk on the strategic parallels between chess and life." },
  { id: 5, src: dummyImages[4], category: "certificate", title: "First Victory", desc: "The heartwarming moment a student receives her first major trophy for tactical excellence." },
  { id: 6, src: dummyImages[5], category: "tournaments", title: "Mind Games Arena", desc: "Hundreds of young players competing simultaneously in our city-wide open tournament." },
  { id: 7, src: dummyImages[6], category: "certificate", title: "Proud Achiever", desc: "Recognizing outstanding progress with formal certification of achievement and mastery." },
  { id: 10, src: dummyImages[7], category: "events", title: "Grand Finale Host", desc: "Our talented host introducing the final round of the masterclass series on the main stage." },
  { id: 11, src: dummyImages[8], category: "tournaments", title: "The Grand Hall", desc: "A panoramic view of the competitive atmosphere where hundreds of minds collide." },
  { id: 12, src: dummyImages[9], category: "tournaments", title: "Heart of a Champion", desc: "True sportsmanship captured in a friendly gesture between young competitors before their game." },
  { id: 13, src: dummyImages[10], category: "certificate", title: "Award Ceremony", desc: "Celebrating dedication and discipline as a student is honored for his exceptional performance." },
  { id: 14, src: dummyImages[11], category: "events", title: "Academy Family", desc: "A joyful moment with our students and parents celebrating at the year-end gathering." },
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
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 overflow-x-hidden">

      {/* 1. HERO */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 text-center overflow-hidden">
        {/* Background - Adjusted for mobile grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transform -rotate-12 scale-125 md:scale-110">
            {dummyImages.map((src, i) => (
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
              <span className="text-[10px] md:text-xs font-black tracking-widest text-[#2D2A26] uppercase">The Collection</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-[#2D2A26] mb-6 leading-[1.1] tracking-tight">
              Captured <br className="md:hidden" />
              <span className="italic font-serif text-[#E76F51]">Brilliance</span>
            </h1>
            <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-medium">
              Every move tells a story. Moments that define our journey, from quiet concentration to championship glory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTERS (Sticky Scrollable) */}
      <section className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E6E0D4]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 overflow-x-auto no-scrollbar">
          <div className="flex justify-start md:justify-center min-w-max gap-6 md:gap-12 py-5 md:py-6">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="relative py-1 group"
              >
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-colors duration-300 ${selectedCategory === category.id ? "text-[#2D2A26]" : "text-[#5C5852]/50 hover:text-[#E76F51]"
                  }`}>
                  {category.name}
                </span>
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-[#E76F51]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOSAIC GRID */}
      <section className="py-10 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-8 space-y-4 md:space-y-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => openLightbox(image)}
                >
                  <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#E6E0D4] hover:shadow-xl transition-all duration-500">
                    <div className="relative overflow-hidden rounded-xl bg-[#2D2A26]">
                      <Image
                        src={image.src}
                        alt={image.title}
                        width={800}
                        height={600}
                        className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white w-6 h-6" />
                      </div>
                    </div>
                    <div className="pt-4 pb-2 px-2">
                      <p className="text-[9px] font-black text-[#E76F51] uppercase tracking-widest mb-1">
                        {galleryCategories.find(c => c.id === image.category)?.name}
                      </p>
                      <h3 className="text-sm md:text-base font-black text-[#2D2A26] uppercase tracking-tight">
                        {image.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <p className="font-bold text-[#5C5852]">No moments found in this collection.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. LIGHTBOX */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D2A26]/95 backdrop-blur-xl p-0 md:p-8"
            onClick={closeLightbox}
          >
            {/* Close Button Mobile */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-[70] p-3 bg-white/10 rounded-full text-white md:hidden"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="relative w-full max-w-7xl h-full flex flex-col lg:flex-row items-center gap-6 lg:gap-12 px-4 py-12 md:py-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Area */}
              <div className="relative flex-1 w-full h-[50vh] md:h-[60vh] lg:h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Nav Arrows */}
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 md:p-4 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 md:p-4 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
                </button>
              </div>

              {/* Info Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full lg:w-[400px] bg-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Close Button Desktop */}
                <button onClick={closeLightbox} className="absolute top-4 right-4 hidden lg:block text-[#5C5852] hover:text-[#2D2A26]">
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-[2px] bg-[#E76F51]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E76F51]">
                    {galleryCategories.find(c => c.id === selectedImage.category)?.name}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-[#2D2A26] mb-4 uppercase tracking-tighter leading-tight">
                  {selectedImage.title}
                </h2>
                <p className="text-sm md:text-base text-[#5C5852] font-medium leading-relaxed mb-8">
                  {selectedImage.desc}
                </p>

                <div className="pt-6 border-t border-[#E6E0D4] flex justify-between items-center">
                  <span className="text-[9px] font-black text-[#5C5852]/50 uppercase tracking-[0.2em]">
                    Royal Rooks Academy
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
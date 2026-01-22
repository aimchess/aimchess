"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ArrowRight,
  Clock,
  ChevronRight,
  TrendingUp,
  Hash,
  Share2,
  Bookmark,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Data
const blogPosts = [
  {
    id: 1,
    title: "The Art of the Checkmate: 5 Patterns Every Player Must Know",
    excerpt: "From Scholar's Mate to Anastasia's Mate — master these patterns to finish games in style.",
    content: `# 5 Checkmate Patterns to Master... \n\nChess is a game of patterns. Mastering the final blow is the difference between a draw and a victory.`,
    author: "",
    authorImage: "/demo-priya.jpg",
    date: "2025-11-08",
    readTime: "7 min",
    category: "Technique",
    tags: ["Checkmate", "Tactics"],
    image: "/blog1.jpg"},
  {
    id: 2,
    title: "Why Your Child Should Play Chess: 7 Science-Backed Benefits",
    excerpt: "Boost IQ, focus, and emotional intelligence. Chess isn't just a game — it's brain training.",
    content: `# Chess & Child Brain Development... \n\nResearch shows that children who play chess exhibit 40% higher problem solving skills.`,
    author: "",
    authorImage: "/demo-rohan.jpg",
    date: "2025-11-05",
    readTime: "9 min",
    category: "Science",
    tags: ["Kids", "Brain"],
    image: "/blog2.avif"},
  {
    id: 3,
    title: "Ruy Lopez: The Spanish Torture Explained",
    excerpt: "The most respected opening in chess history. Learn the main lines and key strategic ideas.",
    author: "",
    authorImage: "/demo-ananya.jpg",
    date: "2025-11-01",
    readTime: "10 min",
    category: "Openings",
    tags: ["Strategy", "White"],
    image: "/blog3.jpeg",
  },
  {
    id: 4,
    title: "How to Study Chess Like a Pro (Without Burning Out)",
    excerpt: "A step-by-step training plan used by grandmasters. Train smarter, not harder.",
    author: "",
    authorImage: "/demo-priya.jpg",
    date: "2025-10-28",
    readTime: "8 min",
    category: "Training",
    tags: ["Study", "Routine"],
    image: "/blog4.webp"}
];

const categories = ["All", "Technique", "Science", "Openings", "Training"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const listPosts = filteredPosts.slice(1);

  const dummyImages = ["/image.jpg", "/image1.jpg", "/image13.jpg", "/image3.jpg", "/image4.jpg", "/image5.jpg"];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 text-[#2D2A26] overflow-x-hidden">

      {/* 1. HERO / BANNER */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transform -rotate-12 scale-125 md:scale-110">
            {dummyImages.map((src, i) => (
              <div key={i} className="aspect-square relative grayscale">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
              <span className="text-[10px] md:text-xs font-black tracking-widest text-[#2D2A26] uppercase">The Chess Chronicles</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-[#2D2A26] mb-6 leading-[1.1] tracking-tight">
              Grandmaster&apos;s <br /> <span className="italic font-serif text-[#E76F51]">Journal</span>
            </h1>
            <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto font-medium leading-relaxed">
              Deep dives into strategy, child development, and the art of the 64 squares.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E6E0D4] px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-auto relative">
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-10 bg-white border-[#E6E0D4] rounded-full py-5 text-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5852]" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#E76F51] text-white' : 'bg-white text-[#2D2A26] border border-[#E6E0D4]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left Column: Posts */}
        <div className="lg:col-span-8 space-y-12 md:space-y-20">

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="group cursor-pointer space-y-6"
              onClick={() => setSelectedPost(featuredPost)}
            >
              <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src={featuredPost.image} alt="" fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                  <Badge className="bg-[#FFDA44] text-[#2D2A26] border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">Featured Story</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black text-[#E76F51] uppercase tracking-[0.2em]">
                  <span>{featuredPost.category}</span>
                  <span className="w-1 h-1 bg-[#E6E0D4] rounded-full" />
                  <span className="text-[#5C5852]">{format(new Date(featuredPost.date), "MMM d, yyyy")}</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-black text-[#2D2A26] leading-tight group-hover:text-[#E76F51] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-base md:text-xl text-[#5C5852] font-medium leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-black border-b-2 border-[#2D2A26] w-fit pb-1 uppercase tracking-widest">
                  Read Journal <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          )}

          <Separator className="bg-[#E6E0D4]" />

          {/* List Posts */}
          <div className="space-y-12">
            {listPosts.length > 0 ? listPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-6 md:gap-8 group cursor-pointer items-start"
                onClick={() => setSelectedPost(post)}
              >
                <div className="w-full sm:w-[240px] md:w-[300px] aspect-[4/3] relative rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-lg">
                  <Image src={post.image} alt="" fill className="object-cover transition-transform group-hover:scale-110" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-[9px] font-black text-[#5C5852] uppercase tracking-[0.2em]">
                    <span className="text-[#E76F51]">{post.category}</span>
                    <span className="w-1 h-1 bg-[#E6E0D4] rounded-full" />
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} read</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-[#2D2A26] leading-tight group-hover:text-[#E76F51] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm md:text-base text-[#5C5852] font-medium leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#E6E0D4]">
                      {/* <Image src={post.authorImage} alt="" fill className="object-cover" /> */}
                    </div>
                    {/* <span className="text-xs font-black text-[#2D2A26] uppercase tracking-wider">{post.author}</span> */}
                  </div>
                </div>
              </motion.div>
            )) : <div className="text-center py-20 font-bold text-[#5C5852]">No matches found.</div>}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-12">

          {/* Topics */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#E6E0D4] shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#2D2A26] mb-8 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#E76F51]" /> Topics
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex justify-between items-center transition-all ${selectedCategory === cat ? 'bg-[#2D2A26] text-white' : 'hover:bg-[#FDFBF7] text-[#5C5852]'
                    }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#2D2A26] mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E76F51]" /> Trending
            </h3>
            <div className="space-y-8">
              {blogPosts.slice(0, 3).map((post, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <span className="text-4xl font-black text-[#E6E0D4] leading-none group-hover:text-[#E76F51] transition-colors">0{i + 1}</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#2D2A26] leading-tight group-hover:underline decoration-[#E76F51] underline-offset-4 decoration-2">
                      {post.title}
                    </h4>
                    <span className="text-[10px] font-bold text-[#5C5852] uppercase tracking-widest">{post.readTime} read</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ARTICLE READER (Full Screen Overlay) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#FDFBF7] overflow-y-auto"
          >
            {/* Nav Header */}
            <div className="sticky top-0 z-10 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E6E0D4] px-4 py-4">
              <div className="max-w-3xl mx-auto flex justify-between items-center">
                <Button variant="ghost" onClick={() => setSelectedPost(null)} className="group font-black text-[10px] uppercase tracking-widest">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180 transition-transform group-hover:-translate-x-1" />
                  Journal
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><Bookmark className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
              <div className="text-center mb-10 md:mb-16">
                <div className="inline-block px-3 py-1 bg-[#E76F51]/10 text-[#E76F51] text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
                  {selectedPost.category}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[#2D2A26] leading-tight tracking-tight mb-8">
                  {selectedPost.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#5C5852]">
                  <div className="flex items-center gap-2">
                    {/* <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#E6E0D4]">
                      <Image src={selectedPost.authorImage} alt="" fill className="object-cover" />
                    </div>
                    <span className="text-[#2D2A26]">{selectedPost.author}</span> */}
                  </div>
                  <span className="opacity-30 hidden sm:block">/</span>
                  <span>{format(new Date(selectedPost.date), "MMM d, yyyy")}</span>
                  <span className="opacity-30 hidden sm:block">/</span>
                  <span>{selectedPost.readTime} read</span>
                </div>
              </div>

              <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
                <Image src={selectedPost.image} alt="" fill className="object-cover" />
              </div>

              <article className="prose prose-lg prose-stone max-w-none 
                   prose-headings:font-black prose-headings:text-[#2D2A26] prose-headings:tracking-tight
                   prose-p:text-[#5C5852] prose-p:leading-relaxed prose-p:font-medium
                   prose-strong:text-[#2D2A26] prose-strong:font-black
                   prose-blockquote:border-l-[#E76F51] prose-blockquote:bg-[#E76F51]/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl
                   prose-img:rounded-[2rem] prose-img:shadow-xl"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.content || "Content coming soon..."}
                </ReactMarkdown>

                <p className="mt-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem.
                  Curabitur ut massa auctor, tincidunt neque eget, scelerisque leo.
                </p>
              </article>
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
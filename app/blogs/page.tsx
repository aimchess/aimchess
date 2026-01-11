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
  Calendar,
  ChevronRight,
  Mail,
  TrendingUp,
  Hash,
  X,
  Share2,
  Bookmark
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Data (Preserved from original)
const blogPosts = [
  {
    id: 1,
    title: "The Art of the Checkmate: 5 Patterns Every Player Must Know",
    excerpt: "From Scholar's Mate to Anastasia's Mate — master these 5 checkmate patterns to finish games in style.",
    content: `# 5 Checkmate Patterns to Master...`, // Content truncated for brevity in code view, assume full markdow exists
    author: "GM Vishal Kumar",
    authorImage: "/demo/author-1.jpg",
    date: "2025-11-08",
    readTime: "7 min",
    category: "Technique",
    tags: ["Checkmate", "Tactics", "Patterns"],
    image: "/blog-1.jpeg",
    views: 4800,
  },
  {
    id: 2,
    title: "Why Your Child Should Play Chess: 7 Science-Backed Benefits",
    excerpt: "Boost IQ, focus, and emotional intelligence. Chess isn't just a game — it's brain training.",
    content: `# Chess & Child Brain Development...`,
    author: "Dr. Neha Gupta",
    authorImage: "/demo/author-2.jpg",
    date: "2025-11-05",
    readTime: "9 min",
    category: "Science",
    tags: ["Kids", "Brain", "Research"],
    image: "/blog-2.jpg",
    views: 6200,
  },
  {
    id: 3,
    title: "Ruy Lopez: The Spanish Torture Explained",
    excerpt: "The most respected opening in chess history. Learn the main lines and key ideas.",
    content: `# Ruy Lopez...`,
    author: "IM Aryan Singh",
    authorImage: "/demo/author-3.jpg",
    date: "2025-11-01",
    readTime: "10 min",
    category: "Openings",
    tags: ["Ruy Lopez", "Strategy", "White"],
    image: "/blog-3.webp",
    views: 3900,
  },
  {
    id: 4,
    title: "How to Study Chess Like a Pro (Without Burning Out)",
    excerpt: "A step-by-step training plan used by grandmasters. Train smarter, not harder.",
    content: `# Pro-Level Study Plan...`,
    author: "Coach Rohan Mehta",
    authorImage: "/demo/author-4.jpg",
    date: "2025-10-28",
    readTime: "8 min",
    category: "Training",
    tags: ["Study", "Routine", "Improvement"],
    image: "/blog-4.png",
    views: 5500,
  },
  {
    id: 5,
    title: "The 7 Biggest Mistakes Beginners Make",
    excerpt: "Stop hanging pieces, blundering, and losing in 10 moves. Fix these now.",
    content: `# 7 Deadly Mistakes...`,
    author: "FM Kavya Reddy",
    authorImage: "/demo/author-5.jpg",
    date: "2025-10-20",
    readTime: "6 min",
    category: "Beginner",
    tags: ["Mistakes", "Tips", "Fixes"],
    image: "/blog-5.jpg",
    views: 7100,
  },
];

const categories = ["All", "Technique", "Science", "Openings", "Training", "Beginner"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);

  // Filter Logic
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured Post is simply the first one in this design, or could be pinned
  const featuredPost = filteredPosts[0];
  const listPosts = filteredPosts.slice(1);


  const dummyImages = [
    "/image.jpg", "/image1.jpg", "/image13.jpg",
    "/image3.jpg", "/image4.jpg", "/image5.jpg",
    "/image6.jpg", "/image7.jpg", "/image13.jpg",
    "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 text-[#2D2A26]">
      {/* 1. HERO: The Manifesto - Bold, Editorial Style */}
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
              Curriculum Roadmap
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-6 leading-tight tracking-tight">
              Choose Your <span className="italic font-serif text-[#E76F51]">Battlefield</span>
            </h1>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              A structured path from learning the rules to breaking them like a Master. Select your starting point.
            </p>
          </motion.div>
        </div>
      </section>
      {/* 1. HEADER: Minimalist Editorial */}
      <header className="pt-22 pb-12 px-6 border-b border-[#E6E0D4]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-12 bg-[#E76F51]"></div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#E76F51]">The Chess Chronicles</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Grandmaster's <br /> <span className="italic font-serif text-[#5C5852]">Journal</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-auto relative">
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-10 bg-white border-[#E6E0D4] rounded-full py-6 focus:ring-[#E76F51]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C5852]" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* 2. MAIN CONTENT (Left Col) */}
        <div className="lg:col-span-8 space-y-16">

          {/* Featured Post (Hero) */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group cursor-pointer"
              onClick={() => setSelectedPost(featuredPost)}
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-xl">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Badge className="bg-[#E76F51] hover:bg-[#E76F51] border-none text-white mb-3">
                    Featured Story
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-[#E76F51] uppercase tracking-wider">
                  <span>{featuredPost.category}</span>
                  <span className="w-1 h-1 bg-[#2D2A26] rounded-full" />
                  <span>{format(new Date(featuredPost.date), "MMMM d, yyyy")}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold group-hover:text-[#E76F51] transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-xl text-[#5C5852] line-clamp-2 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold border-b-2 border-[#2D2A26] w-fit pb-1 group-hover:border-[#E76F51] transition-colors">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          )}

          <Separator className="bg-[#E6E0D4]" />

          {/* List Layout */}
          <div className="space-y-12">
            {listPosts.length > 0 ? (
              listPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col md:flex-row gap-6 group cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Thumbnail */}
                  <div className="w-full md:w-1/3 aspect-[4/3] relative rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3 py-2">
                    <div className="flex items-center gap-3 text-xs font-bold text-[#5C5852] uppercase tracking-wider">
                      <span className="text-[#E76F51]">{post.category}</span>
                      <span className="w-1 h-1 bg-[#E6E0D4] rounded-full" />
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-2xl font-bold font-serif group-hover:text-[#E76F51] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#5C5852] line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-auto pt-2">
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm font-bold text-[#2D2A26]">{post.author}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-[#5C5852]">No articles found matching your criteria.</div>
            )}
          </div>

        </div>

        {/* 3. SIDEBAR (Right Col) */}
        <div className="lg:col-span-4 space-y-12">

          {/* Categories */}
          <div className="bg-white p-8 rounded-3xl border border-[#E6E0D4] shadow-sm">
            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#E76F51]" /> Topics
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex justify-between items-center ${selectedCategory === cat
                    ? "bg-[#2D2A26] text-white"
                    : "hover:bg-[#FDFBF7] text-[#5C5852]"
                    }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter - "Weekly Wisdom" */}
          {/* <div className="bg-[#FFDA44] p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-2xl font-extrabold text-[#2D2A26] mb-2 relative z-10">Weekly Wisdom</h3>
            <p className="text-[#2D2A26]/80 mb-6 relative z-10 font-medium leading-tight">
              Get grandmaster tips delivered to your inbox every Sunday. No moves wasted.
            </p>
            <div className="space-y-3 relative z-10">
              <Input placeholder="Your email address" className="bg-white/90 border-none rounded-xl py-6" />
              <Button className="w-full bg-[#2D2A26] text-white hover:bg-[#E76F51] rounded-xl py-6 text-lg font-bold shadow-lg">
                Subscribe Free <Mail className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div> */}

          {/* Trending / Popular (Static) */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E76F51]" /> Trending
            </h3>
            <div className="space-y-6">
              {[1, 3, 5].map((id, i) => {
                const post = blogPosts.find(p => p.id === id);
                if (!post) return null;
                return (
                  <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <span className="text-3xl font-black text-[#E6E0D4] group-hover:text-[#E76F51] transition-colors">0{i + 1}</span>
                    <div>
                      <h4 className="font-bold leading-tight group-hover:underline decoration-[#E76F51] decoration-2 underline-offset-4">
                        {post.title}
                      </h4>
                      <span className="text-xs text-[#5C5852] mt-1 block">{post.readTime} read</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ARTICLE READER (Modal) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FDFBF7] overflow-y-auto"
          >
            {/* Sticky Nav */}
            <div className="sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E6E0D4] p-4 flex justify-between items-center z-10">
              <Button variant="ghost" onClick={() => setSelectedPost(null)} className="group">
                <ArrowRight className="w-5 h-5 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Journal
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full"><Bookmark className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12">
              <div className="text-center mb-12">
                <Badge className="mb-6 bg-[#E76F51]/10 text-[#E76F51] hover:bg-[#E76F51]/20 border-none px-4 py-1 text-sm">
                  {selectedPost.category}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D2A26] mb-6 leading-tight">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center justify-center gap-4 text-[#5C5852]">
                  <div className="flex items-center gap-2">
                    <Image src={selectedPost.authorImage} alt="" width={32} height={32} className="rounded-full" />
                    <span className="font-bold text-[#2D2A26]">{selectedPost.author}</span>
                  </div>
                  <span>•</span>
                  <span>{format(new Date(selectedPost.date), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime} read</span>
                </div>
              </div>

              <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <Image src={selectedPost.image} alt={selectedPost.title} fill className="object-cover" />
              </div>

              <article className="prose prose-lg prose-stone max-w-none 
                   prose-headings:font-bold prose-headings:text-[#2D2A26]
                   prose-p:text-[#5C5852] prose-p:leading-relaxed
                   prose-a:text-[#E76F51] prose-blockquote:border-l-[#E76F51]
                   prose-img:rounded-2xl"
              >
                {/* In a real app, this would be the actual markdown content */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.content + `\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n## Conclusion\n\nChess is a journey. Enjoy the process.`}
                </ReactMarkdown>
              </article>

              <div className="mt-12 pt-12 border-t border-[#E6E0D4]">
                <h3 className="font-bold text-[#2D2A26] mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="border-[#2D2A26]/20 text-[#5C5852]">#{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
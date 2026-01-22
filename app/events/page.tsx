"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Trophy,
  BookOpen,
  Star,
  ArrowRight,
  Filter,
  Crown,
  Zap,
  Ticket,
} from "lucide-react";
import { format } from "date-fns";

// Brand Colors & Styles
const THEME = {
  bg: "#FDFBF7", // Cream
  text: "#2D2A26", // Charcoal
  textLight: "#5C5852",
  accent: "#E76F51", // Burnt Orange
  gold: "#FFDA44", // Gold
  white: "#FFFFFF",
  border: "#E6E0D4",
};

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("all");

  const events = [
    {
      id: 1,
      title: "Royal State Open 2026",
      category: "tournament",
      date: "2026-02-20",
      time: "09:00 AM",
      location: "Vizag Convention Centre",
      participants: "300+",
      prize: "₹1,00,000",
      description: "FIDE-rated classical tournament. 7 rounds, 90+30 time control. The ultimate test of endurance and strategy.",
      image: "/blog-1.jpeg",
      status: "open",
      registrationFee: "₹800",
    },
    {
      id: 2,
      title: "GM Strategy Masterclass",
      category: "workshop",
      date: "2026-03-15",
      time: "02:00 PM",
      location: "Royal Rooks Academy, Vizag",
      participants: "60",
      prize: "Certificate + PDF",
      description: "3-hour deep dive into advanced positional play with GM Rajesh Kumar. Live analysis and interactive Q&A.",
      image: "/blog-2.jpg",
      status: "filling-fast",
      registrationFee: "₹1,200",
    },
    {
      id: 3,
      title: "Junior Rapid Championship",
      category: "tournament",
      date: "2026-01-25",
      time: "10:00 AM",
      location: "Online (Lichess Team)",
      participants: "200+",
      prize: "₹25,000",
      description: "Fast-paced 15+10 rapid action for players under 14. Titled prizes and scholarships available.",
      image: "/blog-3.webp",
      status: "open",
      registrationFee: "₹400",
    },
    {
      id: 4,
      title: "Chess Psychology Seminar",
      category: "seminar",
      date: "2025-12-06",
      time: "11:00 AM",
      location: "Academy Conference Hall",
      participants: "40",
      prize: "Mindset Workbook",
      description: "Master the mental game. Learn visualization, stress management, and tournament psychology.",
      image: "/blog-4.png",
      status: "closed",
      registrationFee: "₹900",
    },
    {
      id: 5,
      title: "Simul with IM Aruna",
      category: "exhibition",
      date: "2025-11-22",
      time: "04:00 PM",
      location: "City Chess Arena",
      participants: "30",
      prize: "Signed Board",
      description: "A rare opportunity to play against International Master Tejavath Aruna in a 30-board simultaneous exhibition.",
      image: "/blog-5.jpg",
      status: "closed",
      registrationFee: "₹500",
    },
    {
      id: 6,
      title: "Women's Chess Festival",
      category: "special",
      date: "2026-03-08",
      time: "09:00 AM",
      location: "Royal Rooks Academy",
      participants: "150+",
      prize: "₹50,000 + Trophies",
      description: "Celebrating women in chess with a full-day blitz tournament, GM lectures, and networking.",
      image: "/blog-5.jpg",
      status: "upcoming",
      registrationFee: "₹600",
    },
  ];

  const categories = [
    { id: "all", name: "All Events", icon: CalendarIcon },
    { id: "tournament", name: "Tournaments", icon: Trophy },
    { id: "workshop", name: "Workshops", icon: BookOpen },
    { id: "seminar", name: "Seminars", icon: Zap },
    { id: "exhibition", name: "Simuls", icon: Crown },
    { id: "special", name: "Special", icon: Star },
  ];

  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  return (
    <div className="min-h-screen font-sans selection:bg-[#E76F51] selection:text-white" style={{ backgroundColor: THEME.bg }}>

      {/* 1. HERO: The Grand Arena */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-2 px-6 rounded-full bg-[#E76F51]/10 text-[#E76F51] font-bold text-sm tracking-widest uppercase mb-6 border border-[#E76F51]/20">
              Official Calendar
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-8 leading-tight tracking-tight">
              The Grand <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E76F51] to-[#FFDA44]">Arena</span>
            </h1>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              Step into the spotlight. From local blitz battles to international classical tournaments, find your next challenge here.
            </p>
          </motion.div>
        </div>

        {/* Ambient Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFDA44]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E76F51]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* 2. FILTERS & CONTROLS */}
      <section className="sticky top-20 z-40 bg-[#FDFBF7]/80 backdrop-blur-md border-y border-[#E6E0D4] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                    ? "bg-[#2D2A26] text-white shadow-lg scale-105"
                    : "bg-white border border-[#E6E0D4] text-[#5C5852] hover:border-[#E76F51] hover:text-[#E76F51]"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-[#5C5852]">
            <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#E6E0D4]">
              <Filter className="w-4 h-4" />
              {filteredEvents.length} Events
            </span>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-end mb-8">
              <TabsList className="bg-white border border-[#E6E0D4] p-1 rounded-xl h-auto">
                <TabsTrigger value="grid" className="data-[state=active]:bg-[#2D2A26] data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-all">Grid View</TabsTrigger>
                <TabsTrigger value="calendar" className="data-[state=active]:bg-[#2D2A26] data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-all">Calendar</TabsTrigger>
              </TabsList>
            </div>

            {/* --- GRID VIEW --- */}
            <TabsContent value="grid">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* TICKET CARD DESIGN */}
                    <div className="group relative bg-white rounded-3xl border border-[#E6E0D4] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col sm:flex-row h-full">

                      {/* Left: Visual */}
                      <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-[#FFDA44] text-[#2D2A26] hover:bg-[#FFDA44] border-none font-bold">
                              {event.category}
                            </Badge>
                          </div>
                          {event.status === 'open' && (
                            <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Registration Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Details (Ticket Stub) */}
                      <div className="relative w-full sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between border-l-0 sm:border-l-2 border-dashed border-[#E6E0D4]">
                        {/* Cutout Decorations */}
                        <div className="absolute -top-3 -left-[9px] w-4 h-4 bg-[#FDFBF7] rounded-full sm:block hidden border border-[#E6E0D4]" />
                        <div className="absolute -bottom-3 -left-[9px] w-4 h-4 bg-[#FDFBF7] rounded-full sm:block hidden border border-[#E6E0D4]" />

                        <div>
                          <h3 className="text-2xl font-bold text-[#2D2A26] mb-2 group-hover:text-[#E76F51] transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[#5C5852] font-medium mb-4">
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {format(new Date(event.date), "MMM d")}</span>
                            <span className="w-1 h-1 rounded-full bg-[#E6E0D4]" />
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {event.time}</span>
                          </div>
                          <p className="text-[#5C5852]/80 text-sm leading-relaxed mb-6 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#E6E0D4]">
                          <div>
                            <p className="text-xs text-[#5C5852] uppercase tracking-wider font-bold mb-0.5">Entry Fee</p>
                            <p className="text-xl font-black text-[#E76F51]">{event.registrationFee}</p>
                          </div>
                          <Link href="/contact">
                            <Button className="bg-[#2D2A26] text-white rounded-xl hover:bg-[#E76F51] transition-colors">
                              Register
                              <Ticket className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* --- CALENDAR VIEW --- */}
            <TabsContent value="calendar">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* 1. Calendar Widget */}
                <div className="w-full lg:w-[400px] flex-shrink-0">
                  <div className="bg-white rounded-3xl p-6 border border-[#E6E0D4] shadow-lg sticky top-32">
                    <h3 className="text-xl font-bold text-[#2D2A26] mb-6 flex items-center gap-2">
                      <CalendarIcon className="w-6 h-6 text-[#E76F51]" /> Select Date
                    </h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-xl border border-[#E6E0D4] w-full"
                      classNames={{
                        day_selected: "bg-[#E76F51] text-white hover:bg-[#E76F51] focus:bg-[#E76F51]",
                        day_today: "bg-[#FDFBF7] text-[#2D2A26] font-bold border border-[#E76F51]",
                      }}
                    />
                    <div className="mt-6 pt-6 border-t border-[#E6E0D4]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E76F51]" /> Event Day</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-[#2D2A26]" /> Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Events List for Date */}
                <div className="flex-1">
                  <div className="bg-white rounded-3xl p-8 border border-[#E6E0D4] min-h-[600px]">
                    <h3 className="text-2xl font-bold text-[#2D2A26] mb-8 pb-4 border-b border-[#E6E0D4] flex items-center justify-between">
                      <span>Events on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}</span>
                      {selectedDate && <Badge variant="outline" className="text-sm font-normal py-1"> {filteredEvents.filter(e => e.date === format(selectedDate, "yyyy-MM-dd")).length} Events</Badge>}
                    </h3>

                    <div className="space-y-4">
                      {filteredEvents
                        .filter((e) => selectedDate ? e.date === format(selectedDate, "yyyy-MM-dd") : true)
                        .map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D4] hover:border-[#E76F51] transition-all group"
                          >
                            <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="text-lg font-bold text-[#2D2A26] mb-2">{event.title}</h4>
                              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-[#5C5852]">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#E76F51]" /> {event.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#E76F51]" /> {event.location}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-lg font-bold text-[#E76F51]">{event.registrationFee}</span>
                              <Button size="sm" variant="outline" className="border-[#2D2A26] text-[#2D2A26] hover:bg-[#2D2A26] hover:text-white">
                                Details
                              </Button>
                            </div>
                          </motion.div>
                        ))}

                      {filteredEvents.filter(e => selectedDate ? e.date === format(selectedDate, "yyyy-MM-dd") : true).length === 0 && (
                        <div className="text-center py-20 opacity-60">
                          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-[#E6E0D4]" text-gray-300 />
                          <p className="text-xl font-medium text-[#5C5852]">No events scheduled for this day.</p>
                          <p className="text-sm mt-2">Try selecting another date or check our upcoming tournaments.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
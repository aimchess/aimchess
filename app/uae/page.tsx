"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  User,
  Crown,
  BookOpen,
  Trophy,
  Award,
  Clock,
  Laptop,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  GraduationCap
} from "lucide-react";

interface PricingRow {
  classes: number;
  label: string;
  groupPrice: number;
  buddyPrice: number;
  otoPrice: number;
  otoBadge?: string;
}

const PRICING_TABLE: PricingRow[] = [
  {
    classes: 4,
    label: "4 Classes",
    groupPrice: 60,
    buddyPrice: 95,
    otoPrice: 130,
    otoBadge: "STARTER",
  },
  {
    classes: 8,
    label: "8 Classes",
    groupPrice: 110,
    buddyPrice: 195,
    otoPrice: 240,
    otoBadge: "SILVER",
  },
  {
    classes: 16,
    label: "16 Classes",
    groupPrice: 200,
    buddyPrice: 370,
    otoPrice: 420,
    otoBadge: "GOLD",
  },
  {
    classes: 24,
    label: "24 Classes",
    groupPrice: 285,
    buddyPrice: 565,
    otoPrice: 640,
    otoBadge: "DIAMOND",
  },
];

const COURSE_PATHWAY = [
  {
    title: "Foundation Level",
    codes: "BG1 • BG2 • BG3",
    classes: "24 Classes per Level",
    color: "from-sky-500 to-blue-600",
    badgeBg: "bg-sky-500/10 text-sky-700 border-sky-200",
    desc: "Build a strong chess base – rules, tactics, openings, basic endgames and practical play.",
    icon: "♟️",
  },
  {
    title: "Intermediate Level",
    codes: "IM1 • IM2 • IM3 • IM4 • IM5 • IM6",
    classes: "16 Classes per Level",
    color: "from-indigo-500 to-purple-600",
    badgeBg: "bg-purple-500/10 text-purple-700 border-purple-200",
    desc: "Develop calculation, strategy, opening repertoire, positional play and endgames.",
    icon: "♞",
  },
  {
    title: "Advanced Level",
    codes: "Advanced 1 • 2 • 3",
    classes: "16 Classes per Level",
    color: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/10 text-amber-700 border-amber-200",
    desc: "Deeper strategy, complex tactics, advanced endgames and master game analysis.",
    icon: "♜",
  },
  {
    title: "Expert Level",
    codes: "Expert 1 • 2 • 3 • 4 • 5 • 6",
    classes: "16 Classes per Level",
    color: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-500/10 text-rose-700 border-rose-200",
    desc: "Tournament preparation, advanced openings, practical decision-making and performance training.",
    icon: "👑",
  },
];

const HIGHLIGHTS = [
  { icon: BookOpen, title: "Structured Lessons", desc: "Level-wise comprehensive curriculum" },
  { icon: Target, title: "Homework & Practice", desc: "Regular exercises & homework feedback" },
  { icon: Zap, title: "Level Assessment", desc: "Comprehensive skill evaluation tests" },
  { icon: Trophy, title: "Progress Report", desc: "Regular performance tracking reports" },
  { icon: Award, title: "Level Completion Certificate", desc: "Official AIM Chess certified recognition" },
];

export default function UAEFeesPage() {
  const [selectedFormat, setSelectedFormat] = useState<"GROUP" | "BUDDY" | "ONE_ON_ONE">("GROUP");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white text-xs py-2.5 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🇦🇪</span>
            <span className="font-extrabold uppercase tracking-wide">
              Official UAE Student Pricing & Admissions
            </span>
            <span className="hidden md:inline text-emerald-200">
              • Structured, Level-Based Chess Program from Beginner to Expert
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/919903452493?text=Hi%20AIM%20Chess%20Academy%2C%20I%20am%20from%20UAE%20and%20would%20like%20to%20enroll%20for%20chess%20classes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-3 py-1 rounded-full text-[11px] transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: +91 9903452493</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0 flex items-center justify-center">
              <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                AIM Chess Academy
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                  <span>🇦🇪</span> UAE Official Fees
                </span>
              </h1>
              <p className="text-xs text-slate-500">Achieve • Inspire • Maintain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admission?country=uae"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-sky-600/20"
            >
              <span>Enroll Now (UAE)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 text-white py-12 px-4 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            🇦🇪 Official UAE Chess Coaching Packages & Permanent Fees
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Chess Coaching Fees & Packages
          </h2>
          <p className="text-amber-300 font-bold text-base sm:text-lg mb-2">
            For UAE & International Students
          </p>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            A Structured, Level-Based Chess Program from Beginner to Expert. 100% Online Coaching with Rated Coaches, Flexible Timings & 60-Minute Sessions.
          </p>

          {/* Quick Pillars */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-3xl mx-auto text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <span className="block font-bold">Level-wise</span>
              <span className="text-[11px] text-slate-300">Curriculum</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <span className="block font-bold">Student Portal</span>
              <span className="text-[11px] text-slate-300">24/7 Access</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <span className="block font-bold">Regular</span>
              <span className="text-[11px] text-slate-300">Tournaments</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <span className="block font-bold">Progress</span>
              <span className="text-[11px] text-slate-300">Tracking</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <span className="block font-bold">Level</span>
              <span className="text-[11px] text-slate-300">Certificates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 space-y-12">
        {/* UAE Pricing Table Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Crown className="w-5 h-5" />
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Coaching Packages & Fees (UAE)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Transparent and permanent pricing in UAE Dirhams (AED). No hidden registration fees.
              </p>
            </div>

            {/* Format Quick Filter */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSelectedFormat("GROUP")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFormat === "GROUP"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Group (Max 4)
              </button>
              <button
                onClick={() => setSelectedFormat("BUDDY")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFormat === "BUDDY"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Buddy (2 Students)
              </button>
              <button
                onClick={() => setSelectedFormat("ONE_ON_ONE")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFormat === "ONE_ON_ONE"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1-on-1 (Individual)
              </button>
            </div>
          </div>

          {/* Master Table Display */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-black">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Classes</span>
                    </div>
                  </th>
                  <th className={`py-3 px-4 font-black rounded-t-xl transition-all ${
                    selectedFormat === "GROUP" ? "bg-amber-100/70 text-amber-900 border-x border-t border-amber-300" : "text-amber-800"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Group (Max 4 Students)</span>
                    </div>
                  </th>
                  <th className={`py-3 px-4 font-black rounded-t-xl transition-all ${
                    selectedFormat === "BUDDY" ? "bg-sky-100/70 text-sky-900 border-x border-t border-sky-300" : "text-sky-800"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-sky-600" />
                      <span>Buddy (2 Students)</span>
                    </div>
                  </th>
                  <th className={`py-3 px-4 font-black rounded-t-xl transition-all ${
                    selectedFormat === "ONE_ON_ONE" ? "bg-purple-100/70 text-purple-900 border-x border-t border-purple-300" : "text-purple-800"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>One-to-One (Individual)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {PRICING_TABLE.map((row) => (
                  <tr key={row.classes} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {row.classes}
                        </span>
                        <span>{row.label}</span>
                      </div>
                    </td>
                    <td className={`py-4 px-4 font-black text-base text-amber-900 ${
                      selectedFormat === "GROUP" ? "bg-amber-50/50 border-x border-amber-200 font-extrabold text-lg" : ""
                    }`}>
                      AED {row.groupPrice}
                    </td>
                    <td className={`py-4 px-4 font-black text-base text-sky-900 ${
                      selectedFormat === "BUDDY" ? "bg-sky-50/50 border-x border-sky-200 font-extrabold text-lg" : ""
                    }`}>
                      AED {row.buddyPrice}
                    </td>
                    <td className={`py-4 px-4 font-black text-base text-purple-900 ${
                      selectedFormat === "ONE_ON_ONE" ? "bg-purple-50/50 border-x border-purple-200 font-extrabold text-lg" : ""
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>AED {row.otoPrice}</span>
                        {row.otoBadge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                            {row.otoBadge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admission?country=uae&type=${selectedFormat}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-slate-900 hover:bg-black px-3 py-1.5 rounded-lg transition-all"
                      >
                        <span>Enroll</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Notice Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>All sessions are <strong>60 minutes each</strong> with flexible timings.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Admission / Registration Fee for UAE Students.</span>
            </div>
          </div>
        </section>

        {/* 2-Column: Course Pathway & Program Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Pathway */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Course Pathway</h3>
                  <p className="text-xs text-slate-500">Level-wise structured learning journey</p>
                </div>
              </div>

              <div className="space-y-3.5 mt-6">
                {COURSE_PATHWAY.map((stage, idx) => (
                  <div
                    key={stage.title}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xl shrink-0">
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{stage.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                          {stage.classes}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-sky-700 mt-0.5">{stage.codes}</p>
                      <p className="text-xs text-slate-600 mt-1">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Placement assessment provided for students joining with prior chess knowledge.
              </p>
            </div>
          </section>

          {/* Program Highlights & Features */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Program Highlights</h3>
                  <p className="text-xs text-slate-500">Everything included in your enrollment</p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Perks Box */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-xs space-y-2">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-sky-600" />
                  <span>100% Online Coaching (Zoom / Web Portal)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Students receive interactive chess exercises, live coach puzzles, game analysis, and access to our weekly AIM arena tournaments.
                </p>
              </div>
            </div>

            {/* Direct CTA */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Link
                href="/admission?country=uae"
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 rounded-xl transition-all text-center shadow-lg shadow-sky-600/20"
              >
                Register for Admission (UAE)
              </Link>
              <a
                href="https://wa.me/919903452493?text=Hi%20AIM%20Chess%2C%20I%20would%20like%20to%20book%20a%20free%20demo%20for%20my%20child%20in%20UAE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all text-center shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Book a Free Demo</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} AIM Chess Academy. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/admission?country=uae" className="hover:text-sky-600">UAE Admission</Link>
            <Link href="/payment" className="hover:text-sky-600">India Payments</Link>
            <a href="https://aimchessacademy.com" className="hover:text-sky-600">aimchessacademy.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

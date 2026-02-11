"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { motion } from "framer-motion";

// Brand Colors & Constants
const THEME = {
  bg: "#2D2A26",      // Charcoal
  text: "#FDFBF7",    // Cream
  accent: "#FFDA44",  // Gold
  highlight: "#E76F51" // Burnt Orange
};

export function Footer() {
  const currentTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/share/19WmFAAzhk/", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/royalrooksacademy?utm_source=qr&igsh=MnRiZHk0MHRvMXg1", label: "Instagram" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Coaches", href: "/coaches" },
    // { name: "Achievements", href: "/achievements" },
    { name: "Contact", href: "/contact" },
  ];

  const programs = [
    { name: "Beginner Course", href: "/courses" },
    { name: "Intermediate", href: "/courses" },
    { name: "Advanced Coaching", href: "/courses" },
    { name: "Tournament Prep", href: "/courses" },
  ];

  return (
    <footer className="relative font-sans overflow-hidden" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#E76F51] rounded-full blur-[100px] md:blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
      </div>

      <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* COLUMN 1: BRAND */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-white p-1 transition-transform duration-500 group-hover:rotate-12"
              >
                <img
                  src="/logo.jpg"
                  alt="Royal Rooks Chess Academy Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl leading-none tracking-tight">
                  Royal Rooks<br />
                  <span className="text-[#FFDA44] text-[10px] font-sans tracking-[0.3em] uppercase">Chess Academy</span>
                </h3>
              </div>
            </Link>

            <p className="text-sm leading-relaxed opacity-70 max-w-xs">
              Dedicated to world-class chess education and building champions from our academy to the world stage.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, backgroundColor: THEME.highlight, color: "#fff" }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white/5 text-[#FDFBF7] border border-white/10"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#FFDA44] mb-8 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-8 h-1 bg-[#E76F51] rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold opacity-60 hover:opacity-100 hover:text-[#FFDA44] transition-all flex items-center justify-center md:justify-start gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#E76F51] scale-0 group-hover:scale-100 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: PROGRAMS */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#FFDA44] mb-8 relative inline-block">
              Programs
              <span className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-8 h-1 bg-[#E76F51] rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {programs.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold opacity-60 hover:opacity-100 hover:text-[#FFDA44] transition-all flex items-center justify-center md:justify-start gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#E76F51] scale-0 group-hover:scale-100 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CONTACT */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#FFDA44] mb-8 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-8 h-1 bg-[#E76F51] rounded-full"></span>
            </h4>
            <div className="space-y-4">
              <div className="group flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E76F51]/30 transition-all">
                <Phone className="w-5 h-5 text-[#E76F51] shrink-0" />
                <div className="flex flex-col items-center md:items-start">
                  <p className="font-black text-sm group-hover:text-[#FFDA44] transition-colors">+91 73560 26170</p>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">Available 10 AM - 8 PM</p>
                </div>
              </div>

              <div className="group flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E76F51]/30 transition-all overflow-hidden">
                <Mail className="w-5 h-5 text-[#E76F51] shrink-0" />
                <div className="flex flex-col items-center md:items-start max-w-full">
                  <p className="font-black text-sm group-hover:text-[#FFDA44] transition-colors break-all md:break-words">
                    royalrookschesscoach@gmail.com
                  </p>
                </div>
              </div>

              <div className="group flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E76F51]/30 transition-all">
                <MapPin className="w-5 h-5 text-[#E76F51] shrink-0" />
                <div className="flex flex-col items-center md:items-start">
                  <p className="font-black text-sm group-hover:text-[#FFDA44] transition-colors">Kerala, India</p>
                  <p className="text-[10px] opacity-50 font-bold text-center md:text-left mt-1 leading-relaxed">
                    Thekkumbhagam, Kannankulangara, Thrippunithura, Ernakulam, 682301
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-2">
             <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
              © {new Date().getFullYear()} Royal Rooks Chess Academy. All rights reserved.
             </p>
             <p className="text-[9px] font-black text-[#FFDA44] opacity-60 uppercase tracking-[0.2em]">
              India Time: {currentTime}
             </p>
          </div>
          
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
            <Link href="#" className="hover:text-[#FFDA44] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#FFDA44] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#FFDA44] transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
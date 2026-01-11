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
  Crown,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

// Brand Colors & Constants
const THEME = {
  bg: "#2D2A26",      // Charcoal
  text: "#FDFBF7",    // Cream
  dim: "#5C5852",     // Dimmed text
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
    { icon: Facebook, href: "https://www.facebook.com/chessacademy", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/Royal Look", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/Royal Lookacademy", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com/@Royal Lookacademy", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Coaches", href: "/coaches" },
    { name: "Achievements", href: "/achievements" },
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
      {/* 2. BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#E76F51] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* COLUMN 1: BRAND */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-12"
                style={{ backgroundColor: THEME.text }}
              >
                <img
                  src="/logo.jpg"
                  alt="Royal Look Chess Academy Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl leading-none tracking-tight">Royal Look<br /><span className="text-[#FFDA44] text-sm font-sans tracking-[0.2em] uppercase">Academy</span></h3>
              </div>
            </Link>

            <p className="text-sm leading-relaxed opacity-70 max-w-xs">
              Dedicated to world-class chess education and building champions from Visakhapatnam to the world stage.
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
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#FFDA44] mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#FFDA44] rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:text-[#FFDA44] transition-all group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#E76F51] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: PROGRAMS */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#FFDA44] mb-6 relative inline-block">
              Programs
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#FFDA44] rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {programs.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:text-[#FFDA44] transition-all group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#E76F51] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CONTACT */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#FFDA44] mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#FFDA44] rounded-full"></span>
            </h4>
            <div className="space-y-5">
              <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E76F51]/30 hover:bg-[#E76F51]/5 transition-all">
                <Phone className="w-5 h-5 text-[#E76F51] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm mb-1 group-hover:text-[#FFDA44] transition-colors">+91 73560 26170</p>
                  <p className="text-xs opacity-50">Mon - Sun, 10 AM - 8 PM</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E76F51]/30 hover:bg-[#E76F51]/5 transition-all">
                <Mail className="w-5 h-5 text-[#E76F51] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm mb-1 group-hover:text-[#FFDA44] transition-colors break-all">contact@royallookchess.com</p>
                  <p className="text-xs opacity-50">Response within 24 hrs</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E76F51]/30 hover:bg-[#E76F51]/5 transition-all">
                <MapPin className="w-5 h-5 text-[#E76F51] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm mb-1 group-hover:text-[#FFDA44] transition-colors">Kerala, India</p>
                  <p className="text-xs opacity-50">Prarthana Nagar, Thekkumbhagam, Kannankulangara, Thrippunithura, Ernakulam, Kerala 682301</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40">
          <p className="text-center md:text-left">© {new Date().getFullYear()} Royal Look Chess Academy. All rights reserved. • India Time: {currentTime}</p>
          {/* <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#FFDA44] hover:underline transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-[#FFDA44] hover:underline transition-colors">Privacy Policy</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
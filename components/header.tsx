"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AuthNav } from "./auth-nav";

interface NavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string }[];
}

export function Header() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Gallery", href: "/gallery" },
    { name: "Achievements", href: "/achievements" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed w-full z-50 top-0 transition-all duration-500 border-b border-transparent ${scrolled
          ? "bg-[#FDFBF7]/90 backdrop-blur-xl shadow-sm border-[#E6E0D4] py-3"
          : "bg-transparent py-6"
          }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center">

            {/* Logo + Title */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Royal Look Chess Academy Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#2D2A26] tracking-tight leading-none font-serif group-hover:text-[#E76F51] transition-colors">
                  ROYAL LOOK
                </span>
                <span className="text-[10px] font-bold text-[#E76F51] tracking-[0.2em] uppercase mt-0.5">
                  Chess Academy
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <div className="flex bg-white/50 backdrop-blur-md rounded-full px-2 py-1.5 border border-[#E6E0D4]/50 shadow-sm mr-4">
                {navItems.map((item) => (
                  <div key={item.name} className="relative px-1">
                    <Link
                      href={item.href}
                      className="relative block px-5 py-2 text-sm font-semibold text-[#5C5852] hover:text-[#2D2A26] transition-colors rounded-full hover:bg-white/80"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Desktop Auth Nav */}
              <div className="pl-4 border-l border-[#E6E0D4]">
                <AuthNav />
              </div>
            </nav>

            {/* Mobile Header Controls */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-full text-[#2D2A26] bg-white hover:bg-[#FDFBF7] transition-colors border border-[#E6E0D4] shadow-sm active:scale-95"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Full Screen Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed inset-0 top-[88px] bg-[#FDFBF7] z-40 overflow-y-auto"
            >
              <div className="p-6 space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center justify-between p-5 text-2xl font-bold text-[#2D2A26] border-b border-[#E6E0D4] hover:bg-white transition-all active:scale-[0.98]"
                    >
                      <span className="font-serif italic group-hover:not-italic transition-all">{item.name}</span>
                      <ArrowRight className="w-5 h-5 text-[#E76F51] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-8 p-6 bg-white rounded-3xl border border-[#E6E0D4] shadow-sm text-center">
                  <p className="text-xs font-bold text-[#5C5852] uppercase tracking-widest mb-6">Student Portal</p>
                  <AuthNav isMobile={true} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthNav } from "./auth-nav";

interface NavItem {
  name: string;
  href: string;
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

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
        className={`fixed w-full z-[100] top-0 transition-all duration-500 ${isMobileMenuOpen
          ? "bg-white py-3 shadow-none" // Match mobile menu bg
          : scrolled
            ? "bg-[#FDFBF7]/95 backdrop-blur-xl shadow-md py-3 border-b border-[#E6E0D4]/50"
            : "bg-transparent py-5 md:py-8"
          }`}
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex justify-between items-center">

            {/* --- LOGO & BRAND --- */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group relative z-[110]">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <img
                  src="/logo.jpg"
                  alt="Royal Rook Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-[#2D2A26] tracking-tight leading-none uppercase">
                  Royal Rook
                </span>
                <span className="text-[8px] md:text-[10px] font-black text-[#E76F51] tracking-[0.2em] uppercase mt-0.5">
                  Chess Academy
                </span>
              </div>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            <nav className="hidden lg:flex items-center">
              <div className="flex bg-white/40 backdrop-blur-md rounded-full px-2 py-1.5 border border-[#E6E0D4] shadow-sm mr-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-full ${pathname === item.href
                      ? "bg-[#2D2A26] text-white"
                      : "text-[#5C5852] hover:text-[#E76F51]"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="pl-6 border-l border-[#E6E0D4]">
                <AuthNav />
              </div>
            </nav>

            {/* --- MOBILE TOGGLE --- */}
            <div className="lg:hidden flex items-center gap-3 relative z-[110]">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2.5 rounded-2xl transition-all duration-300 border ${isMobileMenuOpen
                  ? "bg-[#2D2A26] border-[#2D2A26] text-white rotate-90"
                  : "bg-white border-[#E6E0D4] text-[#2D2A26]"
                  } shadow-sm active:scale-90`}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU OVERLAY (WHITE BACKGROUND) --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-0 bg-white z-[100] flex flex-col pt-24 px-6 pb-10 shadow-2xl"
            >
              {/* Background Decoration */}
              <div className="absolute top-1/4 -right-20 w-64 h-64 bg-[#E76F51]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center justify-between py-5 border-b border-[#E6E0D4]/40"
                    >
                      <span className={`text-2xl font-black uppercase tracking-tighter transition-colors ${pathname === item.href ? "text-[#E76F51]" : "text-[#2D2A26]"
                        }`}>
                        {item.name}
                      </span>
                      <ArrowRight
                        className={`w-5 h-5 transition-all ${pathname === item.href ? "text-[#E76F51] translate-x-0" : "text-[#2D2A26] opacity-30 -translate-x-4"
                          }`}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Auth/Footer Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 space-y-6 pt-6 border-t border-[#E6E0D4]/40"
              >
                <div className="bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#E6E0D4] shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Sparkles size={40} className="text-[#E76F51]" />
                  </div>
                  <p className="text-[10px] font-black text-[#5C5852] uppercase tracking-[0.2em] mb-4">Student Portal</p>
                  <AuthNav isMobile={true} />
                </div>

                <p className="text-center text-[9px] font-bold text-[#5C5852] opacity-50 uppercase tracking-widest">
                  © {new Date().getFullYear()} Royal Rook Chess Academy
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content jump */}
      <div className="h-20 md:h-24 lg:h-0" />
    </>
  );
}
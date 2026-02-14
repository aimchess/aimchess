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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    { name: "Curriculum", href: "/courses" },
    { name: "Gallery", href: "/gallery" },
    { name: "Achievements", href: "/achievements" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed w-full z-[100] top-0 transition-all duration-300 ${
          isMobileMenuOpen
            ? "bg-white py-3"
            : scrolled
            ? "bg-[#FDFBF7]/90 backdrop-blur-xl shadow-sm py-3 border-b border-[#E6E0D4]/50"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center">
            
            {/* --- LOGO & BRAND --- */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group relative z-[110] shrink-0">
              <div className="relative w-9 h-9 md:w-11 md:h-11">
                <img
                  src="/logo.jpg"
                  alt="Royal Rooks Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg lg:text-xl font-black text-[#2D2A26] tracking-tight leading-none uppercase">
                  Royal Rooks
                </span>
                <span className="text-[7px] md:text-[9px] font-black text-[#E76F51] tracking-[0.15em] uppercase mt-0.5">
                  Chess Academy
                </span>
              </div>
            </Link>

            {/* --- DESKTOP NAVIGATION (Hidden below XL to prevent crowding) --- */}
            <nav className="hidden xl:flex items-center">
              <div className="flex bg-white/50 backdrop-blur-md rounded-full px-1.5 py-1 border border-[#E6E0D4] shadow-sm mr-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all rounded-full ${
                      pathname === item.href
                        ? "bg-[#2D2A26] text-white"
                        : "text-[#5C5852] hover:text-[#E76F51]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="pl-4 border-l border-[#E6E0D4]">
                <AuthNav />
              </div>
            </nav>

            {/* --- TABLET/MOBILE TOGGLE --- */}
            <div className="xl:hidden flex items-center gap-3 relative z-[110]">
              {/* Show AuthNav icon only on tablet, or hide completely for mobile menu */}
              <div className="hidden sm:block">
                 {!isMobileMenuOpen && <AuthNav />}
              </div>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
                className={`p-2 md:p-2.5 rounded-xl transition-all duration-300 border ${
                  isMobileMenuOpen
                    ? "bg-[#2D2A26] border-[#2D2A26] text-white rotate-90"
                    : "bg-white border-[#E6E0D4] text-[#2D2A26]"
                } shadow-sm active:scale-95`}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE/TABLET MENU OVERLAY --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="xl:hidden fixed inset-0 bg-white z-[100] flex flex-col"
            >
              {/* Inner container for centering/scrolling content */}
              <div className="flex flex-col h-full pt-24 px-6 pb-10 overflow-y-auto">
                <div className="flex-1 space-y-1">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between py-4 border-b border-[#E6E0D4]/40"
                      >
                        <span
                          className={`text-xl md:text-2xl font-black uppercase tracking-tight transition-colors ${
                            pathname === item.href ? "text-[#E76F51]" : "text-[#2D2A26]"
                          }`}
                        >
                          {item.name}
                        </span>
                        <ArrowRight
                          className={`w-5 h-5 transition-all ${
                            pathname === item.href
                              ? "text-[#E76F51] translate-x-0"
                              : "text-[#2D2A26] opacity-30 -translate-x-4"
                          }`}
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 space-y-6"
                >
                  <div className="bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#E6E0D4] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles size={32} className="text-[#E76F51]" />
                    </div>
                    <p className="text-[10px] font-black text-[#5C5852] uppercase tracking-[0.2em] mb-4 text-center">
                      Student Portal
                    </p>
                    <div className="flex justify-center">
                      <AuthNav isMobile={true} />
                    </div>
                  </div>

                  <p className="text-center text-[10px] font-bold text-[#5C5852]/50 uppercase tracking-widest">
                    © {new Date().getFullYear()} Royal Rooks Chess Academy
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 
          DYNAMIC SPACER 
          Ensures content doesn't hide under the fixed header. 
          Matches the height/padding of the header at different breakpoints.
      */}
      <div className="h-[72px] md:h-[88px] xl:h-[100px] pointer-events-none" />
    </>
  );
}
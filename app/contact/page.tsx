"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Globe,
  Coffee,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { FaqSection } from "@/components/faq-section";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const inquiryTypes = [
    "General Information",
    "Course Enrollment",
    "Private Coaching",
    "Tournament Registration",
    "Other",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = "contact@royalRook.com";
    const mailSubject = encodeURIComponent(formData.subject || "Contact Inquiry - Royal Rook");
    const bodyLines = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "Not provided"}`,
      `Inquiry Type: ${formData.inquiryType}`,
      `--------------------------------------`,
      `Message:`,
      formData.message
    ];
    const mailBody = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;
    setIsSubmitted(true);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "", inquiryType: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const dummyImages = ["/image.jpg", "/image1.jpg", "/image13.jpg", "/image3.jpg", "/image4.jpg", "/image5.jpg"];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 overflow-x-hidden">

      {/* 1. HERO: Get In Touch */}
      <section className="relative pt-24 md:pt-40 pb-12 md:pb-24 px-4 text-center overflow-hidden">
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
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E76F51]/5 border border-[#E76F51]/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
              <span className="text-[10px] md:text-xs font-black tracking-widest text-[#2D2A26] uppercase">Correspondence</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-[#2D2A26] mb-6 md:mb-8 leading-[1.1] tracking-tight">
              Grandmaster&apos;s <br /> <span className="italic font-serif text-[#E76F51]">Office</span>
            </h1>
            <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto font-medium leading-relaxed">
              Whether you&apos;re Rooking for tournament details or just want to talk chess strategy, our door is always open.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. MAIN CONTENT: Grid */}
      <section className="pb-16 md:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Left Col: Contact Info */}
          <div className="lg:col-span-5 space-y-8 md:space-y-12 order-2 lg:order-1">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-[#E6E0D4] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#E76F51] to-[#FFDA44]" />
              <h3 className="text-xl md:text-2xl font-black text-[#2D2A26] mb-8 flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#E76F51]" /> HQ Coordinates
              </h3>

              <div className="space-y-6 md:space-y-8">
                {[
                  { icon: MapPin, title: "Our Academy", lines: ["Prarthana Nagar, Thekkumbhagam,", "Thrippunithura, Kerala - 682301"] },
                  { icon: Phone, title: "Direct Line", lines: ["+91 73560 26170", "WhatsApp Support Available"] },
                  { icon: Mail, title: "Digital Mail", lines: ["contact@royalRook.com"] },
                  { icon: Clock, title: "Office Hours", lines: ["Mon-Sun: 10 AM - 8 PM"] },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="p-2.5 md:p-3 bg-[#FDFBF7] border border-[#E6E0D4] rounded-xl text-[#E76F51] group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-black text-[#2D2A26] mb-1 uppercase tracking-tight">{item.title}</h4>
                      {item.lines.map((line, idx) => (
                        <p key={idx} className="text-[#5C5852] text-xs md:text-sm font-bold opacity-80">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote Block - Hidden on mobile for flow */}
            <div className="hidden lg:block relative p-8 rounded-[2rem] bg-[#2D2A26] text-white">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Coffee className="w-24 h-24" />
              </div>
              <p className="font-serif italic text-lg opacity-80 mb-4">
                &quot;The game of chess is not merely an idle amusement; several very valuable qualities of the mind are to be acquired and strengthened by it.&quot;
              </p>
              <div className="h-1 w-12 bg-[#FFDA44]" />
            </div>
          </div>

          {/* Right Col: The Form */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-[#2D2A26]/5 border border-[#E6E0D4] relative">

              <div className="absolute -top-4 -right-2 md:top-10 md:-right-12 bg-[#FFDA44] text-[#2D2A26] text-[10px] font-black uppercase tracking-[0.2em] py-2 px-6 -rotate-6 md:-rotate-12 border-2 border-dashed border-[#2D2A26] z-20 shadow-lg">
                Priority Mail
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-[#2D2A26] mb-8 tracking-tighter uppercase">Send a Message</h3>

              {isSubmitted ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 md:py-20">
                  <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-[#E76F51] mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-[#2D2A26] mb-2 uppercase">Message Sealed!</h3>
                  <p className="text-[#5C5852] font-bold">Opening your mail client...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-[#5C5852]">Your Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="bg-[#FDFBF7] border-[#E6E0D4] rounded-xl h-12 md:h-14 font-bold focus:ring-1 focus:ring-[#E76F51]"
                        placeholder="e.g. Anand"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-[#5C5852]">Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-[#FDFBF7] border-[#E6E0D4] rounded-xl h-12 md:h-14 font-bold focus:ring-1 focus:ring-[#E76F51]"
                        placeholder="name@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-[#5C5852]">Phone (Optional)</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-[#FDFBF7] border-[#E6E0D4] rounded-xl h-12 md:h-14 font-bold focus:ring-1 focus:ring-[#E76F51]"
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-[#5C5852]">Topic</Label>
                      <Select onValueChange={(val) => handleInputChange("inquiryType", val)}>
                        <SelectTrigger className="bg-[#FDFBF7] border-[#E6E0D4] rounded-xl h-12 md:h-14 font-bold">
                          <SelectValue placeholder="Select Inquiry" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {inquiryTypes.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-[#5C5852]">Message</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      className="bg-[#FDFBF7] border-[#E6E0D4] rounded-xl min-h-[140px] md:min-h-[160px] font-bold p-4 focus:ring-1 focus:ring-[#E76F51] resize-none"
                      placeholder="How can we help your chess journey?"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 md:h-16 bg-[#2D2A26] hover:bg-[#E76F51] text-white text-base md:text-lg font-black rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-95"
                  >
                    Send Message <Send className="ml-3 w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAP SECTION */}
      <section className="h-[350px] md:h-[500px] w-full relative grayscale hover:grayscale-0 transition-all duration-700">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.8336307137446!2d76.34704737582572!3d9.94784119015523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0873428c0353c7%3A0x889d71c6670498b8!2sThrippunithura%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          className="w-full h-full"
        ></iframe>
        <div className="absolute inset-0 pointer-events-none border-t-4 border-[#FFDA44]" />
      </section>

      {/* 4. SHARED FAQ */}
      <FaqSection />

      {/* 5. CTA SECTION */}
      <section className="relative py-20 md:py-32 bg-white text-[#2D2A26] border-t border-[#E6E0D4] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-6xl font-black mb-8 leading-tight tracking-tighter uppercase">
            Stop Searching.<br />
            <span className="text-[#E76F51]">Start Playing.</span>
          </h2>
          <p className="text-base md:text-xl text-[#5C5852] mb-12 max-w-2xl mx-auto font-medium">
            The board is waiting. Your first lesson is on us.
          </p>
          <div className="flex justify-center">
            <Link href="/courses">
              <Button className="h-14 md:h-16 px-8 md:px-12 rounded-full bg-[#E76F51] text-white text-base md:text-lg font-black hover:bg-[#2D2A26] transition-all shadow-xl active:scale-95">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
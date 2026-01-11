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
  Coffee
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
    const recipient = "contact@Royal Look.com";
    const mailSubject = encodeURIComponent(formData.subject || "Contact Inquiry - Royal Lokk");
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


  const dummyImages = [
    "/image.jpg", "/image1.jpg", "/image13.jpg",
    "/image3.jpg", "/image4.jpg", "/image5.jpg",
    "/image6.jpg", "/image7.jpg", "/image13.jpg",
    "/image9.jpg", "/image10.jpg", "/image11.jpg", "/image12.jpg"
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20">

      {/* 1. HERO: Get In Touch */}
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
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#E76F51] mb-6 block">
              Correspondence
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2D2A26] mb-8 leading-tight">
              Grandmaster's <br /> <span className="italic font-serif text-[#E76F51]">Office</span>
            </h1>
            <p className="text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              Whether you're looking for tournament details or just want to talk chess strategy, our door is always open.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. MAIN CONTENT: Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Left Col: Contact Info (HQ Coordinates) */}
          <div className="lg:col-span-5 space-y-12">

            <div className="bg-white p-8 rounded-[2rem] border border-[#E6E0D4] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E76F51] to-[#FFDA44]" />
              <h3 className="text-2xl font-bold text-[#2D2A26] mb-8 flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#E76F51]" /> HQ Coordinates
              </h3>

              <div className="space-y-8">
                {[
                  { icon: MapPin, title: "Our Academy", lines: [" Prarthana Nagar, Thekkumbhagam, Kannankulangara, Thrippunithura, Ernakulam", "Kerala - 682301"] },
                  { icon: Phone, title: "Direct Line", lines: ["+91 73560 26170", "WhatsApp Support Available"] },
                  { icon: Mail, title: "Digital Mail", lines: ["contact@royallook.com", "support@royallook.com"] },
                  { icon: Clock, title: "Office Hours", lines: ["Mon-Sun: 10 AM - 8 PM", "Walk-ins Welcome"] },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="p-3 bg-[#FDFBF7] rounded-xl text-[#2D2A26] group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D2A26] mb-1">{item.title}</h4>
                      {item.lines.map((line, idx) => (
                        <p key={idx} className="text-[#5C5852] text-sm font-medium">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Element */}
            <div className="hidden lg:block relative h-64 rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-[#2D2A26] opacity-[0.03] pattern-grid-lg" />
              <div className="absolute inset-0 flex items-center justify-center text-[#2D2A26]/10">
                <Coffee className="w-32 h-32" />
              </div>
              <div className="absolute bottom-8 left-8 right-8 text-center pt-8 border-t border-[#2D2A26]/10">
                <p className="font-serif italic text-lg text-[#2D2A26]/60">
                  "The game of chess is not merely an idle amusement."
                </p>
              </div>
            </div>

          </div>

          {/* Right Col: The Form (Sealed Letter) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-[#2D2A26]/5 border border-[#E6E0D4] relative">

              {/* Stamp/Seal Decoration */}
              <div className="absolute -top-6 -right-6 md:top-8 md:-right-12 bg-[#FFDA44] text-[#2D2A26] text-xs font-bold uppercase tracking-widest py-2 px-8 -rotate-12 border-2 border-dashed border-[#2D2A26] hidden md:block shadow-lg">
                Priority Mail
              </div>

              <h3 className="text-3xl font-extrabold text-[#2D2A26] mb-8">Send a Message</h3>

              {isSubmitted ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <CheckCircle className="w-20 h-20 text-[#E76F51] mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-[#2D2A26] mb-2">Message Sealed!</h3>
                  <p className="text-[#5C5852]">Opening your mail client...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold tracking-widest text-[#5C5852]">Your Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="bg-[#FDFBF7] border-none rounded-xl h-14 text-lg focus:ring-1 focus:ring-[#E76F51]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold tracking-widest text-[#5C5852]">Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-[#FDFBF7] border-none rounded-xl h-14 text-lg focus:ring-1 focus:ring-[#E76F51]"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold tracking-widest text-[#5C5852]">Phone (Optional)</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-[#FDFBF7] border-none rounded-xl h-14 text-lg focus:ring-1 focus:ring-[#E76F51]"
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold tracking-widest text-[#5C5852]">Topic</Label>
                      <Select onValueChange={(val) => handleInputChange("inquiryType", val)}>
                        <SelectTrigger className="bg-[#FDFBF7] border-none rounded-xl h-14 text-lg focus:ring-1 focus:ring-[#E76F51]">
                          <SelectValue placeholder="Select Inquiry" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-widest text-[#5C5852]">Message</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      className="bg-[#FDFBF7] border-none rounded-xl min-h-[160px] text-lg p-4 focus:ring-1 focus:ring-[#E76F51] resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 bg-[#2D2A26] hover:bg-[#E76F51] text-white text-lg font-bold rounded-2xl shadow-xl transition-all duration-300"
                  >
                    Send Message <Send className="ml-3 w-5 h-5" />
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAP SECTION */}
      <section className="h-[500px] w-full relative grayscale hover:grayscale-0 transition-all duration-700">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15200.0!2d83.3!3d17.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQyJzAwLjAiTiA4M8KwMTgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          className="w-full h-full"
        ></iframe>
        <div className="absolute inset-0 pointer-events-none border-t-4 border-[#FFDA44]" />
      </section>

      {/* 4. SHARED FAQ SECTION */}
      <FaqSection />

      {/* 5. CTA SECTION */}
      <section className="relative py-32 bg-white text-[#2D2A26] border-t border-[#E6E0D4] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            Stop Searching.<br />
            <span className="text-[#E76F51]">Start Playing.</span>
          </h2>
          <p className="text-xl text-[#5C5852] mb-12 max-w-2xl mx-auto">
            The board is waiting. Your first lesson is on us.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/courses">
              <Button className="h-16 px-10 rounded-full bg-[#E76F51] text-white text-lg font-bold hover:bg-[#2D2A26] transition-all duration-300 shadow-xl hover:shadow-[#E76F51]/30">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
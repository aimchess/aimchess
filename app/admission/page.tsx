"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  User,
  Users,
  UserCheck,
  BookOpen,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Clock,
  HelpCircle,
  ChevronRight,
  Crown,
  Video,
  Laptop,
  PlaySquare,
  BookMarked,
  FileCheck2,
  TrendingUp,
  Trophy,
  Globe2,
  Brain,
  MessageCircle,
} from "lucide-react";

interface PackageItem {
  id: string;
  name: string;
  type: "GROUP" | "ONE_ON_ONE" | "BUDDY";
  stage: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  totalClasses: number;
  priceINR: number;
  admissionFeeINR?: number;
  priceUSD: number;
  admissionFeeUSD?: number;
  priceAED?: number;
  admissionFeeAED?: number;
  tag?: string;
  tagline?: string;
  subtext?: string;
  description: string;
  features: string[];
}

export default function PublicAdmissionPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Packages state
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [sessionType, setSessionType] = useState<"GROUP" | "ONE_ON_ONE" | "BUDDY">("ONE_ON_ONE");

  // Form State
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    birthDate: "",
    address: "",
    country: "UAE",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    stage: "BEGINNER",
    customPassword: "",
    paymentNotes: "",
  });

  // Fetch packages on mount
  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true);
        const res = await fetch("/api/admission/packages");
        const data = await res.json();
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
          const initialPkg = data.packages.find((p: PackageItem) => p.type === "ONE_ON_ONE") || data.packages[0];
          setSelectedPackage(initialPkg);
        }
      } catch (err) {
        console.error("Failed to load packages:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter((p) => p.type === sessionType);

  useEffect(() => {
    if (filteredPackages.length > 0 && (!selectedPackage || selectedPackage.type !== sessionType)) {
      setSelectedPackage(filteredPackages[0]);
    }
  }, [sessionType, packages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.studentName.trim() || !formData.studentEmail.trim() || !formData.studentPhone.trim()) {
      setError("Please fill in Student Name, Email, and Phone Number.");
      return;
    }
    if (!formData.parentName.trim() || !formData.parentPhone.trim()) {
      setError("Please fill in Guardian/Parent Name and Contact Number.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Next = () => {
    if (!selectedPackage) {
      setError("Please select a course package.");
      return;
    }
    setError(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper calculation for tuition fee, admission fee, and total payable based on selected country
  const getPackageCalculatedFee = (pkg: PackageItem | null) => {
    if (!pkg) return { baseFee: 0, admissionFee: 0, totalAmount: 0, currency: "AED" };
    
    if (formData.country === "UAE") {
      const baseFee = pkg.priceAED ?? (pkg.priceUSD ? Math.round(pkg.priceUSD * 3.67) : 99);
      const admissionFee = pkg.admissionFeeAED ?? 0;
      return {
        baseFee,
        admissionFee,
        totalAmount: baseFee + admissionFee,
        currency: "AED",
      };
    }

    if (formData.country === "India") {
      const baseFee = pkg.priceINR;
      const admissionFee = pkg.type === "GROUP" ? (pkg.admissionFeeINR ?? 300) : 0;
      return {
        baseFee,
        admissionFee,
        totalAmount: baseFee + admissionFee,
        currency: "INR",
      };
    }

    // Default: Global USD
    const baseFee = pkg.priceUSD;
    const admissionFee = pkg.type === "GROUP" ? (pkg.admissionFeeUSD ?? 5) : 0;
    return {
      baseFee,
      admissionFee,
      totalAmount: baseFee + admissionFee,
      currency: "USD",
    };
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === "AED") return `AED ${amount.toLocaleString()}`;
    if (currency === "INR") return `₹${amount.toLocaleString("en-IN")}`;
    return `$${amount.toLocaleString()}`;
  };

  const handleSubmitAdmission = async (paymentDetails?: { orderId?: string; paymentId?: string; signature?: string }) => {
    if (!selectedPackage) return;
    setSubmitting(true);
    setError(null);

    const { baseFee, admissionFee, totalAmount, currency } = getPackageCalculatedFee(selectedPackage);

    try {
      const payload = {
        ...formData,
        stage: selectedPackage.stage,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        packageType: selectedPackage.type,
        totalClasses: selectedPackage.totalClasses,
        amount: totalAmount,
        admissionFee,
        currency,
        razorpayOrderId: paymentDetails?.orderId || null,
        razorpayPaymentId: paymentDetails?.paymentId || null,
        razorpaySignature: paymentDetails?.signature || null,
      };

      const res = await fetch("/api/admission/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit admission.");
      }

      router.push(`/admission/status?ref=${encodeURIComponent(data.referenceNo)}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred while submitting your admission.");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerRazorpayPayment = async () => {
    if (!selectedPackage) return;
    const { totalAmount, currency } = getPackageCalculatedFee(selectedPackage);

    // Dynamically load Razorpay SDK if not already loaded
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.body.appendChild(script);
      });
    }

    if (typeof window !== "undefined" && (window as any).Razorpay) {
      try {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TdA1PKIjJ6LEWm",
          amount: Math.round(totalAmount * 100),
          currency,
          name: "AIM Chess Academy",
          description: `Admission Fee - ${selectedPackage.name}`,
          image: "/aim-logo.jpeg",
          handler: function (response: any) {
            handleSubmitAdmission({
              orderId: response.razorpay_order_id || `ORD-${Date.now()}`,
              paymentId: response.razorpay_payment_id || `PAY-${Date.now()}`,
              signature: response.razorpay_signature || "demo_sig",
            });
          },
          prefill: {
            name: formData.studentName,
            email: formData.studentEmail,
            contact: formData.studentPhone,
          },
          theme: { color: "#0284c7" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (e) {
        console.log("Razorpay SDK fallback:", e);
      }
    }
    handleSubmitAdmission({
      orderId: `ORD-${Date.now()}`,
      paymentId: `PAY-${Date.now()}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white antialiased">
      {/* UAE & Global Promo Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-800 text-white text-xs py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🇦🇪</span>
            <span className="font-bold">Official UAE & International Admissions Open:</span>
            <span className="hidden sm:inline text-emerald-100">Special UAE rates in AED with FIDE rated international coaches</span>
          </div>
          <a
            href="https://wa.me/919903452493?text=Hi%20AIM%20Chess%20Academy%2C%20I%20would%20like%20to%20book%20a%20FREE%20Chess%20Assessment"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-2.5 py-1 rounded-full text-[11px] transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Us: +91 9903452493</span>
          </a>
        </div>
      </div>

      {/* Light Clean Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0 flex items-center justify-center">
              <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
                AIM Chess Academy
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                  Online Admission
                </span>
                {formData.country === "UAE" && (
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                    🇦🇪 UAE Edition (AED)
                  </span>
                )}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                Learn Chess • Build a Brighter Future • Developing Minds, Building Champions
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            100% Secure SSL Enrollment
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        {/* Stepper Navigation Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between relative max-w-md sm:max-w-xl mx-auto px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-sky-600 rounded-full transition-all duration-500 z-0"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "calc(100% - 48px)" }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  step >= 1
                    ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-md shadow-sky-600/20"
                    : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                1
              </div>
              <span className={`text-[10px] sm:text-xs font-bold mt-1.5 sm:mt-2 text-center ${step >= 1 ? "text-sky-700" : "text-slate-400"}`}>
                Student Info
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  step >= 2
                    ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-md shadow-sky-600/20"
                    : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                2
              </div>
              <span className={`text-[10px] sm:text-xs font-bold mt-1.5 sm:mt-2 text-center ${step >= 2 ? "text-sky-700" : "text-slate-400"}`}>
                Course Package
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  step >= 3
                    ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-md shadow-sky-600/20"
                    : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                3
              </div>
              <span className={`text-[10px] sm:text-xs font-bold mt-1.5 sm:mt-2 text-center ${step >= 3 ? "text-sky-700" : "text-slate-400"}`}>
                Payment & Submit
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: STUDENT & GUARDIAN DETAILS */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600 shrink-0" />
                Student & Guardian Admission Details
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please enter the student&apos;s details and parent/guardian contact information.
              </p>
            </div>

            <form onSubmit={handleStep1Next} className="space-y-6">
              {/* Student Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-3.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  Student Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      required
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="e.g. Aarav / Omar Al-Mansoor"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="studentEmail"
                      required
                      value={formData.studentEmail}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="studentPhone"
                      required
                      value={formData.studentPhone}
                      onChange={handleChange}
                      placeholder="e.g. +971 50 123 4567 or +91 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Chess Level / Stage</label>
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    >
                      <option value="BEGINNER">Beginner (Knows piece moves or complete novice)</option>
                      <option value="INTERMEDIATE">Intermediate (Knows basic tactics & checkmates)</option>
                      <option value="ADVANCED">Advanced (Rated player / Tournament participant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country & Currency</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                    >
                      <option value="UAE">🇦🇪 United Arab Emirates (AED د.إ)</option>
                      <option value="India">🇮🇳 India (INR ₹)</option>
                      <option value="USA">🇺🇸 United States (USD $)</option>
                      <option value="UK">🇬🇧 United Kingdom & International (USD $)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guardian Section */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-3.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  Parent / Guardian Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Parent / Guardian Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      required
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Sharma / Tariq Al-Mansoor"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Parent Contact Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      required
                      value={formData.parentPhone}
                      onChange={handleChange}
                      placeholder="e.g. +971 50 123 4567"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address / City</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Dubai Marina, UAE / Mumbai, India"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Create Portal Password (Optional)
                    </label>
                    <input
                      type="password"
                      name="customPassword"
                      value={formData.customPassword}
                      onChange={handleChange}
                      placeholder="Choose a password for logging into AIM Portal (or leave blank to auto-generate)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      If left blank, a secure temporary password will be emailed to you upon admission approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  Proceed to Course Package Selection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: COURSE & PACKAGE SELECTION */}
        {step === 2 && (
          <div className="space-y-8">
            {/* UAE Hero Flyer Showcase Banner */}
            {formData.country === "UAE" && (
              <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 rounded-2xl p-6 text-white border border-sky-800/50 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-600/10 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🇦🇪</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950/80 border border-sky-700/50 px-2.5 py-0.5 rounded-full">
                        FOR UAE STUDENTS
                      </span>
                      <span className="text-xs font-bold text-amber-400">★ FIDE Rated Coaches</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Learn Chess • Build a Brighter Future
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      Tailored packages designed specifically for UAE students with personalized 1-on-1, semi-private buddy, and premium small group formats.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                        💡 LEARN
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                        📈 IMPROVE
                      </span>
                      <span className="bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                        🏆 ACHIEVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-600 shrink-0" />
                    Select Course & Coaching Format
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose from 1-to-1 Premium Coaching, Semi-Private Buddy Coaching, or Premium Small Group.
                  </p>
                </div>

                {/* 3-Way Mode Toggle Switch */}
                <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-1 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setSessionType("ONE_ON_ONE")}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      sessionType === "ONE_ON_ONE"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    1-to-1 Premium
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionType("BUDDY")}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      sessionType === "BUDDY"
                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Buddy (Max 2)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionType("GROUP")}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      sessionType === "GROUP"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Small Group (Max 4)
                  </button>
                </div>
              </div>

              {/* Mode Description Banner */}
              <div className="mb-6 p-4 rounded-xl border text-xs flex items-center justify-between flex-wrap gap-2 ${
                sessionType === 'ONE_ON_ONE'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : sessionType === 'BUDDY'
                  ? 'bg-sky-50/70 border-sky-200 text-sky-900'
                  : 'bg-purple-50/70 border-purple-200 text-purple-900'
              }">
                <div className="flex items-center gap-2">
                  {sessionType === "ONE_ON_ONE" && <Crown className="w-4 h-4 text-amber-600 shrink-0" />}
                  {sessionType === "BUDDY" && <Users className="w-4 h-4 text-sky-600 shrink-0" />}
                  {sessionType === "GROUP" && <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />}
                  <span className="font-bold">
                    {sessionType === "ONE_ON_ONE" && "1-to-1 Premium Coaching: Personalised | 60 Minutes • 100% Focus on Your Child • Tailored Plan for Faster Progress"}
                    {sessionType === "BUDDY" && "Buddy Coaching (Max 2 Students): Semi-Private | 60 Minutes • Learn Together Grow Together • Best for Siblings & Friends"}
                    {sessionType === "GROUP" && "Premium Small Group (Max 4 Students): Level-Matched Batch | 60 Minutes • More Interaction More Fun • Affordable & Effective"}
                  </span>
                </div>
              </div>

              {/* Package Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {filteredPackages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const { baseFee, admissionFee, totalAmount, currency } = getPackageCalculatedFee(pkg);
                  const tuitionPrice = formatPrice(baseFee, currency);
                  const totalDisplay = formatPrice(totalAmount, currency);

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer border transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? sessionType === "ONE_ON_ONE"
                            ? "bg-gradient-to-b from-amber-50/80 to-yellow-50/30 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40"
                            : sessionType === "BUDDY"
                            ? "bg-gradient-to-b from-sky-50 to-blue-50/40 border-sky-500 shadow-xl shadow-sky-600/10 ring-2 ring-sky-500/40"
                            : "bg-gradient-to-b from-purple-50 to-indigo-50/40 border-purple-500 shadow-xl shadow-purple-600/10 ring-2 ring-purple-500/40"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute top-4 right-4 p-1.5 rounded-full border ${
                          sessionType === "ONE_ON_ONE"
                            ? "text-amber-700 bg-amber-100 border-amber-200"
                            : sessionType === "BUDDY"
                            ? "text-sky-700 bg-sky-100 border-sky-200"
                            : "text-purple-700 bg-purple-100 border-purple-200"
                        }`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {pkg.tag && (
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              sessionType === "ONE_ON_ONE"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : sessionType === "BUDDY"
                                ? "bg-sky-100 text-sky-800 border-sky-200"
                                : "bg-purple-100 text-purple-800 border-purple-200"
                            }`}>
                              {pkg.tag}
                            </span>
                          )}
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {pkg.stage} Level • {pkg.totalClasses} Classes
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                        <p className="text-xs text-slate-600 mb-4 line-clamp-2">{pkg.description}</p>

                        <div className="my-3 pt-3 border-t border-slate-200 space-y-1">
                          <div className="flex justify-between items-baseline text-xs text-slate-500">
                            <span>Course Tuition Fee:</span>
                            <span className="font-semibold text-slate-800">{tuitionPrice}</span>
                          </div>
                          <div className="flex justify-between items-baseline text-xs text-slate-500">
                            <span>Admission Fee:</span>
                            <span className="font-semibold text-emerald-600">
                              {admissionFee > 0 ? `+${formatPrice(admissionFee, currency)}` : "0 (Exempt)"}
                            </span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-baseline justify-between pt-1 border-t border-slate-200">
                            <span className="text-xs text-slate-500 font-normal">Total Payable:</span>
                            <span className={
                              sessionType === "ONE_ON_ONE"
                                ? "text-amber-700"
                                : sessionType === "BUDDY"
                                ? "text-sky-700"
                                : "text-purple-700"
                            }>{totalDisplay}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 my-4">
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-4 ${
                          isSelected
                            ? sessionType === "ONE_ON_ONE"
                              ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                              : sessionType === "BUDDY"
                              ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                              : "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                        }`}
                      >
                        {isSelected ? "Selected Package" : "Select Package"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Student Info
                </button>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  Proceed to Payment Summary
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* "More Than Just Classes!" Benefits Section from UAE Flyer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200 inline-block mb-2">
                  All-Inclusive Experience
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  More Than Just Classes! 🌟
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Every AIM enrollment includes premium access to our complete chess learning ecosystem:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                    <Video className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Live Zoom Classes</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Interactive 60 Mins</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Student Portal</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">24/7 Practice Access</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                    <PlaySquare className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Class Recordings</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">After Each Session</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Structured Curriculum</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">FIDE Master Aligned</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Homework & Drills</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tactics & Assignments</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Progress Tracking</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rating & Milestones</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center sm:col-span-3 lg:col-span-2">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center mb-2">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Weekly Tournaments</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">& Puzzle Competitions</p>
                </div>
              </div>
            </div>

            {/* "Why Choose AIM Chess Academy?" Section */}
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
              <div className="text-center max-w-xl mx-auto mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Why Choose AIM Chess Academy? 👑
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trusted by hundreds of parents across the UAE, India, USA, and UK.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-center">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Award className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
                  <div className="font-bold text-xs text-slate-200">FIDE Rated</div>
                  <div className="text-[10px] text-slate-400">Experienced Coaches</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <BookOpen className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <div className="font-bold text-xs text-slate-200">Proven System</div>
                  <div className="text-[10px] text-slate-400">Structured Training</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Globe2 className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                  <div className="font-bold text-xs text-slate-200">International</div>
                  <div className="text-[10px] text-slate-400">Global Exposure</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Brain className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
                  <div className="font-bold text-xs text-slate-200">Holistic Mind</div>
                  <div className="text-[10px] text-slate-400">Focus & Strategy</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 col-span-2 md:col-span-1">
                  <Users className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                  <div className="font-bold text-xs text-slate-200">Community</div>
                  <div className="text-[10px] text-slate-400">Global Champions</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & SUBMISSION */}
        {step === 3 && selectedPackage && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600 shrink-0" />
                Admission Summary & Payment
              </h2>
              <p className="text-xs text-slate-500 mt-1">Review your details and complete payment to submit your admission.</p>
            </div>

            {/* Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {/* Applicant Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase text-sky-700 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Applicant Details
                </h3>
                <div className="text-xs sm:text-sm space-y-1.5 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-900 text-right">{formData.studentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{formData.studentEmail}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Country:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {formData.country === "UAE" ? "🇦🇪 UAE" : formData.country === "India" ? "🇮🇳 India" : formData.country}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Parent/Guardian:</span>
                    <span className="font-bold text-slate-900 text-right">{formData.parentName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Parent Phone:</span>
                    <span className="font-medium text-slate-900 text-right">{formData.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Package Card */}
              {(() => {
                const { baseFee, admissionFee, totalAmount, currency } = getPackageCalculatedFee(selectedPackage);
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                    <h3 className="text-xs font-bold uppercase text-sky-700 tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Selected Course Fee Breakdown
                    </h3>
                    <div className="text-xs sm:text-sm space-y-1.5 text-slate-700">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Package Name:</span>
                        <span className="font-bold text-slate-900 text-right">{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Mode:</span>
                        <span className="font-bold text-sky-700 text-right">
                          {selectedPackage.type === "ONE_ON_ONE"
                            ? "1-to-1 Premium Coaching"
                            : selectedPackage.type === "BUDDY"
                            ? "Buddy Coaching (Max 2 Students)"
                            : "Premium Small Group (Max 4 Students)"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Total Classes:</span>
                        <span className="font-bold text-slate-900 text-right">{selectedPackage.totalClasses} Sessions</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Course Tuition Fee:</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {formatPrice(baseFee, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Admission Fee:</span>
                        <span className="font-semibold text-emerald-600 text-right">
                          {admissionFee > 0 ? formatPrice(admissionFee, currency) : "0 (Exempt)"}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 text-sm sm:text-base font-extrabold text-slate-900">
                        <span>Total Payable Now:</span>
                        <span className="text-sky-700">
                          {formatPrice(totalAmount, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Workflow Banner */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-8 text-xs text-sky-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sky-950 block font-bold mb-0.5">Automated Admin Review Flow:</strong>
                After payment, your admission status will be updated to <span className="font-bold text-sky-700">⏳ Profile & Payment Under Review</span>. AIM Admin will verify your payment, assign your FIDE rated coach, generate your official AIM Student ID, and email your portal login credentials to you.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Package Selection
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={triggerRazorpayPayment}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Complete Payment & Submit Admission
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🇦🇪 UAE • 🇮🇳 India • 🌍 Global</span>
            <span>|</span>
            <span>© {new Date().getFullYear()} AIM Chess Academy</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <a
              href="https://wa.me/919903452493?text=Hi%20AIM%20Chess%20Academy%2C%20I%20have%20an%20admission%20query"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Help: 9903452493
            </a>
            <span>•</span>
            <span>Terms of Admission</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  User,
  Users,
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
} from "lucide-react";

interface PackageItem {
  id: string;
  name: string;
  type: "GROUP" | "ONE_ON_ONE";
  stage: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  totalClasses: number;
  priceINR: number;
  admissionFeeINR?: number;
  priceUSD: number;
  admissionFeeUSD?: number;
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
  const [sessionType, setSessionType] = useState<"GROUP" | "ONE_ON_ONE">("GROUP");

  // Form State
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    birthDate: "",
    address: "",
    country: "India",
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
          const initialPkg = data.packages.find((p: PackageItem) => p.type === "GROUP") || data.packages[0];
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

  // Helper calculation for tuition fee, admission fee, and total payable
  const getPackageCalculatedFee = (pkg: PackageItem | null) => {
    if (!pkg) return { baseFee: 0, admissionFee: 0, totalAmount: 0 };
    const isIndia = formData.country === "India";
    const baseFee = isIndia ? pkg.priceINR : pkg.priceUSD;
    const admissionFee = pkg.type === "GROUP"
      ? (isIndia ? (pkg.admissionFeeINR ?? 300) : (pkg.admissionFeeUSD ?? 5))
      : 0;
    return {
      baseFee,
      admissionFee,
      totalAmount: baseFee + admissionFee,
    };
  };

  const handleSubmitAdmission = async (paymentDetails?: { orderId?: string; paymentId?: string; signature?: string }) => {
    if (!selectedPackage) return;
    setSubmitting(true);
    setError(null);

    const { baseFee, admissionFee, totalAmount } = getPackageCalculatedFee(selectedPackage);

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
        currency: formData.country === "India" ? "INR" : "USD",
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
    const { totalAmount } = getPackageCalculatedFee(selectedPackage);

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
          currency: formData.country === "India" ? "INR" : "USD",
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
      {/* Light Clean Top Header - Mobile Responsive */}
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
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">Master Chess with International Masters</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            100% Secure SSL Enrollment
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        {/* Stepper Navigation Header - Responsive */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between relative max-w-md sm:max-w-xl mx-auto px-2">
            {/* Step Line Background */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-sky-600 rounded-full transition-all duration-500 z-0"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "calc(100% - 48px)" }}
            />

            {/* Step 1 Circle */}
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

            {/* Step 2 Circle */}
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

            {/* Step 3 Circle */}
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
                Please enter the student&apos;s legal details and parent/guardian contact information.
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
                      placeholder="e.g. Aarav Sharma"
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
                      placeholder="+91 9876543210"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    >
                      <option value="India">India (INR ₹)</option>
                      <option value="USA">United States (USD $)</option>
                      <option value="UK">United Kingdom (USD $)</option>
                      <option value="UAE">UAE / International (USD $)</option>
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
                      placeholder="e.g. Rajesh Sharma"
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
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House No, Street, City, State, Pincode"
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

              {/* Submit Button - Mobile Full Width */}
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-600 shrink-0" />
                  Select Course & Fee Package
                </h2>
                <p className="text-xs text-slate-500 mt-1">Choose between Interactive Group Sessions or 1-on-1 Personal Master Coaching.</p>
              </div>

              {/* Responsive Toggle Switch */}
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSessionType("GROUP")}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    sessionType === "GROUP"
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Group Sessions
                </button>
                <button
                  type="button"
                  onClick={() => setSessionType("ONE_ON_ONE")}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    sessionType === "ONE_ON_ONE"
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  1-on-1 Coaching
                </button>
              </div>
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const isIndia = formData.country === "India";
                const tuitionPrice = isIndia
                  ? `₹${pkg.priceINR.toLocaleString("en-IN")}`
                  : `$${pkg.priceUSD}`;
                const admissionFeeVal = pkg.type === "GROUP"
                  ? (isIndia ? (pkg.admissionFeeINR ?? 300) : (pkg.admissionFeeUSD ?? 5))
                  : 0;
                const totalCalculated = (isIndia ? pkg.priceINR : pkg.priceUSD) + admissionFeeVal;
                const totalDisplay = isIndia ? `₹${totalCalculated.toLocaleString("en-IN")}` : `$${totalCalculated}`;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer border transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-b from-sky-50 to-blue-50/40 border-sky-500 shadow-xl shadow-sky-600/10 ring-2 ring-sky-500/40"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-sky-600 bg-sky-100 p-1.5 rounded-full border border-sky-200">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <div className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200 mb-3">
                        {pkg.stage} Level • {pkg.totalClasses} Classes
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{pkg.name}</h3>
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2">{pkg.description}</p>

                      <div className="my-3 pt-3 border-t border-slate-200 space-y-1">
                        <div className="flex justify-between items-baseline text-xs text-slate-500">
                          <span>Tuition Fee:</span>
                          <span className="font-semibold text-slate-800">{tuitionPrice}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-xs text-slate-500">
                          <span>Admission Fee:</span>
                          <span className="font-semibold text-emerald-600">
                            {admissionFeeVal > 0 ? (isIndia ? `+₹${admissionFeeVal}` : `+$${admissionFeeVal}`) : "₹0 (Exempt)"}
                          </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-baseline justify-between pt-1 border-t border-slate-200">
                          <span className="text-xs text-slate-500 font-normal">Total First Payment:</span>
                          <span className="text-sky-700">{totalDisplay}</span>
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
                          ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                      }`}
                    >
                      {isSelected ? "Selected Package" : "Select Package"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Responsive Navigation Buttons */}
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
        )}

        {/* STEP 3: PAYMENT & SUBMISSION */}
        {step === 3 && selectedPackage && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600 shrink-0" />
                Admission Summary & Razorpay Payment
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
                const { baseFee, admissionFee, totalAmount } = getPackageCalculatedFee(selectedPackage);
                const isIndia = formData.country === "India";
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
                          {selectedPackage.type === "ONE_ON_ONE" ? "1-on-1 Coaching" : "Group Class"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Total Classes:</span>
                        <span className="font-bold text-slate-900 text-right">{selectedPackage.totalClasses} Sessions</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Course Tuition Fee:</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {isIndia ? `₹${baseFee.toLocaleString("en-IN")}` : `$${baseFee}`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Admission Fee (One-time):</span>
                        <span className="font-semibold text-emerald-600 text-right">
                          {admissionFee > 0 ? (isIndia ? `₹${admissionFee}` : `$${admissionFee}`) : "₹0 (Exempt)"}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 text-sm sm:text-base font-extrabold text-slate-900">
                        <span>Total Payable Now:</span>
                        <span className="text-sky-700">
                          {isIndia ? `₹${totalAmount.toLocaleString("en-IN")}` : `$${totalAmount}`}
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
                After payment, your admission status will be updated to <span className="font-bold text-sky-700">⏳ Profile & Payment Under Review</span>. AIM Admin will verify your payment, assign your coach, generate your official AIM Student ID, and email your portal login credentials to you.
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
                    Pay via Razorpay & Submit Admission
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} AIM Chess Academy. Official Online Admission Portal.</div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Help: support@aimchess.com</span>
            <span>•</span>
            <span>Terms of Admission</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

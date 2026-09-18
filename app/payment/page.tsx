"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Copy, Check, Sparkles, CreditCard, Users, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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

export default function IndiaPaymentHubPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "GROUP" | "ONE_ON_ONE">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadPackages() {
      try {
        setLoading(true);
        const res = await fetch("/api/admission/packages");
        const data = await res.json();
        if (data.packages) {
          setPackages(data.packages);
        }
      } catch (err) {
        console.error("Error loading packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  const filteredPackages = packages.filter((p) => {
    if (activeTab === "GROUP") return p.type === "GROUP";
    if (activeTab === "ONE_ON_ONE") return p.type === "ONE_ON_ONE";
    return true;
  });

  const copyPaymentLink = (pkgId: string, pkgName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const paymentUrl = `${origin}/payment/${pkgId}`;
    navigator.clipboard.writeText(paymentUrl);
    setCopiedId(pkgId);
    setTimeout(() => setCopiedId(null), 2500);
    toast.success(`Payment Link Copied!`, {
      description: `${pkgName}: ${paymentUrl}`,
    });
  };

  const handleRazorpayCheckout = async (pkg: PackageItem) => {
    setProcessingId(pkg.id);

    // Dynamically load Razorpay SDK
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.body.appendChild(script);
      });
    }

    try {
      // 1. Create order on backend
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          currency: "INR",
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const admissionFee = pkg.type === "GROUP" ? (pkg.admissionFeeINR ?? 300) : 0;
      const totalAmount = pkg.priceINR + admissionFee;

      // 2. Configure Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TdA1PKIjJ6LEWm",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "AIM Chess Academy",
        description: `Enrollment: ${pkg.name}`,
        image: "/aim-logo.jpeg",
        order_id: orderData.id,
        handler: async function (response: any) {
          toast.success("Payment Received! Redirecting...", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          setPaymentSuccess(pkg.name);
          setProcessingId(null);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#0284c7" },
        modal: {
          ondismiss: () => setProcessingId(null),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay Error:", err);
      toast.error(err.message || "Failed to launch payment checkout.");
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white antialiased flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0 flex items-center justify-center">
              <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                AIM Chess Academy
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                  <span>🇮🇳</span> Official India Payment Links
                </span>
              </h1>
              <p className="text-xs text-slate-500">Secure Direct Razorpay Payment Links</p>
            </div>
          </div>
          <Link
            href="/admission"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 transition-all"
          >
            <span>Online Admission Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 text-white py-12 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            AIM Chess Academy India Pricing Structure
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            India Fee Structure & Direct Payment Links
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Select a package below to pay directly via UPI, NetBanking, Credit/Debit Cards, or copy the direct payment link to send to parents.
          </p>

          {/* Fee Policy Banner */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 bg-slate-800/80 backdrop-blur-md p-3.5 px-5 rounded-2xl border border-slate-700/80 text-xs text-slate-200 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span>📝 Admission Fee Policy:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold border border-amber-400/30">
                ₹300 One-Time Admission Fee (Group Classes ONLY)
              </span>
              <span className="text-slate-400">•</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-400/30">
                ⚠️ No Admission Fee for One-to-One Classes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {paymentSuccess && (
          <div className="mb-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong>Payment Successful for {paymentSuccess}!</strong>
                <p className="text-xs text-emerald-700 font-normal mt-0.5">
                  Thank you! Our admission desk will send account login details shortly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPaymentSuccess(null)}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ALL"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Packages (8)
          </button>
          <button
            onClick={() => setActiveTab("GROUP")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "GROUP"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Group Classes (₹300 Admission Fee)
          </button>
          <button
            onClick={() => setActiveTab("ONE_ON_ONE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "ONE_ON_ONE"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1-on-1 Classes (No Admission Fee)
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading official India payment packages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredPackages.map((pkg) => {
              const admissionFee = pkg.type === "GROUP" ? (pkg.admissionFeeINR ?? 300) : 0;
              const totalFirstPayment = pkg.priceINR + admissionFee;
              const isProcessing = processingId === pkg.id;
              const isCopied = copiedId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        pkg.type === "GROUP"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {pkg.type === "GROUP" ? "🟡 GROUP CLASS" : "👤 1-ON-1 CLASS"}
                    </span>
                    <span className="text-xs font-extrabold text-slate-500">{pkg.stage} LEVEL</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                    <p className="text-xs text-slate-600 mb-4">{pkg.description}</p>

                    {/* Pricing Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3 space-y-1.5">
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Course Tuition Fee:</span>
                        <span className="font-bold text-slate-900">₹{pkg.priceINR.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>One-Time Admission Fee:</span>
                        <span className="font-bold text-emerald-600">
                          {admissionFee > 0 ? `+₹${admissionFee}` : "₹0 (Exempt)"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-slate-700">Total First Payment:</span>
                        <span className="text-2xl font-black text-sky-700">
                          ₹{totalFirstPayment.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-1.5 my-4">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => handleRazorpayCheckout(pkg)}
                      disabled={isProcessing}
                      className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Opening Razorpay...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay ₹{totalFirstPayment.toLocaleString("en-IN")} Now
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyPaymentLink(pkg.id, pkg.name)}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-all"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied Link!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} AIM Chess Academy. Official India Payment Gateway.</div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secured with Razorpay SSL 256-Bit Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

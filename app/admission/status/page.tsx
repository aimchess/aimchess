"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  Mail,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

function AdmissionStatusContent() {
  const searchParams = useSearchParams();
  const referenceNo = searchParams.get("ref") || "REF-2026-PENDING";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white antialiased">
      {/* Top Header - Mobile Responsive */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0">
              <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">AIM Chess Academy</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">Online Admission Application Portal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
          {/* Status Icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mb-5 sm:mb-6 shadow-xl shadow-amber-500/10">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>

          <div className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 mb-3.5">
            Application Status: Under Review
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2.5">
            Admission Application Received! 🎉
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            Thank you for enrolling with AIM Chess Academy. Your application and payment details have been successfully submitted to our management team for review.
          </p>

          {/* Reference Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 max-w-md mx-auto mb-6 sm:mb-8 text-left space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Application Reference No:</span>
              <span className="text-xs sm:text-sm font-extrabold text-sky-700 tracking-wider font-mono">{referenceNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Verification Status:</span>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                Pending Verification
              </span>
            </div>
          </div>

          {/* Next Steps Box */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 sm:p-6 text-left space-y-3.5 mb-6 sm:mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              What Happens Next?
            </h3>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Payment & Profile Verification</strong>
                  Our admin team manually verifies your submitted payment transaction and student profile.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">AIM Student ID & Account Activation</strong>
                  Upon approval, your unique official <span className="text-sky-700 font-mono font-bold">AIM Student ID</span> is generated and your student portal account is activated.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Official Welcome Email Dispatched</strong>
                  You will receive an official Gmail/Resend welcome email containing your Student ID, login credentials, assigned coach details, and class schedule link.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Full Width Mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/crm/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all"
            >
              Go to Student Login Portal
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admission"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-200"
            >
              Submit Another Application
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdmissionStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">Loading status...</div>}>
      <AdmissionStatusContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Copy,
  Plus,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Phone,
  Calendar,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface Coach {
  id: string;
  name: string;
  email: string;
}

interface AdmissionApp {
  id: string;
  referenceNo: string;
  aimStudentId?: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  birthDate?: string;
  address?: string;
  country: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  stage: string;
  packageId?: string;
  packageName: string;
  packageType: string;
  totalClasses: number;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentNotes?: string;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PENDING_PAYMENT";
  welcomeEmailSent: boolean;
  adminNotes?: string;
  approvedAt?: string;
  createdAt: string;
  coachId?: string;
  coach?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApp[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ALL">("UNDER_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Modal States
  const [selectedApp, setSelectedApp] = useState<AdmissionApp | null>(null);
  const [assignedCoachId, setAssignedCoachId] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  // Package Modal State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [pkgFormData, setPkgFormData] = useState({
    name: "",
    type: "GROUP",
    stage: "BEGINNER",
    totalClasses: "12",
    priceINR: "4999",
    priceUSD: "79",
    description: "",
  });

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/admissions?status=${activeTab}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
        setCoaches(data.coaches || []);
      } else {
        toast.error(data.error || "Failed to fetch admissions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading admissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [activeTab, searchQuery]);

  const copyShareableLink = () => {
    const shareableUrl = `${window.location.origin}/admission`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Shareable Admission Link copied to clipboard!", {
      description: shareableUrl,
    });
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedApp.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: assignedCoachId || null,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve admission");
      }

      toast.success(`🎉 Admission Approved! Student ID: ${data.aimStudentId}`, {
        description: `Student account created and official welcome email sent to ${selectedApp.studentEmail}.`,
      });

      setSelectedApp(null);
      fetchAdmissions();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to approve admission");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedApp.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject application");

      toast.info("Admission application status updated to REJECTED.");
      setSelectedApp(null);
      fetchAdmissions();
    } catch (err: any) {
      toast.error(err.message || "Error rejecting application");
    } finally {
      setProcessing(false);
    }
  };

  const handleResendEmail = async (appId: string) => {
    try {
      const res = await fetch(`/api/admin/admissions/${appId}/resend-email`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend email");
      toast.success("Welcome email resent successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend email");
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admission/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkgFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create package");
      toast.success("Course package created successfully!");
      setShowPackageModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create package");
    }
  };

  // Metrics
  const pendingCount = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const totalRevenue = applications
    .filter((a) => a.status === "APPROVED")
    .reduce((acc, curr) => acc + (curr.currency === "INR" ? curr.amount : curr.amount * 80), 0);

  return (
    <CRMShellLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    Online Admissions
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    Admin Control
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Review registrations, verify payment receipts, assign coaches, and activate student accounts.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyShareableLink}
              className="px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              {copied ? "Link Copied!" : "Copy Admission Link"}
            </button>

            <button
              onClick={() => setShowPackageModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Package & Fee
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Under Review</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{pendingCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Applications waiting approval</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved Students</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{approvedCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Active student accounts</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Coaches Available</span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{coaches.length}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Ready for assignment</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">From verified admissions</p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("UNDER_REVIEW")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "UNDER_REVIEW"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Under Review
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("APPROVED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "APPROVED"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Approved
            </button>
            <button
              onClick={() => setActiveTab("REJECTED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "REJECTED"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              Rejected
            </button>
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, email, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Applicant / Student</th>
                  <th className="py-3.5 px-4">Guardian Contact</th>
                  <th className="py-3.5 px-4">Course Package</th>
                  <th className="py-3.5 px-4">Fee Amount</th>
                  <th className="py-3.5 px-4">Payment Ref</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                        <span className="text-xs">Loading admission records...</span>
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <GraduationCap className="w-10 h-10 text-gray-300" />
                        <span className="font-semibold text-gray-600 text-sm">No applications found</span>
                        <span className="text-xs text-gray-400">
                          {activeTab === "UNDER_REVIEW"
                            ? "There are no pending admission applications awaiting approval."
                            : "Try switching tabs or adjusting your search query."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Applicant Info */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900 text-sm">{app.studentName}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-sky-500" />
                          <span>{app.studentEmail}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{app.studentPhone}</span>
                        </div>
                      </td>

                      {/* Guardian Info */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">{app.parentName}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{app.parentPhone}</div>
                        {app.parentEmail && (
                          <div className="text-[10px] text-gray-400">{app.parentEmail}</div>
                        )}
                      </td>

                      {/* Course Package */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{app.packageName}</div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 mt-1">
                          {app.packageType === "ONE_ON_ONE" ? "1-on-1 Coaching" : "Group Class"} • {app.totalClasses} Classes
                        </span>
                      </td>

                      {/* Fee Amount */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-emerald-600 text-sm">
                          {app.currency === "INR" ? `₹${app.amount.toLocaleString("en-IN")}` : `$${app.amount}`}
                        </div>
                        <span className="text-[10px] text-gray-400">One-time fee</span>
                      </td>

                      {/* Payment Ref */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-[11px] text-gray-700 font-semibold">Ref: {app.referenceNo}</div>
                        {app.razorpayPaymentId ? (
                          <div className="font-mono text-[10px] text-sky-600 font-medium mt-0.5">
                            Pay: {app.razorpayPaymentId}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400">No payment ID</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {app.status === "UNDER_REVIEW" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Under Review
                          </span>
                        )}
                        {app.status === "APPROVED" && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Approved
                            </span>
                            {app.aimStudentId && (
                              <div className="text-[10px] font-mono font-bold text-sky-600 mt-1">
                                ID: {app.aimStudentId}
                              </div>
                            )}
                          </div>
                        )}
                        {app.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === "UNDER_REVIEW" && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setAssignedCoachId(app.coachId || "");
                                setAdminNotes(app.adminNotes || "");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Review & Approve
                            </button>
                          )}

                          {app.status === "APPROVED" && (
                            <button
                              onClick={() => handleResendEmail(app.id)}
                              className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Mail className="w-3.5 h-3.5 text-gray-500" />
                              Resend Mail
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REVIEW & APPROVAL MODAL */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div>
                <div className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-2">
                  Pending Verification Review
                </div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-sky-600" />
                  Approve Student Admission
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Application reference: <span className="text-sky-600 font-mono font-bold">{selectedApp.referenceNo}</span>
                </p>
              </div>

              {/* Applicant Summary */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-bold text-gray-900">{selectedApp.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Student Email:</span>
                  <span className="font-medium text-gray-900">{selectedApp.studentEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Parent / Guardian:</span>
                  <span className="font-semibold text-gray-900">{selectedApp.parentName} ({selectedApp.parentPhone})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Package Selected:</span>
                  <span className="font-semibold text-sky-600">{selectedApp.packageName} ({selectedApp.totalClasses} Classes)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Fee Paid:</span>
                  <span className="font-extrabold text-emerald-600">
                    {selectedApp.currency === "INR" ? `₹${selectedApp.amount.toLocaleString("en-IN")}` : `$${selectedApp.amount}`}
                  </span>
                </div>
                {selectedApp.razorpayPaymentId && (
                  <div className="flex justify-between py-1 border-t border-gray-200/60">
                    <span className="text-gray-500">Razorpay Payment ID:</span>
                    <span className="font-mono text-sky-600 font-medium">{selectedApp.razorpayPaymentId}</span>
                  </div>
                )}
              </div>

              {/* Assign Coach Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Assign Dedicated Coach (Optional)</label>
                <select
                  value={assignedCoachId}
                  onChange={(e) => setAssignedCoachId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                >
                  <option value="">-- No Coach Assigned Yet --</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      Coach: {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Admin Internal Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add verification notes or payment receipt reference..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white h-20 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleReject}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Application
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving & Sending Email...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Activate Student ID
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE PACKAGE MODAL */}
        {showPackageModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowPackageModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-sky-600" />
                  Create Course Package
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Set up course pricing and class counts for online admission.</p>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={pkgFormData.name}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, name: e.target.value })}
                    placeholder="e.g. Master Class 24 Sessions"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Type</label>
                    <select
                      value={pkgFormData.type}
                      onChange={(e) => setPkgFormData({ ...pkgFormData, type: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    >
                      <option value="GROUP">Group Class</option>
                      <option value="ONE_ON_ONE">1-on-1 Coaching</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Stage Level</label>
                    <select
                      value={pkgFormData.stage}
                      onChange={(e) => setPkgFormData({ ...pkgFormData, stage: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Classes</label>
                    <input
                      type="number"
                      required
                      value={pkgFormData.totalClasses}
                      onChange={(e) => setPkgFormData({ ...pkgFormData, totalClasses: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Price INR (₹)</label>
                    <input
                      type="number"
                      required
                      value={pkgFormData.priceINR}
                      onChange={(e) => setPkgFormData({ ...pkgFormData, priceINR: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Price USD ($)</label>
                    <input
                      type="number"
                      required
                      value={pkgFormData.priceUSD}
                      onChange={(e) => setPkgFormData({ ...pkgFormData, priceUSD: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Description</label>
                  <textarea
                    value={pkgFormData.description}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, description: e.target.value })}
                    placeholder="Brief description of what is included in this package..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-sky-500 focus:bg-white h-16"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPackageModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-sm"
                  >
                    Save Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CRMShellLayout>
  );
}

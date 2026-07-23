'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import CRMShellLayout from "@/components/crm/crm-shell"
import { Loader2, Award, Calendar, CheckCircle, Check, RefreshCw, Plus, X, User } from "lucide-react"
import { toast } from "sonner"
import { CertificateTemplate } from "@/components/crm/certificate-template"

const CERTIFICATE_TYPES = [
  { value: "AIM_CLUB", label: "Rating Club Certificate" },
  { value: "STAR_GOLD", label: "Gold Star Player" },
  { value: "STAR_SILVER", label: "Silver Star Player" },
  { value: "STAR_BRONZE", label: "Bronze Star Player" },
  { value: "PARTICIPATION", label: "Participation Certificate" },
  { value: "TOURNAMENT_WINNER", label: "Tournament Winner" },
  { value: "TOURNAMENT_RUNNER_UP", label: "Tournament Runner Up" },
  { value: "BEST_IMPROVEMENT", label: "Best Improvement Award" },
]

const CLUB_NAMES = [
  "Beginner",
  "AIM 600 Club",
  "AIM 800 Club",
  "AIM 1000 Club",
  "AIM 1200 Club",
  "AIM 1400 Club",
  "AIM 1600 Club",
  "AIM 1800 Club",
  "AIM 2000 Club",
]

const getCertificateDetails = (cert: any) => {
  const isClub = cert.type === "AIM_CLUB";
  const clubName = cert.clubName || "AIM 600 Club";
  
  const themes: Record<string, { title: string, level: string, color: string, border: string, bg: string, text: string }> = {
    "AIM 600 Club": { title: "Bronze Rating Club Milestone", level: "Bronze Level", color: "from-amber-700 to-amber-950", border: "border-amber-700", bg: "bg-amber-50/30", text: "text-amber-800" },
    "AIM 800 Club": { title: "Silver Rating Club Milestone", level: "Silver Level", color: "from-slate-400 to-slate-600", border: "border-slate-400", bg: "bg-slate-50/30", text: "text-slate-700" },
    "AIM 1000 Club": { title: "Gold Rating Club Milestone", level: "Gold Level", color: "from-yellow-600 to-amber-600", border: "border-yellow-600", bg: "bg-yellow-50/20", text: "text-yellow-700" },
    "AIM 1200 Club": { title: "Platinum Rating Club Milestone", level: "Platinum Level", color: "from-teal-500 to-emerald-600", border: "border-teal-500", bg: "bg-teal-50/20", text: "text-teal-700" },
    "AIM 1400 Club": { title: "Elite Rating Club Milestone", level: "Elite Level", color: "from-indigo-600 to-purple-700", border: "border-indigo-600", bg: "bg-indigo-50/20", text: "text-indigo-700" },
    "AIM 1600 Club": { title: "Champion Rating Club Milestone", level: "Champion Level", color: "from-red-500 to-rose-700", border: "border-red-500", bg: "bg-rose-50/20", text: "text-rose-700" },
    "AIM 1800 Club": { title: "Master Rating Club Milestone", level: "Master Level", color: "from-purple-700 to-violet-950", border: "border-purple-700", bg: "bg-purple-50/20", text: "text-purple-700" },
    "AIM 2000 Club": { title: "Grandmaster Rating Club Milestone", level: "Grandmaster Level", color: "from-yellow-600 to-stone-900", border: "border-yellow-600", bg: "bg-stone-100/50", text: "text-stone-800" },
  };

  if (isClub) {
    return themes[clubName] || { title: "Rating Club Milestone", level: cert.student?.aimLevel || "Starter Level", color: "from-indigo-500 to-indigo-900", border: "border-indigo-500", bg: "bg-indigo-50/20", text: "text-indigo-700" };
  }

  const nonClubMapping: Record<string, { title: string, level: string, color: string, border: string, bg: string, text: string }> = {
    "STAR_GOLD": { title: "Gold Star Player Award", level: "Gold Star", color: "from-yellow-500 to-amber-500", border: "border-yellow-500", bg: "bg-yellow-50/20", text: "text-yellow-700" },
    "STAR_SILVER": { title: "Silver Star Player Award", level: "Silver Star", color: "from-slate-400 to-slate-600", border: "border-slate-400", bg: "bg-slate-50/30", text: "text-slate-700" },
    "STAR_BRONZE": { title: "Bronze Star Player Award", level: "Bronze Star", color: "from-amber-700 to-amber-900", border: "border-amber-700", bg: "bg-amber-50/30", text: "text-amber-800" },
    "PARTICIPATION": { title: "Certificate of Participation", level: "Participation", color: "from-blue-500 to-indigo-600", border: "border-blue-500", bg: "bg-blue-50/20", text: "text-blue-700" },
    "TOURNAMENT_WINNER": { title: "Tournament Champion Award", level: "First Place", color: "from-yellow-600 to-yellow-800", border: "border-yellow-600", bg: "bg-yellow-50/30", text: "text-yellow-800" },
    "TOURNAMENT_RUNNER_UP": { title: "Tournament Runner-Up Award", level: "Second Place", color: "from-slate-500 to-zinc-700", border: "border-slate-500", bg: "bg-zinc-50/30", text: "text-zinc-700" },
    "BEST_IMPROVEMENT": { title: "Best Improvement Certificate", level: "Most Improved", color: "from-emerald-500 to-teal-700", border: "border-emerald-500", bg: "bg-emerald-50/20", text: "text-emerald-700" },
  };

  return nonClubMapping[cert.type] || { title: "Certificate of Achievement", level: "Special Recognition", color: "from-purple-900 to-indigo-900", border: "border-indigo-900", bg: "bg-indigo-50/20", text: "text-indigo-700" };
};

export default function CertificatesPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedType, setSelectedType] = useState("AIM_CLUB")
  const [selectedClub, setSelectedClub] = useState("AIM 600 Club")
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedCertForPreview, setSelectedCertForPreview] = useState<any | null>(null)

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates")
      if (res.ok) {
        setCertificates(await res.json())
      }
    } catch (e) {
      toast.error("Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setStudents(Array.isArray(data) ? data.filter((u: any) => u.role === "STUDENT") : [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchCertificates()
    if (isAdmin) fetchStudents()
  }, [isAdmin])

  const handleIssueCertificate = async (certificateId: string) => {
    try {
      const res = await fetch("/api/certificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId, status: "ISSUED" })
      })
      if (res.ok) {
        toast.success("Certificate marked as Issued!")
        fetchCertificates()
      } else {
        toast.error("Failed to update status")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  const handleGenerateCertificate = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student")
      return
    }
    setGenerating(true)
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          type: selectedType,
          clubName: selectedType === "AIM_CLUB" ? selectedClub : null,
        })
      })
      if (res.ok) {
        toast.success("Certificate generated successfully!")
        setShowGenerateModal(false)
        setSelectedStudentId("")
        setSelectedType("AIM_CLUB")
        setStudentSearch("")
        fetchCertificates()
      } else {
        toast.error("Failed to generate certificate")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setGenerating(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  )

  if (loading) {
    return (
      <CRMShellLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </CRMShellLayout>
    )
  }

  return (
    <CRMShellLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md">
              <Award size={32} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                {isAdmin ? "Certificate Management" : "My Certificates"}
              </h1>
              <p className="text-indigo-200 text-sm">
                {isAdmin
                  ? "Generate, review, and issue student achievement certificates."
                  : "View your earned certificates."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Generate Certificate
              </button>
            )}
            <button
              onClick={fetchCertificates}
              className="bg-white/10 hover:bg-white/20 border border-white/15 text-white p-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats summary for Admin */}
        {isAdmin && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Certificates", value: certificates.length, color: "text-indigo-600" },
              { label: "Pending", value: certificates.filter(c => c.status === "PENDING").length, color: "text-amber-600" },
              { label: "Issued", value: certificates.filter(c => c.status === "ISSUED").length, color: "text-emerald-600" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center shadow-sm">
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certificates List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            {isAdmin ? "All Student Certificates" : "Your Certificates"}
          </h2>
          {certificates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Certificates Found</h3>
              <p className="text-sm text-gray-400">
                {isAdmin
                  ? "Click 'Generate Certificate' above to create one manually, or certificates auto-generate when students unlock rating clubs."
                  : "Certificates appear once you unlock rating club milestones."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-gray-50/50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        cert.status === "ISSUED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {cert.status}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-1">
                        {cert.type === "AIM_CLUB"
                          ? `${cert.clubName || "Rating Club"} Certificate`
                          : CERTIFICATE_TYPES.find(t => t.value === cert.type)?.label || cert.type.replace(/_/g, " ")}
                      </h3>
                      {isAdmin && cert.student && (
                        <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                          <User size={11} /> {cert.student.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        Created: {new Date(cert.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {cert.issuedAt && (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Issued: {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <Award size={40} className={cert.status === "ISSUED" ? "text-yellow-500 shrink-0" : "text-gray-200 shrink-0"} />
                  </div>

                  <div className="flex gap-2 mt-4">
                    {cert.status === "ISSUED" && (
                      <button
                        onClick={() => setSelectedCertForPreview(cert)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Award size={14} /> View & Download
                      </button>
                    )}
                    {isAdmin && cert.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => setSelectedCertForPreview(cert)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleIssueCertificate(cert.id)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <Check size={14} /> Issue
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate Certificate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={18} className="text-gray-400" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Generate Certificate</h2>
                <p className="text-xs text-gray-400">Create a certificate for a student</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Student Search */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Search & Select Student
                </label>
                <input
                  type="text"
                  placeholder="Type student name or email..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 mb-2"
                />
                <div className="border border-gray-100 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-50">
                  {filteredStudents.length === 0 ? (
                    <p className="p-3 text-xs text-gray-400 text-center">No students found</p>
                  ) : (
                    filteredStudents.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStudentId(s.id); setStudentSearch(s.name) }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors ${
                          selectedStudentId === s.id ? "bg-indigo-50" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-black shrink-0">
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.email}</p>
                        </div>
                        {selectedStudentId === s.id && (
                          <CheckCircle size={16} className="text-indigo-600 ml-auto" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Certificate Type
                </label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                >
                  {CERTIFICATE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Club Name (only for AIM_CLUB type) */}
              {selectedType === "AIM_CLUB" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Rating Club Level
                  </label>
                  <select
                    value={selectedClub}
                    onChange={e => setSelectedClub(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                  >
                    {CLUB_NAMES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleGenerateCertificate}
                disabled={generating || !selectedStudentId}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                {generating ? "Generating..." : "Generate & Send to Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCertForPreview && (() => {
        const cert = selectedCertForPreview;
        const certNo = `ARC-1000-${new Date(cert.createdAt).getFullYear()}-${cert.id.substring(0, 4).toUpperCase()}`;
        const studentName = cert.student?.name || (session?.user as any)?.name || "Student Name";
        const aimRating = cert.student?.aimRating || (session?.user as any)?.aimRating || (cert.type === "AIM_CLUB" ? parseInt(cert.clubName?.replace(/\D/g, '') || "1000") || 1000 : 1000);
        const achievedDate = cert.issuedAt ? new Date(cert.issuedAt) : new Date(cert.createdAt);
        const formattedDate = achievedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
        const clubName = cert.clubName || "AIM 1000 CLUB";
        
        return (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] overflow-y-auto flex flex-col">
            {/* Dynamic CSS for Print */}
            <style dangerouslySetInnerHTML={{__html: `
              @page {
                size: A4 landscape;
                margin: 0mm;
              }
              @media print {
                *, *::before, *::after {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                html, body {
                  width: 100% !important;
                  height: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #faf9f5 !important;
                  overflow: hidden !important;
                }
                body * {
                  visibility: hidden !important;
                }
                .no-print, .no-print * {
                  display: none !important;
                  visibility: hidden !important;
                }
                .printable-cert-container, .printable-cert-container * {
                  visibility: visible !important;
                }
                .printable-cert-container {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: 100vw !important;
                  max-height: 100vh !important;
                  z-index: 9999999 !important;
                  background: #faf9f5 !important;
                  padding: 20px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: 10px solid #071938 !important;
                  box-sizing: border-box !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                }
                .printable-cert-side-tag {
                  display: flex !important;
                }
              }
            `}} />
            
            {/* Sticky Header Controls */}
            <div className="no-print sticky top-0 z-[160] w-full bg-[#071938] border-b border-amber-500/40 p-4 shadow-2xl flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 font-bold">
                  📜
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg tracking-wide text-white">Official Certificate Preview</h3>
                  <p className="text-xs text-amber-300">Formatted exactly as issued by AIM Chess Academy</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-[#071938] font-extrabold px-4 py-2 text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                >
                  🖨️ Download PDF / Print
                </button>
                <button
                  onClick={() => setSelectedCertForPreview(null)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 text-xs font-bold transition-all active:scale-95"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 w-full p-2 sm:p-4 md:p-8 flex items-center justify-center overflow-x-auto">
              <div className="w-full max-w-5xl my-auto">
                <CertificateTemplate
                  data={{
                    id: cert.id,
                    studentName: studentName,
                    aimRating: aimRating,
                    clubName: clubName,
                    type: cert.type,
                    certificateNo: certNo,
                    dateAchieved: formattedDate,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })()}
    </CRMShellLayout>
  )
}

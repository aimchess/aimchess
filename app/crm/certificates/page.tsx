'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import CRMShellLayout from "@/components/crm/crm-shell"
import { Loader2, Award, Calendar, CheckCircle, Check, RefreshCw, Plus, X, User } from "lucide-react"
import { toast } from "sonner"

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
        const details = getCertificateDetails(cert);
        const certNo = `AIM-CERT-${cert.id.substring(0, 8).toUpperCase()}`;
        const studentName = cert.student?.name || "Student Player";
        const aimRating = cert.student?.aimRating || (cert.type === "AIM_CLUB" ? parseInt(cert.clubName.replace(/\D/g, '')) || 600 : 600);
        const achievedDate = cert.issuedAt ? new Date(cert.issuedAt) : new Date(cert.createdAt);
        const formattedDate = achievedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
        
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-4 overflow-y-auto">
            {/* Dynamic CSS for Print */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .printable-cert-container, .printable-cert-container * {
                  visibility: visible !important;
                }
                .printable-cert-container {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  max-width: 100% !important;
                  z-index: 9999999 !important;
                  background: white !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}} />
            
            {/* Controls */}
            <div className="no-print w-full max-w-4xl flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="font-black text-lg">Preview Certificate</h3>
                <p className="text-xs text-amber-300">Format optimized for landscape printing / PDF download</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg"
                >
                  🖨️ Download PDF / Print
                </button>
                <button
                  onClick={() => setSelectedCertForPreview(null)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Certificate Container */}
            <div className="printable-cert-container bg-white text-stone-900 rounded-2xl shadow-2xl p-6 md:p-12 w-full max-w-4xl border-8 border-double border-amber-600 relative overflow-hidden aspect-[1.414/1] flex flex-col justify-between">
              
              {/* Background watermark decorations */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                <Award size={500} />
              </div>
              <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-500/30 m-4 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-500/30 m-4 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-500/30 m-4 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-500/30 m-4 rounded-br-xl"></div>

              {/* Certificate Content */}
              <div className="text-center space-y-4 my-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-widest text-amber-700">👑 AIM CHESS ACADEMY</span>
                  </div>
                  <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-800 tracking-wide uppercase">
                    Certificate of Achievement
                  </h1>
                  <p className="text-xs md:text-sm font-medium text-stone-500 tracking-wider italic">
                    This is proudly presented to
                  </p>
                </div>

                {/* Student Name */}
                <div className="py-2">
                  <h2 className="text-2xl md:text-4xl font-serif font-black text-amber-700 underline decoration-double decoration-amber-500/50 underline-offset-8">
                    {studentName}
                  </h2>
                </div>

                {/* Accomplishment Details */}
                <div className="max-w-2xl mx-auto space-y-2">
                  <p className="text-sm md:text-base text-stone-700 leading-relaxed font-semibold">
                    for successfully achieving the milestone and joining the prestigious
                  </p>
                  <div className={`inline-block px-6 py-2.5 rounded-2xl bg-gradient-to-r ${details.color} text-white font-black tracking-wide text-lg md:text-2xl shadow-md border-2 border-white/20`}>
                    🛡️ {cert.type === "AIM_CLUB" ? cert.clubName : details.title}
                  </div>
                  <p className="text-xs md:text-sm text-stone-500 font-medium">
                    having attained an AIM rating of <span className="font-bold text-amber-700 text-base">{aimRating}</span> at the <span className="font-bold text-stone-700">{details.level}</span>.
                  </p>
                </div>
              </div>

              {/* Footer signatures and seal */}
              <div className="border-t border-stone-200/80 pt-6 mt-6 flex justify-between items-end relative z-10">
                {/* Certificate Details */}
                <div className="text-left text-[10px] md:text-xs text-stone-500 font-bold space-y-0.5">
                  <p><span className="text-stone-400">Date Issued:</span> {formattedDate}</p>
                  <p><span className="text-stone-400">Credential ID:</span> <span className="font-mono text-stone-700">{certNo}</span></p>
                  <p><span className="text-stone-400">Status:</span> <span className="text-emerald-600 font-extrabold uppercase">OFFICIAL</span></p>
                </div>

                {/* Seal */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/80 ring-2 ring-amber-600/30 transform rotate-12">
                  <div className="text-center text-white text-[8px] md:text-[10px] font-black uppercase leading-tight select-none">
                    <p>AIM</p>
                    <p className="text-xs">⚔️</p>
                    <p>SEAL</p>
                  </div>
                </div>

                {/* Signature */}
                <div className="text-center relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-12 flex items-center justify-center select-none pointer-events-none">
                    <span className="font-serif italic text-2xl text-indigo-900 tracking-wider opacity-90 filter drop-shadow-sm font-bold rotate-[-4deg]">
                      Soumen Banerjee
                    </span>
                  </div>
                  <div className="w-36 border-t-2 border-stone-400/80 mt-1"></div>
                  <p className="text-[10px] md:text-xs font-black text-stone-600 mt-1 uppercase tracking-wider">Head Coach Signature</p>
                  <p className="text-[8px] text-stone-400">Aim Chess Academy</p>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </CRMShellLayout>
  )
}

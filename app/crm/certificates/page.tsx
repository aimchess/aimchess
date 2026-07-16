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

                  {isAdmin && cert.status === "PENDING" && (
                    <button
                      onClick={() => handleIssueCertificate(cert.id)}
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Check size={14} /> Mark as Issued
                    </button>
                  )}
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
    </CRMShellLayout>
  )
}

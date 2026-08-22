'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  FileText, Users, Calendar, Award, CheckCircle, Loader2, Save
} from 'lucide-react'
import { toast } from 'sonner'

export default function CoachReportsPage() {
  const { data: session } = useSession()
  const coachId = (session?.user as any)?.id || ''

  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Report Form State
  const [attendancePoints, setAttendancePoints] = useState(0)
  const [homeworkPoints, setHomeworkPoints] = useState(0)
  const [assignmentPoints, setAssignmentPoints] = useState(0)
  const [tournamentPoints, setTournamentPoints] = useState(0)
  const [award, setAward] = useState('Participant')
  
  const [studentProgress, setStudentProgress] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [behavior, setBehavior] = useState('')
  const [nextMonthFocus, setNextMonthFocus] = useState('')
  const [recommendation, setRecommendation] = useState('')

  // Load students for this coach
  useEffect(() => {
    if (!coachId) return
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            const myStudents = data.filter((u: any) => u.role === 'STUDENT' && u.coachId === coachId)
            setStudents(myStudents)
            if (myStudents.length > 0) {
              setSelectedStudentId(myStudents[0].id)
            }
          }
        }
      } catch (e) {
        console.error(e)
        toast.error("Failed to load students")
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [coachId])

  // Fetch or Auto-calculate scores for selected student + month + year
  const loadReport = useCallback(async () => {
    if (!selectedStudentId || !month || !year) return
    setLoading(true)
    try {
      // 1. Try to fetch existing report
      const res = await fetch(`/api/reports?studentId=${selectedStudentId}&month=${month}&year=${year}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const report = data[0]
          setAttendancePoints(report.attendancePoints || 0)
          setHomeworkPoints(report.homeworkPoints || 0)
          setAssignmentPoints(report.assignmentPoints || 0)
          setTournamentPoints(report.tournamentPoints || 0)
          setAward(report.award || 'Participant')
          setStudentProgress(report.studentProgress || '')
          setStrengths(report.strengths || '')
          setWeaknesses(report.weaknesses || '')
          setBehavior(report.behavior || '')
          setNextMonthFocus(report.nextMonthFocus || '')
          setRecommendation(report.recommendation || '')
          setLoading(false)
          return
        }
      }

      // 2. If no report exists, fetch auto-calculated stats
      const statsRes = await fetch(`/api/progress?studentId=${selectedStudentId}`)
      const attRes = await fetch(`/api/attendance?studentId=${selectedStudentId}`)
      
      let computedAtt = 0
      let computedHw = 0
      let computedAssign = 0
      let computedTourn = 0

      if (attRes.ok) {
        const attData = await attRes.json()
        const monthAtt = attData.filter((a: any) => {
          const d = new Date(a.date)
          return d.getMonth() + 1 === month && d.getFullYear() === year
        })
        const presentCount = monthAtt.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length
        computedAtt = Math.min(presentCount * 10, 40)
      }

      setAttendancePoints(computedAtt)
      setHomeworkPoints(0)
      setAssignmentPoints(0)
      setTournamentPoints(0)
      setAward('Participant')
      setStudentProgress('')
      setStrengths('')
      setWeaknesses('')
      setBehavior('')
      setNextMonthFocus('')
      setRecommendation('')

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedStudentId, month, year])

  useEffect(() => {
    loadReport()
  }, [selectedStudentId, month, year, loadReport])

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId) {
      toast.error("Please select a student")
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          month,
          year,
          attendancePoints,
          homeworkPoints,
          assignmentPoints,
          tournamentPoints,
          award,
          studentProgress,
          strengths,
          weaknesses,
          behavior,
          nextMonthFocus,
          recommendation
        })
      })

      if (res.ok) {
        toast.success("Progress Report submitted successfully!")
      } else {
        toast.error("Failed to submit progress report")
      }
    } catch (e) {
      console.error(e)
      toast.error("Network error saving report")
    } finally {
      setSaving(false)
    }
  }

  const totalPoints = attendancePoints + homeworkPoints + assignmentPoints + tournamentPoints

  return (
    <CRMShellLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b pb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0b1d3a] flex items-center gap-3">
              <FileText className="text-sky-500" /> Monthly Progress Report
            </h2>
            <p className="text-slate-400 text-xs font-medium mt-2">Submit monthly performance ratings and learning feedback.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-sky-50/50 p-2.5 border border-sky-200 rounded-xl">
              <Users size={16} className="text-slate-400 shrink-0" />
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-700 outline-none cursor-pointer"
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                {students.length === 0 && <option value="">No Students</option>}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-sky-50/50 p-2.5 border border-sky-200 rounded-xl">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-xs text-slate-700 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
              <span className="text-slate-300">/</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent font-bold text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500 w-10 h-10" /></div>
        ) : !selectedStudentId ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl text-slate-400 font-bold">
            No students currently assigned to you.
          </div>
        ) : (
          <form onSubmit={handleSaveReport} className="space-y-8 animate-in fade-in duration-300">
            
            {/* Scores Section */}
            <div>
              <h3 className="text-sm font-bold text-[#0b1d3a] uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                <Award className="text-yellow-500" size={16} /> Scorecard Ratings (Max 100)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Attendance (Max 40)</label>
                  <input 
                    type="number"
                    min={0}
                    max={40}
                    value={attendancePoints}
                    onChange={(e) => setAttendancePoints(Math.min(40, Number(e.target.value)))}
                    className="w-full p-2 border rounded-lg text-sm bg-white font-bold text-[#0b1d3a]"
                  />
                </div>
                <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Homework (Max 20)</label>
                  <input 
                    type="number"
                    min={0}
                    max={20}
                    value={homeworkPoints}
                    onChange={(e) => setHomeworkPoints(Math.min(20, Number(e.target.value)))}
                    className="w-full p-2 border rounded-lg text-sm bg-white font-bold text-[#0b1d3a]"
                  />
                </div>
                <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Assignment (Max 20)</label>
                  <input 
                    type="number"
                    min={0}
                    max={20}
                    value={assignmentPoints}
                    onChange={(e) => setAssignmentPoints(Math.min(20, Number(e.target.value)))}
                    className="w-full p-2 border rounded-lg text-sm bg-white font-bold text-[#0b1d3a]"
                  />
                </div>
                <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tournament (Max 20)</label>
                  <input 
                    type="number"
                    min={0}
                    max={20}
                    value={tournamentPoints}
                    onChange={(e) => setTournamentPoints(Math.min(20, Number(e.target.value)))}
                    className="w-full p-2 border rounded-lg text-sm bg-white font-bold text-[#0b1d3a]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 p-4 bg-sky-50 rounded-2xl border border-sky-100 justify-between">
                <div className="flex gap-4 items-center">
                  <span className="text-xs font-bold text-[#0b1d3a] uppercase">Total Rating Score:</span>
                  <span className="text-2xl font-black text-[#0b1d3a]">{totalPoints} / 100</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#0b1d3a] uppercase">Calculated Award:</span>
                  <select 
                    value={award} 
                    onChange={(e) => setAward(e.target.value)}
                    className="p-2 border border-sky-200 bg-white font-bold text-xs rounded-xl outline-none"
                  >
                    <option value="Gold Star Player">Gold Star Player (90+)</option>
                    <option value="Silver Star Player">Silver Star Player (80+)</option>
                    <option value="Bronze Star Player">Bronze Star Player (70+)</option>
                    <option value="Participant">Participant (&lt;70)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Written Assessment Feedbacks */}
            <div>
              <h3 className="text-sm font-bold text-[#0b1d3a] uppercase tracking-wider mb-4 border-b pb-2">
                Written Evaluation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student Progress</label>
                  <textarea 
                    value={studentProgress}
                    onChange={(e) => setStudentProgress(e.target.value)}
                    placeholder="Describe progress made during classes..."
                    className="w-full border border-sky-100 rounded-xl p-3 resize-none h-24 text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-sky-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Strengths</label>
                  <textarea 
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="e.g. Tactical awareness, endgame calculation..."
                    className="w-full border border-sky-100 rounded-xl p-3 resize-none h-24 text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-sky-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Weaknesses</label>
                  <textarea 
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    placeholder="e.g. Opening variations, blitz time management..."
                    className="w-full border border-sky-100 rounded-xl p-3 resize-none h-24 text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-sky-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Behaviour & Learning Attitude</label>
                  <textarea 
                    value={behavior}
                    onChange={(e) => setBehavior(e.target.value)}
                    placeholder="Describe student's discipline, curiosity, and attitude..."
                    className="w-full border border-sky-100 rounded-xl p-3 resize-none h-24 text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-sky-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Next Month Focus</label>
                  <textarea 
                    value={nextMonthFocus}
                    onChange={(e) => setNextMonthFocus(e.target.value)}
                    placeholder="What areas will be prioritized next month?"
                    className="w-full border border-sky-100 rounded-xl p-3 resize-none h-24 text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-sky-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Coach Recommendation</label>
                  <textarea 
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Any specific books, puzzle targets, or practice routines?"
                    className="w-full border border-sky-100 rounded-xl p-3 resize-none h-24 text-xs outline-none bg-sky-50/10 focus:bg-white focus:border-sky-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-sky-100 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
                Submit Progress Report
              </button>
            </div>

          </form>
        )}

      </div>
    </CRMShellLayout>
  )
}

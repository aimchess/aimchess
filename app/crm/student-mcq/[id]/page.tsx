'use client'

import { useSession } from "next-auth/react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Chessboard } from "react-chessboard"
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  ArrowLeft, Loader2, SkipForward, CheckCircle, XCircle,
  ChevronRight, HelpCircle, ArrowRight
} from "lucide-react"

export default function StudentMCQPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const mcqId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)
  const folderId = searchParams.get("folderId") || null
  const context = searchParams.get("context") || null

  const [mcq, setMcq] = useState<any>(null)
  const [nextMcqId, setNextMcqId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Solver state
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [solveStatus, setSolveStatus] = useState<"IDLE" | "CORRECT" | "WRONG">("IDLE")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Board
  const [boardWidth, setBoardWidth] = useState(400)
  const boardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setBoardWidth(Math.min(entry.contentRect.width, 500))
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/crm/login"); return }
    if (status !== "authenticated" || !mcqId) return

    setError(null)
    setSelectedIndices([])
    setSolveStatus("IDLE")

    const loadMcq = async () => {
      try {
        const res = await fetch(`/api/mcq/${mcqId}`)
        if (!res.ok) throw new Error("MCQ not found.")
        const data = await res.json()
        setMcq(data)

        if (folderId) {
          const nextRes = await fetch(`/api/content/next?folderId=${folderId}&currentId=${mcqId}&type=MCQ`)
          if (nextRes.ok) {
            const nextData = await nextRes.json()
            setNextMcqId(nextData?.id || null)
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load MCQ")
      }
    }
    loadMcq()
  }, [status, mcqId, folderId, router])

  const toggleOption = (idx: number) => {
    if (solveStatus === "CORRECT") return
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx))
    } else {
      setSelectedIndices([...selectedIndices, idx])
    }
  }

  const handleSubmit = async () => {
    if (selectedIndices.length === 0 || isSubmitting || !mcq) return
    setIsSubmitting(true)
    const isCorrect =
      selectedIndices.length === mcq.correctOptions.length &&
      selectedIndices.every((idx: number) => mcq.correctOptions.includes(idx))

    try {
      const studentId = (session?.user as any)?.id
      if (studentId) {
        await fetch("/api/mcq/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, mcqId: mcq.id, isCorrect }),
        })
      }
      setSolveStatus(isCorrect ? "CORRECT" : "WRONG")
    } catch (error) {
      console.error("Failed to save progress", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (nextMcqId) {
      const params = new URLSearchParams()
      if (folderId) params.set('folderId', folderId)
      if (context) params.set('context', context)
      router.push(`/crm/student-mcq/${nextMcqId}?${params.toString()}`)
    } else {
      router.push(context === 'todo' ? '/crm/student-todo' : '/crm/student-library')
    }
  }

  const handleBack = () => {
    if (context === 'todo') router.push('/crm/student-todo')
    else router.push('/crm/student-library')
  }

  if (error) return (
    <CRMShellLayout>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-600 font-bold text-lg">{error}</p>
        <button onClick={handleBack} className="text-sm text-sky-600 font-bold hover:underline">← Go Back</button>
      </div>
    </CRMShellLayout>
  )

  if (!mcq || status === "loading") return (
    <CRMShellLayout>
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-sky-500" size={24} />
        <span className="text-sky-600 font-bold">Loading MCQ...</span>
      </div>
    </CRMShellLayout>
  )

  return (
    <CRMShellLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0b1d3a] transition-colors">
          <ArrowLeft size={18} /> Back to {context === 'todo' ? 'Assignments' : 'Library'}
        </button>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
            {mcq.stage} MCQ
          </span>
          <button onClick={handleNext} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Skip <SkipForward size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chessboard */}
        <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-sm">
          <div ref={boardContainerRef} className="w-full flex justify-center">
            <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white">
              <Chessboard
                position={mcq.position}
                boardWidth={boardWidth}
                arePiecesDraggable={false}
              />
            </div>
          </div>
        </div>

        {/* Question + Options */}
        <div className="flex flex-col gap-5">
          {/* Question Card */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-sky-100 shadow-sm">
            <div className="flex items-start gap-3 mb-1">
              <HelpCircle className="text-sky-500 mt-0.5 shrink-0" size={22} />
              <div>
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Question</span>
                <p className="text-base md:text-lg font-bold text-[#0b1d3a] leading-relaxed mt-1">{mcq.question}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {(mcq.options as string[]).map((option: string, idx: number) => {
              const isSelected = selectedIndices.includes(idx)
              const isCorrectOption = mcq.correctOptions.includes(idx)
              let variant = "default"
              if (solveStatus === "CORRECT" || solveStatus === "WRONG") {
                if (isCorrectOption) variant = "correct"
                else if (isSelected) variant = "wrong"
              } else if (isSelected) variant = "selected"

              return (
                <button
                  key={idx}
                  onClick={() => toggleOption(idx)}
                  disabled={solveStatus === "CORRECT"}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex items-center gap-3 active:scale-[0.98]
                    ${variant === "correct" ? "bg-emerald-50 border-emerald-400 text-emerald-800" :
                      variant === "wrong" ? "bg-red-50 border-red-400 text-red-800" :
                      variant === "selected" ? "bg-sky-50 border-sky-400 text-sky-800" :
                      "bg-white border-slate-100 hover:border-sky-200 text-slate-700"}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all
                    ${variant === "correct" ? "bg-emerald-500 text-white" :
                      variant === "wrong" ? "bg-red-500 text-white" :
                      variant === "selected" ? "bg-sky-500 text-white" :
                      "bg-slate-100 text-slate-400"}`}>
                    {variant === "correct" ? "✓" : variant === "wrong" ? "✗" : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm font-semibold">{option}</span>
                </button>
              )
            })}
          </div>

          {/* Action Area */}
          <div className="space-y-3 pt-2">
            {solveStatus === "CORRECT" ? (
              <>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 font-bold flex items-center gap-2.5">
                  <CheckCircle size={20} /> Correct! Well done. 🎉
                </div>
                {mcq.explanation && (
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-sky-800 text-sm leading-relaxed">
                    <b>Explanation:</b> {mcq.explanation}
                  </div>
                )}
                {nextMcqId ? (
                  <button onClick={handleNext} className="w-full bg-[#0b1d3a] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-sky-600 flex items-center justify-center gap-2 transition-all active:scale-95">
                    Next MCQ <ArrowRight size={18} />
                  </button>
                ) : (
                  <button onClick={handleBack} className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-sky-600 flex items-center justify-center gap-2 transition-all active:scale-95">
                    Back to {context === 'todo' ? 'Assignments' : 'Library'} <ArrowRight size={18} />
                  </button>
                )}
              </>
            ) : solveStatus === "WRONG" ? (
              <>
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 font-bold flex items-center gap-2.5">
                  <XCircle size={20} /> Not quite. Try again!
                </div>
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-sky-600 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Try Again"}
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={selectedIndices.length === 0 || isSubmitting}
                className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-sky-600 disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Check Answer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </CRMShellLayout>
  )
}

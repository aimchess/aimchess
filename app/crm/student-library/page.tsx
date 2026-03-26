'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Chessboard } from "react-chessboard"
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  BookOpen, ChevronRight, Folder, FileText,
  CheckCircle, Lock, BarChart3, Volume2, Star, HelpCircle,
  ArrowLeft
} from 'lucide-react'

const STAGE_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export default function StudentLibraryPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [studentStage, setStudentStage] = useState<string>('BEGINNER')
  const [libraryStage, setLibraryStage] = useState<string>('BEGINNER')
  const [viewMode, setViewMode] = useState<'COURSES' | 'PRACTICE'>('COURSES')
  const [curriculumPath, setCurriculumPath] = useState<any[]>([])
  const [curriculumItems, setCurriculumItems] = useState<{ folders: any[], puzzles: any[], mcqs: any[] }>({ folders: [], puzzles: [], mcqs: [] })
  const [puzzleProgress, setPuzzleProgress] = useState<Record<string, any>>({})
  const [mcqProgress, setMcqProgress] = useState<Record<string, any>>({})
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Course Viewer State
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1)
  const boardContainerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(400)

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardWidth(entry.contentRect.width)
      }
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [selectedCourse, activeChapterIndex])

  const fetchLibrary = useCallback(async (stage: string, parentId: string | null) => {
    if (!session?.user) return
    try {
      const query = parentId ? `parentId=${parentId}` : `stage=${stage}`
      const [contentRes, puzzleProgressRes, mcqProgressRes] = await Promise.all([
        fetch(`/api/content?${query}`, { cache: 'no-store' }),
        fetch(`/api/progress?studentId=${(session.user as any).id}`, { cache: 'no-store' }),
        fetch(`/api/mcq/progress?studentId=${(session.user as any).id}`, { cache: 'no-store' })
      ])
      if (contentRes.ok) {
        const content = await contentRes.json()
        setCurriculumItems({ folders: content.folders || [], puzzles: content.puzzles || [], mcqs: content.mcqs || [] })
      }
      if (puzzleProgressRes.ok) {
        const progressList = await puzzleProgressRes.json()
        const progressMap: Record<string, any> = {}
        progressList.forEach((p: any) => { progressMap[p.puzzleId] = p })
        setPuzzleProgress(progressMap)
      }
      if (mcqProgressRes.ok) {
        const progressList = await mcqProgressRes.json()
        const progressMap: Record<string, any> = {}
        progressList.forEach((p: any) => { progressMap[p.mcqId] = p })
        setMcqProgress(progressMap)
      }
    } catch (error) { console.error(error) }
  }, [session])

  useEffect(() => {
    if (!session?.user) return
    const init = async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' })
        const user = await res.json()
        if (user.stage) {
          setStudentStage(user.stage)
          setLibraryStage(user.stage)
          fetchLibrary(user.stage, null)
        }
        const coursesRes = await fetch('/api/courses')
        if (coursesRes.ok) setCourses(await coursesRes.json())
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    init()
  }, [session, fetchLibrary])

  const isStageLocked = (targetStage: string) => {
    const currentIndex = STAGE_ORDER.indexOf(studentStage)
    const targetIndex = STAGE_ORDER.indexOf(targetStage)
    return targetIndex > currentIndex
  }

  const changeStage = (stage: string) => {
    if (isStageLocked(stage)) return
    setLibraryStage(stage)
    setCurriculumPath([])
    fetchLibrary(stage, null)
  }

  const handleFolderClick = (folder: any) => {
    setCurriculumPath([...curriculumPath, folder])
    setViewMode('PRACTICE')
    fetchLibrary(libraryStage, folder.id)
  }

  const handleBreadcrumbClick = (index: number) => {
    const newPath = index === -1 ? [] : curriculumPath.slice(0, index + 1)
    setCurriculumPath(newPath)
    const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null
    fetchLibrary(libraryStage, parentId)
  }

  const launchPuzzle = (puzzleId: string, nextPuzzleId?: string) => {
    const params = new URLSearchParams()
    if (nextPuzzleId) params.set('next', nextPuzzleId)
    const currentFolderId = curriculumPath.length > 0 ? curriculumPath[curriculumPath.length - 1].id : null
    if (currentFolderId) params.set('folderId', currentFolderId)
    else params.set('stage', libraryStage)
    router.push(`/puzzle/${puzzleId}?${params.toString()}`)
  }

  const launchMCQ = (mcqId: string, nextMcqId?: string) => {
    const params = new URLSearchParams()
    if (nextMcqId) params.set('next', nextMcqId)
    const currentFolderId = curriculumPath.length > 0 ? curriculumPath[curriculumPath.length - 1].id : null
    if (currentFolderId) params.set('folderId', currentFolderId)
    else params.set('stage', libraryStage)
    router.push(`/crm/student-mcq/${mcqId}?${params.toString()}`)
  }

  const totalPuzzles = curriculumItems.puzzles.length + curriculumItems.mcqs.length
  const solvedCount = curriculumItems.puzzles.filter(p => puzzleProgress[p.id]?.isSolved).length +
    curriculumItems.mcqs.filter(m => mcqProgress[m.id]?.isCorrect).length

  if (loading) return <CRMShellLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div></div></CRMShellLayout>

  return (
    <CRMShellLayout>
      <div className="bg-white rounded-2xl p-4 md:p-8 border border-sky-100 shadow-sm">
        {selectedCourse ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Course Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-sky-50 rounded-xl transition-colors text-slate-400 hover:text-sky-600">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-[#0b1d3a]">{selectedCourse.title}</h2>
                  <p className="text-sm text-slate-500 font-medium">{selectedCourse.chapters?.length || 0} Lessons • {selectedCourse.level} Level</p>
                </div>
              </div>
              {selectedCourse.audioUrl && (
                <button
                  onClick={() => { const audio = new Audio(selectedCourse.audioUrl); audio.play() }}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"
                >
                  <Volume2 size={18} /> <span className="text-sm font-bold">Listen Intro</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar / Chapter List */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  <BarChart3 size={14} /> Lesson Plan
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedCourse.chapters?.map((chap: any, idx: number) => (
                    <div 
                      key={chap.id} 
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-center gap-4 group ${activeChapterIndex === idx ? 'bg-sky-50 border-sky-500' : 'bg-white border-sky-50 hover:border-sky-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${activeChapterIndex === idx ? 'bg-sky-500 text-white' : 'bg-white shadow-sm text-sky-600 border border-sky-100 group-hover:bg-sky-50'}`}>
                        {idx + 1}
                      </div>
                      <div className={`font-bold transition-colors ${activeChapterIndex === idx ? 'text-[#0b1d3a]' : 'text-slate-600 group-hover:text-slate-900'}`}>{chap.title}</div>
                    </div>
                  ))}
                  {(!selectedCourse.chapters || selectedCourse.chapters.length === 0) && (
                    <div className="text-center py-10 text-slate-400 italic text-sm">No lessons found.</div>
                  )}
                </div>
              </div>

              {/* Chapter Viewer */}
              <div className="lg:col-span-8">
                {activeChapterIndex !== -1 && selectedCourse.chapters?.[activeChapterIndex] ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div ref={boardContainerRef} className="bg-[#0b1d3a] p-1.5 rounded-2xl shadow-2xl shadow-sky-900/10 w-full max-w-[550px] mx-auto overflow-hidden">
                      <div className="bg-white rounded-xl overflow-hidden p-1">
                        <Chessboard 
                          position={selectedCourse.chapters[activeChapterIndex].fen} 
                          boardWidth={boardWidth - 12}
                          arePiecesDraggable={false}
                          customBoardStyle={{
                            borderRadius: '4px',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="text-yellow-500 fill-yellow-500" size={18} />
                        <h4 className="text-xl font-black text-[#0b1d3a] tracking-tight">{selectedCourse.chapters[activeChapterIndex].title}</h4>
                      </div>
                      <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                        {selectedCourse.chapters[activeChapterIndex].content || "This lesson summary is not available."}
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                      <button 
                        disabled={activeChapterIndex === 0}
                        onClick={() => setActiveChapterIndex(activeChapterIndex - 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeChapterIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-sky-600 hover:bg-white hover:shadow-sm'}`}
                      >
                        <ChevronRight size={20} className="rotate-180" /> Previous Lesson
                      </button>
                      <button 
                        disabled={activeChapterIndex === (selectedCourse.chapters?.length || 0) - 1}
                        onClick={() => setActiveChapterIndex(activeChapterIndex + 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeChapterIndex === (selectedCourse.chapters?.length || 0) - 1 ? 'text-slate-300 cursor-not-allowed' : 'bg-[#0b1d3a] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'}`}
                      >
                        Next Lesson <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-sky-50 rounded-3xl p-12 bg-sky-50/20">
                    <BookOpen size={80} className="mb-6 opacity-10" />
                    <p className="text-xl font-black text-slate-400">Select a lesson to start learning</p>
                    <p className="text-sm text-slate-400 mt-2 font-medium italic">Your progress will be tracked automatically</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stage Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-sky-100">
              {STAGE_ORDER.map((stage) => {
                const locked = isStageLocked(stage)
                return (
                  <button key={stage} onClick={() => changeStage(stage)} disabled={locked} className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 shrink-0 transition-colors ${libraryStage === stage ? 'bg-[#0b1d3a] text-white border-[#0b1d3a]' : locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white text-slate-500 border-sky-100 hover:bg-sky-50'}`}>
                    {stage} {locked && <Lock size={12} />}
                  </button>
                )
              })}
            </div>

            {/* View Selection Tabs (Only at ROOT) */}
            {curriculumPath.length === 0 && (
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setViewMode('COURSES')}
                  className={`pb-2 px-4 font-bold text-sm transition-all border-b-2 ${viewMode === 'COURSES' ? 'border-[#0b1d3a] text-[#0b1d3a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setViewMode('PRACTICE')}
                  className={`pb-2 px-4 font-bold text-sm transition-all border-b-2 ${viewMode === 'PRACTICE' ? 'border-[#0b1d3a] text-[#0b1d3a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Practice Puzzles
                </button>
              </div>
            )}

            {/* Breadcrumbs + Progress */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto w-full sm:w-auto">
                <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:text-[#0b1d3a] shrink-0">ROOT</span>
                {curriculumPath.map((f, i) => (
                  <span key={f.id} className="flex gap-2 items-center shrink-0">
                    <ChevronRight size={14} className="shrink-0" />
                    <span onClick={() => handleBreadcrumbClick(i)} className="cursor-pointer hover:text-[#0b1d3a] shrink-0">{f.name}</span>
                  </span>
                ))}
              </div>
              {totalPuzzles > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold bg-sky-50 text-sky-700 px-3 py-1 rounded-lg border border-sky-100">
                  <BarChart3 size={14} /> {solvedCount} / {totalPuzzles} Solved
                </div>
              )}
            </div>

            {/* Courses Section */}
            {viewMode === 'COURSES' && curriculumPath.length === 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-[#0b1d3a] mb-6 flex items-center gap-2">
                  <Star className="text-yellow-500" fill="currentColor" /> {libraryStage} Courses
                </h3>
                {courses.filter(c => c.level === libraryStage).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.filter(c => c.level === libraryStage).map(course => (
                      <div key={course.id} className="bg-sky-50/50 border border-sky-100 rounded-2xl p-6 hover:shadow-lg transition-all group flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm"><BookOpen className="text-sky-500" /></div>
                            {course.audioUrl && (
                              <button
                                onClick={() => { const audio = new Audio(course.audioUrl); audio.play() }}
                                className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors shadow-sm"
                              >
                                <Volume2 size={16} />
                              </button>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-[#0b1d3a] mb-1">{course.title}</h4>
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-sky-100">
                          <span className="text-xs font-bold text-slate-400">{course.chapters?.length || 0} Lessons</span>
                          <button 
                            onClick={() => {
                              setSelectedCourse(course);
                              setActiveChapterIndex(course.chapters?.length > 0 ? 0 : -1);
                            }}
                            className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400 flex flex-col items-center border-2 border-dashed border-sky-100 rounded-xl">
                    <BookOpen size={48} className="mb-4 opacity-20" />
                    <p>No courses available for {libraryStage} stage.</p>
                  </div>
                )}
              </div>
            )}

            {/* Practice Section (Folders, Puzzles, MCQs) */}
            {(viewMode === 'PRACTICE' || curriculumPath.length > 0) && (
              <>
                {/* Folders */}
                {curriculumItems.folders.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                    {curriculumItems.folders.map(f => (
                      <div key={f.id} onClick={() => handleFolderClick(f)} className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition">
                        <Folder className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="text-sm font-bold text-slate-700 text-center px-2">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Puzzles & MCQs */}
                {curriculumItems.puzzles.length === 0 && curriculumItems.mcqs.length === 0 && curriculumItems.folders.length === 0 && (
                  <div className="text-center py-20 text-slate-400 flex flex-col items-center border-2 border-dashed border-sky-100 rounded-xl">
                    <Folder size={48} className="mb-4 opacity-20" />
                    <p>This section is empty.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {curriculumItems.puzzles.map((p, index) => {
                    const progress = puzzleProgress[p.id]
                    const isSolved = progress?.isSolved
                    const nextPuzzle = curriculumItems.puzzles[index + 1]
                    const nextId = nextPuzzle ? nextPuzzle.id : undefined
                    return (
                      <div
                        key={p.id}
                        onClick={() => launchPuzzle(p.id, nextId)}
                        className={`group p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${isSolved ? 'bg-green-50 border-green-200' : 'bg-white border-sky-100 hover:border-sky-400 hover:shadow-md'}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {isSolved ? <CheckCircle className="text-green-600 shrink-0" size={20} /> : <FileText className="text-slate-300 group-hover:text-sky-500 shrink-0" size={20} />}
                          <div className="truncate">
                            <span className={`font-bold text-sm block truncate ${isSolved ? 'text-green-800' : 'text-slate-700'}`}>{p.title}</span>
                            {progress && <span className="text-[10px] text-slate-500 font-medium">{progress.attempts} Attempt{progress.attempts !== 1 ? 's' : ''}</span>}
                          </div>
                        </div>
                        {!isSolved && <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-transform group-hover:translate-x-1" />}
                      </div>
                    )
                  })}

                  {curriculumItems.mcqs.map((m, index) => {
                    const progress = mcqProgress[m.id]
                    const isSolved = progress?.isCorrect
                    const nextMCQ = curriculumItems.mcqs[index + 1]
                    const nextId = nextMCQ ? nextMCQ.id : undefined
                    return (
                      <div
                        key={m.id}
                        onClick={() => launchMCQ(m.id, nextId)}
                        className={`group p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${isSolved ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-sky-100 hover:border-emerald-400 hover:shadow-md'}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {isSolved ? <CheckCircle className="text-emerald-600 shrink-0" size={20} /> : <HelpCircle className="text-slate-300 group-hover:text-emerald-500 shrink-0" size={20} />}
                          <div className="truncate">
                            <span className={`font-bold text-sm block truncate ${isSolved ? 'text-emerald-800' : 'text-slate-700'}`}>{m.question}</span>
                            {progress && <span className="text-[10px] text-slate-500 font-medium">{progress.attempts} Attempt{progress.attempts !== 1 ? 's' : ''}</span>}
                          </div>
                        </div>
                        {!isSolved && <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </CRMShellLayout>
  )
}

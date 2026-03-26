'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Clock, BookOpen, ChevronRight, Folder, FileText,
  PlayCircle, CheckCircle, History, RefreshCcw, Lock, BarChart3,
  CreditCard, Wallet, Calendar, Video, Clock as ClockIcon, Volume2, Star,
  HelpCircle
} from 'lucide-react'

const STAGE_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'TODO' | 'HISTORY' | 'LIBRARY' | 'FEES' | 'SCHEDULE'>('TODO')
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Data
  const [assignments, setAssignments] = useState<any[]>([])
  const [studentStage, setStudentStage] = useState<string>('BEGINNER')

  // Library State
  const [libraryStage, setLibraryStage] = useState<string>('BEGINNER')
  const [curriculumPath, setCurriculumPath] = useState<any[]>([])
  const [curriculumItems, setCurriculumItems] = useState<{ folders: any[], puzzles: any[], mcqs: any[] }>({ folders: [], puzzles: [], mcqs: [] })

  // Progress State (Map puzzleId -> Progress Object)
  const [puzzleProgress, setPuzzleProgress] = useState<Record<string, any>>({})
  const [mcqProgress, setMcqProgress] = useState<Record<string, any>>({})
  const [payments, setPayments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  // --- 1. DATA FETCHING ---

  const fetchAssignments = useCallback(async () => {
    if (!session?.user) return
    try {
      setIsRefreshing(true)
      const studentId = (session.user as any).id
      const res = await fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' })
      if (res.ok) setAssignments(await res.json())
    } catch (error) { console.error(error) }
    finally { setIsRefreshing(false); setLoading(false) }
  }, [session])

  const fetchLibrary = useCallback(async (stage: string, parentId: string | null) => {
    try {
      const query = parentId ? `parentId=${parentId}` : `stage=${stage}`
      const [contentRes, puzzleProgressRes, mcqProgressRes] = await Promise.all([
        fetch(`/api/content?${query}`, { cache: 'no-store' }),
        fetch(`/api/progress?studentId=${(session?.user as any).id}`, { cache: 'no-store' }),
        fetch(`/api/mcq/progress?studentId=${(session?.user as any).id}`, { cache: 'no-store' })
      ])

      if (contentRes.ok) {
        const content = await contentRes.json()
        setCurriculumItems({
          folders: content.folders || [],
          puzzles: content.puzzles || [],
          mcqs: content.mcqs || []
        })
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

    } catch (error) { console.error("Error fetching library:", error) }
  }, [session])

  const fetchPayments = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/payments')
      if (res.ok) setPayments(await res.json())
    } catch (error) { console.error(error) }
  }, [session])

  // inside StudentDashboard.tsx

  const fetchSchedule = useCallback(async () => {
    if (!session?.user) return
    try {
      const studentId = (session.user as any).id
      // 1. Pass the studentId to the API
      const res = await fetch(`/api/classes?studentId=${studentId}`)

      if (res.ok) {
        const data = await res.json()
        // 2. The API now returns only the classes for THIS student, 
        // so we don't need to filter it manually here anymore.
        setClasses(data)
      }
    } catch (error) {
      console.error("Fetch Schedule Error:", error)
    }
  }, [session])

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses')
      if (res.ok) setCourses(await res.json())
    } catch (error) { console.error(error) }
  }, [])

  // --- 2. EFFECTS ---

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin')
    if (status === 'authenticated') {
      fetchAssignments()

      fetch('/api/me', { cache: 'no-store' })
        .then(r => r.json())
        .then(user => {
          if (user.stage) {
            setStudentStage(user.stage)
            setLibraryStage(user.stage)
            fetchLibrary(user.stage, null)
          }
        })
      fetchPayments()
      fetchSchedule()
      fetchCourses()
    }
  }, [status, router, fetchAssignments, fetchLibrary, fetchPayments, fetchSchedule, fetchCourses])

  useEffect(() => {
    if (activeTab === 'TODO' || activeTab === 'HISTORY') fetchAssignments()
    if (activeTab === 'FEES') fetchPayments()
    if (activeTab === 'SCHEDULE') fetchSchedule()
    if (activeTab === 'LIBRARY') fetchCourses()
  }, [activeTab, fetchAssignments, fetchPayments, fetchSchedule, fetchCourses])

  // --- 3. HANDLERS ---

  const handleFolderClick = (folder: any) => {
    setCurriculumPath([...curriculumPath, folder])
    fetchLibrary(libraryStage, folder.id)
  }

  const handleBreadcrumbClick = (index: number) => {
    const newPath = index === -1 ? [] : curriculumPath.slice(0, index + 1)
    setCurriculumPath(newPath)
    const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null
    fetchLibrary(libraryStage, parentId)
  }

  const changeStage = (stage: string) => {
    if (isStageLocked(stage)) return;
    setLibraryStage(stage)
    setCurriculumPath([])
    fetchLibrary(stage, null)
  }

  const launchPuzzle = (puzzleId: string, context: 'TODO' | 'LIBRARY', nextPuzzleId?: string, dueDate?: string) => {
    if (dueDate && new Date() > new Date(dueDate)) {
      alert("This assignment's deadline has passed. You can no longer complete it.")
      return
    }

    const params = new URLSearchParams()
    if (nextPuzzleId) params.set('next', nextPuzzleId)

    if (context === 'TODO') {
      params.set('context', 'todo')
    } else {
      const currentFolderId = curriculumPath.length > 0 ? curriculumPath[curriculumPath.length - 1].id : null
      if (currentFolderId) {
        params.set('folderId', currentFolderId)
      } else {
        params.set('stage', libraryStage)
      }
    }

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

  const isStageLocked = (targetStage: string) => {
    const currentIndex = STAGE_ORDER.indexOf(studentStage);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);
    return targetIndex > currentIndex;
  }

  const pending = assignments.filter(a => !a.isCompleted)
  const completed = assignments.filter(a => a.isCompleted)

  const totalPuzzles = curriculumItems.puzzles.length + curriculumItems.mcqs.length
  const solvedCount = curriculumItems.puzzles.filter(p => puzzleProgress[p.id]?.isSolved).length +
    curriculumItems.mcqs.filter(m => mcqProgress[m.id]?.isCorrect).length

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div></div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 pt-24 px-4 md:px-8">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Student Classroom</h1>
            <p className="text-slate-500 mt-2 font-medium">Let's train your brain, {session?.user?.name}!</p>
          </div>
          <button onClick={fetchAssignments} className="text-slate-400 hover:text-orange-500 transition p-2 bg-white rounded-full shadow-sm border">
            <RefreshCcw size={20} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="mt-8 flex gap-2 md:gap-6 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-hide">
          {/* TABS */}
          <button onClick={() => setActiveTab('TODO')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 whitespace-nowrap ${activeTab === 'TODO' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}>
            <Clock size={18} /> To Do {pending.length > 0 && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button onClick={() => setActiveTab('HISTORY')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 whitespace-nowrap ${activeTab === 'HISTORY' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}>
            <History size={18} /> Completed
          </button>
          <button onClick={() => setActiveTab('LIBRARY')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 whitespace-nowrap ${activeTab === 'LIBRARY' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>
            <BookOpen size={18} /> Library
          </button>
          <button onClick={() => setActiveTab('FEES')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 whitespace-nowrap ${activeTab === 'FEES' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500'}`}>
            <CreditCard size={18} /> Fees
          </button>
          <button onClick={() => setActiveTab('SCHEDULE')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 whitespace-nowrap ${activeTab === 'SCHEDULE' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500'}`}>
            <Calendar size={18} /> Schedule
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto min-h-[500px]">

        {/* TODO TAB */}
        {activeTab === 'TODO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {pending.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed text-center">
                <CheckCircle className="w-12 h-12 text-green-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
                <p className="text-slate-500">Check the Library to practice more.</p>
              </div>
            )}
            {pending.map((item, index) => {
              const nextAssignment = pending[index + 1];
              const nextId = nextAssignment ? (nextAssignment.puzzle?.id || nextAssignment.mcq?.id) : undefined;
              const isOverdue = item.dueDate && new Date() > new Date(item.dueDate);
              const isMCQ = !!item.mcqId;

              return (
                <div
                  key={item.id}
                  onClick={() => isMCQ ? launchMCQ(item.mcq.id, nextId) : launchPuzzle(item.puzzle.id, 'TODO', nextId, item.dueDate)}
                  className={`group bg-white rounded-2xl p-6 border shadow-sm transition cursor-pointer relative overflow-hidden ${isOverdue ? 'opacity-75 border-red-200' : isMCQ ? 'hover:shadow-lg hover:border-emerald-300' : 'hover:shadow-lg hover:border-orange-300'}`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${isOverdue ? 'bg-red-500' : isMCQ ? 'bg-emerald-500 group-hover:w-3' : 'bg-orange-500 group-hover:w-3'}`} />
                  <div className="flex justify-between mb-4 pl-3">
                    <div className={`${isOverdue ? 'bg-red-50 text-red-600' : isMCQ ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'} p-3 rounded-full`}>{isMCQ ? <HelpCircle size={24} /> : <PlayCircle size={24} />}</div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-400'}`}>
                        {isOverdue ? 'DEADLINE PASSED' : 'ASSIGNED'}
                      </span>
                      {item.dueDate && (
                        <span className={`text-[10px] flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                          <Clock size={10} /> {new Date(item.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pl-3">
                    <h3 className={`text-xl font-bold ${isOverdue ? 'text-slate-500' : 'text-slate-800'}`}>{isMCQ ? item.mcq.question : item.puzzle.title}</h3>
                    <div className="text-sm text-slate-500 mt-1">By Coach {item.assignedBy}</div>

                    {item.audioUrl && (
                      <div className="mt-4 flex items-center gap-2 bg-orange-50 p-2 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const audio = new Audio(item.audioUrl);
                            audio.play();
                          }}
                          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                        >
                          <Volume2 size={16} />
                        </button>
                        <span className="text-xs font-bold text-orange-700">Voice Instructions</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'HISTORY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
            {completed.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">No completed puzzles yet.</p>}
            {completed.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-5 border opacity-75 hover:opacity-100 transition">
                <div className="flex justify-between items-center mb-3">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-xs font-bold text-slate-400">{new Date(item.assignedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-700 line-through decoration-slate-300">{item.mcqId ? item.mcq.question : item.puzzle.title}</h3>
              </div>
            ))}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'LIBRARY' && (
          <div className="bg-white rounded-3xl p-8 border shadow-sm animate-in fade-in">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b whitespace-nowrap scrollbar-hide">
              {STAGE_ORDER.map((stage) => {
                const locked = isStageLocked(stage);
                return (
                  <button key={stage} onClick={() => changeStage(stage)} disabled={locked} className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 shrink-0 ${libraryStage === stage ? 'bg-slate-800 text-white' : locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-slate-500'} transition-colors`}>
                    {stage} {locked && <Lock size={12} />}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-1 w-full sm:w-auto scrollbar-hide">
                <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:text-black shrink-0">ROOT</span>
                {curriculumPath.map((f, i) => (
                  <span key={f.id} className="flex gap-2 items-center shrink-0"> <ChevronRight size={14} className="shrink-0" /> <span onClick={() => handleBreadcrumbClick(i)} className="cursor-pointer hover:text-black shrink-0">{f.name}</span> </span>
                ))}
              </div>
              {totalPuzzles > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                  <BarChart3 size={14} />
                  {solvedCount} / {totalPuzzles} Solved
                </div>
              )}
            </div>

            {curriculumPath.length === 0 && courses.filter(c => c.level === libraryStage).length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Star className="text-orange-500" fill="currentColor" /> {libraryStage} Courses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.filter(c => c.level === libraryStage).map(course => (
                    <div key={course.id} className="bg-slate-50 border rounded-2xl p-6 hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm"><BookOpen className="text-blue-500" /></div>
                        {course.audioUrl && (
                          <button
                            onClick={(e) => {
                              const audio = new Audio(course.audioUrl);
                              audio.play();
                            }}
                            className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm"
                          >
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-slate-800 mb-1">{course.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t">
                        <span className="text-xs font-bold text-slate-400 capitalize">{course.chapters?.length || 0} Lessons</span>
                        <button className="text-sm font-black text-blue-600 hover:text-blue-700">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {curriculumItems.folders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {curriculumItems.folders.map(f => (
                  <div key={f.id} onClick={() => handleFolderClick(f)} className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition text-indigo-600">
                    <Folder className="w-8 h-8 opacity-80 mb-2" />
                    <span className="text-sm font-bold text-slate-700 text-center px-2">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              {curriculumItems.puzzles.length === 0 && curriculumItems.folders.length === 0 && (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center border-2 border-dashed rounded-xl">
                  <Folder size={48} className="mb-4 opacity-20" />
                  <p>This folder is empty.</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {curriculumItems.puzzles.map((p, index) => {
                  const progress = puzzleProgress[p.id]
                  const isSolved = progress?.isSolved
                  const nextPuzzle = curriculumItems.puzzles[index + 1];
                  const nextId = nextPuzzle ? nextPuzzle.id : undefined;
                  return (
                    <div
                      key={p.id}
                      onClick={() => launchPuzzle(p.id, 'LIBRARY', nextId)}
                      className={`group p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${isSolved ? 'bg-green-50 border-green-200' : 'bg-white hover:border-blue-500 hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isSolved ? <CheckCircle className="text-green-600 shrink-0" size={20} /> : <FileText className="text-slate-300 group-hover:text-blue-500 shrink-0" size={20} />}
                        <div className="truncate">
                          <span className={`font-bold text-sm block truncate ${isSolved ? 'text-green-800' : 'text-slate-700'}`}>{p.title}</span>
                          {progress && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {progress.attempts} Attempt{progress.attempts !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isSolved && <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />}
                    </div>
                  )
                })}

                {curriculumItems.mcqs.map((m, index) => {
                  const progress = mcqProgress[m.id]
                  const isSolved = progress?.isCorrect
                  const nextMCQ = curriculumItems.mcqs[index + 1];
                  const nextId = nextMCQ ? nextMCQ.id : undefined;
                  return (
                    <div
                      key={m.id}
                      onClick={() => launchMCQ(m.id, nextId)}
                      className={`group p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${isSolved ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:border-emerald-500 hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isSolved ? <CheckCircle className="text-emerald-600 shrink-0" size={20} /> : <HelpCircle className="text-slate-300 group-hover:text-emerald-500 shrink-0" size={20} />}
                        <div className="truncate">
                          <span className={`font-bold text-sm block truncate ${isSolved ? 'text-emerald-800' : 'text-slate-700'}`}>{m.question}</span>
                          {progress && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {progress.attempts} Attempt{progress.attempts !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isSolved && <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* FEES TAB */}
        {activeTab === 'FEES' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-green-50 rounded-2xl"><Wallet className="text-green-600" size={32} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Fee Payment History</h2>
                  <p className="text-slate-500 font-medium">View your transaction records and payment status.</p>
                </div>
              </div>
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-bold text-slate-700">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="p-4 font-black text-slate-800">₹{p.amount.toLocaleString()}</td>
                        <td className="p-4"><span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-tighter">{p.method}</span></td>
                        <td className="p-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                            p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan={4} className="p-16 text-center text-slate-400 italic font-medium">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'SCHEDULE' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-purple-50 rounded-2xl">
                  <Calendar className="text-purple-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">My Class Schedule</h2>
                  <p className="text-slate-500 font-medium">View your enrolled batches and join online classes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map(c => (
                  <div key={c.id} className="bg-slate-50 rounded-3xl p-6 border-2 border-transparent hover:border-purple-200 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-black text-xl text-slate-800 mb-1">{c.name}</h3>
                        <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest">
                          <Calendar size={14} /> {c.dayOfWeek}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-600 font-medium">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <ClockIcon size={16} className="text-slate-400" />
                        </div>
                        <span>{c.startTime} - {c.endTime}</span>
                      </div>
                      {c.coach && (
                        <div className="flex items-center gap-3 text-slate-600 font-medium">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <CheckCircle size={16} className="text-green-500" />
                          </div>
                          <span>Coach: <span className="font-bold text-slate-800">{c.coach.name}</span></span>
                        </div>
                      )}
                    </div>

                    {c.meetingLink ? (
                      <a
                        href={c.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-slate-900 hover:bg-purple-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 group-hover:shadow-purple-200"
                      >
                        <Video size={20} />
                        Join Online Class
                      </a>
                    ) : (
                      <div className="w-full bg-slate-200 text-slate-400 font-bold py-4 rounded-2xl text-center text-sm uppercase tracking-widest cursor-not-allowed">
                        No Link Provided
                      </div>
                    )}
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-full py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-400 font-bold text-lg italic">You are not enrolled in any classes yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { 
//   Clock, BookOpen, ChevronRight, Folder, FileText, 
//   PlayCircle, CheckCircle, History, RefreshCcw, Lock, BarChart3
// } from 'lucide-react'

// const STAGE_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

// export default function StudentDashboard() {
//   const { data: session, status } = useSession()
//   const router = useRouter()

//   // --- STATE ---
//   const [activeTab, setActiveTab] = useState<'TODO' | 'HISTORY' | 'LIBRARY'>('TODO')
//   const [loading, setLoading] = useState(true)
//   const [isRefreshing, setIsRefreshing] = useState(false)

//   // Data
//   const [assignments, setAssignments] = useState<any[]>([])
//   const [studentStage, setStudentStage] = useState<string>('BEGINNER')
  
//   // Library State
//   const [libraryStage, setLibraryStage] = useState<string>('BEGINNER')
//   const [curriculumPath, setCurriculumPath] = useState<any[]>([])
//   const [curriculumItems, setCurriculumItems] = useState<{folders: any[], puzzles: any[]}>({ folders: [], puzzles: [] })
  
//   // Progress State (Map puzzleId -> Progress Object)
//   const [puzzleProgress, setPuzzleProgress] = useState<Record<string, any>>({})

//   // --- 1. DATA FETCHING ---

//   const fetchAssignments = useCallback(async () => {
//     if (!session?.user) return
//     try {
//       setIsRefreshing(true)
//       const studentId = (session.user as any).id
//       const res = await fetch(`/api/assignments?studentId=${studentId}`, { cache: 'no-store' })
//       if (res.ok) setAssignments(await res.json())
//     } catch (error) { console.error(error) } 
//     finally { setIsRefreshing(false); setLoading(false) }
//   }, [session])

//   const fetchLibrary = useCallback(async (stage: string, parentId: string | null) => {
//     try {
//       const query = parentId ? `parentId=${parentId}` : `stage=${stage}`
//       const [contentRes, progressRes] = await Promise.all([
//         fetch(`/api/content?${query}`, { cache: 'no-store' }),
//         fetch(`/api/progress?studentId=${(session?.user as any).id}`, { cache: 'no-store' })
//       ])

//       if (contentRes.ok) {
//         const content = await contentRes.json()
//         setCurriculumItems(content)
//       }

//       if (progressRes.ok) {
//         const progressList = await progressRes.json()
//         // Convert array to Map for fast lookup: { puzzleId: { isSolved: true, attempts: 3 } }
//         const progressMap: Record<string, any> = {}
//         progressList.forEach((p: any) => {
//           progressMap[p.puzzleId] = p
//         })
//         setPuzzleProgress(progressMap)
//       }

//     } catch (error) { console.error("Error fetching library:", error) }
//   }, [session])

//   // --- 2. EFFECTS ---

//   useEffect(() => {
//     if (status === 'unauthenticated') router.push('/api/auth/signin')
//     if (status === 'authenticated') {
//       fetchAssignments()
      
//       fetch('/api/me', { cache: 'no-store' })
//         .then(r => r.json())
//         .then(user => {
//           if (user.stage) {
//             setStudentStage(user.stage)
//             setLibraryStage(user.stage)
//             fetchLibrary(user.stage, null)
//           }
//         })
//     }
//   }, [status, router, fetchAssignments, fetchLibrary])

//   useEffect(() => {
//     if (activeTab === 'TODO' || activeTab === 'HISTORY') fetchAssignments()
//   }, [activeTab, fetchAssignments])

//   // --- 3. HANDLERS ---

//   const handleFolderClick = (folder: any) => {
//     setCurriculumPath([...curriculumPath, folder])
//     fetchLibrary(libraryStage, folder.id)
//   }

//   const handleBreadcrumbClick = (index: number) => {
//     const newPath = index === -1 ? [] : curriculumPath.slice(0, index + 1)
//     setCurriculumPath(newPath)
//     const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null
//     fetchLibrary(libraryStage, parentId)
//   }

//   const changeStage = (stage: string) => {
//     if (isStageLocked(stage)) return;
//     setLibraryStage(stage)
//     setCurriculumPath([]) 
//     fetchLibrary(stage, null)
//   }

//   // UPDATED: Accepts nextPuzzleId to create the chain
//   const launchPuzzle = (puzzleId: string, nextPuzzleId?: string) => {
//     let url = `/puzzle/${puzzleId}`
//     if (nextPuzzleId) {
//       url += `?next=${nextPuzzleId}`
//     }
//     router.push(url)
//   }

//   // Helpers
//   const isStageLocked = (targetStage: string) => {
//     const currentIndex = STAGE_ORDER.indexOf(studentStage);
//     const targetIndex = STAGE_ORDER.indexOf(targetStage);
//     return targetIndex > currentIndex;
//   }

//   const pending = assignments.filter(a => !a.isCompleted)
//   const completed = assignments.filter(a => a.isCompleted)

//   // Calculate Library Stats for current view
//   const totalPuzzles = curriculumItems.puzzles.length
//   const solvedCount = curriculumItems.puzzles.filter(p => puzzleProgress[p.id]?.isSolved).length

//   if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div></div>

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 pt-24 px-4 md:px-8">
      
//       {/* HEADER */}
//       <div className="max-w-6xl mx-auto mb-8">
//         <div className="flex justify-between items-end">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Student Classroom</h1>
//             <p className="text-slate-500 mt-2 font-medium">Let's train your brain, {session?.user?.name}!</p>
//           </div>
//           <button onClick={fetchAssignments} className="text-slate-400 hover:text-orange-500 transition p-2 bg-white rounded-full shadow-sm border">
//             <RefreshCcw size={20} className={isRefreshing ? "animate-spin" : ""} />
//           </button>
//         </div>

//         <div className="mt-8 flex gap-2 md:gap-6 border-b border-slate-200 overflow-x-auto">
//           {/* TABS */}
//           <button onClick={() => setActiveTab('TODO')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 ${activeTab === 'TODO' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}>
//             <Clock size={18}/> To Do {pending.length > 0 && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>}
//           </button>
//           <button onClick={() => setActiveTab('HISTORY')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 ${activeTab === 'HISTORY' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}>
//             <History size={18}/> Completed
//           </button>
//           <button onClick={() => setActiveTab('LIBRARY')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 ${activeTab === 'LIBRARY' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>
//             <BookOpen size={18}/> Library
//           </button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto min-h-[500px]">
        
//         {/* TODO TAB */}
//         {activeTab === 'TODO' && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
//             {pending.length === 0 && (
//                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed text-center">
//                   <CheckCircle className="w-12 h-12 text-green-300 mb-4"/>
//                   <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
//                   <p className="text-slate-500">Check the Library to practice more.</p>
//                </div>
//             )}
//             {pending.map((item, index) => {
//               // Calculate Next Puzzle ID for ToDo List
//               const nextAssignment = pending[index + 1];
//               const nextId = nextAssignment ? nextAssignment.puzzle.id : undefined;

//               return (
//                 <div key={item.id} onClick={() => launchPuzzle(item.puzzle.id, nextId)} className="group bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg hover:border-orange-300 transition cursor-pointer relative overflow-hidden">
//                   <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 group-hover:w-3 transition-all" />
//                   <div className="flex justify-between mb-4 pl-3">
//                     <div className="bg-orange-50 text-orange-600 p-3 rounded-full"><PlayCircle size={24} /></div>
//                     <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">ASSIGNED</span>
//                   </div>
//                   <div className="pl-3">
//                     <h3 className="text-xl font-bold text-slate-800">{item.puzzle.title}</h3>
//                     <div className="text-sm text-slate-500 mt-1">By Coach {item.assignedBy}</div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         {/* HISTORY TAB */}
//         {activeTab === 'HISTORY' && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
//              {completed.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">No completed puzzles yet.</p>}
//              {completed.map((item) => (
//                <div key={item.id} className="bg-white rounded-xl p-5 border opacity-75 hover:opacity-100 transition">
//                   <div className="flex justify-between items-center mb-3">
//                      <CheckCircle size={16} className="text-green-600"/>
//                      <span className="text-xs font-bold text-slate-400">{new Date(item.assignedAt).toLocaleDateString()}</span>
//                   </div>
//                   <h3 className="font-bold text-slate-700 line-through decoration-slate-300">{item.puzzle.title}</h3>
//                </div>
//              ))}
//           </div>
//         )}

//         {/* LIBRARY TAB (ENHANCED) */}
//         {activeTab === 'LIBRARY' && (
//           <div className="bg-white rounded-3xl p-8 border shadow-sm animate-in fade-in">
             
//              {/* Stage Selector */}
//              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b">
//                 {STAGE_ORDER.map((stage) => {
//                   const locked = isStageLocked(stage);
//                   return (
//                     <button key={stage} onClick={() => changeStage(stage)} disabled={locked} className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 ${libraryStage === stage ? 'bg-slate-800 text-white' : locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-slate-500'}`}>
//                       {stage} {locked && <Lock size={12}/>}
//                     </button>
//                   )
//                 })}
//              </div>

//              {/* Breadcrumbs + Stats */}
//              <div className="flex justify-between items-end mb-6">
//                 <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
//                     <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:text-black">ROOT</span>
//                     {curriculumPath.map((f, i) => (
//                        <span key={f.id} className="flex gap-2"> <ChevronRight size={14}/> <span onClick={() => handleBreadcrumbClick(i)} className="cursor-pointer hover:text-black">{f.name}</span> </span>
//                     ))}
//                 </div>
                
//                 {/* Stats for Current Folder */}
//                 {totalPuzzles > 0 && (
//                   <div className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
//                      <BarChart3 size={14}/>
//                      {solvedCount} / {totalPuzzles} Solved
//                   </div>
//                 )}
//              </div>

//              {/* Folders Grid */}
//              {curriculumItems.folders.length > 0 && (
//                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
//                   {curriculumItems.folders.map(f => (
//                      <div key={f.id} onClick={() => handleFolderClick(f)} className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition">
//                         <Folder className="w-8 h-8 text-blue-400 mb-2"/>
//                         <span className="text-sm font-bold text-slate-700 text-center px-2">{f.name}</span>
//                      </div>
//                   ))}
//                </div>
//              )}

//              {/* Puzzles Grid (With Status) */}
//              <div>
//                 {curriculumItems.puzzles.length === 0 && curriculumItems.folders.length === 0 && (
//                    <div className="text-center py-20 text-slate-400 flex flex-col items-center border-2 border-dashed rounded-xl">
//                       <Folder size={48} className="mb-4 opacity-20"/>
//                       <p>This folder is empty.</p>
//                    </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                    {curriculumItems.puzzles.map((p, index) => {
//                      const progress = puzzleProgress[p.id]
//                      const isSolved = progress?.isSolved

//                      // Calculate Next Puzzle ID for Library List
//                      const nextPuzzle = curriculumItems.puzzles[index + 1];
//                      const nextId = nextPuzzle ? nextPuzzle.id : undefined;
                     
//                      return (
//                        <div 
//                          key={p.id} 
//                          onClick={() => launchPuzzle(p.id, nextId)} 
//                          className={`group p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${isSolved ? 'bg-green-50 border-green-200' : 'bg-white hover:border-blue-500 hover:shadow-md'}`}
//                        >
//                           <div className="flex items-center gap-3 overflow-hidden">
//                              {isSolved ? <CheckCircle className="text-green-600 shrink-0" size={20}/> : <FileText className="text-slate-300 group-hover:text-blue-500 shrink-0" size={20}/>}
//                              <div className="truncate">
//                                 <span className={`font-bold text-sm block truncate ${isSolved ? 'text-green-800' : 'text-slate-700'}`}>{p.title}</span>
//                                 {progress && (
//                                   <span className="text-[10px] text-slate-500 font-medium">
//                                     {progress.attempts} Attempt{progress.attempts !== 1 ? 's' : ''}
//                                   </span>
//                                 )}
//                              </div>
//                           </div>
//                           {!isSolved && <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"/>}
//                        </div>
//                      )
//                    })}
//                 </div>
//              </div>
//           </div>
//         )}

//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Clock, BookOpen, ChevronRight, Folder, FileText, 
  PlayCircle, CheckCircle, History, RefreshCcw, Lock, BarChart3
} from 'lucide-react'

const STAGE_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'TODO' | 'HISTORY' | 'LIBRARY'>('TODO')
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Data
  const [assignments, setAssignments] = useState<any[]>([])
  const [studentStage, setStudentStage] = useState<string>('BEGINNER')
  
  // Library State
  const [libraryStage, setLibraryStage] = useState<string>('BEGINNER')
  const [curriculumPath, setCurriculumPath] = useState<any[]>([])
  const [curriculumItems, setCurriculumItems] = useState<{folders: any[], puzzles: any[]}>({ folders: [], puzzles: [] })
  
  // Progress State (Map puzzleId -> Progress Object)
  const [puzzleProgress, setPuzzleProgress] = useState<Record<string, any>>({})

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
      const [contentRes, progressRes] = await Promise.all([
        fetch(`/api/content?${query}`, { cache: 'no-store' }),
        fetch(`/api/progress?studentId=${(session?.user as any).id}`, { cache: 'no-store' })
      ])

      if (contentRes.ok) {
        const content = await contentRes.json()
        setCurriculumItems(content)
      }

      if (progressRes.ok) {
        const progressList = await progressRes.json()
        const progressMap: Record<string, any> = {}
        progressList.forEach((p: any) => {
          progressMap[p.puzzleId] = p
        })
        setPuzzleProgress(progressMap)
      }

    } catch (error) { console.error("Error fetching library:", error) }
  }, [session])

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
    }
  }, [status, router, fetchAssignments, fetchLibrary])

  useEffect(() => {
    if (activeTab === 'TODO' || activeTab === 'HISTORY') fetchAssignments()
  }, [activeTab, fetchAssignments])

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

  // UPDATED: Now passes Context and FolderID to keep the chain alive
  const launchPuzzle = (puzzleId: string, context: 'TODO' | 'LIBRARY', nextPuzzleId?: string) => {
    const params = new URLSearchParams()
    
    // 1. Pass the immediate next puzzle (fastest)
    if (nextPuzzleId) params.set('next', nextPuzzleId)

    // 2. Pass context so the *next* page knows how to find the *next-next*
    if (context === 'TODO') {
      params.set('context', 'todo')
    } else {
      // For Library, pass the folder ID or stage so we don't lose our place
      const currentFolderId = curriculumPath.length > 0 ? curriculumPath[curriculumPath.length - 1].id : null
      if (currentFolderId) {
        params.set('folderId', currentFolderId)
      } else {
        // We are at root stage level
        params.set('stage', libraryStage) 
      }
    }

    router.push(`/puzzle/${puzzleId}?${params.toString()}`)
  }

  // Helpers
  const isStageLocked = (targetStage: string) => {
    const currentIndex = STAGE_ORDER.indexOf(studentStage);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);
    return targetIndex > currentIndex;
  }

  const pending = assignments.filter(a => !a.isCompleted)
  const completed = assignments.filter(a => a.isCompleted)

  const totalPuzzles = curriculumItems.puzzles.length
  const solvedCount = curriculumItems.puzzles.filter(p => puzzleProgress[p.id]?.isSolved).length

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

        <div className="mt-8 flex gap-2 md:gap-6 border-b border-slate-200 overflow-x-auto">
          {/* TABS */}
          <button onClick={() => setActiveTab('TODO')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 ${activeTab === 'TODO' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}>
            <Clock size={18}/> To Do {pending.length > 0 && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button onClick={() => setActiveTab('HISTORY')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 ${activeTab === 'HISTORY' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}>
            <History size={18}/> Completed
          </button>
          <button onClick={() => setActiveTab('LIBRARY')} className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold px-4 ${activeTab === 'LIBRARY' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>
            <BookOpen size={18}/> Library
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto min-h-[500px]">
        
        {/* TODO TAB */}
        {activeTab === 'TODO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {pending.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed text-center">
                  <CheckCircle className="w-12 h-12 text-green-300 mb-4"/>
                  <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
                  <p className="text-slate-500">Check the Library to practice more.</p>
               </div>
            )}
            {pending.map((item, index) => {
              // Calculate Next ID
              const nextAssignment = pending[index + 1];
              const nextId = nextAssignment ? nextAssignment.puzzle.id : undefined;

              return (
                <div key={item.id} onClick={() => launchPuzzle(item.puzzle.id, 'TODO', nextId)} className="group bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg hover:border-orange-300 transition cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 group-hover:w-3 transition-all" />
                  <div className="flex justify-between mb-4 pl-3">
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-full"><PlayCircle size={24} /></div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">ASSIGNED</span>
                  </div>
                  <div className="pl-3">
                    <h3 className="text-xl font-bold text-slate-800">{item.puzzle.title}</h3>
                    <div className="text-sm text-slate-500 mt-1">By Coach {item.assignedBy}</div>
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
                     <CheckCircle size={16} className="text-green-600"/>
                     <span className="text-xs font-bold text-slate-400">{new Date(item.assignedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-700 line-through decoration-slate-300">{item.puzzle.title}</h3>
               </div>
             ))}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'LIBRARY' && (
          <div className="bg-white rounded-3xl p-8 border shadow-sm animate-in fade-in">
             
             {/* Stage Selector */}
             <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b">
                {STAGE_ORDER.map((stage) => {
                  const locked = isStageLocked(stage);
                  return (
                    <button key={stage} onClick={() => changeStage(stage)} disabled={locked} className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 ${libraryStage === stage ? 'bg-slate-800 text-white' : locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-slate-500'}`}>
                      {stage} {locked && <Lock size={12}/>}
                    </button>
                  )
                })}
             </div>

             {/* Breadcrumbs + Stats */}
             <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:text-black">ROOT</span>
                    {curriculumPath.map((f, i) => (
                       <span key={f.id} className="flex gap-2"> <ChevronRight size={14}/> <span onClick={() => handleBreadcrumbClick(i)} className="cursor-pointer hover:text-black">{f.name}</span> </span>
                    ))}
                </div>
                
                {/* Stats */}
                {totalPuzzles > 0 && (
                  <div className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                     <BarChart3 size={14}/>
                     {solvedCount} / {totalPuzzles} Solved
                  </div>
                )}
             </div>

             {/* Folders Grid */}
             {curriculumItems.folders.length > 0 && (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                  {curriculumItems.folders.map(f => (
                     <div key={f.id} onClick={() => handleFolderClick(f)} className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition">
                        <Folder className="w-8 h-8 text-blue-400 mb-2"/>
                        <span className="text-sm font-bold text-slate-700 text-center px-2">{f.name}</span>
                     </div>
                  ))}
               </div>
             )}

             {/* Puzzles Grid */}
             <div>
                {curriculumItems.puzzles.length === 0 && curriculumItems.folders.length === 0 && (
                   <div className="text-center py-20 text-slate-400 flex flex-col items-center border-2 border-dashed rounded-xl">
                      <Folder size={48} className="mb-4 opacity-20"/>
                      <p>This folder is empty.</p>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {curriculumItems.puzzles.map((p, index) => {
                     const progress = puzzleProgress[p.id]
                     const isSolved = progress?.isSolved

                     // Calculate Next ID for Library
                     const nextPuzzle = curriculumItems.puzzles[index + 1];
                     const nextId = nextPuzzle ? nextPuzzle.id : undefined;
                     
                     return (
                       <div 
                         key={p.id} 
                         onClick={() => launchPuzzle(p.id, 'LIBRARY', nextId)} 
                         className={`group p-4 border rounded-xl cursor-pointer transition flex items-center justify-between ${isSolved ? 'bg-green-50 border-green-200' : 'bg-white hover:border-blue-500 hover:shadow-md'}`}
                       >
                          <div className="flex items-center gap-3 overflow-hidden">
                             {isSolved ? <CheckCircle className="text-green-600 shrink-0" size={20}/> : <FileText className="text-slate-300 group-hover:text-blue-500 shrink-0" size={20}/>}
                             <div className="truncate">
                                <span className={`font-bold text-sm block truncate ${isSolved ? 'text-green-800' : 'text-slate-700'}`}>{p.title}</span>
                                {progress && (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {progress.attempts} Attempt{progress.attempts !== 1 ? 's' : ''}
                                  </span>
                                )}
                             </div>
                          </div>
                          {!isSolved && <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"/>}
                       </div>
                     )
                   })}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  )
}
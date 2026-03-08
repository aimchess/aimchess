'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  BookOpen, ChevronRight, Folder, FileText,
  CheckCircle, Lock, BarChart3, Volume2, Star
} from 'lucide-react'

const STAGE_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export default function StudentLibraryPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [studentStage, setStudentStage] = useState<string>('BEGINNER')
  const [libraryStage, setLibraryStage] = useState<string>('BEGINNER')
  const [curriculumPath, setCurriculumPath] = useState<any[]>([])
  const [curriculumItems, setCurriculumItems] = useState<{ folders: any[], puzzles: any[] }>({ folders: [], puzzles: [] })
  const [puzzleProgress, setPuzzleProgress] = useState<Record<string, any>>({})
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLibrary = useCallback(async (stage: string, parentId: string | null) => {
    if (!session?.user) return
    try {
      const query = parentId ? `parentId=${parentId}` : `stage=${stage}`
      const [contentRes, progressRes] = await Promise.all([
        fetch(`/api/content?${query}`, { cache: 'no-store' }),
        fetch(`/api/progress?studentId=${(session.user as any).id}`, { cache: 'no-store' })
      ])
      if (contentRes.ok) setCurriculumItems(await contentRes.json())
      if (progressRes.ok) {
        const progressList = await progressRes.json()
        const progressMap: Record<string, any> = {}
        progressList.forEach((p: any) => { progressMap[p.puzzleId] = p })
        setPuzzleProgress(progressMap)
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

  const totalPuzzles = curriculumItems.puzzles.length
  const solvedCount = curriculumItems.puzzles.filter(p => puzzleProgress[p.id]?.isSolved).length

  if (loading) return <CRMShellLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div></div></CRMShellLayout>

  return (
    <CRMShellLayout>
      <div className="bg-white rounded-2xl p-4 md:p-8 border border-sky-100 shadow-sm">
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
        {curriculumPath.length === 0 && courses.filter(c => c.level === libraryStage).length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-[#0b1d3a] mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" fill="currentColor" /> {libraryStage} Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => c.level === libraryStage).map(course => (
                <div key={course.id} className="bg-sky-50/50 border border-sky-100 rounded-2xl p-6 hover:shadow-lg transition-all group">
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
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-sky-100">
                    <span className="text-xs font-bold text-slate-400">{course.chapters?.length || 0} Lessons</span>
                    <span className="text-sm font-bold text-sky-600">View Details</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Puzzles */}
        {curriculumItems.puzzles.length === 0 && curriculumItems.folders.length === 0 && (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center border-2 border-dashed border-sky-100 rounded-xl">
            <Folder size={48} className="mb-4 opacity-20" />
            <p>This folder is empty.</p>
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
        </div>
      </div>
    </CRMShellLayout>
  )
}

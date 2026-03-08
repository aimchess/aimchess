'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  BookOpen, ChevronRight, ChevronLeft, RotateCcw,
  Loader2, ArrowUpDown, Settings, Trash2, Menu, X
} from 'lucide-react'

type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

function getPieceSymbol(type: string, color: string) {
  const symbols: any = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  }
  return symbols[color][type]
}

export default function CoachLibraryPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [activeChapter, setActiveChapter] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const game = useRef(new Chess())
  const [boardFen, setBoardFen] = useState('start')
  const [squares, setSquares] = useState<Record<string, any>>({})
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [setupMode, setSetupMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool>(null)
  const [boardWidth, setBoardWidth] = useState(500)
  const boardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) { setBoardWidth(entry.contentRect.width) }
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses')
        if (res.ok) setCourses(await res.json())
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    if (activeChapter) {
      try {
        game.current.load(activeChapter.fen)
        setBoardFen(activeChapter.fen)
        setSquares({})
        setSetupMode(false)
        setIsSidebarOpen(false)
      } catch (e) {
        game.current.reset()
        setBoardFen('start')
      }
    }
  }, [activeChapter])

  const updateBoard = () => setBoardFen(game.current.fen())

  const currentChapterIndex = selectedCourse?.chapters?.findIndex((c: any) => c.id === activeChapter?.id) ?? -1
  const hasNext = currentChapterIndex !== -1 && currentChapterIndex < (selectedCourse?.chapters?.length || 0) - 1
  const hasPrev = currentChapterIndex > 0

  const handleNext = () => hasNext && setActiveChapter(selectedCourse.chapters[currentChapterIndex + 1])
  const handlePrev = () => hasPrev && setActiveChapter(selectedCourse.chapters[currentChapterIndex - 1])

  const onDrop = (source: string, target: string) => {
    if (setupMode) {
      const boardPiece = game.current.get(source as any)
      if (source === target || !boardPiece) return false
      game.current.remove(source as any)
      game.current.put(boardPiece, target as any)
      updateBoard()
      return true
    }
    try {
      const move = game.current.move({ from: source, to: target, promotion: 'q' })
      if (!move) return false
      setBoardFen(game.current.fen())
      return true
    } catch { return false }
  }

  const onSquareClick = (square: string) => {
    if (setupMode && selectedTool) {
      if (selectedTool === 'TRASH') game.current.remove(square as any)
      else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any)
      updateBoard()
    }
  }

  const onSquareRightClick = (square: string) => {
    if (setupMode) { game.current.remove(square as any); updateBoard(); return }
    setSquares(prev => {
      const ns = { ...prev }
      if (!ns[square]) ns[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
      else if (ns[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') ns[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
      else delete ns[square]
      return ns
    })
  }

  if (loading && !selectedCourse) {
    return <CRMShellLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500 w-8 h-8" /></div></CRMShellLayout>
  }

  // Course list view
  if (!selectedCourse) {
    return (
      <CRMShellLayout>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0b1d3a] mb-8 flex items-center gap-3">
            <BookOpen className="text-sky-500" /> Teaching Library
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-white border border-sky-100 rounded-2xl p-6 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${c.level === 'BEGINNER' ? 'bg-green-50 text-green-700 border-green-100' : c.level === 'INTERMEDIATE' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                    {c.level}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{c.chapters?.length || 0} Lessons</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1d3a] mb-3">{c.title}</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">{c.description || "Teaching module."}</p>
                <button
                  onClick={() => { setSelectedCourse(c); if (c.chapters?.length > 0) setActiveChapter(c.chapters[0]) }}
                  disabled={!c.chapters || c.chapters.length === 0}
                  className="w-full bg-[#0b1d3a] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-sky-500 transition-all active:scale-95 disabled:opacity-30"
                >
                  Start Teaching <ChevronRight size={16} />
                </button>
              </div>
            ))}
            {courses.length === 0 && <div className="col-span-3 text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed">No courses found.</div>}
          </div>
        </div>
      </CRMShellLayout>
    )
  }

  // Classroom view
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0b1d3a] text-white p-3 md:p-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-2 md:gap-4 truncate">
          <button onClick={() => { setSelectedCourse(null); setActiveChapter(null) }} className="hover:bg-sky-800/30 p-2 rounded-xl transition"><ChevronLeft size={20} /></button>
          <div className="truncate">
            <h2 className="font-bold text-sm md:text-lg truncate">{selectedCourse.title}</h2>
            <p className="text-[10px] font-medium text-sky-300">Classroom Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 hover:bg-sky-800/30 rounded-xl">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="p-2 hover:bg-sky-800/30 rounded-xl" title="Flip"><ArrowUpDown size={18} /></button>
          <button
            onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${setupMode ? 'bg-red-600' : 'bg-sky-700 hover:bg-sky-600'}`}
          >
            <Settings size={14} /> {setupMode ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Lesson Sidebar */}
        <div className={`absolute inset-0 z-30 md:relative md:block md:w-72 bg-white border-r border-sky-100 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-sky-50 flex justify-between items-center">
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Lessons</span>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedCourse.chapters.map((chap: any, idx: number) => (
              <button
                key={chap.id}
                onClick={() => setActiveChapter(chap)}
                className={`w-full text-left p-4 border-b border-sky-50 transition-all flex items-center gap-4 ${activeChapter?.id === chap.id ? 'bg-sky-50 border-r-4 border-r-sky-500' : 'hover:bg-sky-50/50'}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${activeChapter?.id === chap.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{idx + 1}</span>
                <span className={`text-xs font-bold truncate ${activeChapter?.id === chap.id ? 'text-[#0b1d3a]' : 'text-slate-400'}`}>{chap.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Board + Notes */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div ref={boardContainerRef} className="w-full h-full flex justify-center items-center">
              <div className="aspect-square w-full max-w-[550px] shadow-2xl rounded-2xl border-4 border-white relative">
                <Chessboard
                  position={boardFen}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  customSquareStyles={squares}
                  boardOrientation={orientation}
                  arePiecesDraggable={true}
                  animationDuration={250}
                  boardWidth={boardWidth}
                />
                {setupMode && <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] font-bold rounded-full animate-pulse z-10 shadow-xl">Editor Active</div>}
              </div>
            </div>

            {setupMode && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-sky-100 flex flex-col items-center gap-3 z-20 w-[90%] sm:w-auto">
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                    <button key={'w' + p} onClick={() => setSelectedTool({ type: p, color: 'w' })} className={`w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-50 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool?.color === 'w' ? 'border-sky-500 bg-sky-50' : 'border-transparent'}`}>{getPieceSymbol(p, 'w')}</button>
                  ))}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                    <button key={'b' + p} onClick={() => setSelectedTool({ type: p, color: 'b' })} className={`w-10 h-10 flex items-center justify-center text-2xl bg-slate-900 text-white hover:bg-slate-800 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool?.color === 'b' ? 'border-sky-500 ring-2 ring-sky-500' : 'border-transparent'}`}>{getPieceSymbol(p, 'b')}</button>
                  ))}
                </div>
                <div className="flex w-full gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold p-2.5 rounded-xl border-2 transition-all ${selectedTool === 'TRASH' ? 'bg-red-50 border-red-500 text-red-600' : 'text-slate-400 border-transparent hover:bg-slate-50'}`}><Trash2 size={16} /> Trash</button>
                  <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 text-xs font-bold p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Clear</button>
                  <button onClick={() => { game.current.reset(); updateBoard() }} className="flex-1 text-xs font-bold p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Notes Panel */}
          <div className="w-full lg:w-[380px] bg-white border-l border-sky-100 flex flex-col shrink-0">
            <div className="p-4 md:p-6 border-b border-sky-50 bg-sky-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#0b1d3a] truncate max-w-[200px]">{activeChapter?.title}</h3>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-1 block">Instructor Notes</span>
              </div>
              <button
                onClick={() => { game.current.load(activeChapter.fen); setBoardFen(activeChapter.fen); setSquares({}) }}
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-sky-50 text-slate-400 hover:text-sky-600 rounded-full transition shadow-sm border border-sky-100"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <p className="whitespace-pre-wrap text-slate-500 leading-relaxed text-sm">
                {activeChapter?.content || "Focus on board positions for this module."}
              </p>
            </div>

            <div className="p-4 md:p-6 border-t border-sky-100 bg-white grid grid-cols-2 gap-4">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="py-4 px-4 bg-sky-50 border border-sky-100 rounded-2xl text-xs font-bold text-slate-400 hover:text-sky-600 hover:bg-sky-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 transition active:scale-95"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="py-4 px-4 bg-[#0b1d3a] text-white rounded-2xl text-xs font-bold hover:bg-sky-600 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 transition active:scale-95 shadow-lg"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

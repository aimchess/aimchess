'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  MousePointer2, RotateCcw, ArrowUpDown, Settings, Trash2
} from 'lucide-react'

type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

function getPieceSymbol(type: string, color: string) {
  const symbols: any = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  }
  return symbols[color][type]
}

export default function CoachAnalysisPage() {
  const game = useRef(new Chess())
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [squares, setSquares] = useState<Record<string, any>>({})
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [setupMode, setSetupMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool>(null)
  const [boardWidth, setBoardWidth] = useState(600)
  const boardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) { setBoardWidth(entry.contentRect.width) }
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const updateBoard = () => setFen(game.current.fen())

  const onDrop = (source: string, target: string) => {
    if (setupMode) {
      const boardPiece = game.current.get(source as any)
      if (source === target || !boardPiece) return false
      game.current.remove(source as any)
      game.current.put(boardPiece, target as any)
      updateBoard(); setSquares({})
      return true
    }
    try {
      const move = game.current.move({ from: source, to: target, promotion: 'q' })
      if (!move) return false
      setFen(game.current.fen()); setSquares({})
      return true
    } catch { return false }
  }

  const onSquareClick = (square: string) => {
    if (setupMode && selectedTool) {
      if (selectedTool === 'TRASH') game.current.remove(square as any)
      else game.current.put({ type: selectedTool.type as any, color: selectedTool.color }, square as any)
      updateBoard()
    }
  }

  const onSquareRightClick = (square: string) => {
    if (setupMode) { game.current.remove(square as any); updateBoard() }
    else {
      setSquares(prev => {
        const ns = { ...prev }
        if (!ns[square]) ns[square] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
        else if (ns[square].backgroundColor === 'rgba(0, 255, 0, 0.4)') ns[square] = { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
        else delete ns[square]
        return ns
      })
    }
  }

  return (
    <CRMShellLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex justify-center items-start">
          <div ref={boardContainerRef} className="w-full max-w-[650px] aspect-square border-4 border-[#0b1d3a] rounded-2xl shadow-2xl relative overflow-hidden">
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
              customSquareStyles={squares}
              boardOrientation={orientation}
              arePiecesDraggable={true}
              boardWidth={boardWidth}
            />
            {setupMode && <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1.5 text-[10px] font-bold uppercase rounded-full animate-pulse z-10 shadow-xl">Setup Mode</div>}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-[#0b1d3a] border-b border-sky-50 pb-4">
              <MousePointer2 className="text-sky-500" /> Analysis Tools
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}) }} className="py-3 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 transition active:scale-95"><RotateCcw size={16} /> Reset</button>
              <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="py-3 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 transition active:scale-95"><ArrowUpDown size={16} /> Flip</button>
            </div>
            <button
              onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${setupMode ? 'bg-red-600 text-white shadow-red-100' : 'bg-[#0b1d3a] text-white shadow-sky-100'}`}
            >
              <Settings size={18} /> {setupMode ? 'Exit Setup' : 'Edit Position'}
            </button>
          </div>

          {setupMode && (
            <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#0b1d3a]">Piece Palette</h4>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <div className="flex justify-center gap-1.5 flex-wrap mb-3">
                {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                  <button key={'w' + p} onClick={() => setSelectedTool({ type: p, color: 'w' })} className={`w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-50 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'w' ? 'border-sky-500 bg-sky-50' : 'border-transparent'}`}>{getPieceSymbol(p, 'w')}</button>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 flex-wrap mb-6">
                {['p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                  <button key={'b' + p} onClick={() => setSelectedTool({ type: p, color: 'b' })} className={`w-10 h-10 flex items-center justify-center text-2xl bg-slate-900 text-white hover:bg-slate-800 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && selectedTool.color === 'b' ? 'border-sky-500 ring-2 ring-sky-500' : 'border-transparent'}`}>{getPieceSymbol(p, 'b')}</button>
                ))}
              </div>
              <div className="flex gap-2 pt-4 border-t border-sky-50">
                <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${selectedTool === 'TRASH' ? 'bg-red-50 border-2 border-red-500 text-red-600' : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-red-50 hover:text-red-500'}`}><Trash2 size={16} /> Trash</button>
                <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">Clear</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMShellLayout>
  )
}

'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import CRMShellLayout from "@/components/crm/crm-shell"
import {
  MousePointer2, RotateCcw, ArrowUpDown, Settings, Trash2,
  Cpu, Zap, ZapOff, ChevronLeft, Copy
} from 'lucide-react'

type Tool = { type: string, color: 'w' | 'b' } | 'TRASH' | null

function getPieceSymbol(type: string, color: string) {
  const symbols: any = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  }
  return symbols[color][type]
}

// ── Stockfish Web Worker helper ─────────────────────────────────────
class StockfishEngine {
  private worker: Worker | null = null
  private onMessage: ((line: string) => void) | null = null

  start() {
    if (this.worker) return
    const workerCode = `
      importScripts("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");
      var sf = STOCKFISH();
      sf.onmessage = function(line) { postMessage(line); };
      onmessage = function(e) { sf.postMessage(e.data); };
    `
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    this.worker = new Worker(URL.createObjectURL(blob))
    this.worker.onmessage = (e) => { if (this.onMessage) this.onMessage(e.data) }
    this.worker.postMessage('uci')
    this.worker.postMessage('isready')
  }

  stop() { this.worker?.postMessage('stop') }

  evaluate(fen: string, depth: number, onMessage: (line: string) => void) {
    if (!this.worker) return
    this.onMessage = onMessage
    this.worker.postMessage('stop')
    this.worker.postMessage(`position fen ${fen}`)
    this.worker.postMessage(`go depth ${depth}`)
  }

  destroy() { this.worker?.terminate(); this.worker = null }
}

export default function CoachAnalysisPage() {
  const game = useRef(new Chess())
  const engineRef = useRef<StockfishEngine | null>(null)
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [squares, setSquares] = useState<Record<string, any>>({})
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [setupMode, setSetupMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool>(null)
  const [boardWidth, setBoardWidth] = useState(600)
  const boardContainerRef = useRef<HTMLDivElement>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [fenInput, setFenInput] = useState('')
  const [copied, setCopied] = useState(false)

  // Engine state
  const [engineEnabled, setEngineEnabled] = useState(false)
  const [engineDepth, setEngineDepth] = useState(15)
  const [engineEval, setEngineEval] = useState({ depth: 0, score: '0.00', bestMove: '', pv: [] as string[], loading: false })

  useEffect(() => {
    if (!boardContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setBoardWidth(entry.contentRect.width)
    })
    observer.observe(boardContainerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const engine = new StockfishEngine()
    engine.start()
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  const runAnalysis = useCallback((currentFen: string) => {
    if (!engineEnabled || !engineRef.current) return
    setEngineEval(prev => ({ ...prev, loading: true }))
    engineRef.current.evaluate(currentFen, engineDepth, (line: string) => {
      if (line.startsWith('info') && line.includes('score')) {
        const depthMatch = line.match(/depth (\d+)/)
        const cpMatch = line.match(/score cp (-?\d+)/)
        const mateMatch = line.match(/score mate (-?\d+)/)
        const pvMatch = line.match(/ pv (.+)/)
        const depth = depthMatch ? parseInt(depthMatch[1]) : 0
        let score = '0.00'
        if (mateMatch) {
          const m = parseInt(mateMatch[1])
          score = m > 0 ? `M${m}` : `-M${Math.abs(m)}`
        } else if (cpMatch) {
          const cp = parseInt(cpMatch[1])
          const pawn = cp / 100
          score = pawn >= 0 ? `+${pawn.toFixed(2)}` : pawn.toFixed(2)
        }
        const pv = pvMatch ? pvMatch[1].trim().split(' ').slice(0, 5) : []
        setEngineEval(prev => ({ ...prev, depth, score, pv, loading: false }))
      }
      if (line.startsWith('bestmove')) {
        const best = line.split(' ')[1] || ''
        setEngineEval(prev => ({ ...prev, bestMove: best, loading: false }))
      }
    })
  }, [engineEnabled, engineDepth])

  useEffect(() => {
    if (engineEnabled) runAnalysis(fen)
    else { engineRef.current?.stop(); setEngineEval({ depth: 0, score: '0.00', bestMove: '', pv: [], loading: false }) }
  }, [fen, engineEnabled, runAnalysis])

  const updateBoard = () => {
    const f = game.current.fen()
    setFen(f)
    setFenInput(f)
  }

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
      setMoveHistory(prev => [...prev, move.san])
      updateBoard(); setSquares({})
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

  const handleUndo = () => {
    game.current.undo()
    setMoveHistory(prev => prev.slice(0, -1))
    const f = game.current.fen()
    setFen(f); setFenInput(f); setSquares({})
  }

  const handleLoadFen = () => {
    try {
      const g = new Chess(fenInput)
      game.current = g
      setFen(g.fen()); setSquares({}); setMoveHistory([])
    } catch { alert('Invalid FEN') }
  }

  const scoreColor = () => {
    if (engineEval.score.startsWith('M')) return 'text-emerald-500'
    if (engineEval.score.startsWith('-M')) return 'text-red-500'
    const val = parseFloat(engineEval.score)
    if (val > 1) return 'text-emerald-600'
    if (val < -1) return 'text-red-500'
    return 'text-gray-700'
  }

  return (
    <CRMShellLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Board */}
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

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Board Controls */}
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#0b1d3a] border-b border-sky-50 pb-3">
              <MousePointer2 className="text-sky-500" size={16} /> Analysis Tools
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { game.current.reset(); updateBoard(); setSquares({}); setMoveHistory([]) }} className="py-2.5 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 transition active:scale-95">
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="py-2.5 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 transition active:scale-95">
                <ArrowUpDown size={14} /> Flip
              </button>
              <button onClick={handleUndo} className="py-2.5 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 transition active:scale-95">
                <ChevronLeft size={14} /> Undo
              </button>
            </div>
            <button onClick={() => { setSetupMode(!setupMode); setSelectedTool(null) }}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${setupMode ? 'bg-red-600 text-white' : 'bg-[#0b1d3a] text-white'}`}>
              <Settings size={16} /> {setupMode ? 'Exit Setup' : 'Edit Position'}
            </button>
          </div>

          {/* Setup Palette */}
          {setupMode && (
            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#0b1d3a]">Piece Palette</h4>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <div className="flex justify-center gap-1.5 flex-wrap mb-3">
                {['p','n','b','r','q','k'].map(p => (
                  <button key={'w'+p} onClick={() => setSelectedTool({ type: p, color: 'w' })}
                    className={`w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-50 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && (selectedTool as any).color === 'w' ? 'border-sky-500 bg-sky-50' : 'border-transparent'}`}>
                    {getPieceSymbol(p, 'w')}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 flex-wrap mb-4">
                {['p','n','b','r','q','k'].map(p => (
                  <button key={'b'+p} onClick={() => setSelectedTool({ type: p, color: 'b' })}
                    className={`w-10 h-10 flex items-center justify-center text-2xl bg-slate-900 text-white hover:bg-slate-800 rounded-xl border-2 transition-all ${selectedTool !== 'TRASH' && selectedTool?.type === p && (selectedTool as any).color === 'b' ? 'border-sky-500 ring-2 ring-sky-500' : 'border-transparent'}`}>
                    {getPieceSymbol(p, 'b')}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-sky-50">
                <button onClick={() => setSelectedTool('TRASH')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${selectedTool === 'TRASH' ? 'bg-red-50 border-2 border-red-500 text-red-600' : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-red-50 hover:text-red-500'}`}>
                  <Trash2 size={14} /> Trash
                </button>
                <button onClick={() => { game.current.clear(); updateBoard() }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">Clear</button>
              </div>
            </div>
          )}

          {/* FEN Input */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FEN</span>
              <button onClick={() => { navigator.clipboard.writeText(fen); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 hover:text-indigo-700">
                <Copy size={10} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea value={fenInput} onChange={e => setFenInput(e.target.value)}
              className="w-full text-[10px] font-mono p-2 bg-white border border-gray-200 rounded-lg outline-none resize-none" rows={2} placeholder="Paste FEN..." />
            <button onClick={handleLoadFen} className="mt-1.5 w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">Load FEN</button>
          </div>

          {/* Stockfish Panel */}
          <div className={`rounded-2xl border p-4 transition-all ${engineEnabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-sky-100 bg-white'}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Cpu size={16} className={engineEnabled ? 'text-emerald-600' : 'text-gray-400'} />
                <span className="text-xs font-black text-[#0b1d3a] uppercase tracking-wider">Stockfish</span>
              </div>
              <button onClick={() => setEngineEnabled(e => !e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${engineEnabled ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                {engineEnabled ? <Zap size={12} /> : <ZapOff size={12} />}
                {engineEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {engineEnabled && (
              <>
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                    <span>Depth</span><span>{engineDepth}</span>
                  </div>
                  <input type="range" min={5} max={20} value={engineDepth} onChange={e => setEngineDepth(parseInt(e.target.value))} className="w-full accent-emerald-600" />
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className={`text-2xl font-black ${scoreColor()}`}>{engineEval.loading ? '...' : engineEval.score}</span>
                    <span className="text-[10px] text-gray-400 font-bold">Depth {engineEval.depth}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden">
                    {(() => {
                      let pct = 50
                      if (!engineEval.score.includes('M')) {
                        pct = Math.min(95, Math.max(5, 50 + parseFloat(engineEval.score) * 8))
                      } else pct = engineEval.score.startsWith('M') ? 95 : 5
                      return <div className="h-full bg-white transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
                    })()}
                  </div>
                  <div className="flex justify-between text-[9px] font-bold mt-0.5 text-gray-500"><span>White</span><span>Black</span></div>
                </div>

                {engineEval.bestMove && (
                  <div className="bg-white rounded-xl border border-gray-100 p-3 mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Best Move</span>
                    <span className="font-black text-indigo-700 text-base">{engineEval.bestMove}</span>
                  </div>
                )}

                {engineEval.pv.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Principal Variation</span>
                    <div className="flex flex-wrap gap-1">
                      {engineEval.pv.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {!engineEnabled && <p className="text-xs text-gray-400 text-center py-2">Toggle ON to start Stockfish analysis</p>}
          </div>

          {/* Move History */}
          {moveHistory.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Move History</span>
              <div className="flex flex-wrap gap-1">
                {moveHistory.map((move, i) => (
                  <span key={i} className="text-xs font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700">
                    {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'}{move}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMShellLayout>
  )
}

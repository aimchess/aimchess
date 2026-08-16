"use client";

import React from "react";
import { Trash2, RotateCcw, Plus, Minus, Target } from "lucide-react";

type Tool = null | "TRASH" | "PLUS" | "MINUS" | "TARGET" | { type: string; color: string };

interface BoardSetupPaletteProps {
  selectedTool: any;
  setSelectedTool: (tool: any) => void;
  onClear: () => void;
  onReset: () => void;
  onClearArrows?: () => void;
  showSpecialTools?: boolean;
}

export function BoardSetupPalette({
  selectedTool,
  setSelectedTool,
  onClear,
  onReset,
  showSpecialTools = false,
}: BoardSetupPaletteProps) {
  const pieces = ["p", "n", "b", "r", "q", "k"];

  const getPieceSymbol = (p: string, color: string) => {
    if (color === "w") {
      return p === "p" ? "♙" : p === "n" ? "♘" : p === "b" ? "♗" : p === "r" ? "♖" : p === "q" ? "♕" : "♔";
    }
    return p === "p" ? "♟" : p === "n" ? "♞" : p === "b" ? "♝" : p === "r" ? "♜" : p === "q" ? "♛" : "♚";
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl select-none text-white">
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider flex justify-between">
        <span>White Pieces</span>
        <span>Black Pieces</span>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="flex gap-1.5 flex-wrap justify-center">
          {pieces.map((p) => {
            const isSelected = typeof selectedTool === "object" && selectedTool !== null && selectedTool.type === p && selectedTool.color === "w";
            return (
              <button
                key={"w" + p}
                type="button"
                onClick={() => setSelectedTool({ type: p, color: "w" })}
                className={`w-9 h-9 flex items-center justify-center text-3xl cursor-pointer hover:bg-slate-800 rounded-xl transition-all border ${
                  isSelected ? "bg-blue-600/35 border-blue-500 scale-110 shadow-md" : "border-slate-800 bg-slate-900/50"
                }`}
              >
                <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">
                  {getPieceSymbol(p, "w")}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 flex-wrap justify-center border-l border-slate-800 pl-4">
          {pieces.map((p) => {
            const isSelected = typeof selectedTool === "object" && selectedTool !== null && selectedTool.type === p && selectedTool.color === "b";
            return (
              <button
                key={"b" + p}
                type="button"
                onClick={() => setSelectedTool({ type: p, color: "b" })}
                className={`w-9 h-9 flex items-center justify-center text-3xl cursor-pointer hover:bg-slate-800 rounded-xl transition-all border ${
                  isSelected ? "bg-slate-700/50 border-slate-500 scale-110 shadow-md" : "border-slate-800 bg-slate-900/50"
                }`}
              >
                <span className="text-stone-300 pb-1">
                  {getPieceSymbol(p, "b")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showSpecialTools && (
        <div className="border-t border-slate-800 pt-3 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
            Special Sequence / Target Tools
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedTool("PLUS")}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                selectedTool === "PLUS"
                  ? "bg-emerald-600/30 border-emerald-500 text-emerald-400"
                  : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Plus size={14} className="text-emerald-400" />
              <span>Plus (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTool("MINUS")}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                selectedTool === "MINUS"
                  ? "bg-rose-600/30 border-rose-500 text-rose-400"
                  : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Minus size={14} className="text-rose-400" />
              <span>Minus (-)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTool("TARGET")}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                selectedTool === "TARGET"
                  ? "bg-blue-600/30 border-blue-500 text-blue-400"
                  : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Target size={14} className="text-blue-400" />
              <span>Target</span>
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-slate-800 pt-3 flex gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedTool("TRASH")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-colors ${
            selectedTool === "TRASH"
              ? "bg-rose-950/20 border-rose-500 text-rose-400 shadow-md"
              : "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60"
          }`}
        >
          <Trash2 size={16} />
          <span className="text-[9px] font-black uppercase tracking-wider">Trash</span>
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 transition-colors"
        >
          <Trash2 size={16} className="text-slate-500" />
          <span className="text-[9px] font-black uppercase tracking-wider">Clear</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 transition-colors"
        >
          <RotateCcw size={16} className="text-slate-500" />
          <span className="text-[9px] font-black uppercase tracking-wider">Reset</span>
        </button>
      </div>
    </div>
  );
}

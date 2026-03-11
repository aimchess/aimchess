"use client";

import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { CheckCircle, XCircle, ChevronRight, HelpCircle, Loader2 } from "lucide-react";

interface MCQSolverProps {
  mcq: {
    id: string;
    position: string;
    question: string;
    options: string[];
    correctOptions: number[];
    explanation?: string;
  };
  studentId: string;
  onNext?: () => void;
}

export default function MCQSolver({ mcq, studentId, onNext }: MCQSolverProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [status, setStatus] = useState<"IDLE" | "CORRECT" | "WRONG" | "SUBMITTED">("IDLE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boardWidth, setBoardWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setBoardWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleOption = (idx: number) => {
    if (status !== "IDLE" && status !== "WRONG") return;
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleSubmit = async () => {
    if (selectedIndices.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = 
      selectedIndices.length === mcq.correctOptions.length &&
      selectedIndices.every((idx) => mcq.correctOptions.includes(idx));

    try {
      if (studentId) {
        await fetch("/api/mcq/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, mcqId: mcq.id, isCorrect }),
        });
      }
      setStatus(isCorrect ? "CORRECT" : "WRONG");
    } catch (error) {
      console.error("Failed to save progress", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div ref={containerRef} className="w-full aspect-square rounded-2xl shadow-xl border-4 border-white bg-white overflow-hidden">
          <Chessboard position={mcq.position} boardWidth={boardWidth} />
        </div>

        <div className="flex flex-col gap-6 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="text-sky-500" /> Question
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">{mcq.question}</p>
          </div>

          <div className="space-y-3">
            {mcq.options.map((option, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const isCorrect = mcq.correctOptions.includes(idx);
                let variant = "default";
                if (status === "CORRECT" || status === "WRONG") {
                    if (isCorrect) variant = "correct";
                    else if (isSelected) variant = "wrong";
                } else if (isSelected) variant = "selected";

                return (
                    <button
                        key={idx}
                        onClick={() => toggleOption(idx)}
                        disabled={status === "CORRECT"}
                        className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex items-center gap-3
                        ${variant === "correct" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : 
                          variant === "wrong" ? "bg-red-50 border-red-500 text-red-800" :
                          variant === "selected" ? "bg-sky-50 border-sky-500 text-sky-800" :
                          "bg-white border-gray-100 hover:border-sky-200 text-gray-700"}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                            ${variant === "correct" ? "bg-emerald-500 border-emerald-500 text-white" :
                              variant === "wrong" ? "bg-red-500 border-red-500 text-white" :
                              variant === "selected" ? "bg-sky-500 border-sky-500 text-white" :
                              "border-gray-200"}`}>
                            {variant === "correct" ? <CheckSquare size={14} /> : variant === "wrong" ? <X size={14} /> : (idx + 1)}
                        </div>
                        {option}
                    </button>
                );
            })}
          </div>

          <div className="pt-4">
            {status === "CORRECT" ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                   <CheckCircle /> Correct! Well done.
                </div>
                {mcq.explanation && (
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-sky-800 text-sm italic">
                        <b>Explanation:</b> {mcq.explanation}
                    </div>
                )}
                {onNext && (
                   <button onClick={onNext} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2">
                      Next MCQ <ChevronRight />
                   </button>
                )}
              </div>
            ) : status === "WRONG" ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 font-bold flex items-center gap-2">
                   <XCircle /> Not quite. Try again!
                </div>
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-sky-600 flex items-center justify-center gap-2">
                   {isSubmitting ? <Loader2 className="animate-spin" /> : "Try Again"}
                </button>
              </div>
            ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={selectedIndices.length === 0 || isSubmitting}
                  className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Check Answer"}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckSquare({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>; }
function X({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>; }

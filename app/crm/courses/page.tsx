"use client";

import React, { useEffect, useState, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import CRMShellLayout from "@/components/crm/crm-shell";
import AudioRecorder from "@/components/AudioRecorder";
import {
    BookOpen, Plus, Edit, Trash2, ArrowLeft, Save, Loader2,
    ChevronRight, RotateCcw, Settings, X,
} from "lucide-react";

type Tool = { type: string; color: "w" | "b" } | "TRASH" | null;

const BoardSetupPalette = ({ selectedTool, setSelectedTool, onClear, onReset }: any) => {
    const pieces = ["p", "n", "b", "r", "q", "k"];
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm select-none">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex justify-between"><span>White</span><span>Black</span></div>
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex gap-1 flex-wrap justify-center">
                    {pieces.map((p) => (
                        <div key={"w" + p} onClick={() => setSelectedTool({ type: p, color: "w" })}
                            className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent ${selectedTool?.type === p && selectedTool?.color === "w" ? "bg-sky-100 border-sky-500 scale-110" : ""}`}>
                            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pb-1">
                                {p === "p" ? "♟" : p === "n" ? "♞" : p === "b" ? "♝" : p === "r" ? "♜" : p === "q" ? "♛" : "♚"}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1 flex-wrap justify-center border-l pl-4">
                    {pieces.map((p) => (
                        <div key={"b" + p} onClick={() => setSelectedTool({ type: p, color: "b" })}
                            className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-100 rounded transition-all border border-transparent ${selectedTool?.type === p && selectedTool?.color === "b" ? "bg-slate-200 border-slate-500 scale-110" : ""}`}>
                            <span className="text-black pb-1">
                                {p === "p" ? "♟" : p === "n" ? "♞" : p === "b" ? "♝" : p === "r" ? "♜" : p === "q" ? "♛" : "♚"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t pt-3 flex gap-2">
                <button onClick={() => setSelectedTool("TRASH")} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-red-50 transition-colors ${selectedTool === "TRASH" ? "bg-red-100 text-red-600 ring-1 ring-red-500" : "text-gray-500"}`}>
                    <Trash2 size={16} /><span className="text-[10px] font-bold">TRASH</span>
                </button>
                <button onClick={onClear} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
                    <Trash2 size={16} className="text-gray-400" /><span className="text-[10px] font-bold">CLEAR</span>
                </button>
                <button onClick={onReset} className="flex-1 flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-gray-500">
                    <RotateCcw size={16} className="text-gray-400" /><span className="text-[10px] font-bold">RESET</span>
                </button>
            </div>
        </div>
    );
};

export default function CoursesPage() {
    const [view, setView] = useState<"LIST" | "EDIT_COURSE">("LIST");
    const [courses, setCourses] = useState<any[]>([]);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1);
    const game = useRef(new Chess());
    const [chapterFen, setChapterFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [selectedTool, setSelectedTool] = useState<Tool>(null);
    const [boardWidth, setBoardWidth] = useState(500);
    const boardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!boardContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) setBoardWidth(entry.contentRect.width);
        });
        observer.observe(boardContainerRef.current);
        return () => observer.disconnect();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/courses");
            if (res.ok) setCourses(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleCreateCourse = () => {
        setEditingCourse({ title: "", description: "", level: "BEGINNER", chapters: [], audioUrl: null });
        setView("EDIT_COURSE");
        setActiveChapterIndex(-1);
    };

    const handleDeleteCourse = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            const res = await fetch("/api/courses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
            if (res.ok) fetchCourses();
            else alert("Failed to delete course");
        } catch (e) { console.error(e); }
    };

    const saveCourse = async () => {
        try {
            const method = editingCourse.id ? "PUT" : "POST";
            const res = await fetch("/api/courses", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingCourse) });
            if (res.ok) { alert("Course saved!"); fetchCourses(); setView("LIST"); }
            else alert("Failed to save course");
        } catch (e) { console.error(e); alert("Error saving course"); }
    };

    const updateBoard = () => {
        const fen = game.current.fen();
        setChapterFen(fen);
        if (activeChapterIndex > -1) {
            const updatedChapters = [...editingCourse.chapters];
            updatedChapters[activeChapterIndex] = { ...updatedChapters[activeChapterIndex], fen };
            setEditingCourse({ ...editingCourse, chapters: updatedChapters });
        }
    };

    const onSquareClick = (square: string) => {
        if (activeChapterIndex === -1 || !selectedTool) return;
        if (selectedTool === "TRASH") game.current.remove(square as any);
        else game.current.put({ type: selectedTool.type as any, color: selectedTool.color as any }, square as any);
        updateBoard();
    };

    const onPieceDrop = (source: string, target: string) => {
        if (activeChapterIndex === -1) return false;
        const p = game.current.get(source as any);
        if (!p) return false;
        game.current.remove(source as any);
        game.current.put(p, target as any);
        updateBoard();
        return true;
    };

    const onSquareRightClick = (square: string) => {
        game.current.remove(square as any);
        updateBoard();
    };

    const levelColors: Record<string, string> = {
        BEGINNER: "bg-emerald-50 text-emerald-700",
        INTERMEDIATE: "bg-sky-50 text-sky-700",
        ADVANCED: "bg-indigo-50 text-indigo-700",
    };

    if (view === "LIST") {
        return (
            <CRMShellLayout>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <BookOpen className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Courses ({courses.length})</h2>
                                <p className="text-xs text-gray-500">Create and manage chess courses with chapters</p>
                            </div>
                        </div>
                        <button onClick={handleCreateCourse}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Plus size={16} /> Create Course
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                            <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
                            <p className="text-sm font-medium">No courses found</p>
                            <p className="text-xs mt-1">Click &quot;Create Course&quot; to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((c) => (
                                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between h-48">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${levelColors[c.level] || "bg-gray-100 text-gray-700"}`}>{c.level}</span>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2 mb-1 truncate">{c.title}</h3>
                                        <p className="text-sm text-gray-500">{c.chapters?.length || 0} Lessons</p>
                                    </div>
                                    <button onClick={() => { setEditingCourse(c); setView("EDIT_COURSE"); setActiveChapterIndex(-1); }}
                                        className="w-full mt-3 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                        <Edit size={14} /> Edit Course
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CRMShellLayout>
        );
    }

    // EDIT COURSE VIEW
    return (
        <CRMShellLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
                <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView("LIST")} className="hover:bg-gray-100 p-2 rounded-xl transition-colors text-gray-500"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{editingCourse.title || "New Course"}</h2>
                            <p className="text-xs text-gray-500">Course Editor</p>
                        </div>
                    </div>
                    <button onClick={saveCourse} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 bg-gray-50/50 flex flex-col shrink-0 max-h-[40vh] lg:max-h-full">
                        <div className="p-4 space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">Settings</label>
                            <input className="w-full border border-gray-200 p-2.5 rounded-xl bg-white focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none text-sm" placeholder="Course Title"
                                value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
                            <select className="w-full border border-gray-200 p-2.5 rounded-xl bg-white text-sm" value={editingCourse.level} onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                            <div className="pt-2">
                                <AudioRecorder
                                    onRecordingComplete={(url) => setEditingCourse({ ...editingCourse, audioUrl: url })}
                                    initialAudio={editingCourse.audioUrl}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-6 mb-2"><span className="text-xs font-bold text-gray-400 uppercase">Chapters</span></div>
                            <button onClick={() => {
                                const newChap = { title: "New Lesson", content: "", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
                                const newChaps = [...editingCourse.chapters, newChap];
                                setEditingCourse({ ...editingCourse, chapters: newChaps });
                                setActiveChapterIndex(newChaps.length - 1);
                                game.current.load(newChap.fen);
                                setChapterFen(newChap.fen);
                            }} className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 font-bold py-2 rounded-xl hover:border-sky-400 hover:text-sky-500 transition-colors text-sm">
                                + Add Lesson
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                            {editingCourse.chapters.map((chap: any, idx: number) => (
                                <div key={idx} onClick={() => { setActiveChapterIndex(idx); game.current.load(chap.fen); setChapterFen(chap.fen); }}
                                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all border ${activeChapterIndex === idx ? "bg-sky-50 border-sky-400 ring-1 ring-sky-400" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeChapterIndex === idx ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-500"}`}>{idx + 1}</span>
                                    <div className="truncate text-sm font-medium text-gray-700">{chap.title || "Untitled"}</div>
                                    <button onClick={(e) => { e.stopPropagation(); const nc = editingCourse.chapters.filter((_: any, i: number) => i !== idx); setEditingCourse({ ...editingCourse, chapters: nc }); if (activeChapterIndex === idx) setActiveChapterIndex(-1); }}
                                        className="ml-auto text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Editor */}
                    <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
                        {activeChapterIndex !== -1 ? (
                            <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-5 flex flex-col gap-4 h-full">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                                        <input className="text-xl font-bold bg-transparent border-b border-gray-100 focus:border-sky-500 outline-none pb-2 w-full mb-4 text-gray-900"
                                            value={editingCourse.chapters[activeChapterIndex].title}
                                            onChange={(e) => { const nc = [...editingCourse.chapters]; nc[activeChapterIndex].title = e.target.value; setEditingCourse({ ...editingCourse, chapters: nc }); }}
                                            placeholder="Lesson Title" />
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2">Coach Notes / Script</label>
                                            <textarea className="flex-1 w-full border border-gray-200 rounded-xl p-4 resize-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none text-sm leading-relaxed text-gray-600 bg-gray-50"
                                                placeholder="Write instructions for the coach here..."
                                                value={editingCourse.chapters[activeChapterIndex].content}
                                                onChange={(e) => { const nc = [...editingCourse.chapters]; nc[activeChapterIndex].content = e.target.value; setEditingCourse({ ...editingCourse, chapters: nc }); }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-7 flex flex-col gap-4">
                                    <div ref={boardContainerRef} className="bg-white p-1 rounded-2xl shadow-lg border border-gray-200 w-full max-w-[550px] mx-auto">
                                        <Chessboard position={chapterFen} onPieceDrop={onPieceDrop} onSquareClick={onSquareClick} onSquareRightClick={onSquareRightClick} boardWidth={boardWidth} />
                                    </div>
                                    <BoardSetupPalette selectedTool={selectedTool} setSelectedTool={setSelectedTool} onClear={() => { game.current.clear(); updateBoard(); }} onReset={() => { game.current.reset(); updateBoard(); }} />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
                                <Settings size={80} className="mb-4 text-gray-200" />
                                <p className="text-xl font-bold text-gray-400">Select a lesson from the sidebar to edit</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CRMShellLayout>
    );
}

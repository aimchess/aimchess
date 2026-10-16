"use client";

import { useState, useEffect, useRef } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
    Loader2, FileUp, BookOpen, CheckCircle, AlertCircle,
    ChevronRight, Sparkles, Layers, RefreshCw, Eye, Edit3,
    Trash2, ExternalLink, ShieldCheck, ChevronDown, ChevronUp,
    FileText, HelpCircle, Check, PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ParsedChapterPreview {
    order: number;
    title: string;
    fen: string;
    movesCount: number;
    moves: string[];
    notes: string;
    rawPgn: string;
    isValid: boolean;
}

interface ParsedPreviewData {
    suggestedTitle: string;
    suggestedLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    description: string;
    totalGames: number;
    validGames: number;
    chapters: ParsedChapterPreview[];
}

export default function SyllabusUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pastedPgn, setPastedPgn] = useState("");
    const [inputMode, setInputMode] = useState<"FILE" | "PASTE">("FILE");
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewData, setPreviewData] = useState<ParsedPreviewData | null>(null);

    // Editable form state for confirmed submission
    const [courseTitle, setCourseTitle] = useState("");
    const [courseLevel, setCourseLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">("BEGINNER");
    const [courseDescription, setCourseDescription] = useState("");
    const [chapters, setChapters] = useState<ParsedChapterPreview[]>([]);
    const [expandedChapterIndex, setExpandedChapterIndex] = useState<number | null>(null);

    // Existing courses list
    const [existingCourses, setExistingCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [repairingCourseId, setRepairingCourseId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch existing courses on mount
    const fetchExistingCourses = async () => {
        setLoadingCourses(true);
        try {
            const res = await fetch("/api/syllabus/upload");
            if (res.ok) {
                const data = await res.json();
                setExistingCourses(data);
            }
        } catch (err) {
            console.error("Failed to fetch existing courses", err);
        } finally {
            setLoadingCourses(false);
        }
    };

    useEffect(() => {
        fetchExistingCourses();
    }, []);

    // Handle file selection and trigger instant preview
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            await parsePgnFile(selectedFile);
        }
    };

    // Trigger PGN parsing to generate the preview
    const parsePgnFile = async (fileToParse: File) => {
        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", fileToParse);
            formData.append("preview", "true");

            const res = await fetch("/api/syllabus/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data: ParsedPreviewData = await res.json();
                setPreviewData(data);
                setCourseTitle(data.suggestedTitle);
                setCourseLevel(data.suggestedLevel);
                setCourseDescription(data.description);
                setChapters(data.chapters);
                toast.success(`Parsed ${data.totalGames} lessons successfully! Review details below.`);
            } else {
                const err = await res.text();
                toast.error(`Parsing error: ${err}`);
            }
        } catch (error) {
            toast.error("Failed to parse PGN file.");
        } finally {
            setIsParsing(false);
        }
    };

    // Parse pasted PGN text
    const handleParsePastedText = async () => {
        if (!pastedPgn.trim()) {
            toast.error("Please paste PGN content first.");
            return;
        }

        const blob = new Blob([pastedPgn], { type: "text/plain" });
        const textFile = new File([blob], "pasted_syllabus.pgn", { type: "text/plain" });
        setFile(textFile);
        await parsePgnFile(textFile);
    };

    // Submit confirmed course and chapters to backend
    const handleConfirmCreate = async () => {
        if (!courseTitle.trim()) {
            toast.error("Course title is required.");
            return;
        }

        if (chapters.length === 0) {
            toast.error("No chapters to create.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: courseTitle.trim(),
                level: courseLevel,
                description: courseDescription.trim(),
                chapters: chapters.map((ch, idx) => ({
                    title: ch.title,
                    order: ch.order || idx + 1,
                    fen: ch.fen,
                    content: ch.rawPgn,
                    rawPgn: ch.rawPgn
                }))
            };

            const res = await fetch("/api/syllabus/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(
                    `Successfully created Course: "${data.course.title}" with ${data.course.chapters.length} lessons!`
                );
                // Reset state
                setFile(null);
                setPastedPgn("");
                setPreviewData(null);
                setChapters([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
                // Refresh courses list
                await fetchExistingCourses();
            } else {
                const err = await res.text();
                toast.error(`Upload failed: ${err}`);
            }
        } catch (error) {
            toast.error("An error occurred during course creation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Inline edit for chapter title
    const handleChapterTitleChange = (index: number, newTitle: string) => {
        setChapters(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], title: newTitle };
            return copy;
        });
    };

    // Repair legacy courses that have generic titles
    const handleRepairCourse = async (courseId: string) => {
        setRepairingCourseId(courseId);
        try {
            const res = await fetch("/api/syllabus/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REPAIR_COURSE", courseId })
            });

            if (res.ok) {
                toast.success("Successfully reparsed and updated chapter titles and level!");
                await fetchExistingCourses();
            } else {
                toast.error("Failed to repair course.");
            }
        } catch (err) {
            toast.error("Error repairing course.");
        } finally {
            setRepairingCourseId(null);
        }
    };

    const levelBadgeStyle = (lvl: string) => {
        switch (lvl) {
            case "BEGINNER":
                return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
            case "INTERMEDIATE":
                return "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20";
            case "ADVANCED":
                return "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20";
            case "EXPERT":
                return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/20";
        }
    };

    return (
        <CRMShellLayout>
            <div className="space-y-8 max-w-6xl mx-auto pb-12">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-[#0b1d3a] via-[#162e5b] to-[#0d47a1] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                            <Sparkles size={14} className="text-yellow-400" /> Curriculum Studio & Auto-Builder
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
                            PGN Syllabus Upload
                        </h1>
                        <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
                            Upload a multi-game PGN file to automatically create a complete, level-wise chess course.
                            All individual lessons, custom chapter titles, interactive moves, and coach scripts are detected automatically.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-2 text-xs font-semibold text-sky-200">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg">BG1 - BG3 Beginner</span>
                            <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-lg">Intermediate 1 - 3</span>
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-lg">Advanced</span>
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-lg">Expert</span>
                        </div>
                    </div>
                    <BookOpen size={260} className="absolute -right-16 -bottom-16 text-white/5 pointer-events-none" />
                </div>

                {/* Upload & Builder Workspace */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                    {/* Input Mode Selector */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Provide Curriculum PGN</h2>
                                <p className="text-xs text-gray-500">Choose a .pgn file containing multiple lessons or paste notation directly</p>
                            </div>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setInputMode("FILE")}
                                className={`px-4 py-1.5 rounded-lg transition-all ${inputMode === "FILE" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => setInputMode("PASTE")}
                                className={`px-4 py-1.5 rounded-lg transition-all ${inputMode === "PASTE" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Paste PGN
                            </button>
                        </div>
                    </div>

                    {/* Mode A: File Upload */}
                    {inputMode === "FILE" && (
                        <div className="border-2 border-dashed border-gray-200 hover:border-sky-400 rounded-2xl p-8 sm:p-12 bg-gray-50/60 hover:bg-sky-50/30 transition-all text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-sky-600 mb-4">
                                <FileUp size={32} />
                            </div>
                            <h3 className="text-base font-bold text-gray-800 mb-1">Select Multi-Game PGN File</h3>
                            <p className="text-gray-500 text-xs sm:text-sm max-w-md mb-6">
                                Supports standard multi-game PGNs. Tags like [Chapter], [Event], [Round], [FEN], and coach notes {"{...}"} will be mapped into individual lessons.
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pgn,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                                id="pgn-file-input"
                            />
                            <label
                                htmlFor="pgn-file-input"
                                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-sky-600/20 text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FileUp size={18} /> Choose PGN File
                            </label>

                            {file && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-sky-200 text-sky-800 text-xs font-semibold shadow-sm">
                                    <CheckCircle size={14} className="text-emerald-500" />
                                    <span>{file.name}</span>
                                    <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mode B: Direct Text Paste */}
                    {inputMode === "PASTE" && (
                        <div className="space-y-4">
                            <textarea
                                value={pastedPgn}
                                onChange={(e) => setPastedPgn(e.target.value)}
                                rows={8}
                                placeholder="Paste complete PGN containing multiple [Event ...] or [Chapter ...] games here..."
                                className="w-full border border-gray-200 rounded-2xl p-4 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none leading-relaxed bg-gray-50 text-gray-800"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleParsePastedText}
                                    disabled={!pastedPgn.trim() || isParsing}
                                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {isParsing ? "Parsing Notation..." : "Parse Pasted PGN"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Parsing Spinner */}
                    {isParsing && (
                        <div className="py-8 flex flex-col items-center justify-center text-sky-600 space-y-2">
                            <Loader2 size={36} className="animate-spin" />
                            <p className="text-sm font-bold text-gray-700">Analyzing PGN structure, validating games and moves...</p>
                        </div>
                    )}

                    {/* Preview & Course Configuration Section */}
                    {previewData && !isParsing && (
                        <div className="border border-sky-100 bg-sky-50/20 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Curriculum Preview & Configuration</h3>
                                        <p className="text-xs text-gray-500">Verify detected course details and customize titles before saving</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <span className="bg-white px-3 py-1.5 rounded-xl border border-sky-200 text-sky-900 shadow-sm flex items-center gap-1.5">
                                        <Layers size={14} className="text-sky-600" />
                                        <strong>{chapters.length}</strong> Lessons Detected
                                    </span>
                                    <span className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 shadow-sm flex items-center gap-1.5">
                                        <CheckCircle size={14} className="text-emerald-600" />
                                        All Games Validated
                                    </span>
                                </div>
                            </div>

                            {/* Course Metadata Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-6 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        placeholder="e.g. BG1 - Fundamentals & Board Coordinates"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Course Level
                                    </label>
                                    <select
                                        value={courseLevel}
                                        onChange={(e) => setCourseLevel(e.target.value as any)}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 outline-none"
                                    >
                                        <option value="BEGINNER">BEGINNER (BG1, BG2, BG3)</option>
                                        <option value="INTERMEDIATE">INTERMEDIATE (IM1, IM2, IM3)</option>
                                        <option value="ADVANCED">ADVANCED (AD1, AD2)</option>
                                        <option value="EXPERT">EXPERT (Master Level)</option>
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Level Badge
                                    </label>
                                    <div className="h-[42px] flex items-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ring-2 ${levelBadgeStyle(courseLevel)}`}>
                                            {courseLevel}
                                        </span>
                                    </div>
                                </div>

                                <div className="md:col-span-12 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={courseDescription}
                                        onChange={(e) => setCourseDescription(e.target.value)}
                                        placeholder="Brief overview of curriculum topics and objectives..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Chapters Table */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <FileText size={16} className="text-sky-600" />
                                        Individual Lessons ({chapters.length})
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                        Click a lesson to view moves and coach script
                                    </span>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm max-h-[480px] overflow-y-auto">
                                    {chapters.map((ch, idx) => {
                                        const isExpanded = expandedChapterIndex === idx;
                                        return (
                                            <div key={idx} className="transition-colors hover:bg-gray-50/70">
                                                <div className="p-3.5 sm:p-4 flex items-center gap-3">
                                                    {/* Order Index */}
                                                    <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 font-black text-xs flex items-center justify-center shrink-0 border border-gray-200">
                                                        {ch.order || idx + 1}
                                                    </span>

                                                    {/* Editable Chapter Title */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={ch.title}
                                                                onChange={(e) => handleChapterTitleChange(idx, e.target.value)}
                                                                className="w-full font-bold text-sm text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-sky-500 focus:bg-white px-1.5 py-0.5 rounded outline-none transition-all truncate"
                                                                title="Click to edit lesson title"
                                                            />
                                                        </div>
                                                        {ch.notes && (
                                                            <p className="text-xs text-gray-500 line-clamp-1 px-1.5 mt-0.5">
                                                                {ch.notes}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Move Count Badge */}
                                                    <div className="shrink-0 flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100 flex items-center gap-1">
                                                            <PlayCircle size={12} /> {ch.movesCount} {ch.movesCount === 1 ? "move" : "moves"}
                                                        </span>

                                                        <button
                                                            onClick={() => setExpandedChapterIndex(isExpanded ? null : idx)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                            title={isExpanded ? "Collapse" : "Expand"}
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-1 bg-gray-50/50 border-t border-gray-100 text-xs space-y-2 animate-in fade-in duration-150">
                                                        {ch.moves.length > 0 && (
                                                            <div>
                                                                <span className="font-bold text-gray-600 block mb-1">PGN Moves:</span>
                                                                <div className="bg-white p-2.5 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-800 overflow-x-auto leading-relaxed">
                                                                    {ch.moves.map((m, mIdx) => {
                                                                        const isWhite = mIdx % 2 === 0;
                                                                        const moveNum = Math.floor(mIdx / 2) + 1;
                                                                        return (
                                                                            <span key={mIdx} className="mr-1.5">
                                                                                {isWhite ? <strong className="text-gray-400">{moveNum}.</strong> : ""} {m}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {ch.notes && (
                                                            <div>
                                                                <span className="font-bold text-gray-600 block mb-1">Coach Flow & Notes:</span>
                                                                <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                                    {ch.notes}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {ch.fen && ch.fen !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" && (
                                                            <div className="text-[11px] text-gray-500 font-mono">
                                                                <strong>Starting FEN:</strong> {ch.fen}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Final Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-sky-100">
                                <button
                                    onClick={() => {
                                        setPreviewData(null);
                                        setFile(null);
                                        setPastedPgn("");
                                        setChapters([]);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    Cancel & Upload Different File
                                </button>

                                <button
                                    onClick={handleConfirmCreate}
                                    disabled={isSubmitting || chapters.length === 0}
                                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    {isSubmitting ? "Creating Course & Lessons..." : `Confirm & Create Course (${chapters.length} Lessons)`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Existing Courses Section */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="text-sky-600" size={20} />
                                Existing Curriculum Courses ({existingCourses.length})
                            </h2>
                            <p className="text-xs text-gray-500">
                                Courses available for coaches and students. You can view, verify or repair lesson titles.
                            </p>
                        </div>

                        <button
                            onClick={fetchExistingCourses}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors"
                        >
                            <RefreshCw size={12} className={loadingCourses ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>

                    {loadingCourses ? (
                        <div className="py-12 flex justify-center text-gray-400">
                            <Loader2 size={28} className="animate-spin text-sky-600" />
                        </div>
                    ) : existingCourses.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 border border-dashed rounded-2xl">
                            No courses found. Upload your first PGN syllabus above!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {existingCourses.map((c) => {
                                const hasGenericLessonTitles = c.chapters?.some(
                                    (ch: any) => ch.title.toLowerCase().includes("aim curriculum vs student practice")
                                );

                                return (
                                    <div
                                        key={c.id}
                                        className="bg-gray-50/70 border border-gray-100 hover:border-sky-300 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${levelBadgeStyle(c.level)}`}>
                                                    {c.level}
                                                </span>
                                                <span className="text-xs font-bold text-gray-500">
                                                    {c.chapters?.length || 0} Lessons
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                                                {c.title}
                                            </h3>

                                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                                {c.description || "Auto-generated chess syllabus."}
                                            </p>

                                            {hasGenericLessonTitles && (
                                                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800">
                                                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span>Contains legacy placeholder titles.</span>
                                                        <button
                                                            onClick={() => handleRepairCourse(c.id)}
                                                            disabled={repairingCourseId === c.id}
                                                            className="block font-bold text-sky-700 hover:underline mt-0.5"
                                                        >
                                                            {repairingCourseId === c.id ? "Repairing..." : "Fix Lesson Titles Now"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between gap-2 text-xs">
                                            <Link
                                                href={`/crm/courses`}
                                                className="text-gray-600 hover:text-gray-900 font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <Edit3 size={12} /> Edit Course
                                            </Link>

                                            <Link
                                                href={`/crm/coach-library`}
                                                className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <ExternalLink size={12} /> Open Library
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </CRMShellLayout>
    );
}

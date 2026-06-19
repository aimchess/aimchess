"use client";

import { useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { Loader2, FileUp, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function SyllabusUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/syllabus/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Successfully created Course: ${data.course.title} with ${data.course.chapters.length} chapters.`);
                setFile(null);
            } else {
                const error = await res.text();
                toast.error(`Upload failed: ${error}`);
            }
        } catch (error) {
            toast.error("An error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-blue-900 to-sky-900 rounded-2xl p-6 md:p-8 text-white flex items-center gap-6 shadow-xl relative overflow-hidden">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-md relative z-10">
                        <FileUp size={32} className="text-sky-300" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">PGN Syllabus Upload</h1>
                        <p className="text-sky-200 text-sm">Upload a .pgn file to automatically create a new Course and Chapters.</p>
                    </div>
                    <BookOpen size={150} className="absolute -right-10 opacity-10" />
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 bg-gray-50 mb-6 flex flex-col items-center justify-center">
                        <FileUp size={48} className="text-gray-400 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Select PGN File</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm">The file should contain one or multiple games. Each game will become a chapter in the course.</p>
                        
                        <label className="bg-white border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm text-sm">
                            Choose File
                            <input type="file" accept=".pgn" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>

                    {file && (
                        <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-center justify-between text-left mb-6">
                            <div>
                                <p className="font-bold text-sky-900 text-sm">{file.name}</p>
                                <p className="text-sky-600 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                            <button 
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {uploading && <Loader2 size={16} className="animate-spin" />}
                                {uploading ? 'Processing...' : 'Upload & Create'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </CRMShellLayout>
    );
}

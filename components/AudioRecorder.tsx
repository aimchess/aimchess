'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Volume2, Loader2, Play, Pause } from 'lucide-react';

interface AudioRecorderProps {
    onRecordingComplete: (base64Audio: string | null) => void;
    initialAudio?: string | null;
}

export default function AudioRecorder({ onRecordingComplete, initialAudio }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(initialAudio || null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setAudioURL(base64String);
                    onRecordingComplete(base64String);
                };

                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const deleteRecording = () => {
        setAudioURL(null);
        onRecordingComplete(null);
        setIsPlaying(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlayback = () => {
        if (audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
            } else {
                audioPlayerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice Instructions</label>
                {isRecording && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono font-bold text-red-500">{formatTime(recordingTime)}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {!audioURL ? (
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isRecording
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                    >
                        {isRecording ? <Square size={16} /> : <Mic size={16} />}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                ) : (
                    <div className="flex items-center gap-2 w-full">
                        <button
                            type="button"
                            onClick={togglePlayback}
                            className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <div className="flex-1 bg-white h-2 rounded-full overflow-hidden border">
                            <div
                                className="bg-orange-500 h-full transition-all duration-300"
                                style={{ width: isPlaying ? '100%' : '0%' }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={deleteRecording}
                            className="p-2 text-slate-400 hover:text-red-500 transition"
                            title="Delete Recording"
                        >
                            <Trash2 size={16} />
                        </button>
                        <audio
                            ref={audioPlayerRef}
                            src={audioURL}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Record a short voice instruction for the student.</p>
        </div>
    );
}

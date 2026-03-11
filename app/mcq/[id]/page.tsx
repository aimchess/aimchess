"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MCQSolver from "@/components/MCQSolver";
import { ArrowLeft, Loader2, SkipForward } from "lucide-react";

export default function MCQPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const mcqId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const folderId = searchParams.get("folderId") || null;

  const [mcq, setMcq] = useState<any>(null);
  const [nextMcqId, setNextMcqId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }
    if (status !== "authenticated" || !mcqId) return;

    const loadMcq = async () => {
      try {
        const res = await fetch(`/api/mcq/${mcqId}`);
        if (!res.ok) throw new Error("MCQ not found.");
        const data = await res.json();
        setMcq(data);

        // Fetch Next MCQ ID if folderId exists
        if (folderId) {
            const nextRes = await fetch(`/api/content/next?folderId=${folderId}&currentId=${mcqId}&type=MCQ`);
            if (nextRes.ok) {
                const nextData = await nextRes.json();
                setNextMcqId(nextData?.id || null);
            }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load MCQ");
      }
    };

    loadMcq();
  }, [status, mcqId, folderId, router]);

  const handleNext = () => {
    if (nextMcqId) {
      router.push(`/mcq/${nextMcqId}?folderId=${folderId}`);
    } else {
      router.push("/learn");
    }
  };

  if (error) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!mcq || status === "loading") return <div className="h-screen flex items-center justify-center text-sky-500 font-bold"><Loader2 className="animate-spin mr-2"/> Loading MCQ...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Training Exercise</h1>
            <span className="inline-block mt-1 px-3 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 uppercase">
                {mcq.stage} MCQ
            </span>
          </div>
          <button onClick={handleNext} className="flex items-center gap-2 font-bold text-gray-400 hover:text-gray-600 transition-colors">
            Skip <SkipForward size={20} />
          </button>
        </div>

        <MCQSolver 
            mcq={mcq} 
            studentId={(session?.user as any)?.id} 
            onNext={nextMcqId ? handleNext : undefined} 
        />
      </div>
    </div>
  );
}

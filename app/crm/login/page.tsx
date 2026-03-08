"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, Users, GraduationCap, Trophy, Target } from "lucide-react";

export default function CRMLoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (status === "authenticated") {
        router.replace("/crm/dashboard");
        return null;
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) { setError("Invalid email or password"); setLoading(false); return; }
        window.location.href = "/crm/dashboard";
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-3deg); } }
        @keyframes float3 { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-25px) scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .float1 { animation: float 6s ease-in-out infinite; }
        .float2 { animation: float2 8s ease-in-out infinite; }
        .float3 { animation: float3 7s ease-in-out infinite; }
        .shimmer-text { background: linear-gradient(90deg, #fff 0%, #38bdf8 50%, #fff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
      `}</style>

            {/* ========= MOBILE HEADER (shown < lg) ========= */}
            <div
                className="lg:hidden w-full py-8 px-6 relative overflow-hidden flex flex-col items-center"
                style={{ background: "linear-gradient(160deg, #020617 0%, #0c1445 50%, #1e3a5f 100%)" }}
            >
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }} />
                <div className="absolute top-[-30%] left-[-20%] w-60 h-60 rounded-full bg-sky-600/20 blur-[80px]" />
                <div className="absolute bottom-[-30%] right-[-20%] w-60 h-60 rounded-full bg-indigo-600/15 blur-[80px]" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-4">
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 blur-md opacity-60 animate-pulse" />
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-xl p-2">
                            <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-contain rounded-xl" />
                        </div>
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">AIM Chess Academy</h2>
                    <p className="shimmer-text text-xs font-semibold tracking-widest uppercase mt-1">Achieve • Inspire • Maintain</p>
                </div>
            </div>

            {/* ========= LEFT PANEL — Desktop Only ========= */}
            <div
                className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center"
                style={{ background: "linear-gradient(160deg, #020617 0%, #0c1445 30%, #1e3a5f 60%, #0f172a 100%)" }}
            >
                <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-600/15 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
                <div className="absolute top-[40%] right-[15%] w-[200px] h-[200px] rounded-full bg-blue-500/8 blur-[80px] animate-pulse" style={{ animationDelay: "4s" }} />

                <div className="absolute top-[8%] left-[12%] text-white/[0.06] text-[140px] font-serif select-none float1">♚</div>
                <div className="absolute bottom-[10%] right-[8%] text-white/[0.06] text-[120px] font-serif select-none float2">♛</div>
                <div className="absolute top-[60%] left-[5%] text-white/[0.04] text-[90px] font-serif select-none float3">♞</div>
                <div className="absolute top-[15%] right-[12%] text-white/[0.04] text-[80px] font-serif select-none float2">♜</div>

                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }} />

                <div className="relative z-10 px-12 xl:px-16 max-w-lg w-full">
                    <div className="relative w-28 h-28 xl:w-36 xl:h-36 mx-auto mb-8 xl:mb-10">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 blur-md opacity-60 animate-pulse" />
                        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-2xl shadow-sky-500/30 p-2 xl:p-3">
                            <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-contain rounded-2xl" />
                        </div>
                    </div>

                    <div className="text-center mb-8 xl:mb-10">
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white mb-2 tracking-tight">AIM Chess Academy</h2>
                        <p className="shimmer-text text-base xl:text-lg font-semibold tracking-widest uppercase">Achieve • Inspire • Maintain</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8 xl:mb-10">
                        {[
                            { icon: Users, label: "Students", value: "500+", color: "from-sky-400 to-sky-600" },
                            { icon: GraduationCap, label: "Coaches", value: "15+", color: "from-indigo-400 to-indigo-600" },
                            { icon: Trophy, label: "Tournaments", value: "50+", color: "from-amber-400 to-orange-500" },
                            { icon: Target, label: "Win Rate", value: "85%", color: "from-emerald-400 to-emerald-600" },
                        ].map((stat, i) => (
                            <div key={i} className="group bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl p-3 xl:p-4 hover:bg-white/[0.10] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 cursor-default">
                                <div className={`w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 xl:mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="text-white" size={16} />
                                </div>
                                <div className="text-xl xl:text-2xl font-extrabold text-white leading-none mb-1">{stat.value}</div>
                                <div className="text-[10px] xl:text-[11px] font-medium text-white/40 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 xl:p-5">
                        <div className="flex gap-1 mb-2 xl:mb-3">
                            {[1, 2, 3, 4, 5].map(i => (<span key={i} className="text-amber-400 text-sm">★</span>))}
                        </div>
                        <p className="text-white/50 text-xs xl:text-sm leading-relaxed italic mb-3">
                            &ldquo;The CRM has transformed how we manage our academy. Tracking students and payments has never been easier.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                            <div>
                                <div className="text-white/70 text-xs font-semibold">Academy Admin</div>
                                <div className="text-white/30 text-[10px]">AIM Chess Academy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========= RIGHT PANEL — Form ========= */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50 min-h-0">
                <div className="w-full max-w-sm sm:max-w-md">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Sign in to AIM Chess Academy CRM</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 sm:mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                required disabled={loading} placeholder="you@example.com"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 sm:mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required disabled={loading} placeholder="••••••••"
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm pr-12 shadow-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />{error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>) : (<>Sign In <ArrowRight size={16} /></>)}
                        </button>
                    </form>

                    <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/crm/signup" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

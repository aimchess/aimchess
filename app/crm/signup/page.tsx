"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle, Shield, Zap, BarChart3, Clock } from "lucide-react";

export default function CRMSignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) { setError("Passwords do not match"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

        setLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Registration failed");
            router.push("/crm/login?registered=true");
        } catch (error: any) {
            setError(error.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    const passLength = password.length >= 6;
    const passMatch = password === confirmPassword && confirmPassword.length > 0;

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
                        <div className="absolute bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 blur-md opacity-60 animate-pulse" />
                        <div className="relative w-full h-full overflow-hidden bg-white shadow-xl p-2">
                            <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-contain" />
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
                <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-600/12 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

                <div className="absolute top-[8%] right-[10%] text-white/[0.06] text-[140px] font-serif select-none float1">♜</div>
                <div className="absolute bottom-[10%] left-[8%] text-white/[0.06] text-[120px] font-serif select-none float2">♝</div>
                <div className="absolute top-[55%] right-[5%] text-white/[0.04] text-[90px] font-serif select-none float3">♞</div>

                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }} />

                <div className="relative z-10 px-12 xl:px-16 max-w-lg w-full">
                    <div className="relative w-28 h-28 xl:w-32 xl:h-32 mx-auto mb-6 xl:mb-8">
                        <div className="absolute bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 blur-md opacity-60 animate-pulse" />
                        <div className="relative w-full h-full overflow-hidden bg-white shadow-2xl shadow-sky-500/30 p-2 xl:p-3">
                            <img src="/aim-logo.jpeg" alt="AIM Chess Academy" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="text-center mb-8 xl:mb-10">
                        <h2 className="text-3xl xl:text-3xl font-extrabold text-white mb-2 tracking-tight">Join AIM Chess Academy</h2>
                        <p className="shimmer-text text-base font-semibold tracking-widest uppercase">Achieve • Inspire • Maintain</p>
                    </div>

                    <div className="space-y-3 mb-8">
                        {[
                            { icon: Shield, label: "Secure & Role-Based", desc: "Admin and coach access with encryption", color: "from-sky-400 to-sky-600" },
                            { icon: Zap, label: "Real-Time Management", desc: "Instant updates across all modules", color: "from-indigo-400 to-indigo-600" },
                            { icon: BarChart3, label: "Analytics Dashboard", desc: "Track revenue, progress & attendance", color: "from-amber-400 to-orange-500" },
                            { icon: Clock, label: "Batch Scheduling", desc: "Organize classes with smart timetables", color: "from-emerald-400 to-emerald-600" },
                        ].map((feat, i) => (
                            <div key={i} className="group flex items-center gap-3 xl:gap-4 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl px-4 xl:px-5 py-3 xl:py-4 hover:bg-white/[0.10] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-0.5 cursor-default">
                                <div className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    <feat.icon className="text-white" size={18} />
                                </div>
                                <div>
                                    <div className="text-white/90 text-sm font-bold">{feat.label}</div>
                                    <div className="text-white/35 text-xs">{feat.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========= RIGHT PANEL — Form ========= */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 bg-gray-50 min-h-0">
                <div className="w-full max-w-sm sm:max-w-md">
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Get started with AIM Chess Academy</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading}
                                placeholder="John Doe"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                                placeholder="you@example.com"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                    required disabled={loading} placeholder="••••••••" minLength={6}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm pr-12 shadow-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                required disabled={loading} placeholder="••••••••"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm shadow-sm" />
                        </div>

                        {password.length > 0 && (
                            <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs">
                                <span className={`flex items-center gap-1 ${passLength ? "text-emerald-600" : "text-gray-400"}`}>
                                    <CheckCircle size={12} /> 6+ characters
                                </span>
                                {confirmPassword.length > 0 && (
                                    <span className={`flex items-center gap-1 ${passMatch ? "text-emerald-600" : "text-red-500"}`}>
                                        <CheckCircle size={12} /> Passwords match
                                    </span>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />{error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>) : (<>Create Account<ArrowRight size={16} /></>)}
                        </button>
                    </form>

                    <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/crm/login" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-bg-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle in top-right corner */}
      <ThemeToggle isFixed={true} />

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 login-grid pointer-events-none"></div>

      {/* Floating Orbs */}
      <div className="absolute top-[10%] left-[15%] w-80 h-80 bg-blue-600/15 rounded-full blur-[120px] login-orb pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] login-orb-2 pointer-events-none"></div>
      <div className="absolute top-[50%] left-[60%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] login-orb-3 pointer-events-none"></div>

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] login-glow pointer-events-none"></div>

      {/* Floating Particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${8 + Math.random() * 12}s`,
                animationDelay: `${Math.random() * 10}s`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: i % 3 === 0 
                  ? 'rgba(96, 165, 250, 0.4)' 
                  : i % 3 === 1 
                  ? 'rgba(167, 139, 250, 0.4)' 
                  : 'rgba(129, 140, 248, 0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* Login Card */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="login-card bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-blue-900/20 hover:border-slate-700">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 mb-4 transition-transform duration-300 hover:scale-110">
              <span className="text-2xl font-black text-white">AF</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-500 bg-clip-text text-transparent mb-2">
              ApparelFlow ERP
            </h1>
            <p className="text-slate-400 text-sm">
              Cutting & Verification Operations Platform
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center animate-[shake_0.3s_ease-in-out]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  placeholder="supervisor@apparelflow.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick 1-Click Demo Personas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("supervisor@apparelflow.com");
                  setPassword("demo1234");
                }}
                className="px-2.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-blue-300 text-xs font-medium transition-all text-left flex flex-col group"
              >
                <span className="font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                  👔 Supervisor
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">supervisor@...</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("verifier@apparelflow.com");
                  setPassword("demo1234");
                }}
                className="px-2.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-medium transition-all text-left flex flex-col group"
              >
                <span className="font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
                  🔍 Verifier
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">verifier@...</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("sewing@apparelflow.com");
                  setPassword("demo1234");
                }}
                className="px-2.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 text-xs font-medium transition-all text-left flex flex-col group"
              >
                <span className="font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                  🧵 Sewing
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">sewing@...</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Default password: <span className="font-mono text-slate-400">demo1234</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 ApparelFlow ERP — Apparel Manufacturing Platform
        </p>
      </div>
    </div>
  );
}

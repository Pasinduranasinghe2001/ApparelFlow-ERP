"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-blue-900/20 hover:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              ApparelFlow ERP
            </h1>
            <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                placeholder="supervisor@apparelflow.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

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
                className="px-2.5 py-2 rounded-xl bg-slate-950/60 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-blue-300 text-xs font-medium transition-all text-left flex flex-col"
              >
                <span className="font-semibold text-blue-400">👔 Supervisor</span>
                <span className="text-[10px] text-slate-500 truncate">supervisor@...</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("verifier@apparelflow.com");
                  setPassword("demo1234");
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-950/60 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-medium transition-all text-left flex flex-col"
              >
                <span className="font-semibold text-emerald-400">🔍 Verifier</span>
                <span className="text-[10px] text-slate-500 truncate">verifier@...</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("sewing@apparelflow.com");
                  setPassword("demo1234");
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-950/60 hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 text-xs font-medium transition-all text-left flex flex-col"
              >
                <span className="font-semibold text-purple-400">🧵 Sewing</span>
                <span className="text-[10px] text-slate-500 truncate">sewing@...</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Default password: <span className="font-mono text-slate-400">demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

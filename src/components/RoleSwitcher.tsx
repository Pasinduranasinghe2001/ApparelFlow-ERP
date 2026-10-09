"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const DEMO_PERSONAS = [
  {
    role: "cutting_supervisor",
    label: "Supervisor",
    email: "supervisor@apparelflow.com",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: "👔",
  },
  {
    role: "cutting_verifier",
    label: "Verifier (QC)",
    email: "verifier@apparelflow.com",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: "🔍",
  },
  {
    role: "sewing_supervisor",
    label: "Sewing Floor",
    email: "sewing@apparelflow.com",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: "🧵",
  },
];

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitch = async (email: string, targetRole: string) => {
    if (targetRole === currentRole) return;
    setSwitching(targetRole);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: "demo1234",
      });
      if (!res?.error) {
        window.location.href = "/dashboard";
      } else {
        alert("Switch failed: " + res.error);
        setSwitching(null);
      }
    } catch {
      setSwitching(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
      <span className="text-[11px] font-medium text-slate-400 px-2 uppercase tracking-wider hidden md:inline">
        Switch Persona:
      </span>
      {DEMO_PERSONAS.map((p) => {
        const isActive = p.role === currentRole;
        const isLoading = switching === p.role;

        return (
          <button
            key={p.role}
            onClick={() => handleSwitch(p.email, p.role)}
            disabled={isActive || isLoading}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              isActive
                ? `${p.badge} font-bold shadow-sm`
                : "bg-slate-900/60 text-slate-400 border-transparent hover:text-white hover:bg-slate-800"
            } disabled:cursor-default`}
            title={`Switch session to ${p.label}`}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            {isLoading && (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}

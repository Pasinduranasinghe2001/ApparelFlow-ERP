import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

// Tell Next.js this layout must be rendered dynamically (reads auth session).
// Required when nextConfig.cacheComponents is enabled.
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const roleLabels: Record<string, string> = {
    cutting_supervisor: "Cutting Supervisor",
    cutting_verifier: "Verification Terminal",
    sewing_supervisor: "Sewing Queue",
  };

  const roleBadgeColor: Record<string, string> = {
    cutting_supervisor: "from-blue-500 to-blue-600",
    cutting_verifier: "from-emerald-500 to-emerald-600",
    sewing_supervisor: "from-purple-500 to-purple-600",
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold">AF</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">ApparelFlow</h1>
                <p className="text-xs text-blue-400 font-medium">
                  {roleLabels[session.user.role] || "Dashboard"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Role badge */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${roleBadgeColor[session.user.role] || "from-slate-500 to-slate-600"} bg-opacity-10 border border-white/10`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-medium text-white/90">
                  {roleLabels[session.user.role] || session.user.role}
                </span>
              </div>

              <div className="text-sm text-slate-400 hidden xl:block">
                <span className="text-white font-medium">{session.user.name || session.user.email}</span>
              </div>

              {/* Theme Toggle Button */}
              <ThemeToggle isFixed={false} />

              <form
                action={async () => {
                  "use server";
                  // Explicitly redirect to /login after signing out to avoid redirect loops
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

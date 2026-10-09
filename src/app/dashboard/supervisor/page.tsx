import { prisma } from "@/lib/db";
import Link from "next/link";
import { SupervisorOrdersTable } from "@/components/SupervisorOrdersTable";
import { Scissors, Clock, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export const instant = false;

export default async function SupervisorDashboard() {
  const orders = await prisma.cuttingOrder.findMany({
    include: {
      recipe: true,
      creator: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = orders.length;
  const cuttingCount = orders.filter((o) => o.status === "CUTTING_IN_PROGRESS").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING_VERIFICATION").length;
  const verifiedCount = orders.filter((o) => o.status === "VERIFIED").length;
  const totalUnits = orders.reduce((sum, o) => sum + o.targetQty, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Cutting Operations Hub
          </h2>
          <p className="text-slate-400 text-sm">
            Live batch tracking, fabric allocation, and Gatekeeper verification pipeline
          </p>
        </div>
        <Link
          href="/dashboard/supervisor/new"
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          <span>+ New Cutting Order</span>
        </Link>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Batches</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalOrders}</div>
          <span className="text-[11px] text-slate-500">All registered runs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 shadow-lg">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Cutting</span>
            <Scissors className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{cuttingCount}</div>
          <span className="text-[11px] text-blue-400/80">Active floor cutting</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending QC</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
          <span className="text-[11px] text-amber-400/80">At Verification Terminal</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">QC Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{verifiedCount}</div>
          <span className="text-[11px] text-emerald-400/80">Released to Sewing</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Units</span>
            <span className="text-xs font-mono">PCS</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{totalUnits.toLocaleString()}</div>
          <span className="text-[11px] text-purple-400/80">Total scheduled garments</span>
        </div>
      </div>

      {/* Orders Table with Search, Filter & CSV Export */}
      <SupervisorOrdersTable orders={orders as any} />
    </div>
  );
}

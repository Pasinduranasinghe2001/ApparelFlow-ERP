import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export const instant = false;

export default async function SewingDashboard() {
  const verifiedOrders = await prisma.cuttingOrder.findMany({
    where: { 
      status: {
        in: ["VERIFIED", "SEWING_IN_PROGRESS"]
      } 
    },
    include: {
      recipe: true,
      verificationLogs: {
        where: { decision: "APPROVED" },
        include: { verifier: true },
        orderBy: { timestamp: "desc" },
        take: 1,
      },
      verificationItems: {
        include: { component: true },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Sewing Assembly Queue
          </h2>
          <p className="text-slate-400 text-sm">
            Gatekeeper Cleared Batches · Strictly isolated from unverified & rejected cutting orders
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Active Batches: <span className="text-emerald-400 font-bold">{verifiedOrders.length}</span>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Order No</th>
                <th className="px-6 py-4 font-medium">Garment Recipe</th>
                <th className="px-6 py-4 font-medium">Target Qty</th>
                <th className="px-6 py-4 font-medium">Fabric Wastage %</th>
                <th className="px-6 py-4 font-medium">Verifier Attribution</th>
                <th className="px-6 py-4 font-medium">QC Cleared</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-400">
              {verifiedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No verified orders ready for sewing. Unverified & rejected batches are strictly blocked by gatekeeper.
                  </td>
                </tr>
              ) : (
                verifiedOrders.map((order) => {
                  const latestLog = order.verificationLogs[0];
                  const wastage = latestLog?.wastagePct;
                  const isOverCap = wastage !== null && wastage !== undefined && wastage > order.recipe.wastageCap;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <div>{order.orderNo}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{order.fabricRollId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">{order.recipe.name}</div>
                        <div className="text-xs text-slate-500">{order.recipe.category} (Cap: {order.recipe.wastageCap}%)</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                        {order.targetQty} pcs
                      </td>
                      <td className="px-6 py-4">
                        {wastage !== null && wastage !== undefined ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                              isOverCap
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {wastage >= 0 ? `+${wastage}%` : `${wastage}%`}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 font-mono">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {latestLog?.verifier ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>{latestLog.verifier.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Verified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {format(new Date(order.updatedAt), "MMM d, HH:mm")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          order.status === 'VERIFIED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'VERIFIED' ? (
                           <form action={async () => {
                             "use server";
                             await prisma.cuttingOrder.update({
                               where: { id: order.id },
                               data: { status: "SEWING_IN_PROGRESS" }
                             });
                             revalidatePath("/dashboard/sewing");
                           }}>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/20 transition-all text-xs font-semibold"
                            >
                              Start Assembly
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-emerald-400 font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            In Production
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

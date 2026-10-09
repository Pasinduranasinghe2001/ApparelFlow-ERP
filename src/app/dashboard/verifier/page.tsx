import { prisma } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";

export const instant = false;

export default async function VerifierDashboard() {
  const pendingOrders = await prisma.cuttingOrder.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: {
      recipe: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          Quality Control Terminal
        </h2>
        <p className="text-slate-400 text-sm">Verify component counts before releasing to Sewing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingOrders.length === 0 ? (
          <div className="col-span-full p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
            <div className="text-emerald-500 mb-3 text-4xl">✓</div>
            <h3 className="text-white font-medium">All Caught Up!</h3>
            <p className="text-slate-500 text-sm mt-1">No orders pending verification right now.</p>
          </div>
        ) : (
          pendingOrders.map((order) => (
            <div key={order.id} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl hover:border-emerald-500/50 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-emerald-400 text-xs font-bold mb-1 uppercase tracking-wider">Requires Verification</div>
                  <h3 className="text-lg font-bold text-white">{order.orderNo}</h3>
                </div>
                <span className="px-2 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-300">
                  {order.fabricRollId}
                </span>
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Garment:</span>
                  <span className="text-slate-200 font-medium">{order.recipe.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Qty:</span>
                  <span className="text-slate-200 font-medium">{order.targetQty} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ready Since:</span>
                  <span className="text-slate-200 font-medium">{format(new Date(order.updatedAt), "HH:mm, MMM d")}</span>
                </div>
              </div>

              <Link
                href={`/dashboard/verifier/${order.id}`}
                className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-medium text-center transition-colors"
              >
                Start Verification
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

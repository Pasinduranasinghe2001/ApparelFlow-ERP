import { prisma } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { SendToVerificationButton } from "@/components/SendToVerificationButton";

export const instant = false;

export default async function SupervisorDashboard() {
  const orders = await prisma.cuttingOrder.findMany({
    include: {
      recipe: true,
      creator: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Cutting Orders
          </h2>
          <p className="text-slate-400 text-sm">Manage and track production batches</p>
        </div>
        <Link 
          href="/dashboard/supervisor/new"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          + New Order
        </Link>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Order No</th>
                <th className="px-6 py-4 font-medium">Recipe</th>
                <th className="px-6 py-4 font-medium">Target Qty</th>
                <th className="px-6 py-4 font-medium">Fabric Roll</th>
                <th className="px-6 py-4 font-medium">Status & Action</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-400">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No cutting orders found. Create one to get started.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{order.orderNo}</td>
                    <td className="px-6 py-4">{order.recipe.name}</td>
                    <td className="px-6 py-4">{order.targetQty}</td>
                    <td className="px-6 py-4 font-mono text-xs">{order.fabricRollId}</td>
                    <td className="px-6 py-4 flex items-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'CUTTING_IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        order.status === 'PENDING_VERIFICATION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        order.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {order.status === 'CUTTING_IN_PROGRESS' && (
                        <SendToVerificationButton orderId={order.id} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

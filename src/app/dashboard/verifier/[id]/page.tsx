import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VerificationForm } from "@/components/VerificationForm";

export const instant = false;

export default async function VerificationPage({ params }: { params: { id: string } | any }) {
  const resolvedParams = await params;
  const order = await prisma.cuttingOrder.findUnique({
    where: { id: resolvedParams.id },
    include: {
      recipe: true,
      verificationItems: {
        include: {
          component: true
        }
      }
    }
  });

  if (!order || order.status !== "PENDING_VERIFICATION") {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/verifier" className="text-emerald-500 hover:text-emerald-400 font-medium">
          ← Back
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Verify Order: {order.orderNo}
            <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-mono border border-emerald-500/20">
              {order.recipe.name}
            </span>
          </h2>
          <p className="text-slate-400 text-sm">Target Quantity: {order.targetQty} garments</p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h4 className="text-blue-400 font-medium text-sm mb-1">Strict Quality Check</h4>
          <p className="text-slate-300 text-sm">
            Enter the exact physical count of cut parts. If any component is short (RED status), the batch cannot proceed to Sewing. Surpluses (YELLOW) are permitted but logged.
          </p>
        </div>

        <VerificationForm orderId={order.id} items={order.verificationItems} />
      </div>
    </div>
  );
}

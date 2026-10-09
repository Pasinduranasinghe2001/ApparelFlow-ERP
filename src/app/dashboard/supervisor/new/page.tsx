import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const instant = false;

export default async function NewOrderPage() {
  const session = await auth();
  if (!session || session.user.role !== "cutting_supervisor") {
    redirect("/login");
  }

  const recipes = await prisma.recipe.findMany();

  async function createOrder(formData: FormData) {
    "use server";
    
    const recipeId = formData.get("recipeId") as string;
    const targetQty = parseInt(formData.get("targetQty") as string, 10);
    const fabricRollId = (formData.get("fabricRollId") as string)?.trim();
    const actualFabricYds = parseFloat(formData.get("actualFabricYds") as string);

    if (!recipeId) throw new Error("Garment recipe is required.");
    if (isNaN(targetQty) || targetQty <= 0) throw new Error("Target quantity must be a positive integer.");
    if (!fabricRollId) throw new Error("Fabric Roll ID is required.");
    if (isNaN(actualFabricYds) || actualFabricYds <= 0) throw new Error("Actual fabric used must be a positive number.");

    const orderNo = `CO-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    const session = await auth();
    if (!session || session.user.role !== "cutting_supervisor") throw new Error("Unauthorized");

    // Create the order
    await prisma.cuttingOrder.create({
      data: {
        orderNo,
        recipeId,
        targetQty,
        fabricRollId,
        actualFabricYds,
        createdBy: session.user.id,
        status: "CUTTING_IN_PROGRESS",
      },
    });

    revalidatePath("/dashboard/supervisor");
    redirect("/dashboard/supervisor");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/supervisor" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-4">
          ← Back to Orders
        </Link>
        <h2 className="text-2xl font-bold text-white">Create New Cutting Order</h2>
        <p className="text-slate-400 text-sm">Fill in the production details for the new batch.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <form action={createOrder} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Garment Recipe</label>
            <select
              name="recipeId"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            >
              <option value="" className="bg-slate-900 text-slate-400">Select a recipe...</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {r.name} ({r.recipeCode}) — Std {r.stdFabricYds} yds/pc
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Target Quantity</label>
              <input
                type="number"
                name="targetQty"
                required
                min="1"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g. 500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Fabric Roll ID</label>
              <input
                type="text"
                name="fabricRollId"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                placeholder="ROLL-12345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Actual Fabric Used (Yards)</label>
            <input
              type="number"
              name="actualFabricYds"
              required
              step="0.01"
              min="0.1"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g. 1050.5"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Issue Order to Floor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

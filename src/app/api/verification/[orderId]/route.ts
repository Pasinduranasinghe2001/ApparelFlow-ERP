import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: { orderId: string } | any }
) {
  const params = await context.params;
  const session = await auth();
  if (!session || session.user.role !== "cutting_verifier") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { counts, decision, rejectionNote } = await request.json();

    const order = await prisma.cuttingOrder.findUnique({
      where: { id: params.orderId },
      include: { verificationItems: true, recipe: true },
    });

    if (!order || order.status !== "PENDING_VERIFICATION") {
      return new NextResponse("Invalid order state", { status: 400 });
    }

    // ── APPROVED path ──────────────────────────────────────────
    if (decision === "APPROVED") {
      // Server-side hard stop: reject if ANY item is short
      for (const item of order.verificationItems) {
        const actual = counts?.[item.id];
        if (actual === undefined || actual < item.expectedQty) {
          return new NextResponse(
            `Component shortage detected on item "${item.id}". Cannot approve.`,
            { status: 422 }
          );
        }
      }

      // Update each verification item with the actual count + traffic-light status
      for (const item of order.verificationItems) {
        const actual = counts[item.id] as number;
        let status: "GREEN" | "YELLOW" | "RED" = "GREEN";
        if (actual > item.expectedQty) status = "YELLOW";

        await prisma.verificationItem.update({
          where: { id: item.id },
          data: { actualQty: actual, status },
        });
      }

      // Transition: PENDING_VERIFICATION → VERIFIED
      await prisma.cuttingOrder.update({
        where: { id: order.id },
        data: { status: "VERIFIED" },
      });

      // Compute fabric wastage %: [ (Actual Fabric Used - Expected Fabric) / Expected Fabric ] * 100
      let wastagePct: number | null = null;
      if (order.recipe?.stdFabricYds && order.targetQty > 0) {
        const expectedFabric = order.targetQty * order.recipe.stdFabricYds;
        wastagePct = Number(
          (((order.actualFabricYds - expectedFabric) / expectedFabric) * 100).toFixed(2)
        );
      }

      // Immutable audit log
      await prisma.verificationLog.create({
        data: {
          orderId: order.id,
          verifierId: session.user.id,
          decision: "APPROVED",
          wastagePct,
        },
      });

      return NextResponse.json({ success: true, wastagePct });
    }

    // ── REJECTED path ──────────────────────────────────────────
    if (decision === "REJECTED") {
      if (!rejectionNote || !String(rejectionNote).trim()) {
        return new NextResponse("Rejection note is mandatory", { status: 422 });
      }

      // Mark all items that were counted as RED where short, YELLOW where surplus
      for (const item of order.verificationItems) {
        const actual = counts?.[item.id];
        if (actual === undefined) continue; // not counted yet — leave as-is

        let status: "GREEN" | "YELLOW" | "RED" = "GREEN";
        if (actual < item.expectedQty) status = "RED";
        else if (actual > item.expectedQty) status = "YELLOW";

        await prisma.verificationItem.update({
          where: { id: item.id },
          data: { actualQty: actual, status },
        });
      }

      // Transition: PENDING_VERIFICATION → REJECTED
      await prisma.cuttingOrder.update({
        where: { id: order.id },
        data: { status: "REJECTED" },
      });

      // Immutable audit log with mandatory rejection note
      await prisma.verificationLog.create({
        data: {
          orderId: order.id,
          verifierId: session.user.id,
          decision: "REJECTED",
          rejectionNote: String(rejectionNote).trim(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return new NextResponse("Invalid decision value", { status: 400 });
  } catch (error) {
    console.error("[verification/route]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

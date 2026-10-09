import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: { id: string } | any }
) {
  const params = await context.params;
  const session = await auth();

  // Server-side RBAC: Only cutting_supervisor can re-cut/resubmit orders
  if (!session || session.user.role !== "cutting_supervisor") {
    return new NextResponse("Unauthorized. Only cutting supervisors can re-cut orders.", { status: 403 });
  }

  try {
    const order = await prisma.cuttingOrder.findUnique({
      where: { id: params.id },
      include: {
        recipe: { include: { components: true } },
        verificationItems: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.status !== "REJECTED") {
      return new NextResponse("Only rejected orders can be re-cut and resubmitted.", { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const additionalFabricYds = body?.additionalFabricYds ? Math.max(0, parseFloat(body.additionalFabricYds)) : 0;

    // Update order: add any additional fabric yards used for recut, transition status back to PENDING_VERIFICATION
    await prisma.cuttingOrder.update({
      where: { id: order.id },
      data: {
        status: "PENDING_VERIFICATION",
        actualFabricYds: {
          increment: additionalFabricYds,
        },
      },
    });

    // Reset verification items so QC Verifier has a fresh count
    for (const comp of order.recipe.components) {
      await prisma.verificationItem.upsert({
        where: {
          orderId_componentId: {
            orderId: order.id,
            componentId: comp.id,
          },
        },
        update: {
          actualQty: null,
          status: "GREEN",
        },
        create: {
          orderId: order.id,
          componentId: comp.id,
          expectedQty: order.targetQty * comp.piecesPerGarment,
          status: "GREEN",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order re-cut recorded and successfully resubmitted to Verification Terminal.",
      newStatus: "PENDING_VERIFICATION",
    });
  } catch (error) {
    console.error("[orders/recut/route]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

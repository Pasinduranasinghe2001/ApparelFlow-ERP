import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: { id: string } | any }
) {
  const params = await context.params;
  const session = await auth();
  if (!session || session.user.role !== "cutting_supervisor") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Generate the initial expected quantities in verification_items
    // when moving to PENDING_VERIFICATION.
    const order = await prisma.cuttingOrder.findUnique({
      where: { id: params.id },
      include: { recipe: { include: { components: true } } },
    });

    if (!order) return new NextResponse("Not Found", { status: 404 });

    // Transition state
    await prisma.cuttingOrder.update({
      where: { id: params.id },
      data: { status: "PENDING_VERIFICATION" },
    });

    // Seed verification items with expected quantities based on recipe components
    for (const comp of order.recipe.components) {
      await prisma.verificationItem.upsert({
        where: {
          orderId_componentId: {
            orderId: order.id,
            componentId: comp.id,
          },
        },
        update: {},
        create: {
          orderId: order.id,
          componentId: comp.id,
          expectedQty: order.targetQty * comp.piecesPerGarment,
          status: "GREEN",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";


/**
 * GET /api/sewing/queue
 * Server-Side Query Isolation:
 * Enforces WHERE status IN ('VERIFIED', 'SEWING_IN_PROGRESS') at the database level.
 * Client-side parameters cannot leak unverified, pending, or rejected cutting orders.
 */
export async function GET() {
  const session = await auth();

  // Strict RBAC: only sewing_supervisor can query the sewing queue
  if (!session || session.user.role !== "sewing_supervisor") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const queueOrders = await prisma.cuttingOrder.findMany({
      where: {
        status: {
          in: ["VERIFIED", "SEWING_IN_PROGRESS"],
        },
      },
      include: {
        recipe: true,
        verificationLogs: {
          where: { decision: "APPROVED" },
          include: {
            verifier: {
              select: { id: true, fullName: true, email: true },
            },
          },
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        verificationItems: {
          include: {
            component: true,
          },
        },
      },
      orderBy: { updatedAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      count: queueOrders.length,
      orders: queueOrders,
    });
  } catch (error) {
    console.error("[api/sewing/queue] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

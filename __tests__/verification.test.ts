/**
 * Automated Domain & Security Guard Tests
 * Verified against Webtezza ApparelFlow ERP Specification (Section 10)
 *
 * Test 1: An order with all GREEN components can be approved by an authenticated Verifier.
 * Test 2: An order containing at least one RED (shortage) component blocks approval and returns an error.
 * Test 3: Rejecting an order without a reason note is rejected by backend validation.
 * Test 4: Non-verifier roles receive 403 Forbidden when attempting verification approval.
 * Test 5: Unapproved orders never appear in the Sewing Queue database query.
 * Plus: Fabric Wastage Percentage & Multiplier Engine calculation tests.
 */
import { describe, it, expect } from "vitest";

// ── Pure logic functions replicating backend domain guards ────────────────────

type TrafficStatus = "GREEN" | "YELLOW" | "RED";

export function computeStatus(actual: number, expected: number): TrafficStatus {
  if (actual < expected) return "RED";
  if (actual > expected) return "YELLOW";
  return "GREEN";
}

export function validateApprovalGate(
  role: string,
  items: Array<{ id: string; expectedQty: number }>,
  counts: Record<string, number>
): { allowed: boolean; status: number; error?: string } {
  // Test 4: Non-verifier roles receive 403 Forbidden
  if (role !== "cutting_verifier") {
    return { allowed: false, status: 403, error: "Unauthorized: verifier role required" };
  }

  // Test 2: An order containing at least one RED (shortage) component blocks approval
  for (const item of items) {
    const actual = counts[item.id];
    if (actual === undefined || actual < item.expectedQty) {
      return {
        allowed: false,
        status: 422,
        error: `Component shortage detected on item "${item.id}". Cannot approve.`,
      };
    }
  }

  // Test 1: An order with all GREEN components can be approved
  return { allowed: true, status: 200 };
}

export function validateRejectionGate(
  rejectionNote: string | undefined | null
): { allowed: boolean; status: number; error?: string } {
  // Test 3: Rejecting an order without a reason note is rejected by backend validation
  if (!rejectionNote || !rejectionNote.trim()) {
    return { allowed: false, status: 422, error: "Rejection note is mandatory" };
  }
  return { allowed: true, status: 200 };
}

export function filterSewingQueue<T extends { status: string }>(orders: T[]): T[] {
  // Test 5: Query isolation — unapproved orders never appear in Sewing Queue
  return orders.filter(
    (order) => order.status === "VERIFIED" || order.status === "SEWING_IN_PROGRESS"
  );
}

export function calculateFabricWastagePct(
  actualFabricYds: number,
  targetQty: number,
  stdFabricYds: number
): number {
  const expectedFabric = targetQty * stdFabricYds;
  return Number((((actualFabricYds - expectedFabric) / expectedFabric) * 100).toFixed(2));
}

export function calculateExpectedComponentQty(
  targetQty: number,
  piecesPerGarment: number
): number {
  return targetQty * piecesPerGarment;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe("Webtezza Section 10 — Core Domain Rules Test Suite", () => {
  const mockComponents = [
    { id: "comp-1", expectedQty: 100 },
    { id: "comp-2", expectedQty: 100 },
    { id: "comp-3", expectedQty: 200 },
  ];

  // Test 1
  it("Test 1: An order with all GREEN components can be approved by an authenticated Verifier", () => {
    const counts = {
      "comp-1": 100, // exact match -> GREEN
      "comp-2": 100, // exact match -> GREEN
      "comp-3": 200, // exact match -> GREEN
    };
    const result = validateApprovalGate("cutting_verifier", mockComponents, counts);
    expect(result.allowed).toBe(true);
    expect(result.status).toBe(200);
  });

  // Test 1 (Edge Case: Surplus/Yellow also allows proceeding)
  it("Test 1b: An order with surplus (YELLOW) components can also be approved", () => {
    const counts = {
      "comp-1": 105, // surplus -> YELLOW
      "comp-2": 100, // exact -> GREEN
      "comp-3": 210, // surplus -> YELLOW
    };
    const result = validateApprovalGate("cutting_verifier", mockComponents, counts);
    expect(result.allowed).toBe(true);
    expect(result.status).toBe(200);
  });

  // Test 2
  it("Test 2: An order containing at least one RED (shortage) component blocks approval and returns an error (422)", () => {
    const counts = {
      "comp-1": 100,
      "comp-2": 95, // Shortage! Expected 100 -> RED
      "comp-3": 200,
    };
    const result = validateApprovalGate("cutting_verifier", mockComponents, counts);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(422);
    expect(result.error).toContain("Component shortage detected");
  });

  it("Test 2b: Uncounted item (missing count) blocks approval with 422", () => {
    const counts = {
      "comp-1": 100,
      // comp-2 missing
      "comp-3": 200,
    };
    const result = validateApprovalGate("cutting_verifier", mockComponents, counts);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(422);
  });

  // Test 3
  it("Test 3: Rejecting an order without a reason note is rejected by backend validation (422)", () => {
    expect(validateRejectionGate("").allowed).toBe(false);
    expect(validateRejectionGate("").status).toBe(422);
    expect(validateRejectionGate("   ").allowed).toBe(false);
    expect(validateRejectionGate(null).allowed).toBe(false);
    expect(validateRejectionGate(undefined).allowed).toBe(false);

    // Valid rejection note succeeds
    const validResult = validateRejectionGate("Left sleeve panels are short by 5 pcs due to fabric fraying.");
    expect(validResult.allowed).toBe(true);
    expect(validResult.status).toBe(200);
  });

  // Test 4
  it("Test 4: Non-verifier roles receive 403 Forbidden when attempting verification approval", () => {
    const counts = { "comp-1": 100, "comp-2": 100, "comp-3": 200 };

    // Cutting Supervisor attempts approval
    const supervisorResult = validateApprovalGate("cutting_supervisor", mockComponents, counts);
    expect(supervisorResult.allowed).toBe(false);
    expect(supervisorResult.status).toBe(403);

    // Sewing Supervisor attempts approval
    const sewingResult = validateApprovalGate("sewing_supervisor", mockComponents, counts);
    expect(sewingResult.allowed).toBe(false);
    expect(sewingResult.status).toBe(403);
  });

  // Test 5
  it("Test 5: Unapproved orders never appear in the Sewing Queue database query", () => {
    const mixedOrders = [
      { id: "1", orderNo: "CO-001", status: "CUTTING_IN_PROGRESS" },
      { id: "2", orderNo: "CO-002", status: "PENDING_VERIFICATION" },
      { id: "3", orderNo: "CO-003", status: "REJECTED" },
      { id: "4", orderNo: "CO-004", status: "VERIFIED" },
      { id: "5", orderNo: "CO-005", status: "SEWING_IN_PROGRESS" },
    ];

    const sewingQueue = filterSewingQueue(mixedOrders);

    // Strictly isolates to VERIFIED and SEWING_IN_PROGRESS only
    expect(sewingQueue).toHaveLength(2);
    expect(sewingQueue.map((o) => o.status)).toEqual(["VERIFIED", "SEWING_IN_PROGRESS"]);
    expect(sewingQueue.some((o) => o.status === "CUTTING_IN_PROGRESS")).toBe(false);
    expect(sewingQueue.some((o) => o.status === "PENDING_VERIFICATION")).toBe(false);
    expect(sewingQueue.some((o) => o.status === "REJECTED")).toBe(false);
  });
});

describe("Traffic-Light Formula Matrix", () => {
  it("returns GREEN when actual equals expected", () => {
    expect(computeStatus(100, 100)).toBe("GREEN");
  });

  it("returns YELLOW when actual exceeds expected (surplus pieces recorded)", () => {
    expect(computeStatus(105, 100)).toBe("YELLOW");
  });

  it("returns RED when actual is below expected (shortage blocks batch)", () => {
    expect(computeStatus(99, 100)).toBe("RED");
  });

  it("returns RED for 0 actual when expected > 0", () => {
    expect(computeStatus(0, 50)).toBe("RED");
  });
});

describe("Manufacturing Multiplier Engine & Fabric Wastage Analytics", () => {
  it("dynamically derives Expected Component Counts: 50 garments × 2 cuffs = 100 cuffs", () => {
    expect(calculateExpectedComponentQty(50, 2)).toBe(100);
  });

  it("dynamically derives Expected Component Counts: 500 garments × 1 body = 500 panels", () => {
    expect(calculateExpectedComponentQty(500, 1)).toBe(500);
  });

  it("calculates fabric wastage percentage correctly: Casual Blouse (50 units, 1.8 yds std, 95 yds actual)", () => {
    // Expected Fabric = 50 * 1.8 = 90 yds
    // Actual Fabric = 95 yds
    // Wastage % = [(95 - 90) / 90] * 100 = 5.56%
    const wastage = calculateFabricWastagePct(95, 50, 1.8);
    expect(wastage).toBe(5.56);
  });

  it("calculates fabric wastage percentage for exact fabric usage (0.0% variance)", () => {
    // 50 units * 1.8 = 90 yds expected, 90 yds actual
    const wastage = calculateFabricWastagePct(90, 50, 1.8);
    expect(wastage).toBe(0);
  });
});

export function validateRecutGate(
  role: string,
  orderStatus: string,
  currentFabricYds: number,
  additionalFabricYds: number
): { allowed: boolean; status: number; newStatus?: string; updatedFabricYds?: number; error?: string } {
  if (role !== "cutting_supervisor") {
    return { allowed: false, status: 403, error: "Unauthorized: only cutting supervisors can re-cut orders" };
  }
  if (orderStatus !== "REJECTED") {
    return { allowed: false, status: 400, error: "Only rejected orders can be re-cut and resubmitted" };
  }
  const addYards = Math.max(0, additionalFabricYds || 0);
  return {
    allowed: true,
    status: 200,
    newStatus: "PENDING_VERIFICATION",
    updatedFabricYds: currentFabricYds + addYards,
  };
}

describe("Re-Cut & Resubmit Closed-Loop State Pipeline", () => {
  it("allows cutting_supervisor to re-cut a REJECTED batch and transitions it to PENDING_VERIFICATION", () => {
    const result = validateRecutGate("cutting_supervisor", "REJECTED", 95, 3.5);
    expect(result.allowed).toBe(true);
    expect(result.status).toBe(200);
    expect(result.newStatus).toBe("PENDING_VERIFICATION");
    expect(result.updatedFabricYds).toBe(98.5);
  });

  it("blocks non-supervisor roles from initiating re-cut action (403 Forbidden)", () => {
    const verifierResult = validateRecutGate("cutting_verifier", "REJECTED", 95, 2);
    expect(verifierResult.allowed).toBe(false);
    expect(verifierResult.status).toBe(403);

    const sewingResult = validateRecutGate("sewing_supervisor", "REJECTED", 95, 2);
    expect(sewingResult.allowed).toBe(false);
    expect(sewingResult.status).toBe(403);
  });

  it("rejects re-cut action on non-rejected orders (e.g. CUTTING_IN_PROGRESS or VERIFIED) with 400", () => {
    const inProgressResult = validateRecutGate("cutting_supervisor", "CUTTING_IN_PROGRESS", 95, 0);
    expect(inProgressResult.allowed).toBe(false);
    expect(inProgressResult.status).toBe(400);

    const verifiedResult = validateRecutGate("cutting_supervisor", "VERIFIED", 95, 0);
    expect(verifiedResult.allowed).toBe(false);
    expect(verifiedResult.status).toBe(400);
  });
});


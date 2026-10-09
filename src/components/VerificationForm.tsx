"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ComponentItem = {
  id: string;
  expectedQty: number;
  component: {
    componentName: string;
    piecesPerGarment: number;
  };
};

export function VerificationForm({ orderId, items }: { orderId: string; items: ComponentItem[] }) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleCountChange = (itemId: string, value: string) => {
    setCounts((prev) => ({ ...prev, [itemId]: parseInt(value) || 0 }));
  };

  const getStatusColor = (itemId: string, expected: number) => {
    const actual = counts[itemId];
    if (actual === undefined) return "text-slate-500 bg-slate-800 border-slate-700";
    if (actual < expected) return "text-red-400 bg-red-500/10 border-red-500/50";
    if (actual > expected) return "text-amber-400 bg-amber-500/10 border-amber-500/50";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/50";
  };

  const getStatusBadge = (itemId: string, expected: number) => {
    const actual = counts[itemId];
    if (actual === undefined) return null;
    if (actual < expected) return <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/30">RED</span>;
    if (actual > expected) return <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">YELLOW</span>;
    return <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">GREEN</span>;
  };

  const hasRedItems = items.some((item) => (counts[item.id] ?? -1) < item.expectedQty);
  const isComplete = items.every((item) => counts[item.id] !== undefined);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasRedItems) {
      setError("Cannot approve: one or more components are below expected count (RED). Fix the shortage or reject the batch.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/verification/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counts, decision: "APPROVED" }),
      });

      if (res.ok) {
        router.push("/dashboard/verifier");
        router.refresh();
      } else {
        const text = await res.text();
        setError(text || "Failed to submit verification");
      }
    } catch {
      setError("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionNote.trim()) return;
    setIsRejecting(true);
    setError("");
    try {
      const res = await fetch(`/api/verification/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counts, decision: "REJECTED", rejectionNote: rejectionNote.trim() }),
      });

      if (res.ok) {
        router.push("/dashboard/verifier");
        router.refresh();
      } else {
        const text = await res.text();
        setError(text || "Failed to submit rejection");
        setShowRejectModal(false);
      }
    } catch {
      setError("Network error occurred. Please try again.");
      setShowRejectModal(false);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleApprove} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => {
            const actual = counts[item.id];
            const diff = actual !== undefined ? actual - item.expectedQty : null;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="col-span-5">
                  <p className="font-medium text-slate-200">{item.component.componentName}</p>
                  <p className="text-xs text-slate-500">{item.component.piecesPerGarment}x per garment</p>
                </div>

                <div className="col-span-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Expected</p>
                  <p className="font-mono text-slate-300 font-semibold">{item.expectedQty}</p>
                </div>

                <div className="col-span-4 flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1 text-right">Actual Count</p>
                    <input
                      type="number"
                      min="0"
                      required
                      onChange={(e) => handleCountChange(item.id, e.target.value)}
                      className={`w-full text-right px-3 py-2 rounded-lg bg-slate-900 border text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors ${getStatusColor(item.id, item.expectedQty)}`}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[52px]">
                    {getStatusBadge(item.id, item.expectedQty)}
                    {diff !== null && diff !== 0 && (
                      <span className={`text-xs font-mono ${diff > 0 ? "text-amber-400" : "text-red-400"}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary bar */}
        {isComplete && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${hasRedItems ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
            <span>{hasRedItems ? "⛔" : "✅"}</span>
            <span>
              {hasRedItems
                ? "Shortages detected — batch cannot be approved. You may reject or investigate."
                : "All components verified — batch ready for sewing queue."}
            </span>
          </div>
        )}

        <div className="flex gap-4 pt-4 mt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setShowRejectModal(true);
              setRejectionNote("");
              setError("");
            }}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-xl font-semibold transition-all duration-200"
          >
            ✗ Reject Batch
          </button>
          <button
            type="submit"
            disabled={!isComplete || hasRedItems || isSubmitting}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? "Approving…" : "✓ Approve & Send to Sewing"}
          </button>
        </div>
      </form>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-red-400">⛔</span> Reject Batch
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                A mandatory rejection reason is required. This note will be permanently logged in the audit trail.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="e.g. Left-sleeve panels are 12 pieces short. Physical recount required. Fabric roll FR-4821 under investigation."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 text-white text-sm placeholder-slate-400 resize-none focus:outline-none transition-colors"
              />
              <p className="text-xs text-slate-500 text-right">{rejectionNote.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionNote.trim() || isRejecting}
                className="flex-1 py-2.5 px-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-red-700/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

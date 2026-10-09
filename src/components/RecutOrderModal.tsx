'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertTriangle, X, Check } from 'lucide-react';

interface RecutOrderModalProps {
  orderId: string;
  orderNo: string;
  recipeName: string;
  targetQty: number;
  currentFabricYds: number;
  rejectionNote?: string | null;
}

export function RecutOrderModal({
  orderId,
  orderNo,
  recipeName,
  targetQty,
  currentFabricYds,
  rejectionNote,
}: RecutOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [additionalFabricYds, setAdditionalFabricYds] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRecutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/recut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalFabricYds: parseFloat(additionalFabricYds) || 0,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to re-cut and resubmit order');
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="px-2.5 py-1 text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
        title="View rejection reason and re-cut batch"
      >
        <RefreshCw className="w-3 h-3 text-amber-400" />
        <span>Re-Cut & Fix</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Re-Cut & Resubmit Batch</h3>
                <p className="text-xs text-slate-400">Order: {orderNo} · {recipeName}</p>
              </div>
            </div>

            {/* Verifier's Rejection Audit Note */}
            <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>⚠️ QC Rejection Note:</span>
              </div>
              <p className="text-sm text-red-200 font-medium">
                {rejectionNote || 'Component shortage or defect flagged by Verifier.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleRecutSubmit} className="space-y-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Batch Qty:</span>
                  <span className="font-semibold text-white">{targetQty} garments</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Fabric Used:</span>
                  <span className="font-semibold text-white">{currentFabricYds} yards</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Additional Fabric Consumed for Re-Cut (Yards)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={additionalFabricYds}
                  onChange={(e) => setAdditionalFabricYds(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="e.g. 2.5 yards"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter extra yards cut to replace missing/defective components (enter 0 if using remnant waste).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Dispatching to QC...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Re-Cut & Send to QC</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

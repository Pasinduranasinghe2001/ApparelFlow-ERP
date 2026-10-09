'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Download, Filter } from 'lucide-react';
import { SendToVerificationButton } from './SendToVerificationButton';
import { RecutOrderModal } from './RecutOrderModal';

interface OrderItem {
  id: string;
  orderNo: string;
  targetQty: number;
  fabricRollId: string;
  actualFabricYds: number;
  status: string;
  createdAt: string | Date;
  recipe: {
    name: string;
    recipeCode: string;
    stdFabricYards: number;
  };
  verificationLogs?: Array<{
    decision: string;
    rejectionNote?: string | null;
  }>;
}

export function SupervisorOrdersTable({ orders }: { orders: OrderItem[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.recipe.name.toLowerCase().includes(search.toLowerCase()) ||
      o.fabricRollId.toLowerCase().includes(search.toLowerCase()) ||
      (o.verificationLogs?.[0]?.rejectionNote || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = [
      'Order No',
      'Recipe',
      'Target Qty',
      'Fabric Roll ID',
      'Actual Yards',
      'Status',
      'QC Rejection Note',
      'Created At',
    ];
    const rows = filtered.map((o) => [
      o.orderNo,
      `"${o.recipe.name}"`,
      o.targetQty,
      o.fabricRollId,
      o.actualFabricYds,
      o.status,
      `"${(o.verificationLogs?.[0]?.rejectionNote || '').replace(/"/g, '""')}"`,
      format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ApparelFlow_Cutting_Orders_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, recipe, fabric roll, or rejection note..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-xs font-medium bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CUTTING_IN_PROGRESS">Cutting in Progress</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified (Ready for Sewing)</option>
              <option value="REJECTED">Rejected (Needs Re-Cut)</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            type="button"
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {orders.length === 0
                      ? 'No cutting orders found. Create one to get started.'
                      : 'No orders match your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const latestLog = order.verificationLogs?.[0];
                  const hasRejection = order.status === 'REJECTED' && latestLog?.rejectionNote;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <div>{order.orderNo}</div>
                        {hasRejection && (
                          <div
                            className="text-[11px] text-red-400/90 mt-1 max-w-xs truncate flex items-center gap-1 font-normal"
                            title={latestLog.rejectionNote || ''}
                          >
                            <span>⚠️ QC:</span>
                            <span className="italic">{latestLog.rejectionNote}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-200">
                        <div>{order.recipe.name}</div>
                        <span className="text-[11px] text-slate-500 font-mono">{order.recipe.recipeCode}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">{order.targetQty} pcs</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-300">{order.fabricRollId}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              order.status === 'CUTTING_IN_PROGRESS'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : order.status === 'PENDING_VERIFICATION'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : order.status === 'VERIFIED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : order.status === 'REJECTED'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {order.status === 'REJECTED'
                              ? 'REJECTED (NEEDS RE-CUT)'
                              : order.status.replace(/_/g, ' ')}
                          </span>

                          {order.status === 'CUTTING_IN_PROGRESS' && (
                            <SendToVerificationButton orderId={order.id} />
                          )}

                          {order.status === 'REJECTED' && (
                            <RecutOrderModal
                              orderId={order.id}
                              orderNo={order.orderNo}
                              recipeName={order.recipe.name}
                              targetQty={order.targetQty}
                              currentFabricYds={order.actualFabricYds}
                              rejectionNote={latestLog?.rejectionNote}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

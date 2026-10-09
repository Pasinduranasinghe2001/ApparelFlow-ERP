"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function SendToVerificationButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSend() {
    startTransition(async () => {
      await fetch(`/api/orders/${orderId}/verify`, { method: "POST" });
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleSend}
      disabled={isPending}
      className="ml-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg shadow disabled:opacity-50 transition-colors"
    >
      {isPending ? "Sending..." : "Send to QC"}
    </button>
  );
}

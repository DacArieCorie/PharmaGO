"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Order, PAYMENT_METHOD_LABELS } from "@/lib/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";

export function OrderCard({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: string) {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/orders/${order.id}/pay`);
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Paiement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelivery() {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${order.id}/status`, { status: "DELIVERED", deliveryProof: "Remis au client" });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/orders/${order.id}`} className="font-semibold text-gray-900 hover:underline">
            Commande #{order.id.slice(0, 8)}
          </Link>
          <p className="text-sm text-gray-500">{order.pharmacy?.name}</p>
          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        {order.items.map((item) => (
          <p key={item.id}>
            {item.quantity} × {item.product.name}
          </p>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-semibold text-emerald-700">{formatFCFA(order.totalAmount)}</span>
        <span className="text-xs text-gray-500">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {/* Client actions */}
        {order.status === "PENDING" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("CANCELLED")}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Annuler
          </button>
        )}
        {order.paymentMethod !== "CASH" && order.paymentStatus === "PENDING" && order.status !== "CANCELLED" && (
          <button
            disabled={busy}
            onClick={pay}
            className="rounded-md bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600"
          >
            Payer via {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </button>
        )}

        {/* Pharmacy actions */}
        {order.status === "PENDING" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("ACCEPTED")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Accepter
          </button>
        )}
        {order.status === "ACCEPTED" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("PREPARING")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Démarrer la préparation
          </button>
        )}
        {order.status === "PREPARING" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("READY_FOR_PICKUP")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Prête pour collecte
          </button>
        )}

        {/* Courier actions */}
        {order.status === "ASSIGNED" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("IN_DELIVERY")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Démarrer la livraison
          </button>
        )}
        {order.status === "IN_DELIVERY" && (
          <button
            disabled={busy}
            onClick={confirmDelivery}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Confirmer la livraison
          </button>
        )}
      </div>
    </div>
  );
}

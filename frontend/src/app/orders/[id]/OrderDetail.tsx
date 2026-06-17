"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { OrderCard } from "@/components/OrderCard";
import { api } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Order, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";

const STATUS_TIMELINE: Order["status"][] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED",
  "IN_DELIVERY",
  "DELIVERED",
];

function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.get<Order>(`/orders/${orderId}`);
    setOrder(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [orderId]);

  if (loading) return <p className="p-8 text-center text-gray-500">Chargement...</p>;
  if (!order) return <p className="p-8 text-center text-gray-500">Commande introuvable.</p>;

  const currentStepIndex = STATUS_TIMELINE.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Commande #{order.id.slice(0, 8)}</h1>
      <p className="mb-6 text-sm text-gray-500">{formatDate(order.createdAt)}</p>

      {isCancelled ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Cette commande a été annulée.
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {STATUS_TIMELINE.map((status, i) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i <= currentStepIndex ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {ORDER_STATUS_LABELS[status]}
              </span>
              {i < STATUS_TIMELINE.length - 1 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{order.pharmacy?.name}</p>
            {order.deliveryAddress && (
              <p className="text-sm text-gray-500">
                Livraison : {order.deliveryAddress.label} — {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </p>
            )}
            {order.courier?.user && <p className="text-sm text-gray-500">Livreur : {order.courier.user.name}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-700">
                {item.quantity} × {item.product.name}
              </span>
              <span className="text-gray-600">{formatFCFA(Number(item.unitPrice) * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{formatFCFA(order.itemsTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frais de livraison</span>
            <span>{formatFCFA(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatFCFA(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Paiement</span>
            <span>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
          </div>
        </div>
      </div>

      <OrderCard order={order} onUpdated={load} />
    </div>
  );
}

export function OrderDetail({ orderId }: { orderId: string }) {
  return (
    <RequireRole roles={["CLIENT", "PHARMACY", "COURIER", "ADMIN"]}>
      <OrderDetailContent orderId={orderId} />
    </RequireRole>
  );
}

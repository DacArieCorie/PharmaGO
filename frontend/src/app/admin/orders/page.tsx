"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { AdminNav } from "@/components/AdminNav";
import { OrderCard } from "@/components/OrderCard";
import { api, ApiError } from "@/lib/api";
import { Courier, Order, OrderStatus, ORDER_STATUS_LABELS } from "@/lib/types";

function AssignCourier({ order, couriers, onAssigned }: { order: Order; couriers: Courier[]; onAssigned: () => void }) {
  const [courierId, setCourierId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function assign() {
    if (!courierId) return;
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${order.id}/assign`, { courierId });
      onAssigned();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Assignation impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-gray-50 p-2">
      <select
        value={courierId}
        onChange={(e) => setCourierId(e.target.value)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="">Choisir un livreur</option>
        {couriers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.user?.name} {c.zone ? `(${c.zone})` : ""}
          </option>
        ))}
      </select>
      <button
        disabled={busy || !courierId}
        onClick={assign}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Assigner
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    const [ordersData, couriersData] = await Promise.all([
      api.get<Order[]>(`/orders${query}`),
      api.get<Courier[]>("/couriers"),
    ]);
    setOrders(ordersData);
    setCouriers(couriersData);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Commandes</h1>
      <AdminNav />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
        className="mb-4 rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="">Tous les statuts</option>
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Aucune commande.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id}>
              <OrderCard order={order} onUpdated={load} />
              {order.status === "READY_FOR_PICKUP" && (
                <AssignCourier order={order} couriers={couriers} onAssigned={load} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <AdminOrdersContent />
    </RequireRole>
  );
}

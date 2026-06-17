"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { OrderCard } from "@/components/OrderCard";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

function CourierContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.get<Order[]>("/orders");
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const active = orders.filter((o) => o.status === "ASSIGNED" || o.status === "IN_DELIVERY");
  const done = orders.filter((o) => o.status === "DELIVERED");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mes livraisons</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <>
          <h2 className="mb-3 font-semibold text-gray-900">En cours</h2>
          {active.length === 0 ? (
            <p className="mb-6 text-gray-500">Aucune livraison en cours.</p>
          ) : (
            <div className="mb-8 space-y-4">
              {active.map((order) => (
                <OrderCard key={order.id} order={order} onUpdated={load} />
              ))}
            </div>
          )}

          <h2 className="mb-3 font-semibold text-gray-900">Livrées</h2>
          {done.length === 0 ? (
            <p className="text-gray-500">Aucune livraison terminée.</p>
          ) : (
            <div className="space-y-4">
              {done.map((order) => (
                <OrderCard key={order.id} order={order} onUpdated={load} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CourierPage() {
  return (
    <RequireRole roles={["COURIER"]}>
      <CourierContent />
    </RequireRole>
  );
}

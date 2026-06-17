"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { OrderCard } from "@/components/OrderCard";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

function OrdersContent() {
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mes commandes</h1>
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireRole roles={["CLIENT", "PHARMACY", "COURIER"]}>
      <OrdersContent />
    </RequireRole>
  );
}

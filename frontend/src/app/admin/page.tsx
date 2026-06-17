"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { AdminNav } from "@/components/AdminNav";
import { api } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Role } from "@/lib/types";

interface Stats {
  usersByRole: { role: Role; count: number }[];
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pharmacyCount: number;
  courierCount: number;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateurs",
  PHARMACY: "Pharmacies",
  COURIER: "Livreurs",
  CLIENT: "Clients",
};

function StatsContent() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats);
  }, []);

  if (!stats) return <p className="p-8 text-center text-gray-500">Chargement...</p>;

  const cards = [
    { label: "Commandes totales", value: stats.totalOrders },
    { label: "Commandes actives", value: stats.activeOrders },
    { label: "Commandes livrées", value: stats.deliveredOrders },
    { label: "Revenu total", value: formatFCFA(stats.totalRevenue) },
    { label: "Pharmacies", value: stats.pharmacyCount },
    { label: "Livreurs", value: stats.courierCount },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <AdminNav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-semibold text-gray-900">Utilisateurs par rôle</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.usersByRole.map((u) => (
          <div key={u.role} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{ROLE_LABELS[u.role]}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{u.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminStatsPage() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <StatsContent />
    </RequireRole>
  );
}

"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { AdminNav } from "@/components/AdminNav";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SupportTicket, TicketStatus } from "@/lib/types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: "bg-orange-100 text-orange-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

function AdminSupportContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.get<SupportTicket[]>("/support");
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: TicketStatus) {
    await api.patch(`/support/${id}`, { status });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Support</h1>
      <AdminNav />

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500">Aucune demande.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{t.subject}</p>
                  <p className="text-xs text-gray-500">
                    {t.user?.name} ({t.user?.email}) · {formatDate(t.createdAt)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{t.message}</p>
              <div className="mt-3 flex gap-2">
                {(Object.keys(STATUS_LABELS) as TicketStatus[])
                  .filter((s) => s !== t.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(t.id, s)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Marquer {STATUS_LABELS[s].toLowerCase()}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <AdminSupportContent />
    </RequireRole>
  );
}

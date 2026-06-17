"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { AdminNav } from "@/components/AdminNav";
import { PaymentStatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Order, Payment, PAYMENT_METHOD_LABELS } from "@/lib/types";

type PaymentWithOrder = Payment & { createdAt: string; order: Order };

function PaymentsContent() {
  const [payments, setPayments] = useState<PaymentWithOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaymentWithOrder[]>("/admin/payments").then((data) => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Paiements</h1>
      <AdminNav />

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">Aucun paiement.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2">Commande</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Pharmacie</th>
                <th className="px-4 py-2">Méthode</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-gray-700">#{p.order.id.slice(0, 8)}</td>
                  <td className="px-4 py-2 text-gray-700">{p.order.client?.name}</td>
                  <td className="px-4 py-2 text-gray-700">{p.order.pharmacy?.name}</td>
                  <td className="px-4 py-2 text-gray-700">{PAYMENT_METHOD_LABELS[p.method]}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{formatFCFA(p.amount)}</td>
                  <td className="px-4 py-2">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <PaymentsContent />
    </RequireRole>
  );
}

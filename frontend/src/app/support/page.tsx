"use client";

import { FormEvent, useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SupportTicket } from "@/lib/types";

const STATUS_LABELS: Record<SupportTicket["status"], string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
};

const STATUS_COLORS: Record<SupportTicket["status"], string> = {
  OPEN: "bg-orange-100 text-orange-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

function SupportContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const data = await api.get<SupportTicket[]>("/support");
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/support", { subject, message });
      setSubject("");
      setMessage("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Assistance</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">Nouvelle demande</h2>
        <input
          required
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <textarea
          required
          placeholder="Décrivez votre problème"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      <h2 className="mb-3 font-semibold text-gray-900">Mes demandes</h2>
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500">Aucune demande pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-gray-900">{t.subject}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{t.message}</p>
              <p className="mt-2 text-xs text-gray-400">{formatDate(t.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <RequireRole roles={["CLIENT", "PHARMACY", "COURIER", "ADMIN"]}>
      <SupportContent />
    </RequireRole>
  );
}

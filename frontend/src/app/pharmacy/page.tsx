"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/RequireRole";
import { api, ApiError } from "@/lib/api";
import { Pharmacy } from "@/lib/types";

function PharmacyProfileContent() {
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "", openingHours: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Pharmacy>("/pharmacies/me/profile").then((data) => {
      setForm({
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        openingHours: data.openingHours || "",
      });
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await api.patch("/pharmacies/me/profile", form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-8 text-center text-gray-500">Chargement...</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil de la pharmacie</h1>
        <Link href="/pharmacy/products" className="text-sm text-emerald-700 hover:underline">
          Gérer le catalogue →
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <input
          required
          placeholder="Nom de la pharmacie"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Adresse"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Ville"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Téléphone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          placeholder="Horaires d'ouverture (ex: Lun-Sam 8h-20h)"
          value={form.openingHours}
          onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Profil mis à jour.</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

export default function PharmacyProfilePage() {
  return (
    <RequireRole roles={["PHARMACY"]}>
      <PharmacyProfileContent />
    </RequireRole>
  );
}

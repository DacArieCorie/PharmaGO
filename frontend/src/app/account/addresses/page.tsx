"use client";

import { FormEvent, useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { api, ApiError } from "@/lib/api";
import { Address } from "@/lib/types";

function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({ label: "", street: "", city: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await api.get<Address[]>("/addresses");
    setAddresses(data);
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/addresses", form);
      setForm({ label: "", street: "", city: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter l'adresse");
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/addresses/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mes adresses</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-900">{a.label}</p>
                <p className="text-sm text-gray-500">
                  {a.street}, {a.city}
                </p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-sm text-red-600 hover:underline">
                Supprimer
              </button>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-gray-500">Aucune adresse enregistrée.</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">Ajouter une adresse</h2>
        <input
          required
          placeholder="Libellé (ex: Domicile)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Rue / quartier"
          value={form.street}
          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Ville"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <RequireRole roles={["CLIENT"]}>
      <AddressesContent />
    </RequireRole>
  );
}

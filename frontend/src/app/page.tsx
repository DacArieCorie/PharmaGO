"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pharmacy } from "@/lib/types";

export default function HomePage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const data = await api.get<Pharmacy[]>(`/pharmacies${params}`);
      setPharmacies(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 rounded-xl bg-emerald-600 px-6 py-10 text-white">
        <h1 className="text-3xl font-bold">Vos médicaments livrés à domicile</h1>
        <p className="mt-2 text-emerald-50">
          Commandez auprès de pharmacies partenaires et payez via Cash, Orange Money, Moov Money ou Wave.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(query);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une pharmacie..."
            className="w-full max-w-sm rounded-md border-0 px-3 py-2 text-gray-900 focus:outline-none"
          />
          <button type="submit" className="rounded-md bg-emerald-800 px-4 py-2 font-medium hover:bg-emerald-900">
            Rechercher
          </button>
        </form>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Pharmacies partenaires</h2>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : pharmacies.length === 0 ? (
        <p className="text-gray-500">Aucune pharmacie trouvée.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map((pharmacy) => (
            <Link
              key={pharmacy.id}
              href={`/pharmacies/${pharmacy.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{pharmacy.address}</p>
              <p className="text-sm text-gray-500">{pharmacy.city}</p>
              {pharmacy.openingHours && (
                <p className="mt-2 text-xs text-emerald-700">Horaires : {pharmacy.openingHours}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

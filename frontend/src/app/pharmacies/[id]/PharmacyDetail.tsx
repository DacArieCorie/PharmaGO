"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Pharmacy, Product } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export function PharmacyDetail({ pharmacyId }: { pharmacyId: string }) {
  const [pharmacy, setPharmacy] = useState<(Pharmacy & { products: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addItem, lines } = useCart();
  const router = useRouter();

  useEffect(() => {
    api
      .get<Pharmacy & { products: Product[] }>(`/pharmacies/${pharmacyId}`)
      .then(setPharmacy)
      .finally(() => setLoading(false));
  }, [pharmacyId]);

  function handleAdd(product: Product) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "CLIENT") return;
    addItem(product);
  }

  if (loading) return <p className="p-8 text-center text-gray-500">Chargement...</p>;
  if (!pharmacy) return <p className="p-8 text-center text-gray-500">Pharmacie introuvable.</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{pharmacy.name}</h1>
        <p className="mt-1 text-gray-600">
          {pharmacy.address}, {pharmacy.city}
        </p>
        <p className="text-sm text-gray-500">{pharmacy.phone}</p>
        {pharmacy.openingHours && <p className="mt-1 text-sm text-emerald-700">Horaires : {pharmacy.openingHours}</p>}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Catalogue</h2>
      {pharmacy.products.length === 0 ? (
        <p className="text-gray-500">Aucun produit disponible actuellement.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pharmacy.products.map((product) => {
            const inCart = lines.find((l) => l.product.id === product.id);
            return (
              <div key={product.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                {product.category && <p className="text-xs text-gray-500">{product.category}</p>}
                {product.description && <p className="mt-1 text-sm text-gray-600">{product.description}</p>}
                {product.isPrescriptionRequired && (
                  <p className="mt-1 text-xs font-medium text-orange-600">Ordonnance requise</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-emerald-700">{formatFCFA(product.price)}</span>
                  <button
                    onClick={() => handleAdd(product)}
                    disabled={product.stock <= 0}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {product.stock <= 0 ? "Rupture" : inCart ? `Ajouté (${inCart.quantity})` : "Ajouter"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

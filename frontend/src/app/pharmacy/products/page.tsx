"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/RequireRole";
import { api, ApiError } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Product } from "@/lib/types";

const emptyForm = { name: "", description: "", price: "", stock: "0", category: "", isPrescriptionRequired: false };

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.get<Product[]>("/products/mine");
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: String(p.stock),
      category: p.category || "",
      isPrescriptionRequired: p.isPrescriptionRequired,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category || undefined,
      isPrescriptionRequired: form.isPrescriptionRequired,
    };
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    }
  }

  async function handleDeactivate(id: string) {
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon catalogue</h1>
        <Link href="/pharmacy" className="text-sm text-emerald-700 hover:underline">
          ← Profil
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">{editingId ? "Modifier le produit" : "Ajouter un produit"}</h2>
        <input
          required
          placeholder="Nom du produit"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            min={0}
            step="1"
            placeholder="Prix (FCFA)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            required
            type="number"
            min={0}
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <input
          placeholder="Catégorie"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isPrescriptionRequired}
            onChange={(e) => setForm((f) => ({ ...f, isPrescriptionRequired: e.target.checked }))}
          />
          Ordonnance requise
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
            {editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-gray-700">
              Annuler
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Aucun produit pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className={`font-medium ${p.isActive ? "text-gray-900" : "text-gray-400 line-through"}`}>{p.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFCFA(p.price)} · Stock : {p.stock}
                  {p.category ? ` · ${p.category}` : ""}
                  {p.isPrescriptionRequired ? " · Ordonnance requise" : ""}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(p)} className="text-sm text-emerald-700 hover:underline">
                  Modifier
                </button>
                {p.isActive && (
                  <button onClick={() => handleDeactivate(p.id)} className="text-sm text-red-600 hover:underline">
                    Désactiver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <RequireRole roles={["PHARMACY"]}>
      <ProductsContent />
    </RequireRole>
  );
}

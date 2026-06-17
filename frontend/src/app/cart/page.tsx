"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/components/RequireRole";
import { useCart } from "@/lib/cart-context";
import { api, ApiError } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Address, Order, PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/types";

const DELIVERY_FEE = 1000;

function CartContent() {
  const { lines, setQuantity, removeItem, clear, total, pharmacyId } = useCart();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Address[]>("/addresses").then((data) => {
      setAddresses(data);
      if (data.length > 0) setAddressId(data[0].id);
    });
  }, []);

  async function handleCheckout() {
    if (!pharmacyId) return;
    if (!addressId) {
      setError("Veuillez ajouter une adresse de livraison.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.post<Order>("/orders", {
        pharmacyId,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        deliveryAddressId: addressId,
        paymentMethod,
      });
      clear();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de passer la commande");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-gray-500">Votre panier est vide.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Votre panier</h1>

      <div className="space-y-3">
        {lines.map((line) => (
          <div key={line.product.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="font-medium text-gray-900">{line.product.name}</p>
              <p className="text-sm text-gray-500">{formatFCFA(line.product.price)} / unité</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => setQuantity(line.product.id, Number(e.target.value))}
                className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center"
              />
              <button onClick={() => removeItem(line.product.id)} className="text-sm text-red-600 hover:underline">
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Sous-total</span>
          <span>{formatFCFA(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Frais de livraison</span>
          <span>{formatFCFA(DELIVERY_FEE)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatFCFA(total + DELIVERY_FEE)}</span>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Adresse de livraison</label>
        {addresses.length === 0 ? (
          <p className="mt-1 text-sm text-gray-500">
            Aucune adresse enregistrée.{" "}
            <a href="/account/addresses" className="text-emerald-700 hover:underline">
              Ajouter une adresse
            </a>
          </p>
        ) : (
          <select
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} — {a.street}, {a.city}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Moyen de paiement</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`rounded-md border px-3 py-2 text-sm ${
                paymentMethod === method
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {PAYMENT_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={submitting || addresses.length === 0}
        className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Validation..." : "Valider la commande"}
      </button>
    </div>
  );
}

export default function CartPage() {
  return (
    <RequireRole roles={["CLIENT"]}>
      <CartContent />
    </RequireRole>
  );
}

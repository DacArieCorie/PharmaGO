"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const ROLE_HOME: Record<string, string> = {
  PHARMACY: "/pharmacy",
  COURIER: "/courier",
  CLIENT: "/",
};

const ROLES = [
  { value: "CLIENT", label: "Client" },
  { value: "PHARMACY", label: "Pharmacie" },
  { value: "COURIER", label: "Livreur" },
] as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<"CLIENT" | "PHARMACY" | "COURIER">("CLIENT");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    pharmacyName: "",
    pharmacyAddress: "",
    pharmacyCity: "",
    zone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register({
        role,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        ...(role === "PHARMACY" && {
          pharmacyName: form.pharmacyName,
          pharmacyAddress: form.pharmacyAddress,
          pharmacyCity: form.pharmacyCity,
        }),
        ...(role === "COURIER" && { zone: form.zone }),
      });
      router.push(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Créer un compte</h1>

      <div className="mb-4 flex gap-2">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
              role === r.value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom complet</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {role === "PHARMACY" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de la pharmacie</label>
              <input
                required
                value={form.pharmacyName}
                onChange={(e) => update("pharmacyName", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                required
                value={form.pharmacyAddress}
                onChange={(e) => update("pharmacyAddress", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ville</label>
              <input
                required
                value={form.pharmacyCity}
                onChange={(e) => update("pharmacyCity", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {role === "COURIER" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Zone de couverture</label>
            <input
              value={form.zone}
              onChange={(e) => update("zone", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-emerald-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

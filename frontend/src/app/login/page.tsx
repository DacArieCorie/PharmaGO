"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  PHARMACY: "/pharmacy",
  COURIER: "/courier",
  CLIENT: "/",
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Connexion</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-emerald-700 hover:underline">
          Créer un compte
        </Link>
      </p>
      <div className="mt-6 rounded-md bg-emerald-50 p-4 text-xs text-emerald-800">
        <p className="font-semibold">Comptes de démonstration (mot de passe : password123)</p>
        <ul className="mt-1 list-inside list-disc">
          <li>admin@pharmago.africa</li>
          <li>pharmacie.centrale@pharmago.africa</li>
          <li>livreur.koffi@pharmago.africa</li>
          <li>client.demo@pharmago.africa</li>
        </ul>
      </div>
    </div>
  );
}

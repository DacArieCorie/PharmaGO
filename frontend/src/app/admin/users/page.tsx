"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { AdminNav } from "@/components/AdminNav";
import { api } from "@/lib/api";
import { Role, User } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  PHARMACY: "Pharmacie",
  COURIER: "Livreur",
  CLIENT: "Client",
};

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = roleFilter ? `?role=${roleFilter}` : "";
    const data = await api.get<User[]>(`/admin/users${query}`);
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [roleFilter]);

  async function toggleActive(user: User) {
    await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Utilisateurs</h1>
      <AdminNav />

      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value as Role | "")}
        className="mb-4 rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="">Tous les rôles</option>
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-500">
                  {u.email} · {ROLE_LABELS[u.role]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {u.isActive ? "Actif" : "Désactivé"}
                </span>
                <button onClick={() => toggleActive(u)} className="text-sm text-emerald-700 hover:underline">
                  {u.isActive ? "Désactiver" : "Activer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <UsersContent />
    </RequireRole>
  );
}

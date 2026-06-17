"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/types";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (!user) return null;
  if (!roles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600">Accès refusé pour ce rôle.</div>;
  }
  return <>{children}</>;
}

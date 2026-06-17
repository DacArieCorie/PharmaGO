"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  PHARMACY: "/pharmacy",
  COURIER: "/courier",
  CLIENT: "/",
};

export function NavBar() {
  const { user, logout, loading } = useAuth();
  const { lines } = useCart();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-emerald-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={user ? ROLE_HOME[user.role] : "/"} className="text-xl font-bold text-emerald-700">
          PharmaGO
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {!loading && !user && (
            <>
              <Link href="/login" className="text-gray-700 hover:text-emerald-700">
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              >
                Créer un compte
              </Link>
            </>
          )}

          {user?.role === "CLIENT" && (
            <>
              <Link href="/" className="text-gray-700 hover:text-emerald-700">
                Pharmacies
              </Link>
              <Link href="/orders" className="text-gray-700 hover:text-emerald-700">
                Mes commandes
              </Link>
              <Link href="/account/addresses" className="text-gray-700 hover:text-emerald-700">
                Adresses
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-emerald-700">
                Support
              </Link>
              <Link href="/cart" className="relative text-gray-700 hover:text-emerald-700">
                Panier
                {lines.length > 0 && (
                  <span className="absolute -right-3 -top-2 rounded-full bg-orange-500 px-1.5 text-xs text-white">
                    {lines.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {user?.role === "PHARMACY" && (
            <>
              <Link href="/pharmacy" className="text-gray-700 hover:text-emerald-700">
                Profil
              </Link>
              <Link href="/pharmacy/products" className="text-gray-700 hover:text-emerald-700">
                Catalogue
              </Link>
              <Link href="/orders" className="text-gray-700 hover:text-emerald-700">
                Commandes
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-emerald-700">
                Support
              </Link>
            </>
          )}

          {user?.role === "COURIER" && (
            <>
              <Link href="/courier" className="text-gray-700 hover:text-emerald-700">
                Mes livraisons
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-emerald-700">
                Support
              </Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link href="/admin" className="text-gray-700 hover:text-emerald-700">
                Tableau de bord
              </Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-emerald-700">
                Utilisateurs
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-emerald-700">
                Commandes
              </Link>
              <Link href="/admin/payments" className="text-gray-700 hover:text-emerald-700">
                Paiements
              </Link>
              <Link href="/admin/support" className="text-gray-700 hover:text-emerald-700">
                Support
              </Link>
            </>
          )}

          {user && (
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

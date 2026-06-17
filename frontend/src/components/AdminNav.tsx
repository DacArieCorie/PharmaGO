import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/payments", label: "Paiements" },
  { href: "/admin/support", label: "Support" },
];

export function AdminNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

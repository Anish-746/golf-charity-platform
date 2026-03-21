// app/admin/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const navItems = [
    { href: "/admin/draws", label: "Draw Management" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/winners", label: "Winners" },
    { href: "/admin/charities", label: "Charities" },
    { href: '/admin/reports',   label: 'Reports & Analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-slate-800 flex flex-col p-4">
        <div className="mb-8">
          <p className="text-white font-bold text-lg">Admin Panel</p>
          <p className="text-slate-500 text-xs">Tee It Forward</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={logout} className="mt-4">
          <button className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-400 text-sm transition-colors">
            Log out
          </button>
        </form>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

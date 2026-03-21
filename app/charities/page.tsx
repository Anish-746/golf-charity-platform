// app/charities/page.tsx
import CharitiesClient from "@/components/home/CharitiesClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CharitiesPage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav matches homepage exactly */}
      <nav className="border-b border-slate-800/60 px-6 py-4 sticky top-0 z-40 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-white font-bold text-xl tracking-tight"
          >
            Tee It Forward
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/charities"
              className="text-white text-sm px-3 py-2 font-medium"
            >
              Charities
            </Link>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors ml-1"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-300">Charities</span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-black mb-3">Supported Charities</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Every subscription directs a portion of the fee to the charity you
            choose. Minimum 10% — increase it anytime from your dashboard.
          </p>
        </div>

        {(charities || []).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg mb-2">
              No charities listed yet.
            </p>
            <p className="text-slate-600 text-sm">
              {"Check back soon — we're onboarding partners."}
            </p>
          </div>
        ) : (
          <CharitiesClient charities={charities || []} />
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center">
          <h2 className="text-2xl font-black mb-2">Ready to make an impact?</h2>
          <p className="text-slate-400 mb-6">
            Subscribe from £9.99/month and direct your contribution to the cause
            you care about.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Get started →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Tee It Forward
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href="/charities"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Charities
            </Link>
            <Link
              href="/subscribe"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

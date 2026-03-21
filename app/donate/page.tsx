// app/donate/page.tsx
// Allows anyone — subscriber or not — to make a one-time donation
// to a charity directly, not tied to the draw or subscription.
import { createClient } from "@/lib/supabase/server";
import DonateClient from "@/components/home/DonateClient";
import Link from "next/link";

export default async function DonatePage({
  searchParams,
}: {
  searchParams: { success?: string; charity?: string };
}) {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
              className="text-slate-400 hover:text-white text-sm px-3 py-2 transition-colors"
            >
              Charities
            </Link>
            <Link
              href="/donate"
              className="text-white text-sm px-3 py-2 font-medium"
            >
              Donate
            </Link>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white text-sm px-3 py-2 transition-colors"
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

      <main className="max-w-2xl mx-auto px-6 py-16">
        {searchParams.success ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
            </div>
            <h1 className="text-4xl font-black mb-3">Thank you!</h1>
            <p className="text-slate-400 text-lg mb-2">
              Your donation to{" "}
              <span className="text-white font-semibold">
                {searchParams.charity}
              </span>{" "}
              has been received.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              A receipt has been sent to your email.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="/donate"
                className="border border-slate-700 hover:border-slate-500 text-slate-300 px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Donate again
              </a>
              <a
                href="/signup"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Subscribe to play →
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                Independent giving
              </p>
              <h1 className="text-4xl font-black mb-3">
                Make a direct donation
              </h1>
              <p className="text-slate-400 text-lg">
                No subscription needed. Choose a charity and donate any amount
                directly.
              </p>
            </div>
            <DonateClient charities={charities || []} />
          </>
        )}
      </main>
    </div>
  );
}

// app/dashboard/page.tsx
// SERVER COMPONENT — fetches all data before sending HTML to browser.
// Uses Promise.all to run all queries in parallel for speed.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import ScoreModule from "@/components/dashboard/ScoreModule";
import CharityModule from "@/components/dashboard/CharityModule";
import SubscriptionModule from "@/components/dashboard/SubscriptionModule";
import DrawModule from "@/components/dashboard/DrawModule";
import type { Profile, Score, Charity, Draw, Winner } from "@/types/database";
import WinnerAlert from "@/components/dashboard/WinnerAlert";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Run all queries at the same time with Promise.all
  // Think of this like sending 5 letters at once instead of waiting
  // for a reply before sending the next one.
  const [
    profileResult,
    { data: scores },
    { data: charities },
    { data: draws },
    { data: winnings },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false }),
    supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false }),
    supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("draw_month", { ascending: false })
      .limit(3),
    supabase
      .from("winners")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("current_period_end, plan")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single(),
  ]);

  // If profile doesn't exist or failed to fetch, create it with defaults
  let profile = profileResult.data;
  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string) ||
      user.email?.split("@")[0] ||
      "User";

    await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      role: "subscriber",
      subscription_status: "inactive",
      charity_percentage: 10,
    });

    profile = {
      id: user.id,
      full_name: fullName,
      email: user.email,
      role: "subscriber",
      subscription_status: "inactive",
      stripe_customer_id: null,
      selected_charity_id: null,
      charity_percentage: 10,
      created_at: new Date().toISOString(),
    };
  }

  // Find the charity this user has currently selected (for display)
  const selectedCharity =
    charities?.find((c: Charity) => c.id === profile?.selected_charity_id) ||
    null;

  return (
    <div className="min-h-screen bg-slate-950">
      <WinnerAlert winners={(winnings || []) as any} />

      {profile?.subscription_status !== "active" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-amber-400 font-semibold text-sm">
              Your subscription is {profile?.subscription_status}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Subscribe to enter monthly draws and contribute to your chosen
              charity.
            </p>
          </div>
          <a
            href="/subscribe"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap ml-4"
          >
            Subscribe Now
          </a>
        </div>
      )}

      {/* Top navigation bar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-xl">Tee It Forward</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{profile?.full_name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main dashboard content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            {"Here's your Tee It Forward summary"}
          </p>
        </div>

        {/* Top row: Subscription + Draw modules side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SubscriptionModule
            profile={profile as Profile}
            renewalDate={subscription?.current_period_end || null}
          />
          <DrawModule
            draws={(draws || []) as Draw[]}
            winnings={(winnings || []) as Winner[]}
          />
        </div>

        {/* Bottom row: Score entry + Charity selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score module takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
            <ScoreModule scores={(scores || []) as Score[]} />
          </div>
          {/* Charity module takes 1/3 */}
          <div>
            <CharityModule
              charities={(charities || []) as Charity[]}
              selectedCharity={selectedCharity as Charity | null}
              currentPercentage={profile?.charity_percentage || 10}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

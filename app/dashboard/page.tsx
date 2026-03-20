// app/dashboard/page.tsx
// This is a protected page — middleware already ensures only logged-in users reach here.
// We fetch the user's profile from Supabase on the server side.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();

  // getUser() verifies the session with Supabase's servers — not just the local cookie.
  // Always use getUser() for security checks, never getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the user's profile from our public.profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {profile?.full_name || "Golfer"} 👋
            </h1>
            <p className="text-slate-400">Your Golf for Good dashboard</p>
          </div>

          {/* Logout button calls our server action */}
          <form action={logout}>
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg 
                         text-sm transition-colors"
            >
              Log out
            </button>
          </form>
        </div>

        {/* Placeholder cards — you'll build these out next */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-slate-300 mb-1">Subscription</h2>
            <p className="text-2xl font-bold text-emerald-400 capitalize">
              {profile?.subscription_status || "Inactive"}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-slate-300 mb-1">Your Scores</h2>
            <p className="text-slate-400 text-sm">No scores entered yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}

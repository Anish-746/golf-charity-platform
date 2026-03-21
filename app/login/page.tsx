// app/login/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

async function loginAction(formData: globalThis.FormData) {
  "use server";

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // After successful login, check the user's role to decide where to send them.
  // We fetch profile immediately using the session that was just created.
  let { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  // If profile doesn't exist, create it with default values
  if (!profile) {
    const fullName =
      (authData.user.user_metadata?.full_name as string) ||
      authData.user.email?.split("@")[0] ||
      "Unknown User";

    await supabase.from("profiles").insert({
      id: authData.user.id,
      full_name: fullName,
      email: authData.user.email,
      role: "subscriber",
      subscription_status: "inactive",
      charity_percentage: 10,
    });

    profile = { role: "subscriber" };
  }

  // Admins go to the admin panel — they have no business on the subscriber dashboard
  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // Everyone else goes to the subscriber dashboard
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">
            Log in to your Tee It Forward account
          </p>
        </div>

        {params.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm text-center">
            {params.error}
          </div>
        )}

        <LoginForm action={loginAction} />

        <p className="text-center text-slate-500 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

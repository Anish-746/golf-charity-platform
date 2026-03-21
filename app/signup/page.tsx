// app/signup/page.tsx
// This is a SERVER component — it runs on the server.
// It exports a "server action" — a function that runs on the server
// when the form is submitted, without needing a separate API route.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "./SignupForm";

// Server Action: This function runs on the SERVER when the form is submitted.
// The 'use server' directive tells Next.js to treat it as a server-side function.
async function signupAction(formData: globalThis.FormData) {
  "use server";

  const supabase = await createClient();

  // Extract values from the submitted form
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Call Supabase Auth to create the user.
  // The 'data' object inside options gets stored in raw_user_meta_data,
  // which our trigger reads to populate the profiles table.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // After email confirmation, redirect here
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    // In a real app you'd pass this error back to the form.
    // For now, redirect with an error param.
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Redirect to a "check your email" page
  redirect("/signup?success=true");
}

// The page itself — passes the server action down to the client form component
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tee It Forward</h1>
          <p className="text-slate-400 mt-2">Play. Win. Give.</p>
        </div>

        {/* Success message after signup */}
        {params.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 text-emerald-400 text-sm text-center">
            Check your email to confirm your account, then log in.
          </div>
        )}

        {/* Error message */}
        {params.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm text-center">
            {params.error}
          </div>
        )}

        {/* 
          SignupForm is a CLIENT component (defined below).
          We pass the server action to it as a prop so the form can call it.
        */}
        <SignupForm action={signupAction} />

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

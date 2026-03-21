import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  const supabase = await createClient();

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  if (data.user) {
    // Ensure profile exists for this user
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    // If profile doesn't exist, create it from user metadata
    if (!existingProfile) {
      const fullName =
        (data.user.user_metadata?.full_name as string) || "Unknown User";

      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email: data.user.email,
        role: "subscriber",
        subscription_status: "inactive",
        charity_percentage: 10,
      });
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(new URL(next, request.url));
}

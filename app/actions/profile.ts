// app/actions/profile.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCharity(formData: globalThis.FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const selected_charity_id = formData.get("charity_id") as string;
  const charity_percentage = parseInt(
    formData.get("charity_percentage") as string,
  );

  // Enforce the minimum 10% rule from the PRD
  if (charity_percentage < 10 || charity_percentage > 100) {
    throw new Error("Charity percentage must be between 10 and 100");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ selected_charity_id, charity_percentage })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

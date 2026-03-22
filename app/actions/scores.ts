// app/actions/scores.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GOLF_SCORE_MIN, GOLF_SCORE_MAX } from "@/lib/constants";

// revalidatePath tells Next.js to re-fetch the dashboard page data
// after a mutation — this is how the UI stays in sync with the database
// without a full page reload.

export async function addScore(formData: globalThis.FormData) {
  const supabase = await createClient();

  // Always verify the user is authenticated in server actions
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const score = parseInt(formData.get("score") as string);
  const score_date = formData.get("score_date") as string;

  // Validate on the server too — never trust only client-side validation
  if (isNaN(score) || score < GOLF_SCORE_MIN || score > GOLF_SCORE_MAX) {
    throw new Error(`Score must be between ${GOLF_SCORE_MIN} and ${GOLF_SCORE_MAX}`);
  }
  if (!score_date) {
    throw new Error("Score date is required");
  }

  // The database trigger handles the rolling 5-score logic automatically.
  // We just insert — the trigger deletes the oldest if needed.
  const { error } = await supabase
    .from("scores")
    .insert({ user_id: user.id, score, score_date });

  if (error) throw new Error(error.message);

  // Tell Next.js to refresh the dashboard page data
  revalidatePath("/dashboard");
}

export async function deleteScore(scoreId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // RLS ensures users can only delete their own scores,
  // but we add the user_id check here as a second layer of safety
  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", scoreId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

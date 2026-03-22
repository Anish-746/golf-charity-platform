// app/api/admin/draw/[drawId]/publish/route.ts
// Publishes the draw — writes winners to the database, sends emails.
// This is irreversible once called.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  processAllEntries,
  calculatePrizePool,
  calculateWinnerPrizes,
} from "@/lib/draw-engine";
import {
  sendWinnerNotification,
  sendDrawResultsNotification,
} from "@/lib/email";

type ScoreRow = {
  score: number;
  score_date: string;
};

type ActiveSubscriber = {
  id: string;
  scores: ScoreRow[] | null;
};

type EligibleEntry = {
  userId: string;
  scores: number[];
};

type SubscriptionRow = {
  prize_pool_contribution: number | null;
};

type WinnerPrize = {
  userId: string;
  matchType: number;
  prizeAmount: number;
};

type ProcessedEntry = {
  userId: string;
  scoresSnapshot: number[];
  matchCount: number;
};

type DrawRow = {
  id: string;
  status: "simulated" | "published" | string;
  winning_numbers: number[] | null;
  jackpot_amount: number | null;
  four_match_pool: number | null;
  three_match_pool: number | null;
};

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> },
) {
  const { drawId } = await params;
  const supabase = await createClient();
  const serviceSupabase = getServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: draw } = await serviceSupabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw)
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });

  const typedDraw = draw as DrawRow;

  if (typedDraw.status !== "simulated") {
    return NextResponse.json(
      {
        error:
          "Draw must be simulated before publishing. Run simulation first.",
      },
      { status: 400 },
    );
  }

  if (!typedDraw.winning_numbers || typedDraw.winning_numbers.length !== 5) {
    return NextResponse.json(
      { error: "No winning numbers set" },
      { status: 400 },
    );
  }

  const { data: activeSubscribers } = await serviceSupabase
    .from("profiles")
    .select("id, scores (score, score_date)")
    .eq("subscription_status", "active");

  const subscribers = (activeSubscribers ?? []) as ActiveSubscriber[];

  const eligibleEntries: EligibleEntry[] = subscribers
    .filter((sub) => Array.isArray(sub.scores) && sub.scores.length > 0)
    .map((sub) => ({
      userId: sub.id,
      scores: sub.scores!.map((s) => s.score),
    }));

  if (eligibleEntries.length === 0) {
    return NextResponse.json(
      { error: "No subscribers have entered scores yet" },
      { status: 400 },
    );
  }

  const results = processAllEntries(eligibleEntries, typedDraw.winning_numbers);

  const { data: subscriptions } = await serviceSupabase
    .from("subscriptions")
    .select("prize_pool_contribution")
    .eq("status", "active");

  const activeSubscriptions = (subscriptions ?? []) as SubscriptionRow[];

  const totalContributions = activeSubscriptions.reduce(
    (sum, sub) => sum + (sub.prize_pool_contribution ?? 0),
    0,
  );

  const prizePool = calculatePrizePool(totalContributions, 0);

  const winnerPrizes = calculateWinnerPrizes(
    results,
    prizePool,
  ) as WinnerPrize[];

  const drawEntries = (results as ProcessedEntry[]).map((r) => ({
    draw_id: drawId,
    user_id: r.userId,
    scores_snapshot: r.scoresSnapshot,
    match_count: r.matchCount,
  }));

  for (let i = 0; i < drawEntries.length; i += 100) {
    await serviceSupabase
      .from("draw_entries")
      .insert(drawEntries.slice(i, i + 100));
  }

  if (winnerPrizes.length > 0) {
    try {
      for (const winner of winnerPrizes) {
        const { data: winnerProfile } = await serviceSupabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", winner.userId)
          .single();

        if (winnerProfile?.email) {
          await sendWinnerNotification({
            to: winnerProfile.email,
            name: winnerProfile.full_name || "Golfer",
            prizeAmount: winner.prizeAmount,
            drawMonth: draw.draw_month,
            matchType: winner.matchType as 3 | 4 | 5,
          });
        }
      }
    } catch (emailError) {
      // Log but don't fail the publish — email is non-critical
      console.error("Email send failed:", emailError);
    }
  }

  // Send draw results to all active subscribers
  try {
    const { data: activeSubscribers } = await serviceSupabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("subscription_status", "active");

    if (activeSubscribers && activeSubscribers.length > 0) {
      for (const subscriber of activeSubscribers) {
        if (subscriber.email) {
          await sendDrawResultsNotification({
            to: subscriber.email,
            name: subscriber.full_name || "Golfer",
            winningNumbers: typedDraw.winning_numbers || [],
            drawMonth: draw.draw_month,
          });
        }
      }
    }
  } catch (emailError) {
    // Log but don't fail the publish — email is non-critical
    console.error("Failed to send draw results:", emailError);
  }

  const hasJackpotWinner = winnerPrizes.some((w) => w.matchType === 5);

  await serviceSupabase
    .from("draws")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      jackpot_amount: typedDraw.jackpot_amount,
    })
    .eq("id", drawId);

  return NextResponse.json({
    published: true,
    totalEntries: eligibleEntries.length,
    totalWinners: winnerPrizes.length,
    hasJackpotWinner,
    jackpotRolledOver: !hasJackpotWinner,
  });
}

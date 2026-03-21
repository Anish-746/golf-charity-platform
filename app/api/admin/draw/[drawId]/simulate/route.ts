// app/api/admin/draw/[drawId]/simulate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  processAllEntries,
  calculatePrizePool,
  calculateWinnerPrizes,
} from "@/lib/draw-engine";

type EligibleEntry = {
  userId: string;
  scores: number[];
};

type SubscriptionRow = {
  prize_pool_contribution: number | null;
};

type PreviousDraw = {
  id: string;
  jackpot_amount: number | null;
};

type WinnerPreview = {
  matchType: number;
  [key: string]: unknown;
};

export async function POST(
  request: NextRequest,
  { params }: { params: { drawId: string } },
) {
  const { drawId } = await params;
  const supabase = await createClient();

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

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw)
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  if (draw.status === "published") {
    return NextResponse.json(
      { error: "Cannot re-simulate a published draw" },
      { status: 400 },
    );
  }

  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')

  const userIds = (activeUsers ?? []).map(u => u.id)

  if (userIds.length === 0) {
    return NextResponse.json({ error: 'No active subscribers' }, { status: 400 })
  }

  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds)

  console.log('activeUsers:', activeUsers)
  console.log('userIds:', userIds)
  console.log('scores:', scores)

  if (!scores || scores.length === 0) {
    return NextResponse.json({ error: 'No subscribers have entered scores yet' }, { status: 400 })
  }

  const scoreMap = new Map<string, number[]>()

  for (const row of scores) {
    if (!scoreMap.has(row.user_id)) {
      scoreMap.set(row.user_id, [])
    }
    scoreMap.get(row.user_id)!.push(row.score)
  }

  const eligibleEntries: EligibleEntry[] = Array.from(scoreMap.entries()).map(
    ([userId, scores]) => ({
      userId,
      scores,
    })
  )

  if (eligibleEntries.length === 0) {
    return NextResponse.json({ error: 'No valid entries found' }, { status: 400 })
  }

  let winningNumbers: number[];

  if (draw.draw_type === "algorithmic") {
    const allScores = eligibleEntries.flatMap((entry) => entry.scores);
    winningNumbers = generateAlgorithmicNumbers(allScores);
  } else {
    winningNumbers = generateRandomNumbers();
  }

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("prize_pool_contribution")
    .eq("status", "active");

  const activeSubscriptions = (subscriptions ?? []) as SubscriptionRow[];

  const totalContributions = activeSubscriptions.reduce(
    (sum, sub) => sum + (sub.prize_pool_contribution ?? 0),
    0,
  );

  const { data: previousDraw } = await supabase
    .from("draws")
    .select("jackpot_amount, id")
    .eq("status", "published")
    .order("draw_month", { ascending: false })
    .limit(1)
    .single();

  let jackpotCarryover = 0;
  if (previousDraw) {
    const prev = previousDraw as PreviousDraw;

    const { data: prevJackpotWinners } = await supabase
      .from("winners")
      .select("id")
      .eq("draw_id", prev.id)
      .eq("match_type", 5);

    if (!prevJackpotWinners || prevJackpotWinners.length === 0) {
      jackpotCarryover = prev.jackpot_amount ?? 0;
    }
  }

  const pool = calculatePrizePool(totalContributions, jackpotCarryover);

  const results = processAllEntries(eligibleEntries, winningNumbers);
  const winnerPrizes = calculateWinnerPrizes(results, pool) as WinnerPreview[];

  await supabase
    .from("draws")
    .update({
      status: "simulated",
      winning_numbers: winningNumbers,
      jackpot_amount: pool.jackpotPool,
      four_match_pool: pool.fourMatchPool,
      three_match_pool: pool.threeMatchPool,
      total_entries: eligibleEntries.length,
    })
    .eq("id", drawId);

  return NextResponse.json({
    winningNumbers,
    pool,
    totalEntries: eligibleEntries.length,
    winnerPreview: winnerPrizes,
    jackpotCarryover,
    hasJackpotWinner: winnerPrizes.some((w) => w.matchType === 5),
  });
}

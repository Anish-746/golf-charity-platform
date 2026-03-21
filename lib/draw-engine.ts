// ─── Types ────────────────────────────────────────────────────────────────────

export type DrawType = 'random' | 'algorithmic'

export type MatchResult = {
  userId: string
  scoresSnapshot: number[]
  matchCount: number        // how many of the user's 5 scores matched a winning number
  matchType: 3 | 4 | 5 | null  // null means no prize-worthy match
}

export type PrizeBreakdown = {
  jackpotPool: number       // 40% of total pool — for 5-match
  fourMatchPool: number     // 35% of total pool — for 4-match
  threeMatchPool: number    // 25% of total pool — for 3-match
  totalPool: number
}

// ─── Number Generation ────────────────────────────────────────────────────────

/**
 * RANDOM DRAW: Picks 5 unique random numbers between 1 and 45.
 * Standard lottery-style — every number has equal probability.
 */
export function generateRandomNumbers(): number[] {
  const numbers: number[] = []

  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1  // 1 to 45 inclusive
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }

  return numbers.sort((a, b) => a - b)  // return sorted for display
}

/**
 * ALGORITHMIC DRAW: Weighted towards numbers that are LEAST frequently
 * entered by users. This means if everyone always scores around 30,
 * the winning numbers will tend to be far from 30 — making it harder
 * to win but more exciting when someone does.
 *
 * How the weighting works:
 * - Count how many times each number (1–45) appears across all user scores
 * - Invert the frequency: numbers that appear rarely get HIGH weight
 * - Pick 5 numbers using weighted random selection
 *
 * @param allScores - flat array of every score from every active subscriber
 */
export function generateAlgorithmicNumbers(allScores: number[]): number[] {
  // Count frequency of each number 1–45
  const frequency: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) frequency[i] = 0
  for (const score of allScores) {
    if (score >= 1 && score <= 45) frequency[score]++
  }

  // Invert: least frequent gets highest weight
  // We add 1 to avoid division by zero for numbers that never appeared
  const weights: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) {
    weights[i] = 1 / (frequency[i] + 1)
  }

  // Weighted random selection without replacement
  const selected: number[] = []

  while (selected.length < 5) {
    // Build a cumulative distribution from remaining numbers
    const remaining = Array.from({ length: 45 }, (_, i) => i + 1)
      .filter(n => !selected.includes(n))

    const totalWeight = remaining.reduce((sum, n) => sum + weights[n], 0)
    let random = Math.random() * totalWeight

    for (const num of remaining) {
      random -= weights[num]
      if (random <= 0) {
        selected.push(num)
        break
      }
    }
  }

  return selected.sort((a, b) => a - b)
}

// ─── Match Calculation ────────────────────────────────────────────────────────

/**
 * Compares a user's 5 scores against the winning numbers.
 * Returns how many scores appear in the winning set.
 *
 * Example: winning = [5, 12, 27, 33, 41], userScores = [12, 27, 33, 19, 8]
 * → 3 matches (12, 27, 33)
 */
export function calculateMatch(
  userScores: number[],
  winningNumbers: number[]
): number {
  const winningSet = new Set(winningNumbers)
  return userScores.filter(score => winningSet.has(score)).length
}

/**
 * Processes ALL subscribers for a draw and returns match results.
 * This is the core loop that runs for every user when a draw is executed.
 */
export function processAllEntries(
  entries: { userId: string; scores: number[] }[],
  winningNumbers: number[]
): MatchResult[] {
  return entries.map(entry => {
    const matchCount = calculateMatch(entry.scores, winningNumbers)

    // Only 3, 4, 5 matches win prizes — anything below is no match
    const matchType =
      matchCount >= 5 ? 5 :
      matchCount >= 4 ? 4 :
      matchCount >= 3 ? 3 :
      null

    return {
      userId: entry.userId,
      scoresSnapshot: entry.scores,
      matchCount,
      matchType,
    }
  })
}

// ─── Prize Calculation ────────────────────────────────────────────────────────

/**
 * Calculates the prize pool breakdown based on total subscription contributions.
 * PRD spec: 40% jackpot, 35% four-match, 25% three-match.
 */
export function calculatePrizePool(
  totalContributions: number,
  jackpotCarryover: number = 0   // previous unclaimed jackpot rolls over
): PrizeBreakdown {
  const totalPool = totalContributions + jackpotCarryover

  return {
    jackpotPool:    parseFloat((totalPool * 0.40).toFixed(2)),
    fourMatchPool:  parseFloat((totalPool * 0.35).toFixed(2)),
    threeMatchPool: parseFloat((totalPool * 0.25).toFixed(2)),
    totalPool:      parseFloat(totalPool.toFixed(2)),
  }
}

/**
 * Given a list of match results and the prize pool, calculates how much
 * each winner receives. Prizes are split equally among winners in the same tier.
 *
 * Example: jackpot pool is £400, two people got 5 matches → each gets £200.
 */
export function calculateWinnerPrizes(
  results: MatchResult[],
  pool: PrizeBreakdown
): { userId: string; matchType: 3 | 4 | 5; prizeAmount: number }[] {
  const winners = results.filter(r => r.matchType !== null)

  const fiveMatches  = winners.filter(w => w.matchType === 5)
  const fourMatches  = winners.filter(w => w.matchType === 4)
  const threeMatches = winners.filter(w => w.matchType === 3)

  const prizes: { userId: string; matchType: 3 | 4 | 5; prizeAmount: number }[] = []

  // 5-match: jackpot splits equally (or rolls over if no winners)
  if (fiveMatches.length > 0) {
    const share = parseFloat((pool.jackpotPool / fiveMatches.length).toFixed(2))
    fiveMatches.forEach(w => prizes.push({ userId: w.userId, matchType: 5, prizeAmount: share }))
  }
  // Note: if fiveMatches.length === 0, jackpot rolls over — handled in the API route

  // 4-match: splits equally
  if (fourMatches.length > 0) {
    const share = parseFloat((pool.fourMatchPool / fourMatches.length).toFixed(2))
    fourMatches.forEach(w => prizes.push({ userId: w.userId, matchType: 4, prizeAmount: share }))
  }

  // 3-match: splits equally
  if (threeMatches.length > 0) {
    const share = parseFloat((pool.threeMatchPool / threeMatches.length).toFixed(2))
    threeMatches.forEach(w => prizes.push({ userId: w.userId, matchType: 3, prizeAmount: share }))
  }

  return prizes
}
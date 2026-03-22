/**
 * Application Constants
 *
 * Centralized definitions for business logic constants, validation rules,
 * and configuration values used throughout the application.
 */

// ──────────────────────────────────────────────────────────────────
// GOLF SCORED
// ──────────────────────────────────────────────────────────────────

/** Minimum valid golf score */
export const GOLF_SCORE_MIN = 1;

/** Maximum valid golf score */
export const GOLF_SCORE_MAX = 45;

// ──────────────────────────────────────────────────────────────────
// DRAW ENGINE CONSTANTS
// ──────────────────────────────────────────────────────────────────

/** Number of winning numbers generated per draw */
export const WINNING_NUMBERS_COUNT = 5;

/** Number of scores each player must submit per draw */
export const PLAYER_SCORES_COUNT = 5;

/** Minimum matches to win a prize */
export const MIN_PRIZE_MATCHES = 3;

/** Match thresholds for different prize tiers */
export const PRIZE_MATCH_TIERS = {
  JACKPOT: 5, // 5-match = jackpot (40% of pool)
  FOUR_MATCH: 4, // 4-match = second prize (35% of pool)
  THREE_MATCH: 3, // 3-match = third prize (25% of pool)
} as const;

// ──────────────────────────────────────────────────────────────────
// PRIZE POOL DISTRIBUTION
// ──────────────────────────────────────────────────────────────────

/** Percentage of pool allocated to jackpot (5 matches) */
export const JACKPOT_POOL_PERCENTAGE = 0.4;

/** Percentage of pool allocated to 4-match winners */
export const FOUR_MATCH_POOL_PERCENTAGE = 0.35;

/** Percentage of pool allocated to 3-match winners */
export const THREE_MATCH_POOL_PERCENTAGE = 0.25;

// ──────────────────────────────────────────────────────────────────
// SUBSCRIPTION CONTRIBUTION SPLIT
// ──────────────────────────────────────────────────────────────────

/** Percentage of subscription fee going to charity */
export const CHARITY_CONTRIBUTION_PERCENTAGE = 0.1;

/** Percentage of subscription fee going to prize pool */
export const PRIZE_POOL_CONTRIBUTION_PERCENTAGE = 0.9;

// ──────────────────────────────────────────────────────────────────
// FILE UPLOAD CONSTRAINTS
// ──────────────────────────────────────────────────────────────────

/** Maximum file size for proof uploads in bytes (5 MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Allowed MIME types for proof uploads */
export const ALLOWED_PROOF_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// ──────────────────────────────────────────────────────────────────
// PAGINATION & QUERY LIMITS
// ──────────────────────────────────────────────────────────────────

/** Default page size for admin list queries */
export const DEFAULT_PAGE_SIZE = 50;

/** Maximum charities to display on homepage */
export const HOMEPAGE_CHARITIES_LIMIT = 15;

// ──────────────────────────────────────────────────────────────────
// VALIDATION & ERROR MESSAGES
// ──────────────────────────────────────────────────────────────────

/** Regex for validating email addresses */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimum password length */
export const PASSWORD_MIN_LENGTH = 8;

/** Minimum full name length */
export const FULL_NAME_MIN_LENGTH = 2;

// ──────────────────────────────────────────────────────────────────
// STRIPE CONSTANTS
// ──────────────────────────────────────────────────────────────────

/** Stripe currency code (pence conversion factor) */
export const STRIPE_CURRENCY = "gbp";

/** Factor to convert pounds to pence for Stripe API */
export const PENCE_CONVERSION_FACTOR = 100;

/** Stripe webhook timeout (ms) */
export const STRIPE_WEBHOOK_TIMEOUT = 30000;

// ──────────────────────────────────────────────────────────────────
// SUBSCRIPTION STATUS MAPPING
// ──────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_STATUS_MAP = {
  active: "active",
  past_due: "lapsed",
  canceled: "cancelled",
  unpaid: "lapsed",
} as const;

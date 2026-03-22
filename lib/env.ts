const REQUIRED_ENV_VARS = [
  // Supabase
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",

  // Stripe
  "STRIPE_SECRET_KEY",
  "STRIPE_MONTHLY_PRICE_ID",
  "STRIPE_YEARLY_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",

  // Email (Resend)
  "RESEND_API_KEY",

  // Site
  "NEXT_PUBLIC_SITE_URL",
];

const OPTIONAL_ENV_VARS = [
  "NEXT_PUBLIC_APP_ENV",
];

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  REQUIRED_ENV_VARS.forEach((key) => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  if (process.env.NODE_ENV === "production") {
    OPTIONAL_ENV_VARS.forEach((key) => {
      if (!process.env[key]) {
        warnings.push(`Missing optional environment variable in production: ${key}`);
      }
    });
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL");
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
    } catch {
      errors.push("NEXT_PUBLIC_SITE_URL must be a valid URL");
    }
  }

  const valid = errors.length === 0;

  if (!valid) {
    console.error(
      "Environment validation failed:\n" + errors.map((e) => `  - ${e}`).join("\n")
    );
  }

  if (warnings.length > 0) {
    console.warn(
      "Environment warnings:\n" + warnings.map((w) => `  - ${w}`).join("\n")
    );
  }

  return { valid, errors, warnings };
}

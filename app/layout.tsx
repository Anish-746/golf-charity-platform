import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";

// Validate environment variables on startup
if (!process.env.SKIP_ENV_VALIDATION) {
  const validation = validateEnv();
  if (!validation.valid) {
    throw new Error(
      "Environment validation failed. Check logs for missing variables."
    );
  }
}

// Inter is a clean, modern sans-serif font — perfect for our non-traditional design
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Golf Charity Platform",
  description: "Play golf. Win prizes. Fund charity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* children is whatever page the user is currently on */}
        {children}
      </body>
    </html>
  );
}

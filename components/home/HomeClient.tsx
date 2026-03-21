// components/home/HomeClient.tsx
// The entire animated homepage lives here as a client component
// so we can use Framer Motion animations throughout.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Charity } from "@/types/database";

// ── Animated Counter ──────────────────────────────────────────────────────────
// Counts up from 0 to the target value when the element scrolls into view.
// This creates the "live stats" feel the PRD asks for.
function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic — starts fast, slows at the end
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── How It Works Step ─────────────────────────────────────────────────────────
function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
        {number}
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeClient({
  subscriberCount,
  featuredCharities,
  currentJackpot,
  totalCharityRaised,
  hasMoreCharities,
}: {
  subscriberCount: number;
  featuredCharities: Charity[];
  currentJackpot: number;
  totalCharityRaised: number;
  hasMoreCharities: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-slate-800/60 px-6 py-4 sticky top-0 z-40 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-xl tracking-tight">
              Tee It Forward
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/charities"
              className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-2"
            >
              Charities
            </Link>
            <Link href="/donate" className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-2">
              Donate
            </Link>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        {/* Background gradient blob — purely decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Monthly draws · Real prizes · Real impact
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Every round
            <br />
            <span className="text-emerald-400">funds a cause.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter your golf scores each month. Get entered into prize draws.
            Watch your subscription fund the charity you care about.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Start for £9.99/month →
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-8 py-4 rounded-xl transition-colors text-sm font-medium"
            >
              See how it works
            </Link>
          </div>

          <p className="text-slate-500 text-sm mt-5">
            Just want to give?{' '}
            <Link href="/donate" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
              Make a direct donation →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Live Stats Bar ──────────────────────────────────────────────────── */}
      <section className="border-y border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">
                <AnimatedCounter target={subscriberCount} suffix="+" />
              </p>
              <p className="text-slate-500 text-sm mt-1">Active members</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-emerald-400">
                <AnimatedCounter
                  target={Math.floor(currentJackpot)}
                  prefix="£"
                />
              </p>
              <p className="text-slate-500 text-sm mt-1">Current jackpot</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">
                <AnimatedCounter
                  target={Math.floor(totalCharityRaised)}
                  prefix="£"
                />
              </p>
              <p className="text-slate-500 text-sm mt-1">Raised for charity</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">
                <AnimatedCounter target={3} />
              </p>
              <p className="text-slate-500 text-sm mt-1">Prize tiers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                How it works
              </p>
              <h2 className="text-4xl font-black mb-10 leading-tight">
                Three steps.
                <br />
                {"That's genuinely it."}
              </h2>
              <div className="space-y-8">
                <Step
                  number="01"
                  title="Subscribe"
                  description="Choose monthly or yearly. A portion of every payment goes straight to your chosen charity, every month."
                />
                <Step
                  number="02"
                  title="Enter your scores"
                  description="Log your last 5 Stableford scores. Your rolling score history is your draw entry — updated automatically."
                />
                <Step
                  number="03"
                  title="Win prizes. Fund good."
                  description="Every month we draw 5 numbers. Match 3, 4, or all 5 against your scores to win from the prize pool. Jackpot rolls over if unclaimed."
                />
              </div>
            </div>

            {/* Prize tier visual */}
            <div className="space-y-3">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-4">
                Prize pool split
              </p>
              {[
                {
                  label: "5-Match Jackpot",
                  percent: 40,
                  color: "bg-yellow-400",
                  rolls: true,
                },
                {
                  label: "4-Match Prize",
                  percent: 35,
                  color: "bg-slate-400",
                  rolls: false,
                },
                {
                  label: "3-Match Prize",
                  percent: 25,
                  color: "bg-amber-700",
                  rolls: false,
                },
              ].map((tier) => (
                <div
                  key={tier.label}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-800"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">
                      {tier.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {tier.rolls && (
                        <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                          Rolls over
                        </span>
                      )}
                      <span className="text-slate-400 text-sm font-bold">
                        {tier.percent}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${tier.color}`}
                      style={{ width: `${tier.percent}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-slate-600 text-xs pt-2">
                Prize pool built from subscriber contributions each month.
                Jackpot grows when unclaimed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Charities ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Making a difference
            </p>
            <h2 className="text-4xl font-black">Charities you can support</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Choose where your contribution goes every month. Switch anytime
              from your dashboard.
            </p>
          </div>

          {featuredCharities.length === 0 ? (
            // Fallback state — shown before any charities are added via admin panel
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg mb-2">Charities coming soon.</p>
              <p className="text-sm">
                Our team is onboarding charity partners.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredCharities.map((charity) => (
                  <div
                    key={charity.id}
                    className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all group"
                  >
                    {charity.is_featured && (
                      <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full mb-3 font-medium">
                        Featured
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg mb-4 group-hover:bg-emerald-500/30 transition-colors">
                      ♥
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      {charity.name}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
                      {charity.description ||
                        "Supporting people who need it most."}
                    </p>
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
                      >
                        Visit website →
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* View all charities CTA — only shown if there are more than 3 */}
              {hasMoreCharities && (
                <div className="text-center mt-10">
                  <Link
                    href="/charities"
                    className="inline-flex items-center gap-2 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
                  >
                    View all supported charities →
                  </Link>
                </div>
              )}

              {/* Even if only 3, still link to the full directory */}
              {!hasMoreCharities && featuredCharities.length > 0 && (
                <div className="text-center mt-10">
                  <Link
                    href="/charities"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    Browse charity directory →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Ready to play for good?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join{" "}
            {subscriberCount > 0
              ? `${subscriberCount}+ members`
              : "our growing community"}{" "}
            already earning prizes while funding causes they care about.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl px-10 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Subscribe from £9.99/month →
          </Link>
          <p className="text-slate-600 text-sm mt-4">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Tee It Forward. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/charities"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Charities
            </Link>
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="/subscribe"
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

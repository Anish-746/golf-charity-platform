// components/dashboard/SubscriptionModule.tsx
// Pure display component — just shows subscription status.
// Server-rendered, no 'use client' needed since there's no interactivity.

import type { Profile } from "@/types/database";
import ManageButton from "./ManageButton";

// A helper to format date strings into readable form
function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Maps subscription status to a colour for the badge
const statusConfig = {
  active: {
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    label: "Active",
  },
  inactive: {
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    label: "Inactive",
  },
  cancelled: { color: "text-red-400", bg: "bg-red-400/10", label: "Cancelled" },
  lapsed: { color: "text-amber-400", bg: "bg-amber-400/10", label: "Lapsed" },
};

export default function SubscriptionModule({ profile, }: { profile: Profile | null; }) {
  if (!profile) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-4">
          Subscription
        </h2>
        <p className="text-slate-400 text-sm">
          Unable to load subscription data.
        </p>
      </div>
    );
  }

  const status = profile.subscription_status;
  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-4">
        Subscription
      </h2>

      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${config.bg} ${config.color}`}
        >
          {config.label}
        </span>
      </div>

      {status === "active" ? (
        <div>
          <p className="text-slate-300 text-sm mb-4">
            You are entered into every monthly draw automatically while your subscription is active.
          </p>
          <ManageButton />
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-sm mb-4">
            Subscribe to enter monthly draws and support your chosen charity.
          </p>
          {/* This will link to the Stripe checkout — we'll wire this up in the Stripe step */}
          <a
            href="/subscribe"
            className="block w-full text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            Subscribe Now
          </a>
        </div>
      )}
    </div>
  );
}

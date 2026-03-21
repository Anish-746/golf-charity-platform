// app/api/donate/route.ts
// Creates a one-time Stripe Checkout session for a direct donation.
// No subscription — mode is 'payment', not 'subscription'.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { charityId, amount, donorName, donorEmail } = await request.json();

  if (!charityId || !amount || amount < 1) {
    return NextResponse.json(
      { error: "Invalid donation details" },
      { status: 400 },
    );
  }
  if (!donorEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Verify charity exists
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: charity } = await supabase
    .from("charities")
    .select("name")
    .eq("id", charityId)
    .eq("is_active", true)
    .single();

  if (!charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment", // one-time payment, not subscription
    customer_email: donorEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: Math.round(amount * 100), // Stripe uses pence
          product_data: {
            name: `Donation to ${charity.name}`,
            description: `Direct donation via Tee It Forward${donorName ? ` from ${donorName}` : ""}`,
          },
        },
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate?success=true&charity=${encodeURIComponent(charity.name)}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate`,
    metadata: {
      type: "donation",
      charity_id: charityId,
      charity_name: charity.name,
      donor_name: donorName || "",
    },
  });

  // Update the charity's total_raised in Supabase
  // We do this optimistically here — in production you'd do this
  // in a webhook listening for 'checkout.session.completed' instead
  await supabase.rpc("increment_charity_raised", {
    charity_id: charityId,
    amount_to_add: amount,
  });

  return NextResponse.json({ url: session.url });
}

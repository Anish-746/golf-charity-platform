import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN = process.env.RESEND_DOMAIN || "onboarding@resend.dev";
const FROM = `Tee It Forward <${DOMAIN}>`;

export async function sendWinnerNotification({
  to,
  name,
  prizeAmount,
  drawMonth,
  matchType = 5,
}: {
  to: string;
  name: string;
  prizeAmount: number;
  drawMonth: string;
  matchType?: 3 | 4 | 5;
}) {
  const formattedMonth = new Date(drawMonth).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const prizeDescription = 
    matchType === 5 ? "Jackpot! 5 matches" :
    matchType === 4 ? "Excellent! 4 matches" :
    "Great! 3 matches";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You won the ${formattedMonth} Tee It Forward draw!`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:16px">
        <h1 style="color:#10b981;font-size:28px;margin-bottom:8px">You won!</h1>
        <p style="color:#94a3b8;font-size:16px">Hi ${name},</p>
        <p style="color:#cbd5e1">${prizeDescription} in the ${formattedMonth} draw.</p>
        <div style="background:#1e293b;border-radius:12px;padding:20px;margin:24px 0">
          <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Your prize</p>
          <p style="color:#10b981;font-size:36px;font-weight:900;margin:0">£${prizeAmount.toFixed(2)}</p>
        </div>
        <p style="color:#94a3b8">Log in to your dashboard to upload your score proof and claim your prize.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
           style="display:inline-block;background:#10b981;color:#0f172a;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          Claim your prize →
        </a>
      </div>
    `,
  });
}

export async function sendDrawResultsNotification({
  to,
  name,
  winningNumbers,
  drawMonth,
}: {
  to: string;
  name: string;
  winningNumbers: number[];
  drawMonth: string;
}) {
  const formattedMonth = new Date(drawMonth).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${formattedMonth} draw results are in`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:16px">
        <h1 style="font-size:24px;margin-bottom:8px">Draw results: ${formattedMonth}</h1>
        <p style="color:#94a3b8">Hi ${name}, the winning numbers for this month are:</p>
        <div style="display:flex;gap:8px;margin:20px 0">
          ${winningNumbers.map((n) => `<span style="width:40px;height:40px;border-radius:50%;background:#10b981;color:#0f172a;font-weight:900;display:inline-flex;align-items:center;justify-content:center;font-size:14px">${n}</span>`).join("")}
        </div>
        <p style="color:#94a3b8">Log in to see if your scores matched.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display:inline-block;background:#10b981;color:#0f172a;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          Check your results →
        </a>
      </div>
    `,
  });
}

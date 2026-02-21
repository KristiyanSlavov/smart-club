import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, isDemo } = body;

  if (!["reminder_25", "reminder_29", "overdue_1st"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const fnUrl = `${SUPABASE_URL}/functions/v1/cron-billing`;

  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ type, isDemo: isDemo === true }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

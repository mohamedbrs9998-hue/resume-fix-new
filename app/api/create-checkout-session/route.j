import { NextResponse } from "next/server";

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fakeUrl = ${appUrl}/success?mock=1;

  return NextResponse.json({ checkoutUrl: fakeUrl });
}


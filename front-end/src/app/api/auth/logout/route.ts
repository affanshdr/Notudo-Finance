import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  await auth.api.signOut({
    headers: await headers(),
  });

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}

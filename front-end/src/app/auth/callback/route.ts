import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // 'recovery' untuk reset password
  const next = searchParams.get("next") ?? "/login";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Boleh diabaikan jika dipanggil dari Server Component
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika ini adalah callback reset password → arahkan ke halaman reset password
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      // Jika ini adalah callback verifikasi email → arahkan ke login dengan notifikasi
      return NextResponse.redirect(`${origin}${next}?verified=true`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

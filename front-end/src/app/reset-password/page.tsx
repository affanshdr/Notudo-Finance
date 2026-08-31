"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Halaman ini tidak lagi digunakan sejak migrasi ke Better Auth.
// Flow reset password kini sepenuhnya dihandle di /forgot-password (OTP-based).
// Redirect ke forgot-password jika ada yang mengakses langsung.
export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/forgot-password");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gradient-hero)", color: "var(--text-secondary)" }}>
      Mengalihkan...
    </div>
  );
}

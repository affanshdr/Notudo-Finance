"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";
import { createClient } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const reset = searchParams.get("reset");
    const error = searchParams.get("error");

    if (verified === "true") {
      setStatusMsg({ type: "success", text: "✅ Email berhasil diverifikasi! Silakan masuk dengan akun Anda." });
    } else if (reset === "true") {
      setStatusMsg({ type: "success", text: "✅ Kata sandi berhasil diperbarui! Silakan masuk." });
    } else if (error === "auth_callback_failed") {
      setStatusMsg({ type: "error", text: "⚠️ Link verifikasi tidak valid atau sudah kadaluwarsa." });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!email || !password) {
      setStatusMsg({ type: "error", text: "Email dan kata sandi wajib diisi." });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        let errorMsg = "Login gagal. Periksa email dan kata sandi Anda.";
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = "Email atau kata sandi salah. Silakan coba lagi.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "Email belum diverifikasi. Silakan cek inbox/spam Anda dan klik link aktivasi.";
        } else if (error.message.includes("Too many requests")) {
          errorMsg = "Terlalu banyak percobaan login. Silakan tunggu beberapa menit.";
        }
        setStatusMsg({ type: "error", text: errorMsg });
        setIsLoading(false);
        return;
      }

      setStatusMsg({ type: "success", text: "Login berhasil! Mengalihkan ke dashboard..." });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error login:", err);
      setStatusMsg({ type: "error", text: "Gagal terhubung ke server. Periksa koneksi internet Anda." });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className={styles.loginCard}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>📈</div>
            <span className={styles.logoText}>Notudo Finance</span>
          </Link>
          <h1 className={styles.title}>Selamat Datang Kembali</h1>
          <p className={styles.subtitle}>
            Masuk untuk mengakses data Broker Tracker BEI real-time
          </p>
        </div>

        {/* Alert Notification */}
        {statusMsg && (
          <div
            className={`${styles.alert} ${
              statusMsg.type === "error" ? styles.alertError : styles.alertSuccess
            }`}
          >
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <label htmlFor="password">Kata Sandi</label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Lupa kata sandi?
              </Link>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <>⏳ Memverifikasi...</> : <>🔐 Masuk ke Dashboard</>}
          </button>
        </form>

        {/* Footer link to Register */}
        <div className={styles.footerText}>
          Belum punya akun?{" "}
          <Link href="/register" className={styles.registerLink}>
            Daftar Gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gradient-hero)" }}>
        <div style={{ color: "var(--text-secondary)" }}>Memuat...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

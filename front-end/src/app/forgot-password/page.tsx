"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!email) {
      setStatusMsg({ type: "error", text: "Alamat email wajib diisi." });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        setStatusMsg({ type: "error", text: "Gagal mengirim link reset. Periksa alamat email Anda." });
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
    } catch (err) {
      console.error("Error reset password:", err);
      setStatusMsg({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
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
          <h1 className={styles.title}>
            {emailSent ? "📧 Cek Email Anda" : "🔑 Lupa Kata Sandi"}
          </h1>
          <p className={styles.subtitle}>
            {emailSent
              ? "Link reset kata sandi telah dikirim"
              : "Masukkan email Anda untuk menerima link reset kata sandi"}
          </p>
        </div>

        {emailSent ? (
          <div>
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <span>
                ✅ Link reset kata sandi telah dikirim ke <strong>{email}</strong>. Silakan periksa
                inbox atau folder spam Anda.
              </span>
            </div>
            <div className={styles.footerText} style={{ marginTop: "24px" }}>
              <Link href="/login" className={styles.registerLink} style={{ marginLeft: 0 }}>
                ← Kembali ke halaman login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Alert */}
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
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Alamat Email
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

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? <>⏳ Mengirim Link Reset...</> : <>📨 Kirim Link Reset Kata Sandi</>}
              </button>
            </form>

            <div className={styles.footerText}>
              Ingat kata sandi Anda?{" "}
              <Link href="/login" className={styles.registerLink}>
                Masuk di sini
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

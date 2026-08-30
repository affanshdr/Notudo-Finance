"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./register.module.css";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setStatusMsg({ type: "error", text: "Semua kolom wajib diisi." });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    if (password.length < 6) {
      setStatusMsg({ type: "error", text: "Kata sandi minimal 6 karakter." });
      return;
    }

    if (!agreeTerms) {
      setStatusMsg({ type: "error", text: "Anda harus menyetujui Syarat & Ketentuan." });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        let errorMsg = "Pendaftaran gagal. Silakan coba lagi.";
        if (error.message.includes("already registered")) {
          errorMsg = "Email ini sudah terdaftar. Silakan login atau gunakan email lain.";
        } else if (error.message.includes("weak_password")) {
          errorMsg = "Kata sandi terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.";
        }
        setStatusMsg({ type: "error", text: errorMsg });
        setIsLoading(false);
        return;
      }

      // Tampilkan pesan cek email
      setEmailSent(true);
    } catch (err) {
      console.error("Error submitting register form:", err);
      setStatusMsg({
        type: "error",
        text: "Gagal terhubung ke server. Periksa koneksi internet Anda.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>📈</div>
            <span className={styles.logoText}>Notudo Finance</span>
          </Link>
          <h1 className={styles.title}>
            {emailSent ? "📧 Cek Email Anda" : "Buat Akun Baru"}
          </h1>
          <p className={styles.subtitle}>
            {emailSent
              ? "Link aktivasi telah dikirim ke alamat email Anda"
              : "Dapatkan akses penuh ke fitur Broker Tracker BEI"}
          </p>
        </div>

        {/* Email Sent Confirmation State */}
        {emailSent ? (
          <div style={{ textAlign: "center" }}>
            <div className={`${styles.alert} ${styles.alertSuccess}`} style={{ justifyContent: "center", marginBottom: "20px" }}>
              <span>✅ Silakan periksa inbox atau folder spam email Anda dan klik link aktivasi untuk mengaktifkan akun.</span>
            </div>
            <Link href="/login" className={styles.submitBtn} style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}>
              🔐 Masuk ke Halaman Login
            </Link>
            <div className={styles.footerText}>
              Belum menerima email?{" "}
              <button
                onClick={() => setEmailSent(false)}
                style={{ background: "none", border: "none", color: "var(--accent-blue-bright)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Coba daftar ulang
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* Alert Notification */}
        {statusMsg && (
          <div
            className={`${styles.alert} ${
              statusMsg.type === "error" ? styles.alertError : styles.alertSuccess
            }`}
          >
            <span>{statusMsg.type === "error" ? "⚠️" : "✅"}</span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Nama Lengkap
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
              <input
                id="fullName"
                type="text"
                className={styles.input}
                placeholder="Budi Pratama"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label htmlFor="password" className={styles.label}>
              Kata Sandi
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* Confirm Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Konfirmasi Kata Sandi
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔑</span>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Ulangi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <label className={styles.termsRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span className={styles.termsLabel}>
              Saya menyetujui{" "}
              <Link href="#" className={styles.termsLink}>
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="#" className={styles.termsLink}>
                Kebijakan Privasi
              </Link>{" "}
              Notudo Finance.
            </span>
          </label>

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <>⏳ Memproses Pendaftaran...</>
            ) : (
              <>🚀 Daftar Gratis Sekarang</>
            )}
          </button>
        </form>

        {/* Footer link to Login */}
        <div className={styles.footerText}>
          Sudah punya akun?{" "}
          <Link href="/login" className={styles.loginLink}>
            Masuk di sini
          </Link>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

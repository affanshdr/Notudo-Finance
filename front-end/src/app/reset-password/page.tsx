"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/login.module.css";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!password || !confirmPassword) {
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

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        let errorMsg = "Gagal memperbarui kata sandi. Coba lagi.";
        if (error.message.includes("same password")) {
          errorMsg = "Kata sandi baru tidak boleh sama dengan kata sandi lama.";
        } else if (error.message.includes("weak_password")) {
          errorMsg = "Kata sandi terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.";
        }
        setStatusMsg({ type: "error", text: errorMsg });
        setIsLoading(false);
        return;
      }

      setStatusMsg({ type: "success", text: "✅ Kata sandi berhasil diperbarui! Mengalihkan ke halaman login..." });

      setTimeout(() => {
        router.push("/login?reset=true");
      }, 1500);
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
          <h1 className={styles.title}>🔐 Buat Kata Sandi Baru</h1>
          <p className={styles.subtitle}>
            Masukkan kata sandi baru untuk akun Anda
          </p>
        </div>

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
          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Kata Sandi Baru
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
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <>⏳ Memperbarui Kata Sandi...</> : <>✅ Simpan Kata Sandi Baru</>}
          </button>
        </form>

        <div className={styles.footerText}>
          <Link href="/login" className={styles.registerLink} style={{ marginLeft: 0 }}>
            ← Kembali ke halaman login
          </Link>
        </div>
      </div>
    </div>
  );
}

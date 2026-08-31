"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./register.module.css";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Step 1: Daftar → kirim OTP
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
      // 1. Daftarkan user
      const signUpResult = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });

      if (signUpResult.error) {
        const msg = signUpResult.error.message ?? "";
        let errorMsg = `Pendaftaran gagal: ${msg}`;
        if (msg.includes("already") || msg.includes("USER_ALREADY_EXISTS") || msg.includes("email_taken")) {
          errorMsg = "Email ini sudah terdaftar. Silakan login atau gunakan email lain.";
        }
        setStatusMsg({ type: "error", text: errorMsg });
        setIsLoading(false);
        return;
      }

      // 2. Kirim OTP verifikasi email
      const otpResult = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (otpResult.error) {
        setStatusMsg({
          type: "error",
          text: `Gagal mengirim OTP: ${otpResult.error.message ?? "Silakan coba lagi."}`,
        });
        setIsLoading(false);
        return;
      }

      setStep("otp");
    } catch (err) {
      console.error("[Register Error]", err);
      setStatusMsg({ type: "error", text: "Gagal terhubung ke server. Periksa koneksi internet Anda." });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verifikasi OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (otp.length !== 6) {
      setStatusMsg({ type: "error", text: "Masukkan 6 digit kode OTP." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (result.error) {
        setStatusMsg({
          type: "error",
          text: `Kode OTP tidak valid: ${result.error.message ?? "Coba kirim ulang."}`,
        });
        setIsLoading(false);
        return;
      }

      setStatusMsg({ type: "success", text: "✅ Email berhasil diverifikasi! Silakan login." });
      setTimeout(() => router.push("/login?verified=true"), 1500);
    } catch (err) {
      console.error("[OTP Verify Error]", err);
      setStatusMsg({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
      setIsLoading(false);
    }
  };

  // Kirim ulang OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMsg(null);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (result.error) {
        setResendMsg({ type: "error", text: `Gagal: ${result.error.message ?? "Coba beberapa saat lagi."}` });
      } else {
        setResendMsg({ type: "success", text: "✅ Kode OTP baru telah dikirim ke email Anda." });
      }
    } catch {
      setResendMsg({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setResendLoading(false);
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
            {step === "otp" ? "🔐 Verifikasi Email" : "Buat Akun Baru"}
          </h1>
          <p className={styles.subtitle}>
            {step === "otp"
              ? `Masukkan kode 6 digit yang dikirim ke ${email}`
              : "Dapatkan akses penuh ke fitur Broker Tracker BEI"}
          </p>
        </div>

        {/* Alert */}
        {statusMsg && (
          <div className={`${styles.alert} ${statusMsg.type === "error" ? styles.alertError : styles.alertSuccess}`}>
            <span>{statusMsg.type === "error" ? "⚠️" : "✅"}</span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* =================== STEP 1: Form Registrasi =================== */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName" className={styles.label}>Nama Lengkap</label>
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

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
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

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Kata Sandi</label>
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

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Konfirmasi Kata Sandi</label>
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

            <label className={styles.termsRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className={styles.termsLabel}>
                Saya menyetujui{" "}
                <Link href="#" className={styles.termsLink}>Syarat & Ketentuan</Link>{" "}
                serta{" "}
                <Link href="#" className={styles.termsLink}>Kebijakan Privasi</Link>{" "}
                Notudo Finance.
              </span>
            </label>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <>⏳ Memproses...</> : <>🚀 Daftar & Kirim Kode OTP</>}
            </button>
          </form>
        )}

        {/* =================== STEP 2: Verifikasi OTP =================== */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="otp" className={styles.label}>Kode OTP (6 digit)</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔢</span>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className={styles.input}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                  required
                  style={{ letterSpacing: "0.4em", fontSize: "1.4rem", textAlign: "center" }}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <>⏳ Memverifikasi...</> : <>✅ Verifikasi & Selesai</>}
            </button>

            {resendMsg && (
              <div className={`${styles.alert} ${resendMsg.type === "error" ? styles.alertError : styles.alertSuccess}`} style={{ marginTop: "12px" }}>
                <span>{resendMsg.text}</span>
              </div>
            )}

            <div className={styles.footerText}>
              Tidak menerima kode?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                style={{ background: "none", border: "none", color: "var(--accent-blue-bright)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                {resendLoading ? "⏳ Mengirim..." : "📨 Kirim Ulang OTP"}
              </button>
            </div>

            <div className={styles.footerText}>
              <button
                type="button"
                onClick={() => { setStep("form"); setStatusMsg(null); setOtp(""); }}
                style={{ background: "none", border: "none", color: "var(--accent-blue-bright)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                ← Kembali ke form pendaftaran
              </button>
            </div>
          </form>
        )}

        {step === "form" && (
          <div className={styles.footerText}>
            Sudah punya akun?{" "}
            <Link href="/login" className={styles.loginLink}>
              Masuk di sini
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

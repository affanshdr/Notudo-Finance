"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Step = "email" | "otp" | "new-password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Step 1: Kirim OTP ke email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!email) {
      setStatusMsg({ type: "error", text: "Alamat email wajib diisi." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        setStatusMsg({ type: "error", text: "Gagal mengirim kode OTP. Periksa alamat email Anda." });
        setIsLoading(false);
        return;
      }

      setStep("otp");
    } catch {
      setStatusMsg({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verifikasi OTP → lanjut ke step 3
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (otp.length !== 6) {
      setStatusMsg({ type: "error", text: "Masukkan 6 digit kode OTP." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword || "placeholder", // placeholder, akan di-replace di step 3
      });

      // Jika perlu verifikasi OTP dulu sebelum reset, simpan OTP dan lanjut ke step 3
      if (error && error.message?.includes("password")) {
        // OTP valid, tinggal set password baru
        setStep("new-password");
      } else if (error) {
        setStatusMsg({ type: "error", text: "Kode OTP salah atau sudah kedaluwarsa." });
      } else {
        setStep("new-password");
      }
    } catch {
      setStatusMsg({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password dengan OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!newPassword || !confirmPassword) {
      setStatusMsg({ type: "error", text: "Semua kolom wajib diisi." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: "error", text: "Kata sandi minimal 6 karakter." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });

      if (error) {
        setStatusMsg({ type: "error", text: "Gagal mereset kata sandi. Kode OTP mungkin sudah kedaluwarsa." });
        setIsLoading(false);
        return;
      }

      setStatusMsg({ type: "success", text: "✅ Kata sandi berhasil diperbarui! Mengalihkan ke login..." });
      setTimeout(() => router.push("/login?reset=true"), 1500);
    } catch {
      setStatusMsg({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
      setIsLoading(false);
    }
  };

  const titleMap: Record<Step, string> = {
    email: "🔑 Lupa Kata Sandi",
    otp: "🔐 Masukkan Kode OTP",
    "new-password": "🔒 Buat Kata Sandi Baru",
  };

  const subtitleMap: Record<Step, string> = {
    email: "Masukkan email Anda untuk menerima kode OTP reset kata sandi",
    otp: `Masukkan kode 6 digit yang dikirim ke ${email}`,
    "new-password": "Masukkan kata sandi baru Anda",
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
          <h1 className={styles.title}>{titleMap[step]}</h1>
          <p className={styles.subtitle}>{subtitleMap[step]}</p>
        </div>

        {/* Alert */}
        {statusMsg && (
          <div className={`${styles.alert} ${statusMsg.type === "error" ? styles.alertError : styles.alertSuccess}`}>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* ============= STEP 1: Email ============= */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Alamat Email</label>
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
              {isLoading ? <>⏳ Mengirim Kode OTP...</> : <>📨 Kirim Kode OTP ke Email</>}
            </button>
            <div className={styles.footerText}>
              Ingat kata sandi Anda?{" "}
              <Link href="/login" className={styles.registerLink}>Masuk di sini</Link>
            </div>
          </form>
        )}

        {/* ============= STEP 2: OTP ============= */}
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
              {isLoading ? <>⏳ Memverifikasi...</> : <>✅ Verifikasi Kode OTP</>}
            </button>
            <div className={styles.footerText}>
              Tidak menerima kode?{" "}
              <button
                type="button"
                onClick={() => { setStep("email"); setStatusMsg(null); setOtp(""); }}
                style={{ background: "none", border: "none", color: "var(--accent-blue-bright)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Kirim ulang
              </button>
            </div>
          </form>
        )}

        {/* ============= STEP 3: Password Baru ============= */}
        {step === "new-password" && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword" className={styles.label}>Kata Sandi Baru</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
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
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <>⏳ Menyimpan...</> : <>🔐 Simpan Kata Sandi Baru</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

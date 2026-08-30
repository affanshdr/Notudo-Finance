"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../register/register.module.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memverifikasi link aktivasi akun Anda...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan pada URL.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email berhasil diverifikasi! Akun Anda kini telah aktif.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verifikasi email gagal. Link mungkin tidak valid atau sudah kadaluwarsa.");
        }
      } catch (err) {
        console.error("Error verifying email:", err);
        setStatus("error");
        setMessage("Gagal terhubung ke server. Silakan coba lagi nanti.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>📈</div>
          <span className={styles.logoText}>Notudo Finance</span>
        </Link>
        <h1 className={styles.title}>
          {status === "loading" && "⏳ Aktivasi Akun"}
          {status === "success" && "🎉 Akun Aktif"}
          {status === "error" && "⚠️ Aktivasi Gagal"}
        </h1>
        <p className={styles.subtitle}>Verifikasi Alamat Email Pengguna</p>
      </div>

      <div
        className={`${styles.alert} ${
          status === "error"
            ? styles.alertError
            : styles.alertSuccess
        }`}
        style={{ justifyContent: "center", textAlign: "center", padding: "16px" }}
      >
        <span>{message}</span>
      </div>

      <div style={{ marginTop: "28px", textAlign: "center" }}>
        {status === "success" && (
          <Link href="/login" className={styles.submitBtn} style={{ textDecoration: "none" }}>
            🔐 Masuk ke Halaman Login
          </Link>
        )}

        {status === "error" && (
          <Link href="/register" className={styles.submitBtn} style={{ textDecoration: "none" }}>
            🚀 Daftar Ulang Akun
          </Link>
        )}

        {status === "loading" && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Mohon tunggu sebentar...
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      <Suspense
        fallback={
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.title}>⏳ Memuat Halaman...</h1>
            </div>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

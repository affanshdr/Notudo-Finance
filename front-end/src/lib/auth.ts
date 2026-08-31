import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import nodemailer from "nodemailer";

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,   // email gmail kamu
    pass: process.env.GMAIL_APP_PASSWORD, // 16 karakter app password
  },
});

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // OTP dihandle manual via emailOTP plugin
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 menit
      async sendVerificationOTP({ email, otp, type }) {
        const subjectMap: Record<string, string> = {
          "email-verification": "Kode Aktivasi Akun Notudo Finance",
          "forget-password": "Kode Reset Kata Sandi Notudo Finance",
          "sign-in": "Kode Masuk Notudo Finance",
        };

        const descMap: Record<string, string> = {
          "email-verification": "mengaktifkan akun",
          "forget-password": "mereset kata sandi",
          "sign-in": "masuk ke akun",
        };

        const subject = subjectMap[type] ?? "Kode OTP Notudo Finance";
        const desc = descMap[type] ?? "mengakses akun";

        // Fallback: selalu print ke terminal dulu
        console.log(`\n${"=".repeat(50)}`);
        console.log(`[OTP] Email: ${email}`);
        console.log(`[OTP] Kode: ${otp}`);
        console.log(`[OTP] Tipe: ${type}`);
        console.log(`${"=".repeat(50)}\n`);

        // Kirim via Gmail SMTP
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
          console.warn("[SMTP] GMAIL_USER atau GMAIL_APP_PASSWORD belum diset di .env");
          return;
        }

        try {
          await transporter.sendMail({
            from: `"Notudo Finance" <${process.env.GMAIL_USER}>`,
            to: email,
            subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0b0f19; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f2937;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">📈 Notudo Finance</h1>
                </div>
                <h2 style="font-size: 20px; color: #f9fafb; margin-top: 0;">Kode Verifikasi Anda</h2>
                <p style="color: #d1d5db; line-height: 1.6;">
                  Gunakan kode berikut untuk ${desc}. Kode ini berlaku selama <strong>10 menit</strong>.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <div style="display: inline-block; background-color: #0f172a; border: 2px solid #0284c7; border-radius: 12px; padding: 20px 40px;">
                    <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #38bdf8; font-family: monospace;">${otp}</span>
                  </div>
                </div>
                <hr style="border: none; border-top: 1px solid #374151; margin: 32px 0 16px 0;" />
                <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                  Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.<br/>
                  Kode ini hanya berlaku selama 10 menit.
                </p>
              </div>
            `,
          });

          console.log(`[SMTP] ✅ Email OTP berhasil dikirim ke ${email}`);
        } catch (err) {
          console.error("[SMTP] ❌ Gagal kirim email:", err);
        }
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

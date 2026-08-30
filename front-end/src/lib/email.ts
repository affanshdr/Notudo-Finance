import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendVerificationEmail(email: string, token: string) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationLink = `${domain}/verify-email?token=${token}`;

  console.log("\n=======================================================");
  console.log(`[LINK AKTIVASI EMAIL UNTUK: ${email}]`);
  console.log(verificationLink);
  console.log("=======================================================\n");

  if (resend) {
    try {
      await resend.emails.send({
        from: "Notudo Finance <onboarding@resend.dev>",
        to: email,
        subject: "Aktivasi Akun Notudo Finance Anda",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0b0f19; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f2937;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">📈 Notudo Finance</h1>
            </div>
            <h2 style="font-size: 20px; color: #f9fafb; margin-top: 0;">Selamat Datang!</h2>
            <p style="color: #d1d5db; line-height: 1.6;">Terima kasih telah mendaftar di Notudo Finance. Untuk menyelesaikan pendaftaran dan mulai menggunakan platform, silakan aktifkan akun Anda melalui tombol di bawah ini:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationLink}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                🚀 Aktifkan Akun Saya
              </a>
            </div>
            <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">Atau salin dan tempel link berikut ke peramban (browser) Anda:</p>
            <p style="font-size: 13px; color: #38bdf8; word-break: break-all;">${verificationLink}</p>
            <hr style="border: none; border-top: 1px solid #374151; margin: 32px 0 16px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
              Link aktivasi ini berlaku selama 24 jam.<br/>
              Jika Anda merasa tidak melakukan pendaftaran akun ini, Anda dapat mengabaikan email ini.
            </p>
          </div>
        `,
      });
      console.log(`Email aktivasi berhasil dikirim via Resend ke ${email}`);
    } catch (err) {
      console.error("Gagal mengirim email via Resend:", err);
    }
  } else {
    console.log("💡 [DEV NOTE] RESEND_API_KEY belum dikonfigurasi di .env. Gunakan link aktivasi yang dicetak di terminal di atas.");
  }
}

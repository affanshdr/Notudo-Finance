import Link from "next/link";
import styles from "./page.module.css";

// Mock broker data for preview teaser
const mockBrokers = [
  { code: "BK",  name: "JP Morgan",     buy: 48_200_000, sell: 12_100_000, net: "+36.1M", netPositive: true,  barW: 88 },
  { code: "YU",  name: "UBS Securities", buy: 35_800_000, sell: 8_500_000,  net: "+27.3M", netPositive: true,  barW: 66 },
  { code: "ZP",  name: "Macquarie",      buy: 11_200_000, sell: 39_400_000, net: "-28.2M", netPositive: false, barW: 52 },
  { code: "AK",  name: "CLSA",           buy: 22_000_000, sell: 31_500_000, net: "-9.5M",  netPositive: false, barW: 42 },
];

function formatVolume(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  return (v / 1_000).toFixed(0) + "K";
}

export default function Home() {
  return (
    <>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.navLogo}>
            <div className={styles.navLogoIcon}>📈</div>
            <span className={styles.navLogoText}>Notudo Finance</span>
          </Link>

          <ul className={styles.navLinks}>
            <li className={styles.navLink}>Broker Tracker</li>
            <li className={styles.navLink}>Fitur</li>
            <li className={styles.navLink}>Harga</li>
            <li className={styles.navLink}>Tentang</li>
          </ul>

          <div className={styles.navActions}>
            <Link id="nav-login-btn" href="/login" className={styles.btnGhost}>Masuk</Link>
            <Link id="nav-register-btn" href="/register" className={styles.btnPrimary}>Daftar Gratis →</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero Section ── */}
        <section className={styles.hero}>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={`${styles.heroOrb} ${styles.heroOrb1}`} aria-hidden="true" />
          <div className={`${styles.heroOrb} ${styles.heroOrb2}`} aria-hidden="true" />

          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Live · Data Broker BEI Real-time
          </div>

          <h1 className={styles.heroTitle}>
            Pantau Pergerakan<br />
            <span className={styles.heroTitleAccent}>Broker Saham BEI</span><br />
            Sebelum Pasar Bergerak
          </h1>

          <p className={styles.heroSubtitle}>
            Lihat siapa broker yang paling agresif beli atau jual saham pilihanmu.
            Deteksi akumulasi institusi besar sebelum harga bergerak signifikan —
            data langsung dari Bursa Efek Indonesia.
          </p>

          <div className={styles.heroCta}>
            <Link id="hero-register-btn" href="/register" className={styles.btnHeroPrimary}>
              🚀 Coba Gratis Sekarang
            </Link>
            <Link id="hero-demo-btn" href="/login" className={styles.btnHeroSecondary}>
              👀 Lihat Demo
            </Link>
          </div>

          {/* ── Mock Broker Tracker Preview ── */}
          <div className={styles.previewWrap}>
            <div className={styles.previewGlow} aria-hidden="true" />
            <div className={styles.previewCard}>
              {/* Window chrome */}
              <div className={styles.previewBar}>
                <div className={`${styles.previewDot} ${styles.dot1}`} />
                <div className={`${styles.previewDot} ${styles.dot2}`} />
                <div className={`${styles.previewDot} ${styles.dot3}`} />
                <span className={styles.previewTitle}>notudo.finance / broker-tracker</span>
              </div>

              <div className={styles.previewBody}>
                {/* Header row */}
                <div className={styles.previewHeader}>
                  <div className={styles.previewEmiten}>
                    <div className={styles.previewTicker}>BBCA</div>
                    <div className={styles.previewTickerName}>
                      Bank Central Asia Tbk
                      <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        · 29 Aug 2025
                      </span>
                    </div>
                  </div>
                  <div className={styles.previewMeta}>
                    <span className={`${styles.previewBadge} ${styles.badgeBuy}`}>▲ Net Buy</span>
                    <span className={`${styles.previewBadge} ${styles.badgeSell}`}>▼ Net Sell</span>
                  </div>
                </div>

                {/* Broker table */}
                <table className={styles.brokerTable}>
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Broker</th>
                      <th>Vol. Beli</th>
                      <th>Vol. Jual</th>
                      <th>Net</th>
                      <th>Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBrokers.map((b) => (
                      <tr key={b.code} className={styles.brokerRow}>
                        <td><span className={styles.brokerCode}>{b.code}</span></td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{b.name}</td>
                        <td style={{ color: "#34d399", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
                          {formatVolume(b.buy)}
                        </td>
                        <td style={{ color: "#f87171", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
                          {formatVolume(b.sell)}
                        </td>
                        <td style={{
                          color: b.netPositive ? "#34d399" : "#f87171",
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.8rem"
                        }}>
                          {b.net}
                        </td>
                        <td>
                          <div className={styles.volumeBarWrap}>
                            <div
                              className={`${styles.volumeBar} ${b.netPositive ? styles.barBuy : styles.barSell}`}
                              style={{ width: b.barW }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Blur overlay hinting locked data */}
              <div className={styles.previewBlur}>
                <span className={styles.previewBlurText}>
                  🔒 Daftar untuk melihat data lengkap semua emiten
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <div className="container">
          <div className={styles.statsStrip}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>826</div>
              <div className={styles.statLabel}>Emiten BEI</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statValue}>775+</div>
              <div className={styles.statLabel}>Dataset Harga</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statValue}>100+</div>
              <div className={styles.statLabel}>Kode Broker</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statValue}>10</div>
              <div className={styles.statLabel}>Sektor Industri</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statValue}>Live</div>
              <div className={styles.statLabel}>Update Data</div>
            </div>
          </div>
        </div>

        {/* ── Features Section ── */}
        <section className={styles.section} id="fitur">
          <div className="container">
            <span className={styles.sectionLabel}>Kenapa Notudo Finance?</span>
            <h2 className={styles.sectionTitle}>
              Keunggulan yang Tidak Bisa<br />
              Kamu Temukan di Tempat Lain
            </h2>
            <p className={styles.sectionSubtitle}>
              Dibangun khusus untuk investor dan trader saham Indonesia yang
              ingin lebih dari sekadar grafik harga.
            </p>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>🏦</div>
                <h3 className={styles.featureTitle}>Broker Activity Heatmap</h3>
                <p className={styles.featureDesc}>
                  Visualisasi broker mana yang paling aktif beli atau jual di setiap emiten.
                  Deteksi pola akumulasi dan distribusi institusi besar.
                </p>
                <span className={styles.featureTag}>buy · sell · net flow</span>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>📊</div>
                <h3 className={styles.featureTitle}>Data OHLCV Historis</h3>
                <p className={styles.featureDesc}>
                  Akses data Open, High, Low, Close, Volume untuk 775+ emiten BEI.
                  Filter berdasarkan sektor, sub-sektor, atau rentang waktu tertentu.
                </p>
                <span className={styles.featureTag}>OHLCV · pandas · CSV</span>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.featureIconGold}`}>⚡</div>
                <h3 className={styles.featureTitle}>Update Inkremental Otomatis</h3>
                <p className={styles.featureDesc}>
                  Data diperbarui secara otomatis tanpa duplikasi. Pipeline cerdas
                  hanya mengambil data yang belum ada — hemat waktu dan efisien.
                </p>
                <span className={styles.featureTag}>auto · incremental</span>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>🔍</div>
                <h3 className={styles.featureTitle}>Filter Sektoral</h3>
                <p className={styles.featureDesc}>
                  Bandingkan aktivitas broker antar emiten dalam satu sektor.
                  Temukan sektor mana yang sedang diakumulasi institusi besar.
                </p>
                <span className={styles.featureTag}>10 sektor · BEI</span>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.featureIconRed}`}>📡</div>
                <h3 className={styles.featureTitle}>Lacak Broker Favorit</h3>
                <p className={styles.featureDesc}>
                  Pantau aktivitas broker spesifik di semua emiten sekaligus.
                  Ketahui broker mana yang sedang bergerak aktif hari ini.
                </p>
                <span className={styles.featureTag}>broker tracking</span>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.featureIconCyan}`}>🛡️</div>
                <h3 className={styles.featureTitle}>Data Langsung dari BEI</h3>
                <p className={styles.featureDesc}>
                  Data bersumber dari Stockbit dengan verifikasi ketat. Bukan
                  data estimasi — ini data transaksi nyata dari bursa Indonesia.
                </p>
                <span className={styles.featureTag}>stockbit · verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials / Social Proof ── */}
        <section className={`${styles.section} ${styles.socialBg}`} id="ulasan">
          <div className="container">
            <span className={styles.sectionLabel}>Dari Pengguna Kami</span>
            <h2 className={styles.sectionTitle}>
              Dipercaya Investor &amp;<br />
              Trader Indonesia
            </h2>

            <div className={styles.testimonialGrid}>
              <div className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>
                  &ldquo;Akhirnya ada tools yang bisa lihat <strong>siapa broker yang beli besar</strong> di saham
                  incaran gue. Sebelum pakai Notudo, gue buta sama sekali soal aktivitas institusi.&rdquo;
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={`${styles.testimonialAvatar} ${styles.avatarBlue}`}>R</div>
                  <div>
                    <div className={styles.testimonialName}>Rizky A.</div>
                    <div className={styles.testimonialRole}>Trader Saham · Jakarta</div>
                  </div>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>
                  &ldquo;Data broker summary-nya lengkap banget. Gue bisa filter per sektor dan lihat
                  <strong>tren akumulasi institusi</strong> secara bersamaan — ini game changer.&rdquo;
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={`${styles.testimonialAvatar} ${styles.avatarGreen}`}>D</div>
                  <div>
                    <div className={styles.testimonialName}>Dita S.</div>
                    <div className={styles.testimonialRole}>Analis Investasi · Surabaya</div>
                  </div>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>
                  &ldquo;Dashboard-nya clean dan <strong>update-nya otomatis</strong>. Gak perlu manually download
                  data lagi tiap hari — sangat membantu workflow analisis gue.&rdquo;
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={`${styles.testimonialAvatar} ${styles.avatarPurple}`}>F</div>
                  <div>
                    <div className={styles.testimonialName}>Farhan B.</div>
                    <div className={styles.testimonialRole}>Investor Ritel · Bandung</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className={styles.ctaSection} id="daftar">
          <div className={styles.ctaGlow} aria-hidden="true" />
          <div className="container">
            <div className={styles.ctaCard}>
              <div className={styles.ctaBadge}>
                <span className={styles.heroBadgeDot} />
                Gratis untuk memulai
              </div>

              <h2 className={styles.ctaTitle}>
                Mulai Pantau Broker<br />
                <span className={styles.ctaGradientText}>Saham BEI Hari Ini</span>
              </h2>

              <p className={styles.ctaDesc}>
                Bergabung dengan ratusan investor dan trader Indonesia yang sudah
                menggunakan Notudo Finance untuk membaca pergerakan broker institusi
                sebelum pasar bergerak.
              </p>

              <div className={styles.ctaButtons}>
                <Link id="cta-register-btn" href="/register" className={styles.btnCtaRegister}>
                  🚀 Daftar Gratis Sekarang
                </Link>
                <Link id="cta-login-btn" href="/login" className={styles.btnCtaLogin}>
                  🔐 Sudah punya akun? Masuk
                </Link>
              </div>

              <div className={styles.ctaNote}>
                <span className={styles.ctaNoteItem}>✓ Tidak perlu kartu kredit</span>
                <span className={styles.ctaNoteItem}>✓ Setup dalam 2 menit</span>
                <span className={styles.ctaNoteItem}>✓ Data BEI terverifikasi</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLeft}>
            <span className={styles.footerLogo}>Notudo Finance</span>
            <span className={styles.footerTagline}>Broker Tracker · Data Saham BEI Indonesia</span>
          </div>

          <div className={styles.footerStack}>
            <span className={styles.stackPill}>Python</span>
            <span className={styles.stackPill}>Selenium</span>
            <span className={styles.stackPill}>FastAPI</span>
            <span className={styles.stackPill}>Next.js</span>
            <span className={styles.stackPill}>TypeScript</span>
          </div>
        </div>
      </footer>
    </>
  );
}

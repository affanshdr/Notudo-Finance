import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import styles from "./dashboard.module.css";
import BrokerTrackerClient from "./BrokerTrackerClient";
import { db } from "@/lib/db";

// ─── Fallback Mock Data jika DB masih kosong ───
const MOCK_BROKER_DATA = [
  { ticker: "BBCA", name: "Bank Central Asia Tbk", broker: "BK", brokerFull: "JP Morgan", buyVol: 48_200_000, sellVol: 12_100_000, date: "2025-08-29" },
  { ticker: "BBCA", name: "Bank Central Asia Tbk", broker: "YU", brokerFull: "UBS Securities", buyVol: 35_800_000, sellVol: 8_500_000, date: "2025-08-29" },
  { ticker: "BBCA", name: "Bank Central Asia Tbk", broker: "ZP", brokerFull: "Macquarie", buyVol: 11_200_000, sellVol: 39_400_000, date: "2025-08-29" },
  { ticker: "BBCA", name: "Bank Central Asia Tbk", broker: "AK", brokerFull: "CLSA", buyVol: 22_000_000, sellVol: 31_500_000, date: "2025-08-29" },
  { ticker: "BBRI", name: "Bank Rakyat Indonesia Tbk", broker: "CC", brokerFull: "Mandiri Sekuritas", buyVol: 62_400_000, sellVol: 15_200_000, date: "2025-08-29" },
  { ticker: "BBRI", name: "Bank Rakyat Indonesia Tbk", broker: "ZP", brokerFull: "Macquarie", buyVol: 28_600_000, sellVol: 71_800_000, date: "2025-08-29" },
  { ticker: "BBRI", name: "Bank Rakyat Indonesia Tbk", broker: "YJ", brokerFull: "Morgan Stanley", buyVol: 44_100_000, sellVol: 9_300_000, date: "2025-08-29" },
  { ticker: "TLKM", name: "Telkom Indonesia Tbk", broker: "BK", brokerFull: "JP Morgan", buyVol: 31_500_000, sellVol: 8_200_000, date: "2025-08-29" },
  { ticker: "TLKM", name: "Telkom Indonesia Tbk", broker: "LG", brokerFull: "Goldman Sachs", buyVol: 19_800_000, sellVol: 42_600_000, date: "2025-08-29" },
  { ticker: "TLKM", name: "Telkom Indonesia Tbk", broker: "KI", brokerFull: "Deutsche Bank", buyVol: 24_300_000, sellVol: 11_100_000, date: "2025-08-29" },
  { ticker: "ASII", name: "Astra International Tbk", broker: "YU", brokerFull: "UBS Securities", buyVol: 55_700_000, sellVol: 13_400_000, date: "2025-08-29" },
  { ticker: "ASII", name: "Astra International Tbk", broker: "BK", brokerFull: "JP Morgan", buyVol: 18_900_000, sellVol: 38_200_000, date: "2025-08-29" },
  { ticker: "GOTO", name: "GoTo Gojek Tokopedia Tbk", broker: "YJ", brokerFull: "Morgan Stanley", buyVol: 112_400_000, sellVol: 28_900_000, date: "2025-08-29" },
  { ticker: "GOTO", name: "GoTo Gojek Tokopedia Tbk", broker: "ZP", brokerFull: "Macquarie", buyVol: 34_600_000, sellVol: 89_100_000, date: "2025-08-29" },
  { ticker: "BMRI", name: "Bank Mandiri Tbk", broker: "CC", brokerFull: "Mandiri Sekuritas", buyVol: 78_300_000, sellVol: 21_400_000, date: "2025-08-29" },
  { ticker: "BMRI", name: "Bank Mandiri Tbk", broker: "LG", brokerFull: "Goldman Sachs", buyVol: 41_200_000, sellVol: 16_800_000, date: "2025-08-29" },
  { ticker: "UNVR", name: "Unilever Indonesia Tbk", broker: "AK", brokerFull: "CLSA", buyVol: 9_400_000, sellVol: 28_700_000, date: "2025-08-29" },
  { ticker: "INDF", name: "Indofood CBP Tbk", broker: "KI", brokerFull: "Deutsche Bank", buyVol: 33_600_000, sellVol: 12_100_000, date: "2025-08-29" },
];

async function getBrokerData() {
  try {
    const rawData = await db.brokerSummary.findMany({
      take: 200,
      orderBy: { date: "desc" },
      include: { emiten: true },
    });

    if (!rawData || rawData.length === 0) {
      return { brokerData: MOCK_BROKER_DATA, isReal: false };
    }

    const brokerData = rawData.map((row) => ({
      ticker: row.ticker,
      name: row.emiten?.name || `Saham ${row.ticker}`,
      broker: row.brokerCode,
      brokerFull: `Broker ${row.brokerCode}`,
      buyVol: Number(row.buyVolume),
      sellVol: Number(row.sellVolume),
      date: row.date.toISOString().split("T")[0],
    }));

    return { brokerData, isReal: true };
  } catch (err) {
    console.error("Gagal mengambil data broker dari DB:", err);
    return { brokerData: MOCK_BROKER_DATA, isReal: false };
  }
}

// Hitung net per ticker untuk top movers
function calcTopMovers(data: typeof MOCK_BROKER_DATA) {
  const netByTicker: Record<string, { ticker: string; name: string; net: number; totalBuy: number; totalSell: number }> = {};
  for (const row of data) {
    if (!netByTicker[row.ticker]) {
      netByTicker[row.ticker] = { ticker: row.ticker, name: row.name, net: 0, totalBuy: 0, totalSell: 0 };
    }
    netByTicker[row.ticker].net += row.buyVol - row.sellVol;
    netByTicker[row.ticker].totalBuy += row.buyVol;
    netByTicker[row.ticker].totalSell += row.sellVol;
  }
  return Object.values(netByTicker).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

// Hitung top broker untuk chart
function calcTopBrokers(data: typeof MOCK_BROKER_DATA) {
  const brokerNet: Record<string, { broker: string; net: number }> = {};
  for (const row of data) {
    if (!brokerNet[row.broker]) brokerNet[row.broker] = { broker: row.broker, net: 0 };
    brokerNet[row.broker].net += row.buyVol - row.sellVol;
  }
  return Object.values(brokerNet).sort((a, b) => b.net - a.net).slice(0, 8);
}

function formatVol(v: number) {
  if (Math.abs(v) >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  return (v / 1_000).toFixed(0) + "K";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userName = session?.user?.name?.split(" ")[0] || "Investor";

  const { brokerData, isReal } = await getBrokerData();

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const topMovers = calcTopMovers(brokerData);
  const topBrokers = calcTopBrokers(brokerData);
  const maxBrokerNet = Math.max(...topBrokers.map(b => Math.abs(b.net)), 1);

  const totalEmiten = new Set(brokerData.map(r => r.ticker)).size;
  const totalBrokers = new Set(brokerData.map(r => r.broker)).size;
  const totalTxn = brokerData.length;
  const netBuyCount = topMovers.filter(m => m.net > 0).length;

  return (
    <>
      {/* ─── Top Header ─── */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <h1>Selamat Datang, {userName} 👋</h1>
          <p>{today}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            {isReal ? "Data Live (Database)" : "Data Demo (Mock)"}
          </div>
        </div>
      </header>

      {/* ─── Page Body ─── */}
      <main className={styles.pageBody}>

        {/* ─── Broker Tracker Table ─── */}
        <BrokerTrackerClient data={brokerData} />

        {/* ─── Stats Bar ─── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Total Emiten</div>
            <div className={`${styles.statCardValue} ${styles.blue}`}>{totalEmiten}</div>
            <div className={styles.statCardSub}>emiten terpantau hari ini</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Kode Broker Aktif</div>
            <div className={styles.statCardValue}>{totalBrokers}</div>
            <div className={styles.statCardSub}>dari 100+ broker terdaftar BEI</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Net Buy Emiten</div>
            <div className={`${styles.statCardValue} ${styles.green}`}>{netBuyCount}</div>
            <div className={styles.statCardSub}>dari {totalEmiten} emiten hari ini</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardLabel}>Total Transaksi</div>
            <div className={styles.statCardValue}>{totalTxn}</div>
            <div className={styles.statCardSub}>baris data broker summary</div>
          </div>
        </div>

        {/* ─── Top Movers ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>🔥 Top Movers Hari Ini</h2>
              <p className={styles.sectionMeta}>Emiten dengan net flow broker terbesar</p>
            </div>
          </div>
          <div className={styles.topMoversGrid}>
            {topMovers.slice(0, 5).map((m) => (
              <div
                key={m.ticker}
                className={`${styles.moverCard} ${m.net > 0 ? styles.buyCard : styles.sellCard}`}
              >
                <div className={styles.moverTicker}>{m.ticker}</div>
                <div className={styles.moverName}>{m.name}</div>
                <div className={`${styles.moverNet} ${m.net > 0 ? styles.pos : styles.neg}`}>
                  {m.net > 0 ? "+" : ""}{formatVol(m.net)}
                </div>
                <span className={`${styles.moverLabel} ${m.net > 0 ? styles.buy : styles.sell}`}>
                  {m.net > 0 ? "▲ Net Buy" : "▼ Net Sell"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Chart Section ─── */}
        <div className={styles.chartGrid}>
          {/* Top Broker Net Buy */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartCardTitle}>🏦 Top Broker Net Flow</h3>
            <div className={styles.chartBar}>
              {topBrokers.map((b) => (
                <div key={b.broker} className={styles.chartBarRow}>
                  <span className={styles.chartBarLabel}>{b.broker}</span>
                  <div className={styles.chartBarTrack}>
                    <div
                      className={styles.chartBarFill}
                      style={{
                        width: `${(Math.abs(b.net) / maxBrokerNet) * 100}%`,
                        background: b.net > 0
                          ? "linear-gradient(90deg, #34d399, #059669)"
                          : "linear-gradient(90deg, #f87171, #dc2626)",
                      }}
                    />
                  </div>
                  <span className={styles.chartBarValue} style={{ color: b.net > 0 ? "#34d399" : "#f87171" }}>
                    {b.net > 0 ? "+" : ""}{formatVol(b.net)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Distribusi */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartCardTitle}>📊 Volume Beli vs Jual per Emiten</h3>
            <div className={styles.chartBar}>
              {topMovers.slice(0, 6).map((m) => {
                const maxVol = Math.max(m.totalBuy, m.totalSell);
                return (
                  <div key={m.ticker} className={styles.chartBarRow}>
                    <span className={styles.chartBarLabel}>{m.ticker}</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div className={styles.chartBarTrack}>
                        <div
                          className={styles.chartBarFill}
                          style={{
                            width: `${(m.totalBuy / maxVol) * 100}%`,
                            background: "linear-gradient(90deg, #34d399, #059669)",
                          }}
                        />
                      </div>
                      <div className={styles.chartBarTrack}>
                        <div
                          className={styles.chartBarFill}
                          style={{
                            width: `${(m.totalSell / maxVol) * 100}%`,
                            background: "linear-gradient(90deg, #f87171, #dc2626)",
                          }}
                        />
                      </div>
                    </div>
                    <span className={styles.chartBarValue}>{formatVol(m.totalBuy)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Broker Tracker Table ─── */}
        <BrokerTrackerClient data={brokerData} />

      </main>
    </>
  );
}

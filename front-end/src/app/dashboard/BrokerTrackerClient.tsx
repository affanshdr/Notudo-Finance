"use client";

import { useState, useMemo } from "react";
import styles from "./dashboard.module.css";

type BrokerRow = {
  ticker: string;
  name: string;
  broker: string;
  brokerFull: string;
  buyVol: number;
  sellVol: number;
  date: string;
};

function formatVol(v: number) {
  if (Math.abs(v) >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  return (v / 1_000).toFixed(0) + "K";
}

export default function BrokerTrackerClient({ data }: { data: BrokerRow[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"net" | "buy" | "sell">("net");

  const tickers = useMemo(() => ["Semua", ...Array.from(new Set(data.map(d => d.ticker)))], [data]);
  const [selectedTicker, setSelectedTicker] = useState("Semua");

  const filtered = useMemo(() => {
    let rows = data;

    // Filter by ticker
    if (selectedTicker !== "Semua") {
      rows = rows.filter(r => r.ticker === selectedTicker);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.ticker.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.broker.toLowerCase().includes(q) ||
        r.brokerFull.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...rows].sort((a, b) => {
      const netA = a.buyVol - a.sellVol;
      const netB = b.buyVol - b.sellVol;
      if (sortBy === "net") return Math.abs(netB) - Math.abs(netA);
      if (sortBy === "buy") return b.buyVol - a.buyVol;
      if (sortBy === "sell") return b.sellVol - a.sellVol;
      return 0;
    });
  }, [data, search, sortBy, selectedTicker]);

  const maxVol = useMemo(() => Math.max(...data.map(r => Math.max(r.buyVol, r.sellVol))), [data]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>📋 Broker Tracker</h2>
          <p className={styles.sectionMeta}>Detail aktivitas broker per emiten</p>
        </div>
      </div>

      <div className={styles.trackerPanel}>
        {/* Toolbar */}
        <div className={styles.trackerToolbar}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              id="broker-search"
              type="text"
              className={styles.searchInput}
              placeholder="Cari ticker, broker..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Ticker */}
          <select
            id="ticker-filter"
            className={styles.filterSelect}
            value={selectedTicker}
            onChange={e => setSelectedTicker(e.target.value)}
          >
            {tickers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            id="sort-filter"
            className={styles.filterSelect}
            value={sortBy}
            onChange={e => setSortBy(e.target.value as "net" | "buy" | "sell")}
          >
            <option value="net">Urutkan: Net Flow</option>
            <option value="buy">Urutkan: Vol. Beli</option>
            <option value="sell">Urutkan: Vol. Jual</option>
          </select>

          <span className={styles.trackerCount}>
            {filtered.length} dari {data.length} transaksi
          </span>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.brokerTable}>
            <thead>
              <tr>
                <th>Emiten</th>
                <th>Broker</th>
                <th>Vol. Beli</th>
                <th>Vol. Jual</th>
                <th>Net Flow</th>
                <th>Aktivitas</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <div style={{ fontSize: "2rem" }}>🔍</div>
                      <p>Tidak ada data yang cocok dengan pencarian &ldquo;{search}&rdquo;</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const net = row.buyVol - row.sellVol;
                  const isPos = net > 0;
                  const barPct = Math.round((Math.max(row.buyVol, row.sellVol) / maxVol) * 100);

                  return (
                    <tr key={`${row.ticker}-${row.broker}-${i}`}>
                      <td>
                        <div className={styles.tickerCell}>
                          <span className={styles.tickerCode}>{row.ticker}</span>
                          <span className={styles.tickerName}>{row.name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span className={styles.brokerCode}>{row.broker}</span>
                          <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{row.brokerFull}</span>
                        </div>
                      </td>
                      <td className={`${styles.numCell} ${styles.numBuy}`}>{formatVol(row.buyVol)}</td>
                      <td className={`${styles.numCell} ${styles.numSell}`}>{formatVol(row.sellVol)}</td>
                      <td className={`${styles.numCell} ${isPos ? styles.numNetPos : styles.numNetNeg}`}>
                        {isPos ? "+" : ""}{formatVol(net)}
                      </td>
                      <td className={styles.barCell}>
                        <div className={styles.barWrap}>
                          <div
                            className={`${styles.barFill} ${isPos ? styles.barFillBuy : styles.barFillSell}`}
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </td>
                      <td className={styles.dateCell}>{row.date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

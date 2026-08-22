# 🇮🇩 Notudo Finance — BEI Stock Scraper

> **Automated pipeline** untuk mengumpulkan data saham Bursa Efek Indonesia (BEI) dari [Stockbit](https://stockbit.com) menggunakan Selenium + Python.

---

## 📁 Struktur Project

```
Semua Saham/
│
├── 📂 _docs/                          # Dokumentasi & Flow Studio Drag-and-Drop
│   ├── 📄 index.html                  # Flow Studio Studio Drag & Drop ← Buka ini
│   ├── 🎨 style.css                   # System styling & animasi
│   └── ⚙️ app.js                      # Engine Drag & Drop, SVG wiring, & simulasi
│
├── 📄 README.md                       # File ini (index project)
│
└── 📂 pipeline/                       # Kode + data (self-contained, path tidak berubah)
    ├── 🔐 login.ipynb                 # Step 1 · Login ke Stockbit
    ├── 📋 scrap-list-perusahaan.ipynb # Step 2 · Scraping daftar emiten
    ├── 💹 scrap-all-harga.ipynb       # Step 3 · Scraping harga historis
    ├── 📊 scrap-broker-summary.ipynb  # Step 4 · Scraping ringkasan broker
    ├── 🔄 update_existing_csvs.py     # Step 5 · Update & migrasi CSV
    ├── 🧪 test-read.ipynb             # Step 6 · Verifikasi data
    │
    ├── 📂 Driver/
    │   └── msedgedriver.exe           # Selenium WebDriver (Microsoft Edge)
    │
    ├── 📂 List-Perusahaan/
    │   └── Perusahaan.csv             # Master list 826 emiten BEI
    │
    └── 📂 Dataset/
        └── [KODE].JK.csv             # 775 file CSV (satu per emiten)
```

---

## 🔄 Alur Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                   SETUP (Satu kali)                     │
│                                                         │
│   login.ipynb  →  Session Stockbit tersimpan di profil  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              STEP 2 · Scraping Daftar Emiten            │
│                                                         │
│  scrap-list-perusahaan.ipynb                            │
│  ├── Loop 10 sektor × sub-sektor di Stockbit            │
│  ├── Virtual scroll trick (scrollIntoView terakhir)     │
│  └── Output → List-Perusahaan/Perusahaan.csv            │
│                   (826 emiten, 5 kolom)                 │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              STEP 3 · Scraping Harga Historis           │
│                                                         │
│  scrap-all-harga.ipynb                                  │
│  ├── Baca daftar ticker dari Perusahaan.csv             │
│  ├── Download data OHLCV per emiten                     │
│  └── Output → Dataset/[KODE].JK.csv                    │
│                   (775 file CSV)                        │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              STEP 4 · Scraping Broker Summary           │
│                                                         │
│  scrap-broker-summary.ipynb                             │
│  ├── Loop 775 ticker → buka /symbol/[KODE] di Stockbit │
│  ├── Navigasi tanggal mundur (klik Previous)            │
│  ├── Proteksi koneksi: auto-pause jika internet putus   │
│  ├── Validasi kode broker (2 huruf kapital)             │
│  ├── Proteksi overwrite: skip baris yang sudah valid    │
│  └── Append kolom broker ke Dataset/[KODE].JK.csv      │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              STEP 5 · Update & Migrasi CSV              │
│                                                         │
│  update_existing_csvs.py                                │
│  ├── Baca mapping Sektor + Sub_Sektor dari Perusahaan.csv│
│  ├── Sisipkan kolom setelah kolom "Volume"              │
│  └── Skip file yang sudah punya kolom tersebut         │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              STEP 6 · Verifikasi Data                   │
│                                                         │
│  test-read.ipynb                                        │
│  └── Baca & validasi hasil CSV                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Output Data

### `List-Perusahaan/Perusahaan.csv`
| Kolom | Deskripsi |
|-------|-----------|
| `Sektor` | Sektor emiten (misal: `Keuangan`, `Energi`) |
| `Sub_Sektor` | Sub-sektor spesifik |
| `Ticker` | Kode saham (misal: `BBCA`) |
| `Ticker_YF` | Format Yahoo Finance (misal: `BBCA.JK`) |
| `Link` | URL halaman Stockbit |

### `Dataset/[KODE].JK.csv`
| Kolom | Deskripsi |
|-------|-----------|
| `Date` | Tanggal trading |
| `Open/High/Low/Close` | Harga OHLC |
| `Volume` | Volume perdagangan |
| `Sektor` | Ditambahkan oleh `update_existing_csvs.py` |
| `Sub_Sektor` | Ditambahkan oleh `update_existing_csvs.py` |
| `[BROKER_CODE]_Buy/Sell` | Kolom broker summary dari Stockbit |

---

## 🛠️ Tech Stack

| Library | Kegunaan |
|---------|----------|
| `selenium` | Automasi browser Edge |
| `pandas` | Manipulasi & simpan data CSV |
| `keyboard` | Tunggu sinyal manual (login) |
| `glob` / `os` | File & direktori management |
| `urllib.request` | Cek koneksi internet |
| `msedgedriver.exe` | WebDriver untuk Microsoft Edge |

---

## ⚙️ Setup & Cara Pakai

### Prasyarat
```bash
pip install selenium pandas keyboard
```

> **Edge WebDriver**: Pastikan versi `msedgedriver.exe` di folder `Driver/` cocok dengan versi Microsoft Edge yang terinstall.

### Konfigurasi Profil Edge
Script menggunakan profil Edge khusus agar sesi login tersimpan:
```python
edge_options.add_argument(r"user-data-dir=D:\Tools\selenium_edge_profile")
edge_options.add_argument("profile-directory=Stockbit")
```
Sesuaikan path `user-data-dir` dengan lokasi di komputer kamu.

---

## 🚀 Urutan Eksekusi

| # | File | Perlu Browser? | Durasi Estimasi |
|---|------|---------------|-----------------|
| 1 | `login.ipynb` | ✅ Ya | ~2 menit (manual) |
| 2 | `scrap-list-perusahaan.ipynb` | ✅ Ya | ~10 menit |
| 3 | `scrap-all-harga.ipynb` | ❓ Tergantung sumber | ~30-60 menit |
| 4 | `scrap-broker-summary.ipynb` | ✅ Ya | **4-8 jam** (775 ticker) |
| 5 | `update_existing_csvs.py` | ❌ Tidak | ~1 menit |
| 6 | `test-read.ipynb` | ❌ Tidak | Sesuai kebutuhan |

---

## 📌 Catatan Penting

- **Session Login**: Setelah `login.ipynb` dijalankan dan login berhasil, step 2 & 4 tidak perlu login ulang selama profil Edge masih valid.
- **Anti-Detection**: Script menggunakan `--disable-blink-features=AutomationControlled` dan `excludeSwitches: enable-automation` untuk menghindari deteksi bot.
- **Proteksi Koneksi** (di `scrap-broker-summary.ipynb`): Jika internet putus, script auto-pause dan tunggu pulih — tidak menganggap koneksi putus sebagai "libur bursa".
- **Incremental Update**: `scrap-broker-summary.ipynb` cerdas — skip tanggal yang sudah punya data, hanya scrape yang belum.
- **Flow Diagram Interaktif**: Buka `flow-diagram.html` di browser untuk melihat diagram alur yang bisa di-drag.

---

## 📚 Dokumentasi Lengkap

Buka [`_docs/docs-portal.html`](./_docs/docs-portal.html) di browser untuk portal dokumentasi lengkap:
- 🗺️ **Overview & Flow** — gambaran besar pipeline
- 📖 **Runbook / SOP** — instruksi step-by-step
- 👤 **Ownership** — siapa yang handle apa
- 📋 **Changelog** — log perubahan & versi

Atau buka [`_docs/flow-diagram.html`](./_docs/flow-diagram.html) untuk diagram alur interaktif yang bisa di-drag & zoom.

---

*Project ini adalah bagian dari **Notudo Finance** — platform analisis data saham Indonesia.*

import os
import glob
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 1. Load .env file dari front-end/.env jika ada
env_path = os.path.join(os.path.dirname(__file__), "..", "..", "front-end", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

DB_URL = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
if not DB_URL:
    DB_URL = "postgresql://postgres.pfarncamqjacchdsckdm:9lU3aCeurVpgzZZk@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Pastikan sslmode=require untuk Supabase
if "sslmode" not in DB_URL:
    DB_URL += "?sslmode=require" if "?" not in DB_URL else "&sslmode=require"

engine = create_engine(DB_URL)

KOLOM_NON_BROKER = {"Date", "Close", "High", "Low", "Open", "Volume", "Sektor", "Sub_Sektor"}

def sync_all_csv_to_db():
    dataset_dir = os.path.join(os.path.dirname(__file__), "Dataset", "Harga_Saham")
    csv_files = sorted(glob.glob(os.path.join(dataset_dir, "*.csv")))
    
    print(f"📦 Ditemukan {len(csv_files)} file CSV di {dataset_dir}")
    print(f"🔌 Menghubungkan ke Database Supabase...")
    
    total_rows_inserted = 0

    with engine.begin() as conn:
        for idx, csv_path in enumerate(csv_files):
            filename = os.path.basename(csv_path)
            ticker = filename.replace(".csv", "").replace(".JK", "").upper()
            
            # 1. Auto-insert Emiten jika belum ada
            conn.execute(
                text("""
                    INSERT INTO "Emiten" ("ticker", "name", "createdAt")
                    VALUES (:ticker, :name, NOW())
                    ON CONFLICT ("ticker") DO NOTHING
                """),
                {"ticker": ticker, "name": f"Saham {ticker}"}
            )
            
            try:
                df = pd.read_csv(csv_path)
            except Exception as e:
                print(f"  ✗ Gagal membaca {filename}: {e}")
                continue

            broker_cols = [c for c in df.columns if c not in KOLOM_NON_BROKER]
            
            if not broker_cols or df.empty:
                print(f"  [skip] {ticker} — belum ada kolom broker")
                continue
                
            # 2. Melt: Ubah Wide Format (banyak kolom broker) ke Long Format (Baris)
            melted = df.melt(
                id_vars=["Date"],
                value_vars=broker_cols,
                var_name="brokerCode",
                value_name="netVolume"
            )
            
            # Filter hanya broker yang ada transaksinya (bukan NaN dan bukan 0)
            melted = melted[melted["netVolume"].notna() & (melted["netVolume"] != 0)]
            
            if melted.empty:
                print(f"  [skip] {ticker} — tidak ada data transaksi broker valid")
                continue
                
            records = []
            for _, row in melted.iterrows():
                try:
                    vol = float(row["netVolume"])
                    # Konversi nilai (dalam jutaan/persen) ke perkiraan volume lembar saham
                    buy_vol = int(abs(vol * 1_000_000)) if vol > 0 else 0
                    sell_vol = int(abs(vol * 1_000_000)) if vol < 0 else 0
                    
                    records.append({
                        "ticker": ticker,
                        "date": str(row["Date"]),
                        "brokerCode": str(row["brokerCode"]).upper().strip(),
                        "buyVolume": buy_vol,
                        "sellVolume": sell_vol,
                    })
                except Exception:
                    continue
            
            if records:
                # 3. Batch Insert ke tabel BrokerSummary
                conn.execute(
                    text("""
                        INSERT INTO "BrokerSummary" ("ticker", "date", "brokerCode", "buyVolume", "sellVolume", "createdAt")
                        VALUES (:ticker, :date::date, :brokerCode, :buyVolume, :sellVolume, NOW())
                    """),
                    records
                )
                total_rows_inserted += len(records)
                print(f"  ✓ [{idx+1}/{len(csv_files)}] {ticker} — {len(records)} baris berhasil di-sync")

    print(f"\n🎉 Selesai! Total {total_rows_inserted} baris data broker berhasil di-sync ke Supabase PostgreSQL.")

if __name__ == "__main__":
    sync_all_csv_to_db()

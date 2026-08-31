import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className={styles.dashboardRoot}>
      {/* ─── Sidebar ─── */}
      <aside className={styles.sidebar}>
        {/* Logo */}
        <Link href="/" className={styles.sidebarLogo}>
          <span className={styles.sidebarLogoIcon}>📈</span>
          <span className={styles.sidebarLogoText}>Notudo Finance</span>
        </Link>

        {/* User */}
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{initials}</div>
          <div>
            <div className={styles.sidebarUserName}>{user.name || "User"}</div>
            <div className={styles.sidebarUserEmail}>{user.email}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <span className={styles.sidebarLabel}>Menu Utama</span>

          <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
            <span className={styles.navIcon}>📊</span>
            <span>Broker Tracker</span>
            <span className={styles.navBadge}>Live</span>
          </Link>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>🏢</span>
            <span>Daftar Emiten</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>⭐</span>
            <span>Watchlist</span>
          </a>

          <span className={styles.sidebarLabel}>Analisis</span>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>🔥</span>
            <span>Top Movers</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>🏦</span>
            <span>Aktivitas Broker</span>
          </a>

          <span className={styles.sidebarLabel}>Akun</span>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>⚙️</span>
            <span>Pengaturan</span>
          </a>
        </nav>

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <LogoutButton />
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}

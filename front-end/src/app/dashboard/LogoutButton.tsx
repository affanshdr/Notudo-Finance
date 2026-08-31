"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button className={styles.logoutBtn} onClick={handleLogout}>
      <span className={styles.navIcon}>🚪</span>
      <span>Keluar</span>
    </button>
  );
}

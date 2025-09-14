// src/lib/auth.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuardForAdmin() {
  const router = useRouter();
  const [state, setState] = useState({ token: null, role: null, ready: false });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const role = String(user?.role || "").toLowerCase();

    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (role !== "admin" && role !== "petugas") {
      router.replace("/dashboard");
      return;
    }
    setState({ token, role, ready: true });
  }, [router]);

  return state;
}

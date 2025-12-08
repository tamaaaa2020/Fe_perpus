"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  User as UserIcon,
  Mail,
  Shield,
  Save,
  Loader2,
  Lock,
  ArrowLeft,
} from "lucide-react";

const API = "http://localhost:8000/api";

async function apiFetch(url, opts = {}, token) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(url, { ...opts, headers });
  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { message: raw };
  }
  return { ok: res.ok, status: res.status, data };
}

export default function Profile() {
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);

  const [user, setUser] = useState({
    username: "",
    name: "",
    email: "",
    role: "",
  });

  const [stats, setStats] = useState({
    total_denda: 0,
    total_pinjam: 0,
    total_collection: 0,
    total_review: 0,
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // ====== INIT CLIENT & TOKEN ======
  useEffect(() => {
    setIsClient(true);
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(storedToken);
  }, []);

  // ====== FETCH USER PROFILE (GET /api/profile) ======
  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { ok, data } = await apiFetch(`${API}/profile`, {}, token);

    if (!ok) {
      // coba ambil error validation kalau ada
      const fallbackMsg =
        data?.message ||
        (data?.errors &&
          Object.values(data.errors)[0] &&
          Object.values(data.errors)[0][0]) ||
        "Gagal mengambil data profil. Silakan coba lagi.";
      setErrorMsg(fallbackMsg);
      setLoading(false);
      return;
    }

    setUser({
      username: data.username || "",
      // backend kirim nama_lengkap
      name: data.nama_lengkap || "",
      email: data.email || "",
      role: data.role || "",
    });

    if (data.stats) {
      setStats({
        total_denda: data.stats.total_denda ?? 0,
        total_pinjam: data.stats.total_pinjam ?? 0,
        total_collection: data.stats.total_collection ?? 0,
        total_review: data.stats.total_review ?? 0,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  // ====== LOGOUT ======
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    router.push("/login");
  };

  // ====== UPDATE PROFIL (PUT /api/profile) ======
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { ok, data } = await apiFetch(
      `${API}/profile`,
      {
        method: "PUT",
        body: JSON.stringify({
          // backend expect "name" dan "email"
          name: user.name,
          email: user.email,
        }),
      },
      token
    );

    if (!ok) {
      const fallbackMsg =
        data?.message ||
        (data?.errors &&
          Object.values(data.errors)[0] &&
          Object.values(data.errors)[0][0]) ||
        "Gagal menyimpan perubahan profil.";
      setErrorMsg(fallbackMsg);
    } else {
      setSuccessMsg(data?.message || "Profil berhasil diperbarui.");
      fetchProfile();
    }

    setSavingProfile(false);
  };

  // ====== UPDATE PASSWORD (PUT /api/profile/change-password) ======
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSavingPassword(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !passwordForm.new_password ||
      passwordForm.new_password !== passwordForm.new_password_confirmation
    ) {
      setErrorMsg("Konfirmasi password baru tidak sama.");
      setSavingPassword(false);
      return;
    }

    const { ok, data } = await apiFetch(
      `${API}/profile/change-password`,
      {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      },
      token
    );

    if (!ok) {
      const fallbackMsg =
        data?.message ||
        (data?.errors &&
          Object.values(data.errors)[0] &&
          Object.values(data.errors)[0][0]) ||
        "Gagal mengubah password.";
      setErrorMsg(fallbackMsg);
    } else {
      setSuccessMsg(data?.message || "Password berhasil diubah.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    }

    setSavingPassword(false);
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Pocket Library
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memuat profil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center">
        <p className="mb-4 text-slate-700">
          Kamu belum login. Silakan login terlebih dahulu.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Ke Halaman Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Pocket Library
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/user")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-medium max-w-[140px] truncate">
                {user.name || user.username || "User"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-indigo-600" />
              Profil Saya
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Lihat dan perbarui informasi akun Pocket Library.
            </p>
          </div>
          {user.role && (
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {user.role}
            </span>
          )}
        </div>

        {(successMsg || errorMsg) && (
          <div
            className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 border ${
              successMsg
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span className="mt-0.5">{successMsg ? "✅" : "⚠️"}</span>
            <div>
              <p className="font-medium">
                {successMsg ? "Berhasil" : "Terjadi Kesalahan"}
              </p>
              <p>{successMsg || errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* CARD USER */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Username
                  </p>
                  <p className="font-semibold text-slate-900">
                    {user.username}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{user.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">
                    {user.role || "member / user"}
                  </span>
                </div>
              </div>

              {/* Stats singkat dari backend */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-slate-400">Total Pinjam</p>
                  <p className="font-semibold text-slate-800">
                    {stats.total_pinjam}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-slate-400">Koleksi</p>
                  <p className="font-semibold text-slate-800">
                    {stats.total_collection}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-slate-400">Ulasan</p>
                  <p className="font-semibold text-slate-800">
                    {stats.total_review}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-slate-400">Total Denda</p>
                  <p className="font-semibold text-slate-800">
                    Rp{" "}
                    {new Intl.NumberFormat("id-ID").format(
                      stats.total_denda || 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-800">
              <p className="font-semibold mb-1">Tips keamanan</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Jangan berikan password ke orang lain.</li>
                <li>Gunakan kombinasi huruf, angka, dan simbol.</li>
                <li>Selalu logout jika menggunakan komputer umum.</li>
              </ul>
            </div>
          </div>

          {/* FORM PROFIL + PASSWORD */}
          <div className="md:col-span-2 space-y-6">
            {/* FORM PROFIL */}
            <form
              onSubmit={handleUpdateProfile}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Informasi Profil
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      setUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan email aktif"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* FORM PASSWORD */}
            <form
              onSubmit={handleUpdatePassword}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Ganti Password
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password Sekarang
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        current_password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password_confirmation: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <p>
                  Setelah password diubah, kamu harus login menggunakan password
                  baru tersebut.
                </p>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengubah...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Ubah Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

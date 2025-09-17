"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Globe } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

function routeForRole(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin" || r === "petugas") return "/admin";
  return "/user";
}

const Login = () => {
  const router = useRouter();
  const redirectTimer = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState(null);   // error validasi Laravel (422)
  const [info, setInfo] = useState("");         // pesan sukses

  useEffect(() => {
    // bersihkan timer saat unmount
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleInputChange = (e) => {
    setErrors(null);
    setInfo("");
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Mohon isi semua field!");
      return;
    }

    setIsLoading(true);
    setErrors(null);
    setInfo("");

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        if (res.status === 422 && data?.errors) {
          setErrors(data.errors);           // error validasi
        } else if (res.status === 401) {
          alert(data?.message || "Email atau password salah.");
        } else if (res.status === 419) {
          alert("CSRF token mismatch (419). Jika memakai Sanctum dengan cookie, inisialisasi CSRF dulu.");
        } else {
          alert(data?.message || "Login gagal. Coba lagi.");
        }
        return;
      }

      // Jika banned, controllermu mengembalikan message tanpa token.
      if (!data?.token) {
        alert(data?.message || "Login berhasil, tapi token tidak ditemukan.");
        return;
      }

      // ======= LOGIN SUKSES =======
      localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      const target = routeForRole(data?.user?.role);
      setInfo("Login berhasil! Mengarahkan dalam 2 detik...");

      redirectTimer.current = setTimeout(() => {
        router.push(target);
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);
      alert("Terjadi kesalahan jaringan. Periksa koneksi atau CORS server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-800">Pocker Library</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang Kembali</h2>
              <p className="text-slate-600">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {errors?.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors?.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>
                )}
              </div>

              {info && <p className="text-sm text-green-600">{info}</p>}

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot")}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600">
                Belum punya akun?{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Daftar sekarang
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-slate-500 hover:text-slate-700 font-medium"
          >
            ← Kembali ke beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

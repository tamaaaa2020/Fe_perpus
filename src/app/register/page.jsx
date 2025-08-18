"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Globe, MapPin, AtSign } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

async function post(path, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error((data && data.message) || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data; // sukses -> return data
}

export default function Register() {
  const router = useRouter();
  const timerRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    nama_lengkap: "",
    alamat: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    setErrors(null);
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["username", "nama_lengkap", "alamat", "email", "password", "confirmPassword"];
    if (required.some((k) => !String(formData[k]).trim())) {
      alert("Mohon isi semua field!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password minimal 8 karakter!");
      return;
    }

    setIsLoading(true);
    setErrors(null);

    try {
      // Kalau sukses -> tidak throw
      await post("/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        nama_lengkap: formData.nama_lengkap,
        alamat: formData.alamat,
      });

      alert("Registrasi berhasil! Mengarahkan ke halaman login dalam 2 detik...");
      timerRef.current = setTimeout(() => {
        router.push("/login"); // redirect setelah 2 detik
      }, 2000);
    } catch (err) {
      if (err && err.status === 422 && err.data && err.data.errors) {
        setErrors(err.data.errors); // tampilkan error validasi dari Laravel
      } else {
        alert((err && err.message) || "Registrasi gagal. Coba lagi.");
      }
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
                <span className="text-2xl font-bold text-slate-800">Pocket Library</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Bergabung dengan Kami</h2>
              <p className="text-slate-600">Buat akun baru untuk memulai</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="username unik"
                    required
                    autoComplete="username"
                  />
                </div>
                {errors?.username && <p className="mt-2 text-sm text-red-600">{errors.username[0]}</p>}
              </div>

              {/* Nama lengkap */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                    required
                    autoComplete="name"
                  />
                </div>
                {errors?.nama_lengkap && <p className="mt-2 text-sm text-red-600">{errors.nama_lengkap[0]}</p>}
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alamat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nama jalan, RT/RW, kelurahan, kecamatan, kota"
                    required
                  />
                </div>
                {errors?.alamat && <p className="mt-2 text-sm text-red-600">{errors.alamat[0]}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {errors?.email && <p className="mt-2 text-sm text-red-600">{errors.email[0]}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Minimal 8 karakter"
                    required
                    autoComplete="new-password"
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
                {errors?.password && <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ulangi password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600">
                Sudah punya akun?{" "}
                <button onClick={() => router.push("/login")} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Masuk di sini
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => router.push("/")} className="text-slate-500 hover:text-slate-700 font-medium">
            ← Kembali ke beranda
          </button>
        </div>
      </div>
    </div>
  );
}

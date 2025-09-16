"use client";
import React, { useState, useEffect } from "react";
import { X, User, Mail, MapPin, Lock, Shield, Eye, EyeOff } from "lucide-react";

const UserModal = ({ selectedItem, setShowModal, setUsers }) => {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    role: "user",
    alamat: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock API call - replace with actual API
  const api = async (url, options) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: [] };
  };

  useEffect(() => {
    if (selectedItem) {
      setForm({
        username: selectedItem.username || "",
        name: selectedItem.name || "",
        email: selectedItem.email || "",
        role: selectedItem.role || "user",
        alamat: selectedItem.alamat || "",
        password: "",
      });
    }
  }, [selectedItem]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const url = selectedItem
        ? `/admin/users/${selectedItem.id}`
        : `/admin/users`;

      await api(url, {
        method: selectedItem ? "PUT" : "POST",
        token: localStorage.getItem("token"),
        body: form,
      });

      const refreshed = await api("/admin/users", { token: localStorage.getItem("token") });
      setUsers(refreshed.data || refreshed);
      setShowModal(null);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(null);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'from-violet-500 to-violet-600';
      case 'petugas': return 'from-violet-500 to-violet-600';
      default: return 'from-violet-500 to-violet-600';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'petugas': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getRoleColor(form.role)} p-4 relative`}>
          <button
            onClick={() => setShowModal(null)}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {selectedItem ? "Edit User" : "Tambah User Baru"}
              </h2>
              <p className="text-white/80 text-sm">
                {selectedItem ? "Perbarui informasi pengguna" : "Buat akun pengguna baru"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4">
          {/* Username Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span>Username</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan username unik"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-slate-400 text-sm"
            />
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span>Nama Lengkap</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-slate-400 text-sm"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </label>
            <input
              type="email"
              placeholder="contoh@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-slate-400 text-sm"
            />
          </div>

          {/* Role Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <Shield className="w-3 h-3" />
              <span>Role Pengguna</span>
            </label>
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none bg-white text-sm"
              >
                <option value="user">👤 User - Pengguna Biasa</option>
                <option value="petugas">👨‍💼 Petugas - Staff Perpustakaan</option>
                <option value="admin">👨‍💻 Admin - Administrator</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(form.role)}`}>
                  {form.role.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <MapPin className="w-3 h-3" />
              <span>Alamat</span>
            </label>
            <textarea
              placeholder="Masukkan alamat lengkap"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-slate-400 resize-none text-sm"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <Lock className="w-3 h-3" />
              <span>Password {selectedItem && "(kosongkan jika tidak diubah)"}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={selectedItem ? "Masukkan password baru" : "Masukkan password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-slate-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!selectedItem && (
              <p className="text-xs text-slate-500">Minimal 6 karakter, kombinasi huruf dan angka</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={() => setShowModal(null)}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 bg-gradient-to-r ${getRoleColor(form.role)} text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 text-sm`}
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{selectedItem ? "Perbarui" : "Tambah"} User</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
"use client";

import React, { useCallback } from "react";
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

import { joinApi } from "@/lib/api";

/* =========================
   Reusable Report Button
   ========================= */
function ReportButton({ onClick, icon: Icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-semibold transition-all duration-200 group 
        ${color.bg} ${color.hover} ${color.text} ${color.border}`}
    >
      <span className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </span>
      <Download className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

export default function Reports({ role = "admin" }) {
  /* =========================
     Generate Report Function — FIXED 100%!
     ========================= */
  const generateReport = useCallback(async (type) => {
    try {
      // AMBIL TOKEN DARI LOCALSTORAGE — INI YANG SEBELUMNYA KURANG!
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("Token tidak ditemukan! Silakan login ulang.");
        return;
      }

      let url = "";

      const prefix = role === "admin" ? "/admin" : "/petugas";

      // Peminjaman
      if (type.startsWith("peminjaman")) {
        const scope = type.split("-")[1] ?? "bulanan";
        url = `http://localhost:8000/api${prefix}/reports/loans?type=${scope}`;
      }
      // Denda
      else if (type.startsWith("denda")) {
        const scope = type.split("-")[1] ?? "bulanan";
        url = `http://localhost:8000/api${prefix}/reports/fines?type=${scope}`;
      }
      // Buku (admin only)
      else if (role === "admin") {
        if (type === "inventori-buku") url = "http://localhost:8000/api/admin/reports/books";
        if (type === "popularitas-buku") url = "http://localhost:8000/api/admin/reports/books/popular";
        if (type === "kategori-statistik") url = "http://localhost:8000/api/admin/reports/books/category-stats";
      }

      if (!url) {
        alert("Jenis laporan tidak valid!");
        return;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,   // TOKEN SUDAH ADA!
          Accept: "application/pdf",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error("Gagal generate laporan");
      }

      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `laporan_${type.replace("-", "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Generate report error:", err);
      alert(`Gagal mengunduh laporan: ${err.message}`);
    }
  }, [role]); // role masuk dependency

  /* =========================
     Render
     ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Generate Laporan
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Buat dan unduh laporan komprehensif untuk analisis data perpustakaan yang mendalam
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Peminjaman */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Laporan Peminjaman</h3>
                <p className="text-slate-600">Data peminjaman & pengembalian</p>
              </div>
            </div>

            <div className="space-y-4">
              {["harian", "bulanan", "tahunan"].map((scope) => (
                <ReportButton
                  key={scope}
                  onClick={() => generateReport(`peminjaman-${scope}`)}
                  icon={Calendar}
                  label={scope.charAt(0).toUpperCase() + scope.slice(1)}
                  color={{
                    bg: "bg-gradient-to-r from-blue-50 to-blue-100",
                    hover: "hover:from-blue-100 hover:to-blue-200",
                    text: "text-blue-800",
                    border: "border border-blue-200",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Buku (admin only) */}
          {role === "admin" && (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Laporan Buku</h3>
                  <p className="text-slate-600">Statistik & data buku</p>
                </div>
              </div>

              <div className="space-y-4">
                <ReportButton
                  onClick={() => generateReport("inventori-buku")}
                  icon={BarChart3}
                  label="Inventori Buku"
                  color={{
                    bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
                    hover: "hover:from-emerald-100 hover:to-emerald-200",
                    text: "text-emerald-800",
                    border: "border border-emerald-200",
                  }}
                />
                <ReportButton
                  onClick={() => generateReport("popularitas-buku")}
                  icon={TrendingUp}
                  label="Buku Populer"
                  color={{
                    bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
                    hover: "hover:from-emerald-100 hover:to-emerald-200",
                    text: "text-emerald-800",
                    border: "border border-emerald-200",
                  }}
                />
                <ReportButton
                  onClick={() => generateReport("kategori-statistik")}
                  icon={BarChart3}
                  label="Statistik Kategori"
                  color={{
                    bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
                    hover: "hover:from-emerald-100 hover:to-emerald-200",
                    text: "text-emerald-800",
                    border: "border border-emerald-200",
                  }}
                />
              </div>
            </div>
          )}

          {/* Denda */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Laporan Denda</h3>
                <p className="text-slate-600">Data denda keterlambatan</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: "denda-bulanan", label: "Denda Bulanan" },
                { key: "denda-keterlambatan", label: "Keterlambatan" },
                { key: "denda-rusak", label: "Kerusakan" },
                { key: "denda-hilang", label: "Kehilangan" },
              ].map((item) => (
                <ReportButton
                  key={item.key}
                  onClick={() => generateReport(item.key)}
                  icon={AlertTriangle}
                  label={item.label}
                  color={{
                    bg: "bg-gradient-to-r from-red-50 to-red-100",
                    hover: "hover:from-red-100 hover:to-red-200",
                    text: "text-red-800",
                    border: "border border-red-200",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full border border-white/60 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-slate-600 font-medium">
              Sistem laporan siap digunakan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
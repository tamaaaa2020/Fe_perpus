// src/app/admin/components/Reports.jsx
"use client";
import { FileText, Download, BarChart3, TrendingUp } from "lucide-react";

export default function Reports({ role }) {
  const generateReport = (type) => {
    alert(`Generate laporan: ${type} (dummy, hubungkan ke backend Laravel)`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Generate Laporan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peminjaman */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Laporan Peminjaman</h3>
              <p className="text-sm text-slate-600">Data peminjaman & pengembalian</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => generateReport("peminjaman-harian")} className="btn-report">
              Harian <Download className="w-4 h-4" />
            </button>
            <button onClick={() => generateReport("peminjaman-bulanan")} className="btn-report">
              Bulanan <Download className="w-4 h-4" />
            </button>
            <button onClick={() => generateReport("peminjaman-tahunan")} className="btn-report">
              Tahunan <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buku (admin only) */}
        {role === "admin" && (
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Laporan Buku</h3>
                <p className="text-sm text-slate-600">Statistik & data buku</p>
              </div>
            </div>
            <div className="space-y-3">
              <button onClick={() => generateReport("inventori-buku")} className="btn-report">
                Inventori Buku <Download className="w-4 h-4" />
              </button>
              <button onClick={() => generateReport("popularitas-buku")} className="btn-report">
                Buku Populer <Download className="w-4 h-4" />
              </button>
              <button onClick={() => generateReport("kategori-statistik")} className="btn-report">
                Statistik Kategori <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Denda */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Laporan Denda</h3>
              <p className="text-sm text-slate-600">Data denda keterlambatan</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => generateReport("denda-bulanan")} className="btn-report">
              Denda Bulanan <Download className="w-4 h-4" />
            </button>
            <button onClick={() => generateReport("keterlambatan")} className="btn-report">
              Keterlambatan <Download className="w-4 h-4" />
            </button>
            <button onClick={() => generateReport("kerusakan")} className="btn-report">
              Kerusakan <Download className="w-4 h-4" />
            </button>
            <button onClick={() => generateReport("kehilangan")} className="btn-report">
              Kehilangan <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

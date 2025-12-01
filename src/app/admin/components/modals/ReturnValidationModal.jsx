"use client";
import React, { useState } from "react";
import { X, Sparkles, Book as BookIcon } from "lucide-react";

export default function ReturnValidationModal({
  loan,
  onClose,
  onConfirmReturn,
  isLoading = false,
}) {
  const [finalCondition, setFinalCondition] = useState(null);

  if (!loan) return null;

  const choices = [
    { key: "baik",   label: "Baik / Normal" },
    { key: "rusak",  label: "Rusak" },
    { key: "hilang", label: "Hilang" },
  ];

  const handleSubmit = () => {
    if (!finalCondition) return;
    onConfirmReturn(finalCondition);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100">
        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Validasi Pengembalian
                </h2>
                <p className="text-blue-100 text-sm">
                  {loan.user?.nama_lengkap || loan.user?.username} mengembalikan:
                  <span className="font-semibold"> {loan.book?.title}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-h-[60vh] overflow-y-auto p-8 space-y-6">
          {/* Info klaim user */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-sm">
                <p className="text-xs text-gray-500 font-medium uppercase">
                  Info Pengembalian User
                </p>
                <p className="text-gray-800">
                  Kondisi klaim:{" "}
                  <span className="font-semibold text-gray-900">
                    {loan.requested_return_condition || "-"}
                  </span>
                </p>
                <p className="text-gray-800">
                  Catatan:{" "}
                  <span className="font-medium text-gray-700">
                    {loan.return_note || "(tidak ada catatan)"}
                  </span>
                </p>
                <p className="text-gray-500 text-[11px] mt-2">
                  Tgl Pinjam:{" "}
                  <span className="font-medium text-gray-700">
                    {loan.tanggal_peminjaman || "-"}
                  </span>
                  {" • "}
                  Tgl Klaim Balik:{" "}
                  <span className="font-medium text-gray-700">
                    {loan.tanggal_pengembalian || "-"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Pilihan final petugas */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              Tetapkan status akhir buku:
            </p>

            {choices.map((c) => (
              <button
                key={c.key}
                onClick={() => setFinalCondition(c.key)}
                className={`w-full text-left rounded-2xl p-4 transition-all border text-sm font-medium
                  ${
                    finalCondition === c.key
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300"
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center border-t border-gray-200 px-8 py-6 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {isLoading ? "Memproses..." : "Ready to finalize"}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Batal
            </button>

            <button
              onClick={handleSubmit}
              disabled={!finalCondition || isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Simpan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simpan Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

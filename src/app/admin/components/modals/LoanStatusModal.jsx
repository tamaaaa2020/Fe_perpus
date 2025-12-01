"use client";
import React, { useState } from "react";

export default function LoanStatusModal({ loan, onClose, onChangeStatus }) {
  if (!loan) return null;

  // cuma 2 status ya sekarang
  const statuses = [
    { key: "siap_diambil", label: "Siap Diambil" },
    { key: "ditolak", label: "Ditolak" },
  ];

  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleSubmit = () => {
    if (!selectedStatus) return;
    onChangeStatus(selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
          <div className="text-white">
            <div className="text-lg font-bold leading-tight">Validasi Peminjaman</div>
            <div className="text-[12px] text-blue-100">
              {loan.user?.nama_lengkap || loan.user?.username} minta pinjam:
              <span className="font-semibold"> {loan.book?.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedStatus(s.key)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition
                ${selectedStatus === s.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStatus}
            className={`px-4 py-2 rounded-lg text-white transition ${
              selectedStatus
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

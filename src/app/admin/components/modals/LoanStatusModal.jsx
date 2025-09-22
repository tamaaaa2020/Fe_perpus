"use client";
import React, { useState } from "react";

export default function LoanStatusModal({ loan, onClose, onChangeStatus }) {
  if (!loan) return null;

  const statuses = [
    { key: "siap_diambil", label: "Siap Diambil" },
    { key: "dipinjam", label: "Dipinjam" },
    { key: "ditolak", label: "Ditolak" },
  ];

  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleSubmit = () => {
    if (!selectedStatus) return;
    onChangeStatus(selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg">
        {/* Header */}
        <h2 className="text-xl font-bold mb-4">Ubah Status Peminjaman</h2>

        {/* Info buku */}
        <p className="mb-4 text-sm text-gray-600">
          Buku: <span className="font-semibold">{loan.book?.title}</span>
        </p>

        {/* Pilihan status */}
        <div className="space-y-2">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedStatus(s.key)}
              className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition ${
                selectedStatus === s.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end space-x-2 mt-6">
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

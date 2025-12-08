"use client";
import { X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { showWarning } from "@/lib/swal";

export default function ReportReviewModal({ reviewId, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      await showWarning("Peringatan!", "Alasan tidak boleh kosong");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(reason);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay - Click to close */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <div 
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scaleIn pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-slate-800">Laporkan Ulasan</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Jelaskan alasan Anda melaporkan ulasan ini kepada tim moderasi kami.
          </p>

          <textarea
            className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Contoh: Spam, konten menyinggung, tidak relevan, dll..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || isSubmitting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Mengirim..." : "Laporkan"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

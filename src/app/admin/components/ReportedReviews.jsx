// src/app/admin/components/ReportedReviews.jsx
"use client";
import { Eye, Trash2 } from "lucide-react";

export default function ReportedReviews({ reviews, setReviews }) {
  const deleteReportedReview = (id) => {
    setReviews((list) => list.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Review yang Dilaporkan</h2>
      <p className="text-slate-500 text-sm">
        *Belum ada endpoint list/delete report di backend. Data di bawah dummy untuk contoh UI.
      </p>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Buku</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Reviewer</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Review</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Alasan</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Pelapor</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm">{r.book_title}</td>
                  <td className="px-6 py-4 text-sm">{r.reviewer}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{r.review}</td>
                  <td className="px-6 py-4 text-sm">{r.report_reason}</td>
                  <td className="px-6 py-4 text-sm">{r.reported_by}</td>
                  <td className="px-6 py-4 text-sm">{r.reported_at}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReportedReview(r.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada laporan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

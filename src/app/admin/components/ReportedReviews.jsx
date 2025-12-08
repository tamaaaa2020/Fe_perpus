"use client";
import { Trash2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { confirmDelete, showSuccess, showError } from "@/lib/swal";

export default function ReportedReviews({ reviews, setReviews }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/admin/review-reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal fetch reports:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, setReviews]);

  const deleteReport = async (reportId) => {
    const result = await confirmDelete(
      "Hapus Laporan?",
      "Laporan ini akan dihapus dari sistem"
    );

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/review-reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus laporan");

      setReviews((list) => list.filter((r) => r.id !== reportId));
      await showSuccess("Berhasil!", "Laporan berhasil dihapus");
    } catch (err) {
      console.error(err);
      await showError("Error!", "Gagal menghapus laporan");
    }
  };

  const deleteReview = async (reviewId, reviewTitle) => {
    const result = await confirmDelete(
      "Hapus Review?",
      `Review "${reviewTitle}..." akan dihapus beserta semua laporannya`
    );

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus review");

      setReviews((list) => list.filter((r) => r.review.id_review !== reviewId));
      await showSuccess(
        "Berhasil!",
        "Review dan semua laporannya berhasil dihapus"
      );
    } catch (err) {
      console.error(err);
      await showError("Error!", "Gagal menghapus review");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Memuat laporan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Review yang Dilaporkan</h2>
        {reviews.length > 0 && (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            {reviews.length}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Buku</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reviewer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Review</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Alasan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Pelapor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">

              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-800">{r.review.book.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{r.review.user.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                    <span className="truncate block" title={r.review.review}>{r.review.review}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                    <span className="truncate block" title={r.reason}>{r.reason}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{r.user.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(r.reported_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Delete Report Button */}
                      <button
                        onClick={() => deleteReport(r.id)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Hapus laporan"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>

                      {/* Delete Review Button */}
                      <button
                        onClick={() => deleteReview(r.review.id_review, r.review.review?.substring(0, 30))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus review yang dilaporkan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Tidak ada laporan review.</p>
                    </div>
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

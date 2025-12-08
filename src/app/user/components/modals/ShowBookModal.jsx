"use client";
import React, { useEffect, useState } from "react";
import {
  X, Star, Flag, User, Book, Calendar, Building2, MessageSquareText,
} from "lucide-react";
import ReportReviewModal from "./ReportReviewModal";
import { showSuccess, showError } from "@/lib/swal";

const ShowBookModal = ({ bookId, setShowModal }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reportingReviewId, setReportingReviewId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        setBook(data?.data || data);
      } catch (err) {
        console.error(err);
        showError("Error", "Gagal memuat detail buku");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);


  const handleReportReview = async (reviewId, reason) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/reviews/${reviewId}/report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal melaporkan");

      await showSuccess("Berhasil!", "Laporan berhasil dikirim");
    } catch (err) {
      await showError("Error!", "Gagal melaporkan ulasan");
    }
  };


  if (!bookId) return null;

  return (
    <>
      {/* Overlay - Click to close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-fadeIn"
        onClick={() => setShowModal(null)}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden animate-scaleIn pointer-events-auto flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl text-white font-bold">Detail Buku</h2>
            <button
              onClick={() => setShowModal(null)}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Memuat...</div>
            ) : (
              <div className="flex flex-col md:flex-row p-6 gap-6">

                {/* Cover */}
                <img
                  src={book.cover || "https://via.placeholder.com/300x400"}
                  className="w-56 h-72 rounded-xl shadow-md object-cover flex-shrink-0"
                />

                {/* Detail */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Book className="w-5 h-5 text-indigo-500" />
                    {book.title}
                  </h3>

                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      Penulis: <span className="font-medium">{book.author}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      Penerbit: <span className="font-medium">{book.publisher}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Tahun: <span className="font-medium">{book.publish_year}</span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(book.reviews_avg_rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                            }`}
                        />
                      ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {book.reviews_avg_rating?.toFixed(1)} ({book.reviews_count || 0} ulasan)
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${book.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {book.stock > 0 ? `Tersedia: ${book.stock}` : "Stok Habis"}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mt-4">{book.description}</p>
                </div>
              </div>
            )}

            {/* REVIEWS BLOCK */}
            {!loading && (
              <div className="px-6 pb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <MessageSquareText className="w-5 h-5 text-indigo-500" />
                  Ulasan Pengguna ({book.reviews?.length || 0})
                </h3>

                {book.reviews?.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada ulasan.</p>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {(book.reviews || []).map((rev) => (
                      <div
                        key={rev.id_review}
                        className="p-4 border rounded-xl shadow-sm bg-slate-50 hover:shadow-md transition-shadow"
                      >

                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800">{rev.user?.username}</div>
                            <div className="flex gap-1 mt-1">
                              {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < rev.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                      }`}
                                  />
                                ))}
                            </div>
                          </div>

                          <button
                            onClick={() => setReportingReviewId(rev.id_review)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors flex-shrink-0"
                            title="Laporkan ulasan ini"
                          >
                            <Flag className="w-4 h-4" /> Laporkan
                          </button>
                        </div>

                        <p className="text-sm text-slate-700 mt-3 line-clamp-3">{rev.review}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportingReviewId && (
        <ReportReviewModal
          reviewId={reportingReviewId}
          onClose={() => setReportingReviewId(null)}
          onSubmit={(reason) => {
            handleReportReview(reportingReviewId, reason);
            setReportingReviewId(null);
          }}
        />
      )}
    </>
  );
};

export default ShowBookModal;

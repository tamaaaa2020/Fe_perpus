"use client";
import React, { useEffect, useState } from "react";
import { X, Book, User, Building2, Calendar, FileText, Layers } from "lucide-react";

const ShowBookModal = ({ bookId, setShowModal }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat detail buku");
        setBook(data);
      } catch (err) {
        console.error(err);
        alert("❌ Gagal memuat detail buku");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  if (!bookId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h2 className="text-white text-xl font-semibold">Detail Buku</h2>
          <button
            onClick={() => setShowModal(null)}
            className="text-white/80 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : (
          <div className="flex flex-col md:flex-row p-6 gap-6">
            {/* Cover */}
            <div className="flex-shrink-0">
              <img
                src={book.cover || "https://via.placeholder.com/300x400"}
                alt={book.title}
                className="w-56 h-72 object-cover rounded-xl shadow-md"
              />
            </div>

            {/* Detail Info */}
            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Book className="w-5 h-5 text-indigo-600" />
                {book.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-sm">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" /> Penulis:{" "}
                  <span className="font-medium">{book.author || "-"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" /> Penerbit:{" "}
                  <span className="font-medium">{book.publisher || "-"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Tahun Terbit:{" "}
                  <span className="font-medium">{book.publish_year || "-"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" /> Stok:{" "}
                  <span
                    className={`font-semibold ${
                      book.stock > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {book.stock > 0 ? `${book.stock} tersedia` : "Habis"}
                  </span>
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Deskripsi
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {book.description || "Tidak ada deskripsi buku ini."}
                </p>
              </div>

              {book.categories && book.categories.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Kategori</h4>
                  <div className="flex flex-wrap gap-2">
                    {book.categories.map((c) => (
                      <span
                        key={c.id}
                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                      >
                        {c.category_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ShowBookModal;

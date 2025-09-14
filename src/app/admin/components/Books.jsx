"use client";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Books({
  books,
  setBooks,
  setShowModal,
  setSelectedItem,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manajemen Buku</h3>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal("book");
          }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Tambah Buku
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">Judul</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Penulis</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Kategori</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {books.map((book) => (
              <tr key={book.id_book || book.id} className="hover:bg-slate-50">
                {/* Judul */}
                <td className="px-6 py-4 text-sm">{book.title}</td>

                {/* Penulis */}
                <td className="px-6 py-4 text-sm">{book.author}</td>

                {/* Kategori */}
                <td className="px-6 py-4 text-sm">
                  {/* relasi many-to-many */}
                  {book.categories && book.categories.length > 0
                    ? book.categories.map((c) => c.category_name).join(", ")
                    : // fallback kalau API langsung kasih category_name
                      book.category_name || "-"}
                </td>

                {/* Aksi */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedItem(book);
                      setShowModal("book");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Yakin hapus buku ini?")) {
                        setBooks((prev) =>
                          prev.filter((b) => b.id_book !== book.id_book)
                        );
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Belum ada buku.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

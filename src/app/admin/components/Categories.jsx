"use client";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Categories({
  categories,
  setCategories,
  setShowModal,
  setSelectedItem,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manajemen Kategori</h3>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal("category");
          }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">Nama</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((cat) => (
              <tr key={cat.id_category} className="hover:bg-slate-50">
                {/* Gunakan category_name sesuai field di DB */}
                <td className="px-6 py-4 text-sm">{cat.category_name}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  {/* Edit */}
                  <button
                    onClick={() => {
                      setSelectedItem(cat);
                      setShowModal("category");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm("Yakin hapus kategori ini?")) {
                        setCategories((prev) =>
                          prev.filter(
                            (c) => c.id_category !== cat.id_category
                          )
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
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Belum ada kategori.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

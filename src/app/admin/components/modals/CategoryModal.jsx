"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { X, Archive, FileText, Sparkles, Tag, Info } from "lucide-react";

const CategoryModal = ({ selectedItem, setShowModal, setCategories }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ category_name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setForm({
        category_name: selectedItem.category_name || selectedItem.name || "",
        description: selectedItem.description || "",
      });
    }
  }, [selectedItem]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const url = selectedItem
        ? `/admin/categories/${selectedItem.id}`
        : `/admin/categories`;

      await api(url, {
        method: selectedItem ? "PUT" : "POST",
        token,
        body: form,
      });

      const refreshed = await api("/admin/categories", { token });
      setCategories(refreshed);
      setShowModal(null);
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transform animate-scaleIn border border-gray-100">
        {/* Header dengan Gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-600 to-purple-600 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedItem ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h2>
                <p className="text-purple-100 text-sm">
                  {selectedItem ? "Perbarui informasi kategori" : "Buat kategori baru untuk mengorganisir buku"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(null)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Category Name Field */}
            <div className="group relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Tag className="w-4 h-4 text-purple-600" />
                Nama Kategori
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan nama kategori (misal: Programming, Database, Design)"
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50 hover:bg-white group-hover:border-gray-300 text-lg"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>

            {/* Description Field */}
            <div className="group relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4 text-purple-600" />
                Deskripsi
              </label>
              <div className="relative">
                <textarea
                  placeholder="Tuliskan deskripsi lengkap tentang kategori ini...&#10;&#10;Contoh: Kategori Programming berisi buku-buku tentang pemrograman, coding, dan pengembangan software."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50 hover:bg-white group-hover:border-gray-300 resize-none"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Tips Membuat Kategori</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Gunakan nama yang jelas dan mudah dimengerti</li>
                    <li>• Buat deskripsi yang menjelaskan jenis buku dalam kategori</li>
                    <li>• Hindari nama kategori yang terlalu umum atau terlalu spesifik</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-200 px-8 py-6 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            {form.category_name ? 'Ready to save' : 'Fill in category name'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(null)}
              className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !form.category_name.trim()}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simpan Kategori
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CategoryModal;
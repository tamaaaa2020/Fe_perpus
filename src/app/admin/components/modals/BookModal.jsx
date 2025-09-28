"use client";
import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import {
  X,
  Upload,
  Book,
  User,
  Building2,
  Calendar,
  Hash,
  FileText,
  Camera,
  Sparkles,
} from "lucide-react";

const BookModal = ({ selectedItem, setShowModal, setBooks }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    publish_year: "",
    stock: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setForm({
        title: selectedItem.title || "",
        author: selectedItem.author || "",
        publisher: selectedItem.publisher || "",
        publish_year: selectedItem.publish_year || "",
        stock: selectedItem.stock || "",
        description: selectedItem.description || "",
      });
      if (selectedItem.cover) {
        setPreview(selectedItem.cover);
      }
    }
  }, [selectedItem]);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("cover", image);

      let url = `${API_BASE}/admin/books`;
      let method = "POST";

      if (selectedItem) {
        const id = selectedItem.id_book ?? selectedItem.id;
        url = `${API_BASE}/admin/books/${id}`;
        formData.append("_method", "PUT"); // Laravel method spoofing
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        if (selectedItem) {
          setBooks((prev) =>
              prev.map((b) => b.id_book === result.data.id ? {...b, ...result.data} : b
            )
          );
        } else {
          setBooks((prev) => [...prev, result.data]);
        }
        setShowModal(null);
      } else {
        alert(result.message || "❌ Gagal menyimpan buku");
      }
    } catch (error) {
      console.error("Error: ", error);
      alert("❌ Terjadi Kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldIcons = {
    title: Book,
    author: User,
    publisher: Building2,
    publish_year: Calendar,
    stock: Hash,
    description: FileText,
  };

  const fieldLabels = {
    title: "Judul Buku",
    author: "Penulis",
    publisher: "Penerbit",
    publish_year: "Tahun Terbit",
    stock: "Stok",
    description: "Deskripsi",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden transform animate-scaleIn border border-gray-100">
        {/* Header dengan Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedItem ? "Edit Buku" : "Tambah Buku Baru"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {selectedItem
                    ? "Perbarui informasi buku"
                    : "Tambahkan buku baru ke perpustakaan"}
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
        <div className="flex max-h-[75vh] overflow-hidden">
          {/* Form Section */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["title", "author", "publisher", "publish_year", "stock"].map(
                (field) => {
                  const Icon = fieldIcons[field];
                  return (
                    <div key={field} className="group relative">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Icon className="w-4 h-4 text-blue-600" />
                        {fieldLabels[field]}
                      </label>
                      <div className="relative">
                        <input
                          type={
                            field === "publish_year" || field === "stock"
                              ? "number"
                              : "text"
                          }
                          placeholder={`Masukkan ${fieldLabels[
                            field
                          ].toLowerCase()}`}
                          value={form[field]}
                          onChange={(e) =>
                            setForm({ ...form, [field]: e.target.value })
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white group-hover:border-gray-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Description */}
            <div className="mt-6 group relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {fieldLabels.description}
              </label>
              <div className="relative">
                <textarea
                  placeholder="Tuliskan deskripsi lengkap tentang buku ini..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white group-hover:border-gray-300 resize-none"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 p-8 border-l border-gray-200">
            <div className="h-full flex flex-col">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Camera className="w-5 h-5 text-blue-600" />
                Cover Buku
              </h3>

              {/* Upload Area */}
              <div
                className={`flex-1 border-2 border-dashed rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  dragOver
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="relative h-full group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-white">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Ganti Gambar</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="p-4 bg-blue-100 rounded-full mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Upload Cover Buku
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag & drop atau klik untuk memilih gambar
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, JPEG • Maks 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium pointer-events-none">
                      Pilih File
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Rekomendasi: Rasio 3:4 (misal 300x400px)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-200 px-8 py-6 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Ready to save
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
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simpan Buku
                </>
              )}
            </button>
          </div>
        </div>
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

export default BookModal;

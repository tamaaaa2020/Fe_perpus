"use client";
import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import {
  X, Upload, Book, User, Building2, Calendar, Hash, FileText, Camera, Sparkles, Plus,
} from "lucide-react";

const makeKey = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;

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

  const [categories, setCategories] = useState([]);
  // rows: [{ key: string, value: string }]
  const [rows, setRows] = useState([{ key: makeKey(), value: "" }]);

  // Fetch categories
    useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const raw = await res.json();

        // Normalisasi -> selalu { id: string, name: string }
        const data = (Array.isArray(raw) ? raw : []).map((c) => ({
          id: String(c.id_category ?? c.id ?? ""),   // aman buat key/value
          name: c.category_name ?? c.name ?? "",
        })).filter((c) => c.id); // buang yang gak ada id

        setCategories(data);
      } catch (err) {
        console.error("Gagal memuat kategori", err);
        setCategories([]);
      }
    })();
  }, [token]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Prefill saat edit
  useEffect(() => {
    if (!selectedItem) return;

    setForm({
      title: selectedItem.title || "",
      author: selectedItem.author || "",
      publisher: selectedItem.publisher || "",
      publish_year: selectedItem.publish_year || "",
      stock: selectedItem.stock || "",
      description: selectedItem.description || "",
    });

    const preRows =
    (selectedItem?.categories || []).map((c) => ({
      key: makeKey(),
      value: String(c.id ?? c.id_category ?? ""),
    }));

  setRows(preRows.length ? preRows : [{ key: makeKey(), value: "" }]);

    if (selectedItem.cover) setPreview(selectedItem.cover);
  }, [selectedItem]); 

  // Upload handling
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

  // Kategori rows
  const addRow = () => setRows((r) => [...r, { key: makeKey(), value: "" }]);
  const removeRow = (key) => setRows((r) => r.filter((x) => x.key !== key));
  const setRowValue = (key, value) =>
    setRows((r) => r.map((x) => (x.key === key ? { ...x, value } : x)));

  // Submit
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      // kirim hanya id valid (string angka > 0)
      rows
        .map((r) => r.value)
        .filter((v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) > 0)
        .forEach((v) => fd.append("categories[]", v));

      if (image) fd.append("cover", image);

      let url = `${API_BASE}/admin/books`;
      let method = "POST";
      if (selectedItem) {
        const id = selectedItem.id_book ?? selectedItem.id;
        url = `${API_BASE}/admin/books/${id}`;
        fd.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: fd,
      });

      const text = await res.text();
      if (!res.ok) {
        let payload = null;
        try { payload = JSON.parse(text); } catch {}
        if (res.status === 422 && payload?.errors) {
          alert("Validasi gagal:\n" + JSON.stringify(payload.errors, null, 2));
        } else {
          alert(payload?.message || text || "Gagal menyimpan buku");
        }
        return;
      }

      // refresh list supaya konsisten
      const listRes = await fetch(`${API_BASE}/admin/books`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const list = await listRes.json();
      setBooks(list);
      setShowModal(null);
    } catch (e) {
      console.error(e);
      alert("❌ Terjadi kesalahan jaringan atau server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldIcons = {
    title: Book, author: User, publisher: Building2, publish_year: Calendar, stock: Hash, description: FileText,
  };
  const fieldLabels = {
    title: "Judul Buku", author: "Penulis", publisher: "Penerbit", publish_year: "Tahun Terbit", stock: "Stok", description: "Deskripsi",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden transform animate-scaleIn border border-gray-100">
        {/* Header */}
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
                  {selectedItem ? "Perbarui informasi buku" : "Tambahkan buku baru ke perpustakaan"}
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
          {/* Form kiri */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["title", "author", "publisher", "publish_year", "stock"].map((field) => {
                const Icon = fieldIcons[field];
                return (
                  <div key={field} className="group relative">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Icon className="w-4 h-4 text-blue-600" />
                      {fieldLabels[field]}
                    </label>
                    <input
                      type={field === "publish_year" || field === "stock" ? "number" : "text"}
                      min={field === "publish_year" ? 1901 : undefined}
                      max={field === "publish_year" ? 2155 : undefined}
                      step={field === "publish_year" ? 1 : undefined}
                      placeholder={`Masukkan ${fieldLabels[field].toLowerCase()}`}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                );
              })}
            </div>

            {/* Kategori */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Book className="w-4 h-4 text-blue-600" />
                Kategori Buku
              </label>

              <div className="space-y-3">
                {rows.map((row) => (
                  <div key={row.key} className="flex items-center gap-2 animate-fadeIn">
                    <select
                        value={row.value}
                        onChange={(e) => setRowValue(row.key, e.target.value)}
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50 hover:bg-white"
                      >
                        <option key="__placeholder" value="">Pilih kategori...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRow}
                  className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kategori
                </button>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Deskripsi
              </label>
              <textarea
                placeholder="Tuliskan deskripsi lengkap tentang buku ini..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50 hover:bg-white resize-none"
              />
            </div>
          </div>

          {/* Upload cover kanan */}
          <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 p-8 border-l border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Camera className="w-5 h-5 text-blue-600" />
              Cover Buku
            </h3>

            <div
              className={`flex-1 border-2 border-dashed rounded-2xl transition-all duration-300 relative overflow-hidden ${
                dragOver ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="relative h-full group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
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
                  <h4 className="font-semibold text-gray-800 mb-2">Upload Cover Buku</h4>
                  <p className="text-sm text-gray-600 mb-4">Drag & drop atau klik untuk memilih gambar</p>
                  <p className="text-xs text-gray-500 mb-4">PNG, JPG, JPEG • Maks 5MB</p>
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
    </div>
  );
};

export default BookModal;

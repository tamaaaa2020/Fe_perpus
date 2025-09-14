"use client";
import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

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
    }
  }, [selectedItem]);

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (image) formData.append("image", image);

    const url = selectedItem
      ? `${API_BASE}/admin/books/${selectedItem.id}`
      : `${API_BASE}/admin/books`;

    const res = await fetch(url, {
      method: selectedItem ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setBooks((prev) =>
        selectedItem
          ? prev.map((b) => (b.id === data.id ? data : b))
          : [...prev, data]
      );
      setShowModal(null);
    } else {
      alert("Gagal simpan buku");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedItem ? "Edit Buku" : "Tambah Buku"}
        </h2>

        <div className="space-y-3">
          {["title", "author", "publisher", "publish_year", "stock"].map(
            (field) => (
              <input
                key={field}
                placeholder={field}
                value={form[field]}
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
            )
          )}
          <textarea
            placeholder="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setShowModal(null)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookModal;

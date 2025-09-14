"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

const CategoryModal = ({ selectedItem, setShowModal, setCategories }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ category_name: "", description: "" });

  useEffect(() => {
    if (selectedItem) {
      setForm({
        category_name: selectedItem.category_name || selectedItem.name || "",
        description: selectedItem.description || "",
      });
    }
  }, [selectedItem]);

  const handleSubmit = async () => {
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
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedItem ? "Edit Kategori" : "Tambah Kategori"}
        </h2>

        <input
          placeholder="Nama Kategori"
          value={form.category_name}
          onChange={(e) => setForm({ ...form, category_name: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <textarea
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />

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

export default CategoryModal;

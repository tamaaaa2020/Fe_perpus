"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

const UserModal = ({ selectedItem, setShowModal, setUsers }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    role: "user",
    alamat: "",
    password: "",
  });

  useEffect(() => {
    if (selectedItem) {
      setForm({
        username: selectedItem.username || "",
        name: selectedItem.name || "",
        email: selectedItem.email || "",
        role: selectedItem.role || "user",
        alamat: selectedItem.alamat || "",
        password: "",
      });
    }
  }, [selectedItem]);

  const handleSubmit = async () => {
    const url = selectedItem
      ? `/admin/users/${selectedItem.id}`
      : `/admin/users`;

    await api(url, {
      method: selectedItem ? "PUT" : "POST",
      token,
      body: form,
    });

    const refreshed = await api("/admin/users", { token });
    setUsers(refreshed.data || refreshed);
    setShowModal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedItem ? "Edit User" : "Tambah User"}
        </h2>

        {["username", "name", "email", "alamat"].map((f) => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />
        ))}

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="user">User</option>
          <option value="petugas">Petugas</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
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

export default UserModal;

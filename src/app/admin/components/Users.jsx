"use client";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Users({
  users,
  setUsers,
  setShowModal,
  setSelectedItem,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manajemen User</h3>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal("user");
          }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">Username</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Nama Lengkap</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Role</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id_user} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm">{u.username}</td>
                <td className="px-6 py-4 text-sm">{u.nama_lengkap}</td>
                <td className="px-6 py-4 text-sm">{u.email}</td>
                <td className="px-6 py-4 text-sm">{u.role}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedItem(u);
                      setShowModal("user");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Yakin hapus user ini?")) {
                        setUsers((prev) =>
                          prev.filter((usr) => usr.id_user !== u.id_user)
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
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Belum ada user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

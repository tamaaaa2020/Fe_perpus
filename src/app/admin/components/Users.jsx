import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";

export default function Users({
  users = [],
  setUsers,
  setShowModal,
  setSelectedItem,
}) {
  const [searchUsername, setSearchUsername] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Filter users based on search and role filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesUsername = user.username
        .toLowerCase()
        .includes(searchUsername.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesUsername && matchesRole;
    });
  }, [users, searchUsername, filterRole]);

  // Get unique roles for filter dropdown
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(users.map(user => user.role))];
    return uniqueRoles;
  }, [users]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manajemen User</h3>
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal("user");
            }}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah User
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search by Username */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Role */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="block pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white min-w-[140px]"
            >
              <option value="all">Semua Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        {(searchUsername || filterRole !== "all") && (
          <div className="mt-3 text-sm text-slate-600">
            Menampilkan {filteredUsers.length} dari {users.length} user
            {searchUsername && (
              <span className="ml-1">
                untuk "{searchUsername}"
              </span>
            )}
            {filterRole !== "all" && (
              <span className="ml-1">
                dengan role "{filterRole}"
              </span>
            )}
          </div>
        )}
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
            {filteredUsers.map((u) => (
              <tr key={u.id_user} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium">{u.username}</td>
                <td className="px-6 py-4 text-sm">{u.nama_lengkap}</td>
                <td className="px-6 py-4 text-sm">{u.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin' 
                      ? 'bg-violet-100 text-violet-800'
                      : u.role === 'petugas'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedItem(u);
                      setShowModal("user");
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                    title="Edit User"
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
                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                    title="Hapus User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && users.length > 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Search className="w-8 h-8 text-slate-400" />
                    <p>Tidak ada user yang cocok dengan pencarian</p>
                    <button
                      onClick={() => {
                        setSearchUsername("");
                        setFilterRole("all");
                      }}
                      className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                    >
                      Reset filter
                    </button>
                  </div>
                </td>
              </tr>
            )}
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
import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";

// ==== BASE URL API - Sesuaikan dengan Laravel route ====
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/admin";

// Debug: Log API calls
const DEBUG = true;

export default function Users({
  users = [],
  setUsers,
  setShowModal,
  setSelectedItem,
}) {
  const [searchUsername, setSearchUsername] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState({});

  // Validate props (hanya warning di console, jangan block render)
  if (!setUsers || typeof setUsers !== 'function') {
    console.warn('Users component: setUsers is not a function. Will use page reload as fallback.');
  }

  // Filter users berdasarkan search + role filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesUsername = user.username
        .toLowerCase()
        .includes(searchUsername.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesUsername && matchesRole;
    });
  }, [users, searchUsername, filterRole]);

  // Unique roles untuk filter dropdown
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(users.map((user) => user.role))];
    return uniqueRoles;
  }, [users]);

  // ==== Toggle Ban / Unban ====
  const handleToggleBan = async (user) => {
    const action = user.banned_at ? "unban" : "ban";
    const userId = user.id_user;
    
    // Debug log
    if (DEBUG) {
      console.log('=== BAN/UNBAN DEBUG ===');
      console.log('User:', user);
      console.log('User ID:', userId);
      console.log('Action:', action);
      console.log('URL:', `${API_BASE_URL}/users/${userId}/${action}`);
    }

    // Set loading state untuk button spesifik
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      // Get token - sesuaikan dengan cara Anda menyimpan token
      const token = localStorage.getItem('token') || 
                    sessionStorage.getItem('token') ||
                    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const url = `${API_BASE_URL}/users/${userId}/${action}`;
      
      if (DEBUG) {
        console.log('Fetching:', url);
        console.log('Token:', token ? 'Available' : 'Not found');
      }
      
      const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
      };

      // Tambahkan Authorization header jika token ada
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: headers,
        credentials: "include", // Untuk Sanctum cookie-based
      });

      if (DEBUG) {
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (DEBUG) console.log('Error data:', data);
        
        // Handle specific error cases
        if (res.status === 401) {
          throw new Error('Unauthorized - Silakan login kembali');
        } else if (res.status === 403) {
          throw new Error('Forbidden - Anda tidak memiliki akses');
        } else if (res.status === 404) {
          throw new Error('User tidak ditemukan');
        }
        
        throw new Error(data?.message || `Gagal ${action} user (${res.status})`);
      }

      const responseData = await res.json();
      if (DEBUG) console.log('Success data:', responseData);

      // Update state lokal - cek dulu apakah setUsers adalah function
      if (typeof setUsers === 'function') {
        setUsers((prev) =>
          prev.map((usr) =>
            usr.id_user === userId
              ? { 
                  ...usr, 
                  banned_at: action === "ban" ? new Date().toISOString() : null,
                  is_banned: action === "ban"
                }
              : usr
          )
        );
      } else {
        console.warn('setUsers is not a function, state not updated');
        // Reload page sebagai fallback
        alert(responseData.message || `User berhasil di-${action}. Halaman akan di-refresh.`);
        window.location.reload();
        return;
      }

      // Optional: Tampilkan success message
      alert(responseData.message || `User berhasil di-${action}`);
      
    } catch (err) {
      console.error("Ban/unban error:", err);
      alert(err.message || `Terjadi kesalahan saat ${action} user`);
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ==== Delete User ====
  const handleDelete = async (user) => {
    if (!confirm(`Yakin hapus user "${user.username}"?`)) return;

    const userId = user.id_user;
    setLoading(prev => ({ ...prev, [`delete-${userId}`]: true }));

    try {
      const token = localStorage.getItem('token') || 
                    sessionStorage.getItem('token') ||
                    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const headers = {
        "Accept": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(
        `${API_BASE_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: headers,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        
        if (res.status === 401) {
          throw new Error('Unauthorized - Silakan login kembali');
        } else if (res.status === 403) {
          throw new Error(data?.message || 'Tidak dapat menghapus user ini');
        }
        
        throw new Error(data?.message || "Gagal menghapus user");
      }

      const responseData = await res.json();
      
      // Update state lokal
      if (typeof setUsers === 'function') {
        setUsers((prev) => prev.filter((usr) => usr.id_user !== userId));
      } else {
        console.warn('setUsers is not a function, reloading page');
        alert(responseData.message || "User berhasil dihapus. Halaman akan di-refresh.");
        window.location.reload();
        return;
      }
      
      alert(responseData.message || "User berhasil dihapus");
      
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus user");
    } finally {
      setLoading(prev => ({ ...prev, [`delete-${userId}`]: false }));
    }
  };

  // Check if user is banned
  const isBanned = (user) => {
    return user.banned_at !== null && user.banned_at !== undefined;
  };

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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
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

          {/* Filter role */}
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

        {(searchUsername || filterRole !== "all") && (
          <div className="mt-3 text-sm text-slate-600">
            Menampilkan {filteredUsers.length} dari {users.length} user
            {searchUsername && (
              <span className="ml-1">untuk "{searchUsername}"</span>
            )}
            {filterRole !== "all" && (
              <span className="ml-1">dengan role "{filterRole}"</span>
            )}
          </div>
        )}
      </div>

      {/* Tabel Users */}
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
            {filteredUsers.map((u) => {
              const userBanned = isBanned(u);
              const isLoading = loading[u.id_user];
              const isDeleting = loading[`delete-${u.id_user}`];
              
              return (
                <tr key={u.id_user} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium">{u.username}</td>
                  <td className="px-6 py-4 text-sm">{u.nama_lengkap}</td>
                  <td className="px-6 py-4 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {userBanned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Banned
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-violet-100 text-violet-800"
                            : u.role === "petugas"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedItem(u);
                          setShowModal("user");
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Edit User"
                        disabled={isLoading || isDeleting}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Hapus User"
                        disabled={isLoading || isDeleting}
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                      {/* Banned / Unbanned */}
                      <button
                        onClick={() => handleToggleBan(u)}
                        disabled={isLoading || isDeleting}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          userBanned
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </span>
                        ) : (
                          userBanned ? "Unban" : "Ban"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && users.length > 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
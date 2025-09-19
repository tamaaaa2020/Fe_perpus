"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

export default function Loans({
  loans,
  searchTerm,
  filterStatus,
  setSearchTerm,
  setFilterStatus,
  setErrorMsg,
  setSuccessMsg,
  role,
  token,
  reloadLoans,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID");
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      dipinjam: "bg-blue-100 text-blue-700",
      terlambat: "bg-red-100 text-red-700",
      dikembalikan: "bg-green-100 text-green-700",
      ditolak: "bg-gray-100 text-gray-700",
      hilang: "bg-orange-100 text-orange-700",
      rusak: "bg-purple-100 text-purple-700",
      siap_diambil: "bg-cyan-100 text-cyan-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status?.replace("_", " ")?.toUpperCase()}
      </span>
    );
  };

  // === aksi petugas / admin ===
  const handleAction = async (loanId, action) => {
    try {
      let path = "";
      let method = "PUT";

      switch (action) {
        case "approve":
          path = `/petugas/loans/${loanId}/validate`;
          break;
        case "reject":
          path = `/petugas/loan/${loanId}/reject`;
          method = "POST";
          break;
        case "pickup":
          path = `/petugas/loans/${loanId}/pickup`;
          break;
        case "return":
          path = `/petugas/loans/${loanId}/return`;
          break;
        default:
          return;
      }

      await fetchWithAuth(path, token, { method });
      setSuccessMsg(`Berhasil ${action} peminjaman.`);
      reloadLoans && reloadLoans();
    } catch (err) {
      console.error(err);
      setErrorMsg(`Gagal ${action} peminjaman.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari peminjaman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="siap_diambil">Siap Diambil</option>
          <option value="dipinjam">Dipinjam</option>
          <option value="terlambat">Terlambat</option>
          <option value="dikembalikan">Dikembalikan</option>
          <option value="ditolak">Ditolak</option>
          <option value="hilang">Hilang</option>
          <option value="rusak">Rusak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Daftar Peminjaman</h3>
          {(role === "petugas" || role === "admin") && (
            <div className="text-xs text-slate-500">
              Aksi: Approve / Reject / Pickup / Return
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Peminjam
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">Buku</th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Tanggal Pinjam
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">Denda</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loans.map((loan) => (
                <tr key={loan.id_loan} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm">
                    {loan.user?.nama_lengkap || loan.user?.username}
                  </td>
                  <td className="px-6 py-4 text-sm">{loan.book?.title}</td>
                  <td className="px-6 py-4 text-sm">
                    {formatDate(loan.tanggal_peminjaman)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDate(loan.due_date)}
                  </td>
                  <td className="px-6 py-4">
                    {statusBadge(loan.status_peminjaman)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {loan.denda > 0 ? formatRupiah(loan.denda) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(role === "petugas" || role === "admin") &&
                        loan.status_peminjaman === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleAction(loan.id_loan, "approve")
                              }
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleAction(loan.id_loan, "reject")
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      {(role === "petugas" || role === "admin") &&
                        loan.status_peminjaman === "siap_diambil" && (
                          <button
                            onClick={() =>
                              handleAction(loan.id_loan, "pickup")
                            }
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <PackageCheck className="w-4 h-4" />
                          </button>
                        )}
                      {(role === "petugas" || role === "admin") &&
                        loan.status_peminjaman === "dipinjam" && (
                          <button
                            onClick={() =>
                              handleAction(loan.id_loan, "return")
                            }
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                          >
                            Return
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada data peminjaman.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import LoanStatusModal from "./modals/LoanStatusModal";
import ReturnValidationModal from "./modals/ReturnValidationModal";

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
  const [selectedLoan, setSelectedLoan] = useState(null);

  // modal untuk approve pinjam
  const [showLoanStatusModal, setShowLoanStatusModal] = useState(false);
  // modal untuk validasi pengembalian
  const [showReturnValidationModal, setShowReturnValidationModal] = useState(false);

  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID");
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      siap_diambil: "bg-cyan-100 text-cyan-700",
      dipinjam: "bg-blue-100 text-blue-700",
      menunggu_validasi_pengembalian: "bg-purple-100 text-purple-700",
      dikembalikan: "bg-green-100 text-green-700",
      rusak: "bg-pink-100 text-pink-700",
      hilang: "bg-orange-100 text-orange-700",
      terlambat: "bg-red-100 text-red-700",
      ditolak: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status?.replaceAll("_", " ")?.toUpperCase()}
      </span>
    );
  };

  // petugas klik "Validasi Peminjaman" -> buka modal LoanStatusModal
  const openValidateBorrowModal = (loan) => {
    setSelectedLoan(loan);
    setShowLoanStatusModal(true);
  };

  // petugas klik "Validasi Pengembalian" -> buka ReturnValidationModal
  const openValidateReturnModal = (loan) => {
    setSelectedLoan(loan);
    setShowReturnValidationModal(true);
  };

  // petugas set status pinjam: siap_diambil / ditolak
  const handleChangeStatus = async (status) => {
    if (!selectedLoan) return;
    try {
      await fetchWithAuth(
        `/petugas/loans/${selectedLoan.id_loan}/validate`,
        token,
        {
          method: "PUT",
          body: { status },
        }
      );
      setSuccessMsg?.(`Status peminjaman diubah ke ${status}`);
      reloadLoans && reloadLoans();
    } catch (err) {
      console.error(err);
      setErrorMsg?.("Gagal ubah status peminjaman.");
    } finally {
      setShowLoanStatusModal(false);
      setSelectedLoan(null);
    }
  };

  // petugas finalisasi pengembalian -> baik / rusak / hilang
  const handleFinalizeReturn = async (condition) => {
    if (!selectedLoan) return;
    setIsSubmittingReturn(true);
    try {
        await fetchWithAuth(
          `/petugas/loans/${selectedLoan.id_loan}/finalize-return`,
          token,
          {
            method: "PUT",
            body: { condition },
          }
        );
        setSuccessMsg?.(`Pengembalian selesai sebagai ${condition}`);
        reloadLoans && reloadLoans();
    } catch (err) {
        console.error(err);
        setErrorMsg?.("Gagal memfinalisasi pengembalian.");
    } finally {
        setIsSubmittingReturn(false);
        setShowReturnValidationModal(false);
        setSelectedLoan(null);
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
          <option value="menunggu_validasi_pengembalian">
            Menunggu Validasi Pengembalian
          </option>
          <option value="dikembalikan">Dikembalikan</option>
          <option value="rusak">Rusak</option>
          <option value="hilang">Hilang</option>
          <option value="ditolak">Ditolak</option>
          <option value="terlambat">Terlambat</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Daftar Peminjaman</h3>
          {(role === "petugas" || role === "admin") && (
            <div className="text-xs text-slate-500">
              Tindakan hanya muncul bila butuh aksi.
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
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Buku
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Tanggal Pinjam
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Denda
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Aksi
                </th>
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
                    {(role === "petugas" || role === "admin") && (
                      <div className="flex flex-col gap-2 w-[190px]">
                        {/* Validasi peminjaman awal */}
                        {loan.status_peminjaman === "pending" && (
                          <button
                            onClick={() => openValidateBorrowModal(loan)}
                            className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            Validasi Peminjaman
                          </button>
                        )}

                        {/* Validasi pengembalian */}
                        {loan.status_peminjaman ===
                          "menunggu_validasi_pengembalian" && (
                          <button
                            onClick={() => openValidateReturnModal(loan)}
                            className="px-3 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                          >
                            Validasi Pengembalian
                          </button>
                        )}
                      </div>
                    )}
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

      {/* MODAL VALIDASI PEMINJAMAN */}
      {showLoanStatusModal && (
        <LoanStatusModal
          loan={selectedLoan}
          onClose={() => setShowLoanStatusModal(false)}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {/* MODAL VALIDASI PENGEMBALIAN */}
      {showReturnValidationModal && (
        <ReturnValidationModal
          loan={selectedLoan}
          onClose={() => setShowReturnValidationModal(false)}
          onConfirmReturn={handleFinalizeReturn}
          isLoading={isSubmittingReturn}
        />
      )}
    </div>
  );
}

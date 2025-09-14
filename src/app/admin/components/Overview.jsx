"use client";
import { Book, Users, Clock, AlertTriangle } from "lucide-react";

export default function Overview({ stats, errorMsg, successMsg }) {
  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMsg && (!stats || Object.keys(stats).length === 0) && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
          {successMsg}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Buku */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <Book className="w-10 h-10 text-violet-600" />
          <div>
            <p className="text-sm text-slate-500">Total Buku</p>
            <p className="text-2xl font-bold">{stats?.totalBooks ?? 0}</p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <Users className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>

        {/* Peminjaman Aktif */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <Clock className="w-10 h-10 text-orange-500" />
          <div>
            <p className="text-sm text-slate-500">Peminjaman Aktif</p>
            <p className="text-2xl font-bold">{stats?.activeLoans ?? 0}</p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-red-600" />
          <div>
            <p className="text-sm text-slate-500">Pending Approval</p>
            <p className="text-2xl font-bold">{stats?.pendingLoans ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

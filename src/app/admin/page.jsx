"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Archive,
  Flag,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import { api } from "@/lib/api";
import { useAuthGuardForAdmin } from "@/lib/auth";

// Komponen
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Loans from "./components/Loans";
import Books from "./components/Books";
import Categories from "./components/Categories";
import UsersTable from "./components/Users";
import ReportedReviews from "./components/ReportedReviews";
import Reports from "./components/Reports";

// Modals
import BookModal from "./components/modals/BookModal";
import CategoryModal from "./components/modals/CategoryModal";
import UserModal from "./components/modals/UserModal";
import ReviewModal from "./components/modals/ReviewModal";

/* ====== Overview (Dashboard) ====== */
const Overview = ({ stats }) => {
  const [timeFilter, setTimeFilter] = useState("month");

  // Dummy data (replace API if available)
  const loanTrends = useMemo(() => {
    if (timeFilter === "week") {
      return [
        { period: "M1", loans: 12, returns: 8 },
        { period: "M2", loans: 18, returns: 15 },
        { period: "M3", loans: 25, returns: 20 },
        { period: "M4", loans: 22, returns: 18 },
      ];
    } else if (timeFilter === "month") {
      return [
        { period: "Jan", loans: 85, returns: 78 },
        { period: "Feb", loans: 92, returns: 88 },
        { period: "Mar", loans: 108, returns: 95 },
        { period: "Apr", loans: 125, returns: 118 },
        { period: "May", loans: 98, returns: 102 },
        { period: "Jun", loans: 142, returns: 135 },
        { period: "Jul", loans: 156, returns: 148 },
        { period: "Aug", loans: 134, returns: 140 },
        { period: "Sep", loans: 128, returns: 125 },
      ];
    } else {
      return [
        { period: "2020", loans: 1250, returns: 1180 },
        { period: "2021", loans: 1420, returns: 1380 },
        { period: "2022", loans: 1680, returns: 1650 },
        { period: "2023", loans: 1890, returns: 1845 },
        { period: "2024", loans: 2150, returns: 2085 },
      ];
    }
  }, [timeFilter]);

  const categoryDistribution = [
    { name: "Programming", value: 45, color: "#3B82F6" },
    { name: "Database", value: 25, color: "#10B981" },
    { name: "Design", value: 20, color: "#F59E0B" },
    { name: "Network", value: 10, color: "#EF4444" },
  ];

  const dailyActivity = [
    { day: "Sen", morning: 12, afternoon: 18, evening: 8 },
    { day: "Sel", morning: 15, afternoon: 22, evening: 12 },
    { day: "Rab", morning: 18, afternoon: 25, evening: 15 },
    { day: "Kam", morning: 14, afternoon: 20, evening: 10 },
    { day: "Jum", morning: 16, afternoon: 28, evening: 18 },
    { day: "Sab", morning: 25, afternoon: 35, evening: 22 },
    { day: "Min", morning: 20, afternoon: 30, evening: 25 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-white/80 text-sm">Total Login Hari Ini</p>
          <p className="text-3xl font-bold">127</p>
          <p className="text-white/70 text-xs mt-1">+12% dari kemarin</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-white/80 text-sm">Buku Dipinjam Minggu Ini</p>
          <p className="text-3xl font-bold">45</p>
          <p className="text-white/70 text-xs mt-1">+8% dari minggu lalu</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-white/80 text-sm">User Aktif Bulan Ini</p>
          <p className="text-3xl font-bold">89</p>
          <p className="text-white/70 text-xs mt-1">+15% dari bulan lalu</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-white/80 text-sm">Tingkat Pengembalian</p>
          <p className="text-3xl font-bold">94%</p>
          <p className="text-white/70 text-xs mt-1">+2% dari rata-rata</p>
        </div>
      </div>

      {/* Chart 1 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Tren Peminjaman
          </h3>
          <div className="flex gap-2">
            {["week", "month", "year"].map((key) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  timeFilter === key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {key === "week" ? "Minggu" : key === "month" ? "Bulan" : "Tahun"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={loanTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="loans" stroke="#3B82F6" name="Peminjaman" />
              <Line dataKey="returns" stroke="#10B981" name="Pengembalian" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Distribusi Kategori Buku
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {categoryDistribution.map((c) => (
              <div key={c.name} className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="flex-1">{c.name}</span>
                <span className="font-bold" style={{ color: c.color }}>
                  {c.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Aktivitas Harian
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="morning" stackId="a" fill="#3B82F6" name="Pagi" />
              <Bar dataKey="afternoon" stackId="a" fill="#10B981" name="Siang" />
              <Bar dataKey="evening" stackId="a" fill="#F59E0B" name="Sore" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ====== Main Dashboard ====== */
const AdminPetugasDashboard = () => {
  const { token, role, ready } = useAuthGuardForAdmin();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [stats, setStats] = useState({});
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const getAvailableTabs = useMemo(() => {
    const base = [
      { id: "overview", label: "Dashboard", icon: BarChart3 },
      { id: "loans", label: "Peminjaman", icon: BookOpen },
    ];
    const adminTabs = [
      { id: "books", label: "Buku", icon: Book },
      { id: "categories", label: "Kategori", icon: Archive },
      { id: "users", label: "Users", icon: Users },
      { id: "reported-reviews", label: "Review Reports", icon: Flag },
    ];
    const reportTab = { id: "reports", label: "Laporan", icon: FileText };
    return role === "admin" ? [...base, ...adminTabs, reportTab] : [...base, reportTab];
  }, [role]);

  const fetchLoans = async () => {
    const loanData = await api(
      role === "admin" ? "/admin/loans" : "/petugas/loans",
      { token }
    );
    setLoans(Array.isArray(loanData) ? loanData : loanData.data || []);
  };

  useEffect(() => {
    if (!ready) return;
    const fetchData = async () => {
      try {
        const dash = await api(
          role === "admin" ? "/admin/dashboard" : "/petugas/dashboard",
          { token }
        );
        setStats(dash || {});
        await fetchLoans();
        if (role === "admin") {
          const books = await api("/admin/books", { token });
          setBooks(Array.isArray(books) ? books : books.data || []);
          const cats = await api("/admin/categories", { token });
          setCategories(Array.isArray(cats) ? cats : cats.data || []);
          const users = await api("/admin/users", { token });
          setUsers(Array.isArray(users) ? users : users.data || []);
        }
        setReportedReviews([
          {
            id: 1,
            book_title: "Belajar React Native",
            reviewer: "User123",
            review: "Buku ini sangat buruk...",
            report_reason: "Konten tidak pantas",
            reported_by: "Ahmad",
            reported_at: "2025-09-10",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ready, role, token]);

  if (!ready || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header role={role} router={router} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs tabs={getAvailableTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="space-y-8">
          {activeTab === "overview" && <Overview stats={stats} />}
          {activeTab === "loans" && (
            <Loans
              loans={loans}
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              setSearchTerm={setSearchTerm}
              setFilterStatus={setFilterStatus}
              setErrorMsg={setErrorMsg}
              setSuccessMsg={setSuccessMsg}
              role={role}
              token={token}
              reloadLoans={fetchLoans}
            />
          )}
          {activeTab === "books" && role === "admin" && <Books books={books} setShowModal={setShowModal} setSelectedItem={setSelectedItem} />}
          {activeTab === "categories" && role === "admin" && <Categories categories={categories} setShowModal={setShowModal} setSelectedItem={setSelectedItem} />}
          {activeTab === "users" && role === "admin" && <UsersTable users={users} setShowModal={setShowModal} setSelectedItem={setSelectedItem} />}
          {activeTab === "reported-reviews" && role === "admin" && <ReportedReviews reviews={reportedReviews} setShowModal={setShowModal} setSelectedItem={setSelectedItem} />}
          {activeTab === "reports" && <Reports role={role} />}
        </div>
      </div>
      {showModal === "book" && <BookModal selectedItem={selectedItem} setShowModal={setShowModal} />}
      {showModal === "category" && <CategoryModal selectedItem={selectedItem} setShowModal={setShowModal} />}
      {showModal === "user" && <UserModal selectedItem={selectedItem} setShowModal={setShowModal} />}
      {showModal === "review" && <ReviewModal selectedItem={selectedItem} setShowModal={setShowModal} />}
    </div>
  );
};

export default AdminPetugasDashboard;

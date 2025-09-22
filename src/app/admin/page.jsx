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

import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Loans from "./components/Loans";
import Books from "./components/Books";
import Categories from "./components/Categories";
import UsersTable from "./components/Users";
import ReportedReviews from "./components/ReportedReviews";
import Reports from "./components/Reports";

import BookModal from "./components/modals/BookModal";
import CategoryModal from "./components/modals/CategoryModal";
import UserModal from "./components/modals/UserModal";
import ReviewModal from "./components/modals/ReviewModal";

// ====== Overview (Dashboard) ======
const Overview = ({ token, role }) => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [loanTrends, setLoanTrends] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  // LoanTrends + CategoryDistribution + DailyActivity => admin & petugas
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api(
          role === "admin" ? "/admin/dashboard" : "/petugas/dashboard",
          { token }
        );
        setLoanTrends(data.loanTrends || []);
        setCategoryDistribution(data.categoryDistribution || []);
        setDailyActivity(data.dailyActivity || []);
      } catch (err) {
        console.error("Error fetching dashboard", err);
      }
    };
    fetchDashboard();
  }, [token, role]);

  // User Growth => hanya admin
  useEffect(() => {
    if (role !== "admin") return;
    const fetchUserGrowth = async () => {
      try {
        const data = await api(
          `/admin/dashboard/user-growth?range=${timeFilter}`,
          { token }
        );
        setUserGrowth(data || []);
      } catch (err) {
        console.error("Error fetching user growth", err);
      }
    };
    fetchUserGrowth();
  }, [timeFilter, token, role]);

  // Top Books & Users => hanya admin
  useEffect(() => {
    if (role !== "admin") return;
    const fetchTop = async () => {
      try {
        const books = await api("/admin/dashboard/top-books", { token });
        const users = await api("/admin/dashboard/top-users", { token });
        setTopBooks(books || []);
        setTopUsers(users || []);
      } catch (err) {
        console.error("Error fetching top data", err);
      }
    };
    fetchTop();
  }, [token, role]);

  return (
    <div className="space-y-8">
      {/* Chart 1: Tren Peminjaman */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Tren Peminjaman
          </h3>
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
        <ResponsiveContainer width="100%" height={300}>
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

      {/* Chart 3 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Aktivitas Harian
        </h3>
        <ResponsiveContainer width="100%" height={300}>
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

      {/* Chart tambahan hanya untuk Admin */}
      {role === "admin" && (
        <>
          {/* Chart 4: Growth User */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Pertumbuhan User ({timeFilter})
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
                    {key === "week"
                      ? "Minggu"
                      : key === "month"
                      ? "Bulan"
                      : "Tahun"}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#6366F1" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Buku */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Top 10 Buku Paling Banyak Dipinjam
            </h3>
            <ul className="space-y-2">
              {topBooks.map((book, idx) => (
                <li key={idx} className="flex justify-between border-b pb-1">
                  <span>{book.title}</span>
                  <span className="font-bold">{book.total}x</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top 10 User */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Top 10 User Paling Aktif Minjem
            </h3>
            <ul className="space-y-2">
              {topUsers.map((user, idx) => (
                <li key={idx} className="flex justify-between border-b pb-1">
                  <span>{user.username}</span>
                  <span className="font-bold">{user.total}x</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
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
    return role === "admin"
      ? [...base, ...adminTabs, reportTab]
      : [...base, reportTab];
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
        setReportedReviews([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ready, role, token]);

  if (!ready || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header role={role} router={router} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs
          tabs={getAvailableTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="space-y-8">
          {activeTab === "overview" && <Overview token={token} role={role} />}
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
          {activeTab === "books" &&
            role === "admin" && (
              <Books
                books={books}
                setShowModal={setShowModal}
                setSelectedItem={setSelectedItem}
              />
            )}
          {activeTab === "categories" &&
            role === "admin" && (
              <Categories
                categories={categories}
                setShowModal={setShowModal}
                setSelectedItem={setSelectedItem}
              />
            )}
          {activeTab === "users" &&
            role === "admin" && (
              <UsersTable
                users={users}
                setShowModal={setShowModal}
                setSelectedItem={setSelectedItem}
              />
            )}
          {activeTab === "reported-reviews" &&
            role === "admin" && (
              <ReportedReviews
                reviews={reportedReviews}
                setShowModal={setShowModal}
                setSelectedItem={setSelectedItem}
              />
            )}
          {activeTab === "reports" && <Reports role={role} />}
        </div>
      </div>
      {showModal === "book" && (
        <BookModal selectedItem={selectedItem} setShowModal={setShowModal} />
      )}
      {showModal === "category" && (
        <CategoryModal selectedItem={selectedItem} setShowModal={setShowModal} />
      )}
      {showModal === "user" && (
        <UserModal selectedItem={selectedItem} setShowModal={setShowModal} />
      )}
      {showModal === "review" && (
        <ReviewModal selectedItem={selectedItem} setShowModal={setShowModal} />
      )}
    </div>
  );
};

export default AdminPetugasDashboard;

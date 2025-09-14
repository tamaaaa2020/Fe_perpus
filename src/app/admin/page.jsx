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
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuthGuardForAdmin } from "@/lib/auth";

// Komponen
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Overview from "./components/Overview";
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

const AdminPetugasDashboard = () => {
  const { token, role, ready } = useAuthGuardForAdmin();
  const router = useRouter();

  // State
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

  // Tabs
  const getAvailableTabs = useMemo(() => {
    const baseTabs = [
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
      ? [...baseTabs, ...adminTabs, reportTab]
      : [...baseTabs, reportTab];
  }, [role]);

  // Fetch data
  useEffect(() => {
    if (!ready) return;

    const fetchData = async () => {
      try {
        // Dashboard
        const dash = await api(
          role === "admin" ? "/admin/dashboard" : "/petugas/dashboard",
          { token }
        );
        setStats(dash || {});
      } catch (e) {
        console.error("Dashboard error:", e);
        setErrorMsg("Gagal ambil data dashboard");
      }

      try {
        // Loans
        const loanData = await api(
          role === "admin" ? "/admin/loans" : "/petugas/loans",
          { token }
        );
        setLoans(Array.isArray(loanData) ? loanData : loanData.data || []);
      } catch (e) {
        console.error("Loans error:", e);
        setErrorMsg("Gagal ambil data peminjaman");
      }

      if (role === "admin") {
        try {
          const bookData = await api("/admin/books", { token });
          setBooks(Array.isArray(bookData) ? bookData : bookData.data || []);
        } catch (e) {
          console.error("Books error:", e);
          setErrorMsg("Gagal ambil data buku");
        }

        try {
          const categoryData = await api("/admin/categories", { token });
          setCategories(
            Array.isArray(categoryData)
              ? categoryData
              : categoryData.data || []
          );
        } catch (e) {
          console.error("Categories error:", e);
          setErrorMsg("Gagal ambil data kategori");
        }

        try {
          const userData = await api("/admin/users", { token });
          setUsers(Array.isArray(userData) ? userData : userData.data || []);
        } catch (e) {
          console.error("Users error:", e);
          setErrorMsg("Gagal ambil data users");
        }
      }

      // Dummy Reported Reviews
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

      setIsLoading(false);
    };

    fetchData();
  }, [ready, role, token]);

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

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
          {activeTab === "overview" && (
            <Overview
              stats={stats}
              errorMsg={errorMsg}
              successMsg={successMsg}
            />
          )}
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
            />
          )}
          {activeTab === "books" && role === "admin" && (
            <Books
              books={books}
              setBooks={setBooks}
              setShowModal={setShowModal}
              setSelectedItem={setSelectedItem}
            />
          )}
          {activeTab === "categories" && role === "admin" && (
            <Categories
              categories={categories}
              setCategories={setCategories}
              setShowModal={setShowModal}
              setSelectedItem={setSelectedItem}
            />
          )}
          {activeTab === "users" && role === "admin" && (
            <UsersTable
              users={users}
              setUsers={setUsers}
              setShowModal={setShowModal}
              setSelectedItem={setSelectedItem}
            />
          )}
          {activeTab === "reported-reviews" && role === "admin" && (
            <ReportedReviews
              reviews={reportedReviews}
              setReviews={setReportedReviews}
              setShowModal={setShowModal}
              setSelectedItem={setSelectedItem}
            />
          )}
          {activeTab === "reports" && <Reports role={role} />}
        </div>
      </div>

      {/* ==== MODALS ==== */}
      {showModal === "book" && (
        <BookModal
          selectedItem={selectedItem}
          setShowModal={setShowModal}
          setBooks={setBooks}
        />
      )}
      {showModal === "category" && (
        <CategoryModal
          selectedItem={selectedItem}
          setShowModal={setShowModal}
          setCategories={setCategories}
        />
      )}
      {showModal === "user" && (
        <UserModal
          selectedItem={selectedItem}
          setShowModal={setShowModal}
          setUsers={setUsers}
        />
      )}
      {showModal === "review" && (
        <ReviewModal
          selectedItem={selectedItem}
          setShowModal={setShowModal}
          setReviews={setReportedReviews}
        />
      )}
    </div>
  );
};

export default AdminPetugasDashboard;

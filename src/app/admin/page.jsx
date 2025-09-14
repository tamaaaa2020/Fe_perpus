"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  FileText,
  Bell,
  LogOut,
  Shield,
  ShieldCheck,
  Eye,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  BookOpen,
  UserPlus,
  Flag,
  Archive,
  PackageCheck,
  Upload,
  Image,
} from "lucide-react";

/* =========================
   API BASE + HELPERS
   ========================= */
const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
// buang trailing slash
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// gabung path aman
function joinApi(path = "") {
  return `${API_BASE}/${String(path).replace(/^\/+/, "")}`;
}

// helper fetch (auto JSON/Text/Blob + error detail)
async function api(path, { method = "GET", body, token, isFormData = false } = {}) {
  const url = joinApi(path);
  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  // Don't set Content-Type for FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  try {
    console.log(`Making ${method} request to:`, url);
    console.log('Headers:', headers);
    
    const res = await fetch(url, {
      method,
      headers,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send cookies
      ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    const ctype = res.headers.get("content-type") || "";
    let payload = null;
    
    try {
      if (ctype.includes("application/json")) {
        payload = await res.json();
      } else if (ctype.includes("text/")) {
        payload = await res.text();
      } else {
        payload = await res.blob(); // file (pdf/xlsx/csv)
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      payload = null;
    }

    console.log('Response payload:', payload);

    if (!res.ok) {
      console.error("API ERROR", { url, status: res.status, payload });
      const msg =
        (payload && payload.message) ||
        (typeof payload === "string" ? payload : "") ||
        `Request failed: ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = payload;
      throw err;
    }
    
    return payload;
  } catch (networkError) {
    console.error('Network error:', networkError);
    
    // Handle different types of fetch errors
    if (networkError.name === 'TypeError' && networkError.message.includes('Failed to fetch')) {
      throw new Error('Network error: Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan di http://localhost:8000');
    } else if (networkError.name === 'AbortError') {
      throw new Error('Request timeout');
    } else if (networkError.status) {
      // Re-throw API errors
      throw networkError;
    } else {
      throw new Error(`Connection error: ${networkError.message}`);
    }
  }
}

// Helper function untuk fetch dengan authentication (untuk kompatibilitas)
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${url}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

function downloadBlob(blob, filename = "report") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* =========================
   AUTH GUARD (Admin/Petugas)
   ========================= */
function useAuthGuardForAdmin() {
  const router = useRouter();
  const [state, setState] = useState({ token: null, role: null, ready: false });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const role = String(user?.role || "").toLowerCase();

    if (!token || !user) {
      router.replace("/login");
      return;
    }
    // hanya admin/petugas boleh di halaman ini
    if (role !== "admin" && role !== "petugas") {
      router.replace("/dashboard");
      return;
    }
    setState({ token, role, ready: true });
  }, [router]);

  return state; // {token, role, ready}
}

/* =========================
   DASHBOARD
   ========================= */
const AdminPetugasDashboard = () => {
  const { token, role, ready } = useAuthGuardForAdmin();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState("admin"); // visual switch saja

  // search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // modal & selection
  const [showModal, setShowModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Inventory management states (from original code)
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // forms - enhanced book form to include inventory fields
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    publisher: "",
    publish_year: "",
    stock: "",
    description: "",
  });

  const [categoryForm, setCategoryForm] = useState({ category_name: "", description: "" });
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    name: "",
  });

  // Image handling states
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  // data
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    pendingLoans: 0,
    overdue: 0,
    todayReturns: 0,
  });
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // dummy reported reviews (belum ada endpoint list)
  const [reportedReviews, setReportedReviews] = useState([
    {
      id: 1,
      book_title: "Belajar React Native",
      reviewer: "User123",
      review: "Buku ini sangat buruk...",
      report_reason: "Konten tidak pantas",
      reported_by: "Ahmad",
      reported_at: "2024-02-10",
    },
  ]);

  // tab berdasarkan role
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

    if (role === "admin") return [...baseTabs, ...adminTabs, reportTab];
    return [...baseTabs, reportTab]; // petugas
  }, [role]);

  // Fetch books using /books endpoint with search capability
  const fetchBarang = async (search = '') => {
    try {
      const url = search ? `/books?search=${encodeURIComponent(search)}` : '/books';
      const data = await fetchWithAuth(url);
      
      // Handle response structure
      const bookList = Array.isArray(data) ? data : (data.data || []);
      
      // Map to match existing structure
      const mappedBooks = bookList.map(book => ({
        id: book.id_book,
        title: book.title,
        author: book.author,
        category: book.category?.name || book.category_name || "-",
        category_id: book.category_id || book.category?.id_category,
        publish_year: book.publish_year,
        stock: book.stock ?? 0,
        available: book.available ?? book.stock ?? 0,
        created_at: book.created_at?.slice(0, 10),
        description: book.description,
        image: book.image || book.cover,
        // Legacy mapping for compatibility
        nama_Barang: book.title,
        kode_Barang: book.publish_year || book.id_book, // <-- Diubah menggunakan publish_year
        jumlah: book.stock || 0,
        id_kategori: book.category_id || book.category?.id_category,
        kategori_nama: book.category?.name || book.category_name,
        gambar_barang: book.image || book.cover,
      }));
      
      setBooks(mappedBooks);
    } catch (err) {
      console.error('Gagal fetch barang:', err);
      setErrorMsg('Gagal memuat data buku');
    }
  };

  // Fetch categories using admin route
  const fetchKategori = async () => {
    try {
      console.log('Fetching categories with token:', token);
      
      // Test connection first
      try {
        const testResponse = await fetch(`${API_BASE}/dashboard`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors',
          credentials: 'omit'
        });
        console.log('Connection test result:', testResponse.status);
      } catch (testError) {
        console.error('Connection test failed:', testError);
        throw new Error('Tidak dapat terhubung ke server Laravel. Pastikan server berjalan di http://localhost:8000');
      }

      const data = await api('/admin/categories', { token });
      console.log('Categories response:', data);
      
      const categoryList = Array.isArray(data) ? data : (data.data || []);
      setCategories(categoryList);
      console.log('Categories set:', categoryList);
      
      // Clear any previous error
      setErrorMsg('');
      
    } catch (err) {
      console.error('Gagal fetch kategori:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      
      // Set specific error message based on error type
      if (err.message.includes('Network error')) {
        setErrorMsg(`${err.message}. Cek apakah Laravel development server berjalan dengan: php artisan serve`);
      } else if (err.status === 401) {
        setErrorMsg('Unauthorized: Token tidak valid atau sudah expired. Silakan login ulang.');
      } else if (err.status === 403) {
        setErrorMsg('Forbidden: Anda tidak memiliki akses admin.');
      } else if (err.status === 404) {
        setErrorMsg('Endpoint /admin/categories tidak ditemukan. Cek routes di backend.');
      } else if (err.status === 500) {
        setErrorMsg('Server error: Ada masalah di backend Laravel.');
      } else {
        setErrorMsg(`Gagal memuat kategori: ${err.message}`);
      }
      
      // Temporary test data for development (only if it's a network error)
      if (err.message.includes('Network error') || err.message.includes('Failed to fetch')) {
        console.log('Loading test categories due to connection error...');
        setCategories([
          {
            id: 1,
            name: "Fiksi",
            description: "Buku-buku fiksi dan novel",
            books_count: 5
          },
          {
            id: 2,
            name: "Non-Fiksi", 
            description: "Buku-buku edukasi dan referensi",
            books_count: 3
          },
          {
            id: 3,
            name: "Teknologi",
            description: "Buku tentang teknologi dan programming",
            books_count: 8
          }
        ]);
      }
    }
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBarang(searchTerm);
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Reset form
  const resetForm = () => {
    setBookForm({
      title: "",
      author: "",
      publisher: "",
      publish_year: "",
      description: "",
      stock: "",
    });
    setImage(null);
    setImagePreview('');
    setCurrentImage('');
    setSelectedItem(null);
  };

  // initial load
  useEffect(() => {
    if (!ready) return;
    setUserRole(role); // sinkron tampilan

    (async () => {
      // dashboard (semua role)
      try {
        const dash = await api("/dashboard", { token });
        setStats((s) => ({
          totalBooks: dash?.totalBooks ?? s.totalBooks,
          totalUsers: dash?.totalUsers ?? s.totalUsers,
          activeLoans: dash?.activeLoans ?? s.activeLoans,
          pendingLoans: dash?.pendingLoans ?? s.pendingLoans,
          overdue: dash?.overdue ?? s.overdue,
          todayReturns: dash?.todayReturns ?? s.todayReturns,
        }));
      } catch (e) {
        // optional log
      }

      // books (public GET /books) - using enhanced fetchBarang
      try {
        await fetchBarang();
      } catch (e) {}

      // categories & users (admin only)
      if (role === "admin") {
        console.log('User is admin, fetching categories and users...');
        console.log('Token available:', !!token);
        
        try {
          await fetchKategori();
        } catch (e) {
          console.error('Failed to fetch categories:', e);
        }

        try {
          const resp = await api("/admin/users", { token });
          const list = Array.isArray(resp?.data) ? resp.data : resp;
          setUsers(
            (list || []).map((u) => ({
              id: u.id_user,
              username: u.username,
              name: u.nama_lengkap || u.name || u.username,
              email: u.email,
              role: (u.role || "").toLowerCase(),
              active_loans: u.active_loans ?? 0,
              created_at: u.created_at?.slice(0, 10),
            }))
          );
        } catch (e) {
          console.error('Failed to fetch users:', e);
        }
      } else {
        console.log('User is not admin, role:', role);
      }

      // loans (petugas only)
      if (role === "petugas" || role === "admin") {
        try {
          const endpoint = role === "admin" ? "/admin/loans" : "/petugas/loans";
          const resp = await api(endpoint, { token });
          const list = Array.isArray(resp?.data) ? resp.data : resp;
          setLoans(
            (list || []).map((l) => ({
              id: l.id_loan,
              user_name: l.user?.nama_lengkap || l.user?.username || "-",
              book_title: l.book?.title || "-",
              loan_date: (l.tanggal_peminjaman || l.created_at || "").slice(0, 10),
              due_date: (l.due_date || "").slice(0, 10),
              return_date: l.tanggal_pengembalian ? l.return_date.slice(0, 10) : null,
              status: l.status_peminjaman || "pending",
              fine: l.denda ?? 0,
            }))
          );
        } catch (e) {
          console.log("Failed to Fetch Loans:", e);
        }
      }

      setIsLoading(false);
    })();
  }, [ready, role, token]);

  /* ===== Loans actions (petugas) ===== */
  const approveLoan = async (loanId) => {
    try {
      await api(`/loans/${loanId}/validate`, { method: "PUT", token });
      setLoans((list) =>
        list.map((l) => (l.id === loanId ? { ...l, status: "dipinjam" } : l))
      );
      setSuccessMsg("Peminjaman berhasil disetujui");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal menyetujui peminjaman");
    }
  };

  const pickupLoan = async (loanId) => {
    try {
      await api(`/loans/${loanId}/pickup`, { method: "PUT", token });
      setLoans((list) =>
        list.map((l) => (l.id === loanId ? { ...l, status: "dipinjam" } : l))
      );
      setSuccessMsg("Konfirmasi pengambilan berhasil");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal konfirmasi pengambilan");
    }
  };

  const rejectLoan = async (loanId) => {
    // route reject belum ada → update lokal dulu
    setLoans((list) =>
      list.map((l) => (l.id === loanId ? { ...l, status: "ditolak" } : l))
    );
    setSuccessMsg("Status diubah ke 'ditolak' (UI). Tambahkan endpoint reject di backend untuk persist.");
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const processReturn = async (loanId) => {
    try {
      await api(`/loans/${loanId}/return`, { method: "PUT", token });
      setLoans((list) =>
        list.map((l) =>
          l.id === loanId
            ? { ...l, status: "dikembalikan", return_date: new Date().toISOString().slice(0, 10) }
            : l
        )
      );
      setSuccessMsg("Pengembalian berhasil diproses");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal memproses pengembalian");
    }
  };

  /* ===== Books (admin) - Enhanced with image upload ===== */
  const saveBook = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('title', bookForm.title);
      formData.append('author', bookForm.author);
      formData.append('publisher', bookForm.publisher);      
      formData.append('publish_year', bookForm.publish_year); 
      formData.append('description', bookForm.description);
      formData.append('stock', Number(bookForm.stock || 0));
          
      if (image) {
        formData.append('image', image);
      }

      let response;
      
      if (selectedItem) {
        // Update existing book
        response = await fetch(`${API_BASE}/admin/books/${selectedItem.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });
      } else {
        // Create new book
        response = await fetch(`${API_BASE}/admin/books`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan buku');
      }

      await fetchBarang(); // Refresh book list
      setShowModal(null);
      resetForm();
      setSuccessMsg(selectedItem ? 'Buku berhasil diperbarui!' : 'Buku berhasil ditambahkan!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (e) {
      console.error('Error:', e);
      setErrorMsg(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBook = async (bookId) => {
    const confirmDelete = confirm('Yakin ingin menghapus buku ini?');
    if (!confirmDelete) return;

    try {
      await api(`/admin/books/${bookId}`, { method: "DELETE", token });
      await fetchBarang(); // Refresh list
      setSuccessMsg("Buku berhasil dihapus");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal menghapus buku");
    }
  };

  // Edit book - Enhanced to handle images
  const handleEditBarang = async (book) => {
    try {
      setSelectedItem(book);
      setBookForm({
        title: book.title ?? '',
        author: book.author ?? '',
        publisher: book.publisher ?? '', // Ditambahkan untuk kelengkapan
        publish_year: book.publish_year ?? '',
        category_id: book.category_id ?? '',
        description: book.description ?? '',
        stock: String(book.stock ?? 0), // Logika diperbaiki
      });
      
      // Set current image if exists
      if (book.image || book.gambar_barang) {
        setCurrentImage(book.image || book.gambar_barang);
      }
      
      setShowModal("book");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Gagal mengambil data buku:', err);
      setErrorMsg('Gagal mengambil data untuk edit.');
    }
  };

  /* ===== Categories (admin) ===== */
  const saveCategory = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      if (selectedItem) {
        await api(`/admin/categories/${selectedItem.id}`, {
          method: "PUT",
          token,
          body: categoryForm,
        });
      } else {
        await api(`/admin/categories`, {
          method: "POST",
          token,
          body: categoryForm,
        });
      }
      
      await fetchKategori(); // Refresh list
      setShowModal(null);
      setCategoryForm({ category_name: "", description: "" });
      setSelectedItem(null);
      setSuccessMsg("Kategori berhasil disimpan");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    const confirmDelete = confirm('Yakin ingin menghapus kategori ini?');
    if (!confirmDelete) return;

    try {
      await api(`/admin/categories/${categoryId}`, { method: "DELETE", token });
      await fetchKategori(); // Refresh list
      setSuccessMsg("Kategori berhasil dihapus");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal menghapus kategori");
    }
  };

  /* ===== Users (admin) ===== */
  const saveUser = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      if (selectedItem) {
        setErrorMsg("Route update user belum tersedia. Tambahkan endpoint update di backend.");
        return;
      } else {
        const created = await api(`/admin/users`, {
          method: "POST",
          token,
          body: {
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            role: userForm.role,
            nama_lengkap: userForm.name,
          },
        });
        const id = created?.data?.id || created?.id || Math.random();
        setUsers((list) => [
          ...list,
          {
            id,
            username: userForm.username,
            name: userForm.name,
            email: userForm.email,
            role: userForm.role,
            active_loans: 0,
            created_at: new Date().toISOString().slice(0, 10),
          },
        ]);
      }
      setShowModal(null);
      setUserForm({ username: "", email: "", password: "", role: "petugas", name: "" });
      setSelectedItem(null);
      setSuccessMsg("User berhasil disimpan");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e?.data?.message || "Gagal menyimpan user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = confirm('Yakin ingin menghapus user ini?');
    if (!confirmDelete) return;

    try {
      await api (`/admin/users/${userId}`, { method: "DELETE", token});
      setUsers((list) => list.filter((u) => u.id !== userId));
      setSuccessMsg("User berhasil dihapus");
      setTimeout(() => setSuccessMsg(' '), 3000);
    } catch (e) {
      console.error("Delete User Error:", e);
      setErrorMsg(e?.data?.message || "Gagal menghapus user");
    }
  };

  // ✅ Tambahan: Ban User
  const banUser = async (userId) => {
    const confirmBan = confirm('Yakin ingin membanned user ini?');
    if (!confirmBan) return;

    try {
      await api(`/admin/users/${userId}/ban`, { method: "PUT", token });
      setUsers((list) =>
        list.map((u) => (u.id === userId ? { ...u, role: "banned" } : u))
      );
      setSuccessMsg("User berhasil dibanned");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error("Ban User Error:", e);
      setErrorMsg(e?.data?.message || "Gagal membanned user");
    }
  };

  /* ===== Reports ===== */
  const deleteReportedReview = async (reviewId) => {
    // belum ada endpoint list/delete di backend
    setReportedReviews((list) => list.filter((r) => r.id !== reviewId));
    setSuccessMsg("Review (dummy) dihapus dari UI");
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const generateReport = async (type) => {
  try {
    let endpoint = "";

    // =====================
    // Laporan Peminjaman
    // =====================
    if (["peminjaman-harian", "peminjaman-bulanan", "peminjaman-tahunan"].includes(type)) {
      endpoint = `/petugas/reports/loans?type=${type.split("-")[1]}`;
    }

    // =====================
    // Laporan Denda
    // =====================
    else if (["denda-bulanan", "keterlambatan", "rusak", "hilang"].includes(type)) {
      const fineType = type === "denda-bulanan" ? "bulanan" : type; 
      endpoint = `/petugas/reports/fines?type=${fineType}`;
    }

    // =====================
    // Laporan Buku (Admin)
    // =====================
    else if (type === "inventori-buku") {
      endpoint = `/admin/reports/books`; // semua buku
    } 
    else if (type === "popularitas-buku") {
      endpoint = `/admin/reports/books/popular`; // buku populer by rating
    } 
    else if (type === "kategori-statistik") {
      endpoint = `/admin/reports/books/category-stats`; // statistik kategori
    }

    if (!endpoint) throw new Error(`Unknown report type: ${type}`);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Gagal generate laporan: ${res.status}`);
    }

    // Expecting PDF Blob
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${type}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    setSuccessMsg(`Laporan ${type} berhasil digenerate`);
    setTimeout(() => setSuccessMsg(""), 3000);
  } catch (e) {
    console.error("Generate report error:", e);
    setErrorMsg(e?.data?.message || e.message || "Gagal generate laporan");
    setTimeout(() => setErrorMsg(""), 3000);
  }
};
  if (!ready || isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  );

  /* =================== UI RENDERERS =================== */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Buku</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBooks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Peminjaman Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeLoans}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingLoans}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h3>
        </div>
        <div className="p-6 text-slate-500 text-sm">–</div>
      </div>
    </div>
  );

  const renderLoans = () => (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari peminjaman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="dipinjam">Dipinjam</option>
          <option value="terlambat">Terlambat</option>
          <option value="dikembalikan">Dikembalikan</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Daftar Peminjaman</h3>
          {role === "petugas" && (
            <div className="text-xs text-slate-500">Aksi: Approve / Pickup / Return</div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Peminjam</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Buku</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Tanggal Pinjam</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Jatuh Tempo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Denda</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loans
                .filter((loan) => {
                  const q = searchTerm.toLowerCase();
                  const matchesSearch =
                    loan.user_name?.toLowerCase().includes(q) ||
                    loan.book_title?.toLowerCase().includes(q);
                  const matchesFilter = filterStatus === "all" || loan.status === filterStatus;
                  return matchesSearch && matchesFilter;
                })
                .map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{loan.user_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{loan.book_title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{loan.loan_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{loan.due_date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : loan.status === "dipinjam"
                            ? "bg-blue-100 text-blue-700"
                            : loan.status === "terlambat"
                            ? "bg-red-100 text-red-700"
                            : loan.status === "ditolak"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {loan.fine > 0 ? `Rp ${loan.fine.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {role === "petugas" && loan.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveLoan(loan.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectLoan(loan.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Tolak (UI)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {role === "petugas" && loan.status === "dipinjam" && (
                          <button
                            onClick={() => processReturn(loan.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Return"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {role === "petugas" && loan.status === "approved" && (
                          <button
                            onClick={() => pickupLoan(loan.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Pickup Confirmation"
                          >
                            <PackageCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
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

  const renderBooks = () => (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manajemen Buku</h2>
        <div className="flex gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari buku..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cari
            </button>
          </form>
          
          <button
            onClick={() => {
              setSelectedItem(null);
              resetForm();
              setShowModal("book");
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Gambar</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Judul</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Penulis</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">publish_year</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Stok</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Tersedia</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {book.image || book.gambar_barang ? (
                      <img
                        src={book.image || book.gambar_barang}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Book className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{book.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{book.author}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{book.category?.category_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{book.publish_year}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{book.stock}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{book.available}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBarang(book)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBook(book.id_book)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data buku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manajemen Kategori</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setErrorMsg('');
              fetchKategori();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setSelectedItem(null);
              setCategoryForm({ category_name: "", description: "" });
              setShowModal("category");
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 mb-3">
            <li>Role: {role}</li>
            <li>Token: {token ? 'Available' : 'Missing'}</li>
            <li>API Base: {API_BASE}</li>
            <li>Categories Count: {categories.length}</li>
            <li>Endpoint: GET {API_BASE}/admin/categories</li>
          </ul>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE}/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  alert(`Connection test: ${response.status} ${response.statusText}`);
                } catch (e) {
                  alert(`Connection failed: ${e.message}`);
                }
              }}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
            >
              Test Connection
            </button>
            <button
              onClick={() => {
                console.log('Current categories state:', categories);
                console.log('Token:', token);
                console.log('Role:', role);
              }}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
            >
              Log State
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id || category.id_category} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{category.name || category.category_name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedItem(category);
                    setCategoryForm({ category_name: category.name || category.category_name, description: category.description });
                    setShowModal("category");
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4">{category.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{category.books_count || 0} buku</span>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Book className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && !errorMsg && (
          <div className="col-span-full text-center py-12">
            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium mb-2">Belum ada kategori</p>
            <p className="text-slate-400 text-sm mb-4">Mulai dengan menambahkan kategori pertama</p>
            <button
              onClick={() => {
                setSelectedItem(null);
                setCategoryForm({ category_name: "", description: "" });
                setShowModal("category");
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

const renderUsers = () => {
  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manajemen User</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setUserForm({ username: "", email: "", password: "", role: "petugas", name: "" });
            setShowModal("user");
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari username / email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="petugas">Petugas</option>
          <option value="user">User</option>
          <option value="banned">Banned</option> {/* ✅ Tambahan filter */}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Username</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Peminjaman Aktif</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Bergabung</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users
                .filter((u) => {
                  const q = searchTerm.toLowerCase();
                  const matchesSearch =
                    u.username.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.role.toLowerCase().includes(q);
                  const matchesRole = filterStatus === "all" || u.role === filterStatus;
                  return matchesSearch && matchesRole;
                })
                .map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "petugas"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "banned"
                            ? "bg-black text-white" // ✅ Badge banned
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "admin"
                          ? "Admin"
                          : user.role === "petugas"
                          ? "Petugas"
                          : user.role === "banned"
                          ? "Banned"
                          : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{user.active_loans}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.created_at}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(user);
                            setUserForm({
                              username: user.username,
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              password: "",
                            });
                            setShowModal("user");
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {user.role !== "banned" && (
                          <button
                            onClick={() => banUser(user.id)}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            title="Ban User"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Belum ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const renderReportedReviews = () => (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-900">Review yang Dilaporkan</h2>
      <p className="text-slate-500 text-sm">
        *Belum ada endpoint list/delete report di backend. Data di bawah dummy untuk contoh UI.
      </p>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Buku</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Reviewer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Review</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Alasan Laporan</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Pelapor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportedReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{review.book_title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{review.reviewer}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{review.review}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{review.report_reason}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{review.reported_by}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{review.reported_at}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => setSelectedItem(review)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReportedReview(review.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reportedReviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada laporan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-900">Generate Laporan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Laporan Peminjaman</h3>
              <p className="text-slate-600 text-sm">Data peminjaman & pengembalian</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => generateReport("peminjaman-harian")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Laporan Harian</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button
              onClick={() => generateReport("peminjaman-bulanan")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Laporan Bulanan</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button
              onClick={() => generateReport("peminjaman-tahunan")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Laporan Tahunan</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>
        </div>

        {role === "admin" && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Laporan Buku</h3>
                <p className="text-slate-600 text-sm">Statistik & data buku</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => generateReport("inventori-buku")}
                className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Inventori Buku</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </div>
              </button>
              <button
                onClick={() => generateReport("popularitas-buku")}
                className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Buku Populer</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </div>
              </button>
              <button
                onClick={() => generateReport("kategori-statistik")}
                className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Statistik Kategori</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" /> 
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Laporan Denda</h3>
              <p className="text-slate-600 text-sm">Data denda keterlambatan</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => generateReport("denda-bulanan")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Denda Bulanan</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button
              onClick={() => generateReport("keterlambatan")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Data Keterlambatan</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button
              onClick={() => generateReport("kerusakan")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Data Kerusakan</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            <button
              onClick={() => generateReport("kehilangan")}
              className="w-full px-4 py-2 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Data Kehilangan</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Admin</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Role Switch (visual only) */}
              <button className="p-2 text-slate-600 hover:text-slate-800 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  {role === "admin" ? (
                    <Shield className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {role === "admin" ? "Admin" : "Petugas"} User
                </span>
              </div>
              <button
                className="p-2 text-slate-600 hover:text-slate-800"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  router.replace("/login");
                }}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {getAvailableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "loans" && renderLoans()}
          {activeTab === "books" && role === "admin" && renderBooks()}
          {activeTab === "categories" && role === "admin" && renderCategories()}
          {activeTab === "users" && role === "admin" && renderUsers()}
          {activeTab === "reported-reviews" && role === "admin" && renderReportedReviews()}
          {activeTab === "reports" && renderReports()}
        </div>
      </div>

      {/* Book Modal */}
      {showModal === "book" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{selectedItem ? "Edit Buku" : "Tambah Buku"}</h2>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Judul</label>
                    <input
                      type="text"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Penulis</label>
                    <input
                      type="text"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <input
                      type="text"
                      value={bookForm.category}
                      onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                      placeholder="Isi nama kategori (atau mapping ID jika diperlukan)"
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">publish_year</label>
                    <input
                      type="number"
                      value={bookForm.publish_year}
                      onChange={(e) => setBookForm({ ...bookForm, publish_year: e.target.value })}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Publisher</label>
                  <input
                    type="text" 
                    value={bookForm.publisher} 
                    onChange={(e) =>
                      setBookForm({ ...bookForm, publisher: e.target.value })
                    }
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stok</label>
                  <input
                    type="number"
                    value={bookForm.stock}
                    onChange={(e) => setBookForm({ ...bookForm, stock: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                  <textarea
                    value={bookForm.description}
                    onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(null)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveBook}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {selectedItem ? "Update" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showModal === "category" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{selectedItem ? "Edit Kategori" : "Tambah Kategori"}</h2>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kategori</label>
                  <input
                    type="text"
                    value={categoryForm.category_name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, category_name: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                  <textarea
                    value={categoryForm.description || ""}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(null)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveCategory}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {selectedItem ? "Update" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showModal === "user" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{selectedItem ? "Edit User" : "Tambah User"}</h2>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="petugas">Petugas</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password {selectedItem && "(Kosongkan jika tidak ingin mengubah)"}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(null)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveUser}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {selectedItem ? "Update" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal (dummy) */}
       {selectedItem && selectedItem.review && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Detail Review yang Dilaporkan
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Buku
                    </label>
                    <p className="text-slate-900 font-medium">
                      {selectedItem.book_title}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reviewer
                    </label>
                    <p className="text-slate-900">{selectedItem.reviewer}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Review
                  </label>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-900">{selectedItem.review}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alasan Laporan
                    </label>
                    <p className="text-slate-900">{selectedItem.report_reason}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dilaporkan oleh
                    </label>
                    <p className="text-slate-900">{selectedItem.reported_by}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Laporan
                  </label>
                  <p className="text-slate-900">{selectedItem.reported_at}</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      deleteReportedReview(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Hapus Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPetugasDashboard;

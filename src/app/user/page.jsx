"use client";

import React, { useState, useEffect } from "react";
import {
  Book,
  BookOpen,
  Heart,
  Star,
  Clock,
  Search,
  Filter as Funnel,
  User as UserIcon,
  LogOut,
  Bell,
  Eye,
  MessageSquare,
  CheckCircle2,
  CalendarClock,
  AlertTriangle,
  XCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ShowBookModal from "./components/modals/ShowBookModal";

const API = "http://localhost:8000/api";

const getBookId = (b) => b?.id_book ?? b?.id;

async function apiFetch(url, opts = {}, token) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(url, { ...opts, headers });
  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { message: raw };
  }
  return { ok: res.ok, status: res.status, data };
}

export default function Dashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("books");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBookDetail, setShowBookDetail] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [returnCondition, setReturnCondition] = useState("baik");
  const [returnNote, setReturnNote] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [user, setUser] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historyQuery, setHistoryQuery] = useState("");
  const [collections, setCollections] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { ok, data } = await apiFetch(`${API}/user`, {}, token);
      if (ok) setUser(data);
      else setUser({ username: "user" });
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoadingBooks(true);
      const { ok, data } = await apiFetch(`${API}/books`, {}, token);
      if (ok) setBooks(data?.data || data || []);
      setLoadingBooks(false);
    })();
  }, [token]);

  const fetchBorrowHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    const { ok, data } = await apiFetch(`${API}/my-loans`, {}, token);
    if (ok) setBorrowHistory(Array.isArray(data) ? data : []);
    setLoadingHistory(false);
  };
  useEffect(() => {
    if (token) fetchBorrowHistory();
  }, [token]);

  const fetchCollections = async () => {
    if (!token) return;
    const { ok, data } = await apiFetch(`${API}/collections`, {}, token);
    if (ok) setCollections(data || []);
  };
  useEffect(() => {
    if (token) fetchCollections();
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;
    const { ok, data } = await apiFetch(`${API}/notifications`, {}, token);
    if (ok) {
      const allNotifications = Array.isArray(data) ? data : [];
      setNotifications(allNotifications);
      const unread = allNotifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    }
  };
  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const intv = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intv);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!token) return;
    try {
      await apiFetch(
        `${API}/notifications/${notificationId}/read`,
        { method: "PUT" },
        token
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Gagal mark notification sebagai read:", err);
    }
  };

  const borrowBook = async (bookId) => {
    const { ok, data } = await apiFetch(
      `${API}/loans`,
      { method: "POST", body: JSON.stringify({ id_book: bookId }) },
      token
    );
    if (!ok) {
      alert(data?.message || "Gagal meminjam buku");
      return;
    }
    alert(data?.message || "Pengajuan peminjaman berhasil.");
    setBooks((prev) =>
      prev.map((bk) =>
        getBookId(bk) === bookId
          ? { ...bk, stock: Math.max(0, (bk.stock || 1) - 1) }
          : bk
      )
    );
    fetchBorrowHistory();
    fetchNotifications();
  };

  const handlePickupBook = async (loanId) => {
    const { ok, data } = await apiFetch(
      `${API}/loans/${loanId}/pickup`,
      { method: "PUT" },
      token
    );
    if (!ok) {
      alert(data?.message || "Gagal konfirmasi");
      return;
    }
    alert(data?.message || "Buku diambil");
    fetchBorrowHistory();
    fetchNotifications();
  };

  const handleSubmitReturnRequest = async () => {
    const { ok, data } = await apiFetch(
      `${API}/loans/${showReturnModal.id_loan}/return-request`,
      {
        method: "PUT",
        body: JSON.stringify({
          condition: returnCondition,
          note: returnNote || null,
        }),
      },
      token
    );
    if (!ok) {
      alert(data?.message || "Gagal mengajukan pengembalian");
      return;
    }
    alert(data?.message || "Permintaan terkirim");
    setShowReturnModal(null);
    fetchBorrowHistory();
    fetchNotifications();
  };

  const toggleFavorite = async (bookId) => {
    const { ok, data } = await apiFetch(
      `${API}/collections/${bookId}`,
      { method: "POST" },
      token
    );
    if (!ok) {
      alert(data?.message || "Gagal update favorit");
      return;
    }
    alert(data?.message || "Koleksi diperbarui");
    fetchCollections();
  };

  const isFavorites = (bookId) => {
    const idNum = Number(bookId);
    return collections.some((item) => Number(getBookId(item.book)) === idNum);
  };

  const submitReview = async () => {
    if (!showReviewModal || reviewRating < 1) {
      alert("Pilih rating terlebih dahulu!");
      return;
    }

    const { ok, data } = await apiFetch(
      `${API}/reviews/${getBookId(showReviewModal.book)}`,
      {
        method: "POST",
        body: JSON.stringify({ review: reviewText, rating: reviewRating }),
      },
      token
    );

    if (!ok) {
      alert(data?.message || "Gagal mengirim ulasan");
      return;
    }

    alert("Ulasan berhasil dikirim!");
    setShowReviewModal(null);
    setReviewText("");
    setReviewRating(0);

    setLoadingBooks(true);
    const { ok: ok2, data: data2 } = await apiFetch(`${API}/books`, {}, token);
    if (ok2) setBooks(data2?.data || data2 || []);
    setLoadingBooks(false);

    await fetchBorrowHistory();
  };

  const renderStars = (rating = 0, interactive = false, onRate = null) => {
    const r = Number(rating) || 0;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-4 h-4 ${
                star <= r ? "text-yellow-400 fill-current" : "text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-slate-600 ml-2">{r.toFixed(1)}</span>
      </div>
    );
  };

  const filteredBooks = books.filter((book) => {
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      author.includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (book.categories &&
        book.categories.some((c) => c.category_name === selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr) =>
    !dateStr ? "-" : new Date(dateStr).toLocaleDateString("id-ID");
  const dayDiff = (a, b) => Math.floor((a - b) / (1000 * 60 * 60 * 24));

  const STATUS_META = {
    pending: {
      text: "Menunggu",
      chip: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    siap_diambil: {
      text: "Siap Diambil",
      chip: "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon: CalendarClock,
    },
    dipinjam: {
      text: "Dipinjam",
      chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: BookOpen,
    },
    menunggu_validasi_pengembalian: {
      text: "Menunggu Validasi",
      chip: "bg-violet-50 text-violet-700 border-violet-200",
      icon: CheckCircle2,
    },
    dikembalikan: {
      text: "Dikembalikan",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    rusak: {
      text: "Rusak",
      chip: "bg-red-50 text-red-700 border-red-200",
      icon: AlertTriangle,
    },
    hilang: {
      text: "Hilang",
      chip: "bg-orange-50 text-orange-700 border-orange-200",
      icon: XCircle,
    },
    ditolak: {
      text: "Ditolak",
      chip: "bg-slate-50 text-slate-600 border-slate-200",
      icon: XCircle,
    },
    terlambat: {
      text: "Terlambat",
      chip: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertTriangle,
    },
  };

  const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META.pending;
    const Icon = meta.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.chip}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {meta.text}
      </span>
    );
  };

  const statusBorder = (status) => {
    const map = {
      pending: "from-amber-500/60 to-amber-400/40",
      siap_diambil: "from-cyan-500/60 to-cyan-400/40",
      dipinjam: "from-indigo-500/60 to-indigo-400/40",
      menunggu_validasi_pengembalian: "from-violet-500/60 to-violet-400/40",
      dikembalikan: "from-emerald-500/60 to-emerald-400/40",
      rusak: "from-red-500/60 to-red-400/40",
      hilang: "from-orange-500/60 to-orange-400/40",
      ditolak: "from-slate-400/60 to-slate-300/40",
    };
    return map[status] || map.ditolak;
  };

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">
          Koleksi Favorit
        </h3>
        <span className="text-slate-600">{collections.length} buku</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((item) => {
          const book = item.book;
          const id = getBookId(book);
          return (
            <div
              key={item.id_collection}
              className="bg-white rounded-2xl shadow-lg border"
            >
              <div className="aspect-[3/4]">
                <img
                  src={book.cover || "https://via.placeholder.com/200x300"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{book.title}</h3>
                <p className="text-sm text-slate-600">{book.author}</p>
                <button
                  onClick={() => toggleFavorite(id)}
                  className="mt-3 px-3 py-1 bg-red-500 text-white rounded-lg"
                >
                  Hapus dari Koleksi
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderHistory = () => {
    const now = new Date();
    const list = borrowHistory
      .filter((l) => historyFilter === "all" || l.status === historyFilter)
      .filter((l) =>
        historyQuery
          ? (l.book?.title || "")
              .toLowerCase()
              .includes(historyQuery.toLowerCase())
          : true
      );

    const totalPending = borrowHistory.filter((x) => x.status === "pending")
      .length;
    const totalBorrowed = borrowHistory.filter((x) => x.status === "dipinjam")
      .length;
    const totalWaitingReturn = borrowHistory.filter(
      (x) => x.status === "menunggu_validasi_pengembalian"
    ).length;

    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">
              Total: <span className="font-semibold">{borrowHistory.length}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm">
              Pending: <span className="font-semibold">{totalPending}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm">
              Dipinjam: <span className="font-semibold">{totalBorrowed}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-violet-50 text-violet-700 text-sm">
              Menunggu Validasi:{" "}
              <span className="font-semibold">{totalWaitingReturn}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="Cari judul buku…"
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="siap_diambil">Siap Diambil</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="menunggu_validasi_pengembalian">
                Menunggu Validasi
              </option>
              <option value="dikembalikan">Dikembalikan</option>
              <option value="rusak">Rusak</option>
              <option value="hilang">Hilang</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {loadingHistory ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border animate-pulse bg-slate-100"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 bg-white border rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-slate-600">Belum ada riwayat yang cocok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((loan) => {
              const due = loan.due_date ? new Date(loan.due_date) : null;
              const daysLeft = due ? dayDiff(due, now) : null;
              const isOver =
                due &&
                daysLeft < 0 &&
                ["dipinjam", "siap_diambil"].includes(loan.status);

              return (
                <div
                  key={loan.id_loan}
                  className="relative bg-white rounded-xl shadow-sm border overflow-hidden"
                >
                  <div
                    className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${statusBorder(
                      loan.status
                    )}`}
                  />

                  {loan.denda > 0 && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-2xl font-black text-lg shadow-2xl animate-pulse border-4 border-white">
                        Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(loan.denda)}
                      </div>
                    </div>
                  )}

                  <div className="p-4 md:p-5 pl-5 md:pl-6 grid grid-cols-[auto,1fr,auto] gap-4">
                    <img
                      src={
                        loan.book.cover ||
                        "https://via.placeholder.com/80x120"
                      }
                      alt={loan.book.title}
                      className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-md border"
                    />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {loan.book.title}
                        </h4>
                        <StatusBadge status={loan.status} />
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="px-3 py-2 rounded-lg bg-slate-50 border">
                          <p className="text-slate-500">Pinjam</p>
                          <p className="font-medium">
                            {formatDate(loan.tanggal_peminjaman)}
                          </p>
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-slate-50 border">
                          <p className="text-slate-500">Jatuh Tempo</p>
                          <p className="font-medium">
                            {formatDate(loan.due_date)}
                          </p>
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-slate-50 border">
                          <p className="text-slate-500">Kembali</p>
                          <p className="font-medium">
                            {formatDate(loan.tanggal_pengembalian)}
                          </p>
                        </div>
                      </div>
                      {due && (
                        <div className="mt-2">
                          {isOver ? (
                            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Terlambat {Math.abs(daysLeft)} hari
                            </span>
                          ) : loan.status === "dipinjam" ? (
                            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Sisa {daysLeft} hari
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end text-right">
                      {loan.status === "siap_diambil" && (
                        <button
                          onClick={() => handlePickupBook(loan.id_loan)}
                          className="px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors"
                        >
                          Ambil Buku
                        </button>
                      )}
                      {loan.status === "dipinjam" && (
                        <button
                          onClick={() => {
                            setShowReturnModal(loan);
                            setReturnCondition("baik");
                            setReturnNote("");
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Ajukan Pengembalian
                        </button>
                      )}
                      {loan.status === "dikembalikan" && (
                        <button
                          onClick={() => {
                            setShowReviewModal(loan);
                            setReviewText("");
                            setReviewRating(0);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Beri Ulasan
                        </button>
                      )}
                      {loan.status === "menunggu_validasi_pengembalian" && (
                        <span className="text-xs text-purple-600 font-medium">
                          Menunggu validasi…
                        </span>
                      )}
                      {["rusak", "hilang", "ditolak"].includes(
                        loan.status
                      ) && (
                        <span className="text-xs text-red-600 font-medium">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showReturnModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                Ajukan Pengembalian
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Buku:{" "}
                <span className="font-semibold">
                  {showReturnModal.book.title}
                </span>
              </p>
              <label className="block mb-2 text-sm font-medium">
                Kondisi Buku
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 mb-4"
              >
                <option value="baik">Baik / Normal</option>
                <option value="rusak">Rusak</option>
                <option value="hilang">Hilang</option>
              </select>
              <label className="block mb-2 text-sm font-medium">
                Catatan (opsional)
              </label>
              <textarea
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                rows={3}
                placeholder="Contoh: halaman sobek..."
                className="w-full border border-slate-300 rounded-lg p-2 text-sm mb-6 resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowReturnModal(null)}
                  className="px-4 py-2 rounded-lg border text-slate-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitReturnRequest}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Beri Ulasan & Rating
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Buku:{" "}
                <span className="font-semibold">
                  {showReviewModal.book.title}
                </span>
              </p>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewRating
                            ? "text-yellow-400 fill-current"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-slate-600 mt-1">
                  {reviewRating > 0
                    ? `${reviewRating} bintang`
                    : "Pilih rating"}
                </p>
              </div>
              <label className="block mb-2 text-sm font-medium">
                Ulasan (opsional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                placeholder="Ceritakan pengalaman Anda..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowReviewModal(null);
                    setReviewText("");
                    setReviewRating(0);
                  }}
                  className="px-4 py-2 rounded-lg border text-slate-700"
                >
                  Batal
                </button>
                <button
                  onClick={submitReview}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                  disabled={reviewRating < 1}
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMyReviews = () => {
    const myReviews = borrowHistory
      .filter((loan) => loan.status === "dikembalikan" && loan.review)
      .map((loan) => ({
        id_review: loan.review.id_review,
        rating: loan.review.rating,
        review: loan.review.review || "(Tanpa ulasan tertulis)",
        book: loan.book,
        reviewed_at: loan.tanggal_pengembalian || loan.updated_at,
      }));

    const deleteReview = async (reviewId) => {
      if (!confirm("Yakin ingin menghapus ulasan ini?")) return;

      const { ok, data } = await apiFetch(
        `${API}/reviews/${reviewId}`,
        { method: "DELETE" },
        token
      );

      if (!ok) {
        alert(data?.message || "Gagal menghapus ulasan");
        return;
      }

      alert("Ulasan berhasil dihapus!");

      await fetchBorrowHistory();
      setLoadingBooks(true);
      const { ok: ok2, data: data2 } = await apiFetch(`${API}/books`, {}, token);
      if (ok2) setBooks(data2?.data || data2 || []);
      setLoadingBooks(false);
    };

    if (myReviews.length === 0) {
      return (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <p className="text-2xl font-bold text-slate-700 mb-2">
            Belum ada ulasan
          </p>
          <p className="text-slate-500">
            Ulasan kamu akan muncul setelah mengembalikan buku dan memberi
            rating
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Ulasan Saya ({myReviews.length})
        </h2>

        <div className="grid gap-8">
          {myReviews.map((rev) => (
            <div
              key={rev.id_review}
              className="bg-white rounded-2xl border shadow-lg p-8 hover:shadow-xl transition-all relative"
            >
              <div className="flex gap-8">
                <img
                  src={rev.book.cover || "https://via.placeholder.com/120x170"}
                  alt={rev.book.title}
                  className="w-32 h-44 object-cover rounded-xl shadow-md"
                />

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {rev.book.title}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {rev.book.author || "Penulis tidak diketahui"}
                  </p>

                  <div className="flex items-center gap-6 mb-6">
                    {renderStars(rev.rating)}
                    <span className="text-sm font-medium text-slate-500">
                      {new Date(rev.reviewed_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-lg text-slate-700 leading-relaxed italic">
                    "{rev.review}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => deleteReview(rev.id_review)}
                className="absolute top-6 right-6 p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Hapus ulasan"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBooks = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari buku atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-12 pr-8 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Semua Kategori</option>
            <option value="Programming">Programming</option>
            <option value="Technology">Technology</option>
            <option value="Science">Science</option>
          </select>
        </div>
      </div>

      {loadingBooks ? (
        <p className="text-center text-slate-500">Loading buku...</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-center text-slate-500">Tidak ada buku ditemukan</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const id = getBookId(book);
            return (
              <div
                key={id}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={
                      book.cover || "https://via.placeholder.com/200x300"
                    }
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => toggleFavorite(id)}
                      className={`p-2 rounded-full ${
                        isFavorites(id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-slate-600 hover:bg-red-500 hover:text-white"
                      } transition-colors`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorites(id) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-2">
                    {book.author}
                  </p>
                  <div className="mb-3">
                    {renderStars(book.reviews_avg_rating || 0)}
                    <span className="text-xs text-slate-500">
                      ({book.reviews_count || 0} ulasan)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {book.stock > 0
                        ? `Tersedia (${book.stock})`
                        : "Habis"}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowBookDetail(getBookId(book))}
                        className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {book.stock > 0 && (
                        <button
                          onClick={() => borrowBook(id)}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Pinjam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showBookDetail && (
        <ShowBookModal
          bookId={showBookDetail}
          setShowModal={setShowBookDetail}
        />
      )}
    </div>
  );

  // ================= HEADER KANAN (SUDAH ADA ROUTING PROFILE) =================
  const renderHeaderRight = () => {
    if (!isClient) {
      return (
        <div className="flex items-center gap-4 text-slate-400 text-sm select-none">
          <div className="w-5 h-5 rounded-full bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200" />
            <span className="text-slate-400">...</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-slate-200" />
        </div>
      );
    }

    if (!token) {
      return (
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Login
        </button>
      );
    }

    return (
      <div className="flex items-center gap-4 relative">
        {/* Bell / Notifikasi */}
        <div className="relative">
          <button
            className="relative p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            onClick={() => setShowNotifDropdown((s) => !s)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  Notifikasi
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white text-slate-700 font-semibold border border-slate-200">
                  {notifications.length} pesan
                </span>
              </div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">Belum ada notifikasi.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 overflow-y-auto flex-1">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                        n.is_read
                          ? "bg-white border-l-transparent"
                          : "bg-blue-50 border-l-blue-500"
                      }`}
                      onClick={() => !n.is_read && markNotificationAsRead(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              n.is_read
                                ? "text-slate-700"
                                : "font-semibold text-slate-900"
                            }`}
                          >
                            {n.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1.5">
                            {n.book} · {formatDate(n.updated_at)}
                          </p>
                          <p className="text-xs font-semibold uppercase mt-2">
                            <span
                              className={`px-2 py-1 rounded-full ${
                                n.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : n.status === "siap_diambil"
                                  ? "bg-cyan-100 text-cyan-700"
                                  : n.status === "dipinjam"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : n.status === "dikembalikan"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {n.status}
                            </span>
                          </p>
                        </div>
                        {!n.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* AVATAR + NAMA → ROUTING KE /user/profile */}
        <button
          onClick={() => router.push("/user/profile")}
          className="flex items-center space-x-2 text-sm text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-lg transition"
          title="Profil saya"
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="font-medium max-w-[120px] truncate">
            {user?.name ?? user?.username ?? "user"}
          </span>
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Pocket Library
              </span>
            </div>
            {renderHeaderRight()}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-1 mb-8 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "books", label: "Katalog Buku", icon: BookOpen },
            { id: "history", label: "Riwayat", icon: Clock },
            { id: "favorites", label: "Favorit", icon: Heart },
            { id: "reviews", label: "Ulasan", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {activeTab === "books" && renderBooks()}
          {activeTab === "history" && renderHistory()}
          {activeTab === "favorites" && renderFavorites()}
          {activeTab === "reviews" && renderMyReviews()}
        </div>
      </div>
    </div>
  );
}

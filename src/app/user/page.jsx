"use client";

import React, { useState, useEffect } from "react";
import {
  Book,
  BookOpen,
  Heart,
  Star,
  Clock,
  Search,
  Filter,
  User,
  LogOut,
  Bell,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("books");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBookDetail, setShowBookDetail] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showReportModal, setShowReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");

  // books state
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // user state
  const [user, setUser] = useState(null);

  // fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Gagal fetch user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setUser({ name: "Guest" }); // fallback biar UI tetap jalan
      }
    };

    fetchUser();
  }, []);

  // fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/books", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Gagal fetch buku");
        const data = await res.json();
        setBooks(data.data || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  // logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const [borrowHistory, setBorrowHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [collections, setCollections] = useState([]);

  const borrowBook = async (bookId) => {
    alert(`Buku berhasil dipinjam! (Book ID: ${bookId})`);
    setBooks(
      books.map((book) =>
        book.id === bookId ? { ...book, stock: book.stock - 1 } : book
      )
    );
  };

  const toggleFavorite = async (bookId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/collections/${bookId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Gagal Update Favorite");
      const data = await res.json();

      fetchCollections();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Terjadi Kesalahan Saat Update Favorite");
    }
  };

  const isFavorites = (bookId) => {
    return collections.some((item) => item.book?.id === bookId);
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/collections", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Gagal fetch Favorite");
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const submitRating = async () => {
    const newReview = {
      id: reviews.length + 1,
      book_id: showRatingModal,
      book_title: books.find((b) => b.id === showRatingModal)?.title,
      user_name: user?.name || "Saya",
      rating: userRating,
      review: userReview,
      created_at: new Date().toISOString().split("T")[0],
      is_mine: true,
    };

    setReviews([newReview, ...reviews]);
    setShowRatingModal(null);
    setUserRating(0);
    setUserReview("");
    alert("Rating dan ulasan berhasil disimpan!");
  };

  const reportReview = async () => {
    alert("Laporan berhasil dikirim ke admin");
    setShowReportModal(null);
    setReportReason("");
  };

  const deleteReview = async (reviewId) => {
    setReviews(reviews.filter((review) => review.id !== reviewId));
    alert("Ulasan berhasil dihapus");
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (book.categories &&
        book.categories.some((c) => c.category_name === selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating = 0, interactive = false, onRate = null) => {
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
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-slate-600 ml-2">{rating.toFixed(1)}</span>
      </div>
    );
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
                  onClick={() => toggleFavorite(book.id)}
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

  const renderBooks = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari buku atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
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

      {/* Books Grid */}
      {loadingBooks ? (
        <p className="text-center text-slate-500">Loading buku...</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-center text-slate-500">Tidak ada buku ditemukan</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={
                    book.cover_url || "https://via.placeholder.com/200x300"
                  }
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleFavorite(book.id)}
                    className={`p-2 rounded-full ${
                      isFavorites(book.id)
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-slate-600 hover:bg-red-500 hover:text-white"
                    } transition-colors`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorites(book.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-slate-600 text-sm mb-2">{book.author}</p>
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
                    {book.stock > 0 ? "Tersedia" : "Dipinjam"}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowBookDetail(book)}
                      className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {book.stock > 0 && (
                      <button
                        onClick={() => borrowBook(book.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Pinjam
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
              <span className="text-xl font-bold text-slate-800">
                Pocket Library
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 hover:text-slate-800 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user?.name || "Loading..."}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-slate-800"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-xl">
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

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "books" && renderBooks()}
          {activeTab === "favorites" && renderFavorites()}
          {/* history, reviews bisa lanjut pakai dummy dulu */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

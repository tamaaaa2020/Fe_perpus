"use client";

import React, { useState, useEffect } from 'react';
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
  Plus,
  Eye,
  MessageSquare,
  Flag,
  Trash2,
  ChevronRight,
  Calendar,
  StarHalf,
  BookMarked
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBookDetail, setShowBookDetail] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showReportModal, setShowReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Sample data - replace with API calls
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "Belajar React Native",
      author: "John Doe",
      category: "Programming",
      cover: "https://via.placeholder.com/200x300/6366f1/ffffff?text=Book+1",
      rating: 4.5,
      available: true,
      description: "Panduan lengkap untuk mempelajari React Native dari dasar hingga mahir.",
      reviews_count: 25,
      pages: 320,
      published_year: 2023
    },
    {
      id: 2,
      title: "Machine Learning Basics",
      author: "Jane Smith",
      category: "Technology",
      cover: "https://via.placeholder.com/200x300/8b5cf6/ffffff?text=Book+2",
      rating: 4.2,
      available: false,
      description: "Pengenalan dasar tentang machine learning dan implementasinya.",
      reviews_count: 18,
      pages: 280,
      published_year: 2022
    }
  ]);

  const [borrowHistory, setBorrowHistory] = useState([
    {
      id: 1,
      book_title: "Belajar React Native",
      borrow_date: "2024-01-15",
      return_date: "2024-01-29",
      status: "returned",
      fine: 0
    },
    {
      id: 2,
      book_title: "Machine Learning Basics",
      borrow_date: "2024-02-01",
      return_date: null,
      status: "borrowed",
      due_date: "2024-02-15",
      fine: 5000
    }
  ]);

  const [favorites, setFavorites] = useState([1]);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      book_id: 1,
      book_title: "Belajar React Native",
      user_name: "Ahmad Rizki",
      rating: 5,
      review: "Buku yang sangat bagus untuk pemula. Penjelasannya mudah dipahami.",
      created_at: "2024-01-20",
      is_mine: false
    },
    {
      id: 2,
      book_id: 1,
      book_title: "Belajar React Native",
      user_name: "Saya",
      rating: 4,
      review: "Konten bagus, tapi bisa lebih detail di beberapa bagian.",
      created_at: "2024-01-25",
      is_mine: true
    }
  ]);

  // API Functions - Replace with actual Laravel API calls
  const borrowBook = async (bookId) => {
    try {
      // const response = await fetch(`/api/books/${bookId}/borrow`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      alert(`Buku berhasil dipinjam! (Book ID: ${bookId})`);
      // Update book availability
      setBooks(books.map(book => 
        book.id === bookId ? { ...book, available: false } : book
      ));
    } catch (error) {
      alert('Gagal meminjam buku');
    }
  };

  const toggleFavorite = async (bookId) => {
    try {
      const isFavorite = favorites.includes(bookId);
      // const response = await fetch(`/api/books/${bookId}/favorite`, {
      //   method: isFavorite ? 'DELETE' : 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== bookId));
        alert('Buku dihapus dari koleksi favorit');
      } else {
        setFavorites([...favorites, bookId]);
        alert('Buku ditambahkan ke koleksi favorit');
      }
    } catch (error) {
      alert('Gagal mengubah status favorit');
    }
  };

  const submitRating = async () => {
    try {
      // const response = await fetch(`/api/books/${showRatingModal}/reviews`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     rating: userRating,
      //     review: userReview
      //   })
      // });

      const newReview = {
        id: reviews.length + 1,
        book_id: showRatingModal,
        book_title: books.find(b => b.id === showRatingModal)?.title,
        user_name: "Saya",
        rating: userRating,
        review: userReview,
        created_at: new Date().toISOString().split('T')[0],
        is_mine: true
      };

      setReviews([newReview, ...reviews]);
      setShowRatingModal(null);
      setUserRating(0);
      setUserReview('');
      alert('Rating dan ulasan berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan rating');
    }
  };

  const reportReview = async () => {
    try {
      // const response = await fetch(`/api/reviews/${showReportModal}/report`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     reason: reportReason
      //   })
      // });

      alert('Laporan berhasil dikirim ke admin');
      setShowReportModal(null);
      setReportReason('');
    } catch (error) {
      alert('Gagal mengirim laporan');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      // const response = await fetch(`/api/reviews/${reviewId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      setReviews(reviews.filter(review => review.id !== reviewId));
      alert('Ulasan berhasil dihapus');
    } catch (error) {
      alert('Gagal menghapus ulasan');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteBooks = books.filter(book => favorites.includes(book.id));

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-slate-600 ml-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-[3/4] relative overflow-hidden">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className={`p-2 rounded-full ${
                    favorites.includes(book.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-slate-600 hover:bg-red-500 hover:text-white'
                  } transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(book.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-slate-600 text-sm mb-2">{book.author}</p>
              <div className="mb-3">
                {renderStars(book.rating)}
                <span className="text-xs text-slate-500">({book.reviews_count} ulasan)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  book.available 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {book.available ? 'Tersedia' : 'Dipinjam'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowBookDetail(book)}
                    className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {book.available && (
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
    </div>
  );

  const renderBorrowHistory = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Riwayat Peminjaman</h3>
      </div>
      <div className="divide-y divide-slate-200">
        {borrowHistory.map(item => (
          <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{item.book_title}</h4>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                  <span>Dipinjam: {item.borrow_date}</span>
                  {item.return_date ? (
                    <span>Dikembalikan: {item.return_date}</span>
                  ) : (
                    <span>Jatuh tempo: {item.due_date}</span>
                  )}
                </div>
                {item.fine > 0 && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Denda: Rp {item.fine.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === 'returned'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'borrowed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.status === 'returned' ? 'Dikembalikan' : 
                   item.status === 'borrowed' ? 'Dipinjam' : 'Terlambat'}
                </span>
                {item.status === 'returned' && (
                  <button
                    onClick={() => setShowRatingModal(books.find(b => b.title === item.book_title)?.id)}
                    className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Koleksi Favorit</h3>
        <span className="text-slate-600">{favoriteBooks.length} buku</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteBooks.map(book => (
          <div key={book.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="aspect-[3/4] relative overflow-hidden">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-1">{book.title}</h3>
              <p className="text-slate-600 text-sm mb-2">{book.author}</p>
              <div className="mb-3">
                {renderStars(book.rating)}
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowBookDetail(book)}
                  className="flex items-center space-x-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Detail</span>
                </button>
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Ulasan Saya</h3>
      </div>
      <div className="divide-y divide-slate-200">
        {reviews.map(review => (
          <div key={review.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-900">{review.book_title}</h4>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-slate-600">{review.user_name}</span>
                  <span className="text-sm text-slate-500">{review.created_at}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(review.rating)}
                {review.is_mine ? (
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReportModal(review.id)}
                    className="p-1 text-slate-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-700">{review.review}</p>
          </div>
        ))}
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
              <span className="text-xl font-bold text-slate-800">Pocket Library</span>
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
                <span className="text-sm font-medium text-slate-700">John Doe</span>
              </div>
              <button className="p-2 text-slate-600 hover:text-slate-800">
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
            { id: 'books', label: 'Katalog Buku', icon: BookOpen },
            { id: 'history', label: 'Riwayat', icon: Clock },
            { id: 'favorites', label: 'Favorit', icon: Heart },
            { id: 'reviews', label: 'Ulasan', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'books' && renderBooks()}
          {activeTab === 'history' && renderBorrowHistory()}
          {activeTab === 'favorites' && renderFavorites()}
          {activeTab === 'reviews' && renderReviews()}
        </div>
      </div>

      {/* Book Detail Modal */}
      {showBookDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Detail Buku</h2>
                <button
                  onClick={() => setShowBookDetail(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={showBookDetail.cover} 
                    alt={showBookDetail.title}
                    className="w-full rounded-xl"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{showBookDetail.title}</h3>
                    <p className="text-slate-600">{showBookDetail.author}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Rating:</span>
                      {renderStars(showBookDetail.rating)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Halaman:</span>
                      <span className="font-medium">{showBookDetail.pages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Tahun:</span>
                      <span className="font-medium">{showBookDetail.published_year}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        showBookDetail.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {showBookDetail.available ? 'Tersedia' : 'Dipinjam'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Deskripsi</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{showBookDetail.description}</p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {showBookDetail.available && (
                      <button
                        onClick={() => {
                          borrowBook(showBookDetail.id);
                          setShowBookDetail(null);
                        }}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Pinjam Buku
                      </button>
                    )}
                    <button
                      onClick={() => {
                        toggleFavorite(showBookDetail.id);
                        setShowBookDetail(null);
                      }}
                      className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
                        favorites.includes(showBookDetail.id)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(showBookDetail.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Beri Rating & Ulasan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                {renderStars(userRating, true, setUserRating)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ulasan</label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Tulis ulasan Anda..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRatingModal(null)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitRating}
                  disabled={userRating === 0}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Laporkan Ulasan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alasan Pelaporan</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Pilih alasan...</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Konten tidak pantas</option>
                  <option value="hate_speech">Ujaran kebencian</option>
                  <option value="fake_review">Ulasan palsu</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(null)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={reportReview}
                  disabled={!reportReason}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Laporkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
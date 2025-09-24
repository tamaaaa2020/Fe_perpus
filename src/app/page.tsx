"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe,
  Book as BookIcon,
  Heart,
  Users,
} from "lucide-react";

type Book = {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  genre: string;
  available: boolean;
  description: string;
};

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_books: 0,
    active_members: 0,
    borrowed_books: 0,
  });

  // mock API
useEffect(() => {
  const fetchLandingData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/landing`
      );
      const data = await res.json();

      setBooks(data.popularBooks || []);

      setStats(data.stats);
    } catch(err) {
      console.error("Gagal Fetching landing data:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchLandingData();
}, []);

  const handleBorrowClick = (bookId: number) => {
    // Arahkan ke register saat klik Pinjam
    router.push("/register");
  };

  const BookCard: React.FC<{ book: Book }> = ({ book }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden border border-slate-100">
      <div className="relative overflow-hidden">
        <img
          src={book.cover || "https://via.placeholder.com/400x600?text=No+Cover"}
          alt={book.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              book.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {book.available ? "Tersedia" : "Dipinjam"}
          </span>
        </div>
        <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="flex items-center text-white text-sm">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            {book.rating}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-full">
            {book.genre}
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-slate-600 font-medium mb-3">oleh {book.author}</p>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {book.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-500">
            <Users className="w-4 h-4 mr-1" />
            <span>12 peminjam</span>
          </div>

          <button
            onClick={() => handleBorrowClick(book.id)}
            disabled={!book.available}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${
              book.available
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            <BookIcon className="w-4 h-4 mr-2" />
            {book.available ? "Pinjam" : "Tidak Tersedia"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Pocket Library
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Daftar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Platform Perpustakaan Digital Terdepan
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Pocket{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Library
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Temukan ribuan buku berkualitas, beri rating, dan nikmati
              pengalaman membaca yang tak terlupakan. Bergabunglah dengan
              komunitas pembaca terbesar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("/register")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center group"
              >
                Mulai Membaca
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
              >
                Sudah Punya Akun?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {stats.total_books}+
              </div>
              <div className="text-slate-600">Koleksi Buku</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.active_members}+
              </div>
              <div className="text-slate-600">Anggota Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.borrowed_books}+
              </div>
              <div className="text-slate-600">Buku Dipinjam</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                4.8⭐
              </div>
              <div className="text-slate-600">Rating Rata-rata</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Books Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              📚 Buku{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Populer
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Temukan koleksi buku terbaik yang paling digemari oleh para
              pembaca
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="bg-slate-200 h-64 rounded-lg mb-4" />
                  <div className="bg-slate-200 h-4 rounded mb-2" />
                  <div className="bg-slate-200 h-4 rounded w-2/3 mb-4" />
                  <div className="bg-slate-200 h-10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => router.push("/register")}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl inline-flex items-center group"
            >
              Lihat Semua Buku
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Mengapa Memilih{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pocket Library?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Aman & Terpercaya
              </h3>
              <p className="text-slate-600">
                Sistem keamanan berlapis untuk melindungi data dan transaksi
                peminjaman Anda
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Akses Cepat
              </h3>
              <p className="text-slate-600">
                Cari dan pinjam buku favorit Anda dalam hitungan detik dengan
                sistem yang responsif
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Koleksi Global
              </h3>
              <p className="text-slate-600">
                Ribuan buku dari berbagai genre dan penulis terkenal dari
                seluruh dunia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8 relative">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Memulai Petualangan Membaca? 📖
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Bergabunglah dengan ribuan pembaca lainnya dan temukan buku impian
            Anda hari ini juga!
          </p>
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl inline-flex items-center group"
          >
            <Heart className="w-5 h-5 mr-2" />
            Daftar Gratis Sekarang
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Pocket Library
              </span>
            </div>
            <p className="text-slate-400">
              © 2024 Pocket Library. Menghadirkan dunia literasi digital untuk
              semua.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

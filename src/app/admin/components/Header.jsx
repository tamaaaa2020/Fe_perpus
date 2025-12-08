"use client";
import { useState, useEffect } from "react";
import { Book, Bell, LogOut, Shield, ShieldCheck, X } from "lucide-react";
import { api } from "@/lib/api";

export default function Header({ role, router, token }) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const NOTIF_ENDPOINT =
    role === "admin" ? "/admin/notifications" : "/petugas/notifications";

  const MARK_AS_READ_ENDPOINT =
    role === "admin" ? "/admin/notifications" : "/petugas/notifications";

  // 🔥 FIXED FETCH (TANPA {ok, data})
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const res = await api(NOTIF_ENDPOINT, {token});

      const arr = Array.isArray(res) ? res : res.data ?? [];

      console.log("Notif : ", arr);

      setNotifications(arr);
      setUnreadCount(arr.filter(n => !n.is_read).length);

    } catch(err) {
      console.error("Error fetching notifications: ", err);
    }
  };

  // 🔥 FIXED MARK AS READ
  const markNotificationAsRead = async (notificationId) => {
    if (!token) return;

    try {
      await api(`${MARK_AS_READ_ENDPOINT}/${notificationId}/read`, {
        method: "PUT",
        token,
      });

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? {...n, is_read:true} : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error("Error marking notification as read: ", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LEFT — TITLE */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Admin</span>
          </div>

          {/* RIGHT — NOTIF & USER */}
          <div className="flex items-center space-x-4">

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                className="p-2 text-slate-600 hover:text-slate-800 relative rounded-lg hover:bg-slate-100"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">

                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      Notifikasi
                    </span>
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* LIST */}
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
                          className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${n.is_read
                              ? "bg-white border-l-transparent"
                              : "bg-blue-50 border-l-blue-500"
                            }`}
                          onClick={() => !n.is_read && markNotificationAsRead(n.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`text-sm ${n.is_read ? "text-slate-700" : "font-semibold text-slate-900"}`}>
                                {n.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1.5">
                                {n.type === "report" ? "📋 Report" : "📖 Pinjaman"} · {formatDate(n.created_at)}
                              </p>
                            </div>

                            {!n.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* USER ROLE */}
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

            {/* LOGOUT */}
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
  );
}

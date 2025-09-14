// src/app/admin/components/Header.jsx
"use client";
import { Book, Bell, LogOut, Shield, ShieldCheck } from "lucide-react";

export default function Header({ role, router }) {
  return (
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
  );
}

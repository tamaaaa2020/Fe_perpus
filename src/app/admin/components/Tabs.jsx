// src/app/admin/components/Tabs.jsx
"use client";

export default function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-xl overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
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
  );
}

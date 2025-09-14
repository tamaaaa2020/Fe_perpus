// src/lib/utils.js

// Format angka ke Rupiah
export function formatRupiah(value) {
  if (value == null || isNaN(value)) return "Rp 0";
  return (
    "Rp " +
    Number(value)
      .toLocaleString("id-ID", { minimumFractionDigits: 0 })
  );
}

// Format tanggal (YYYY-MM-DD)
export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
}

// Capitalize huruf pertama
export function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

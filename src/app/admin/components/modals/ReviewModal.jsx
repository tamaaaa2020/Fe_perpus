"use client";
import React from "react";

const ReviewModal = ({ selectedItem, setShowModal, setReviews }) => {
  if (!selectedItem) return null;

  const handleDelete = () => {
    setReviews((prev) => prev.filter((r) => r.id !== selectedItem.id));
    setShowModal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold mb-4">Detail Review</h2>
        <p><strong>Buku:</strong> {selectedItem.book_title}</p>
        <p><strong>Reviewer:</strong> {selectedItem.reviewer}</p>
        <p><strong>Review:</strong> {selectedItem.review}</p>
        <p><strong>Alasan:</strong> {selectedItem.report_reason}</p>
        <p><strong>Pelapor:</strong> {selectedItem.reported_by}</p>
        <p><strong>Tanggal:</strong> {selectedItem.reported_at}</p>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setShowModal(null)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Tutup
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

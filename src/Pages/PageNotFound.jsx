import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 text-center">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 mb-6">
        Maaf, halaman yang kamu cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Kembali ke Halaman Login
      </Link>
    </div>
  );
};

export default PageNotFound;
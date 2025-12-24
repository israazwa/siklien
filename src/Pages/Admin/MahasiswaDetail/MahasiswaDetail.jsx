import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";

import { getMahasiswa } from "@/Utils/Apis/MahasiswaApi";
import { toastError } from "@/Utils/Helpers/ToastHelpers";

const MahasiswaDetail = () => {
  const { id } = useParams(); // ambil ID dari URL
  const [mahasiswa, setMahasiswa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMahasiswa();
  }, [id]);

  const fetchMahasiswa = async () => {
    try {
      const res = await getMahasiswa(id);
      console.log("Mahasiswa response:", res);
      setMahasiswa(res.data);
    } catch (err) {
      console.error("Mahasiswa fetch error:", err);
      toastError(err?.message || "Gagal mengambil data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center">Memuat data...</p>;
  }

  if (!mahasiswa) {
    return <p className="text-center text-red-600">Data mahasiswa tidak ditemukan.</p>;
  }

  return (
    <Card>
      <Heading as="h2" className="mb-4 text-left">
        Detail Mahasiswa
      </Heading>

      <table className="table-auto text-sm w-full">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-medium">ID</td>
            <td className="py-2 px-4">{mahasiswa.id}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">NIM</td>
            <td className="py-2 px-4">{mahasiswa.nim}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Nama</td>
            <td className="py-2 px-4">{mahasiswa.nama}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default MahasiswaDetail;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";

import { getMataKuliah } from "@/Utils/Apis/MataKuliahApi";
import { toastError } from "@/Utils/Helpers/ToastHelpers";

const MataKuliahDetail = () => {
  const { id } = useParams();
  const [mataKuliah, setMataKuliah] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMataKuliah();
  }, [id]);

  const fetchMataKuliah = async () => {
    try {
      const res = await getMataKuliah(id);
      console.log("MataKuliah response:", res);
      setMataKuliah(res.data);
    } catch (err) {
      console.error("MataKuliah fetch error:", err);
      toastError(err?.message || "Gagal mengambil data mata kuliah");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center">Memuat data...</p>;
  }

  if (!mataKuliah) {
    return <p className="text-center text-red-600">Data mata kuliah tidak ditemukan.</p>;
  }

  return (
    <Card>
      <Heading as="h2" className="mb-4 text-left">
        Detail Mata Kuliah
      </Heading>

      <table className="table-auto text-sm w-full">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-medium">ID</td>
            <td className="py-2 px-4">{mataKuliah.id}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Kode</td>
            <td className="py-2 px-4">{mataKuliah.kode}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Nama</td>
            <td className="py-2 px-4">{mataKuliah.nama}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default MataKuliahDetail;

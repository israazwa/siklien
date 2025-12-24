import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";

import { getDosen } from "@/Utils/Apis/DosenApi";
import { toastError } from "@/Utils/Helpers/ToastHelpers";

const DosenDetail = () => {
  const { id } = useParams();
  const [dosen, setDosen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDosen();
  }, [id]);

  const fetchDosen = async () => {
    try {
      const res = await getDosen(id);
      console.log("Dosen response:", res);
      setDosen(res.data);
    } catch (err) {
      console.error("Dosen fetch error:", err);
      toastError(err?.message || "Gagal mengambil data dosen");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center">Memuat data...</p>;
  }

  if (!dosen) {
    return <p className="text-center text-red-600">Data dosen tidak ditemukan.</p>;
  }

  return (
    <Card>
      <Heading as="h2" className="mb-4 text-left">
        Detail Dosen
      </Heading>

      <table className="table-auto text-sm w-full">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-medium">ID</td>
            <td className="py-2 px-4">{dosen.id}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">NIDN</td>
            <td className="py-2 px-4">{dosen.nidn}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Nama</td>
            <td className="py-2 px-4">{dosen.nama}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default DosenDetail;

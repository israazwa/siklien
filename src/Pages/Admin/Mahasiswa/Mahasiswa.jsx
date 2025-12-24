import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Button from "@/Pages/Layouts/Components/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

// Import React Query Hooks
import {
  useMahasiswa,
  useStoreMahasiswa,
  useUpdateMahasiswa,
  useDeleteMahasiswa,
} from "@/Utils/Hooks/useMahasiswa";
import { useKelas } from "@/Utils/Hooks/useKelas";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers";
import Swal from "sweetalert2";

import TableMahasiswa from "./TableMahasiswa";
import ModalMahasiswa from "./ModalMahasiswa";

const Mahasiswa = () => {
  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // React Query Hooks
  const {
    data: result = { data: [], total: 0 },
    isLoading: isLoadingMahasiswa,
  } = useMahasiswa({
    q: search,
    _sort: sortBy,
    _order: sortOrder,
    _page: page,
    _limit: limit,
  });

  const { data: allKelasResult } = useKelas({ _limit: 1000 });
  const { data: allMKResult } = useMataKuliah({ _limit: 1000 });

  const allKelas = allKelasResult?.data || [];
  const allMK = allMKResult?.data || [];

  const { data: mahasiswa = [] } = result;

  // Calculate SKS map for students in current page
  const studentSksMap = {};
  mahasiswa.forEach(m => {
    let total = 0;
    allKelas.forEach(k => {
      if (k.mahasiswa_ids?.includes(m.id)) {
        const mk = allMK.find(mkItem => mkItem.id == k.matakuliah_id);
        total += mk?.sks || 0;
      }
    });
    studentSksMap[m.id] = total;
  });

  const totalCount = result.total;
  const totalPages = Math.ceil(totalCount / limit);

  const { mutate: store } = useStoreMahasiswa();
  const { mutate: update } = useUpdateMahasiswa();
  const { mutate: remove } = useDeleteMahasiswa();

  // Local State
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStateContext();

  const openAddModal = () => {
    setSelectedMahasiswa(null);
    setModalOpen(true);
  };

  const openEditModal = (mhs) => {
    setSelectedMahasiswa(mhs);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      // Validasi NIM duplikat
      const nimSudahAda = mahasiswa.some((m) => {
        if (selectedMahasiswa && m.id === selectedMahasiswa.id) return false;
        return m.nim === formData.nim;
      });

      if (nimSudahAda) {
        toastError("NIM sudah digunakan!");
        return;
      }

      if (selectedMahasiswa) {
        // Edit Mode
        confirmUpdate(() => {
          update({ id: selectedMahasiswa.id, data: formData });
          setModalOpen(false);
          setSelectedMahasiswa(null);
        });
      } else {
        // Add Mode
        Swal.fire({
          title: "Menambahkan...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });

        store(formData, {
          onSuccess: () => {
            Swal.fire({
              title: "Berhasil",
              text: "Data berhasil ditambahkan",
              icon: "success",
              timer: 6000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            setModalOpen(false);
          },
          onError: () => {
            Swal.fire({
              title: "Gagal",
              text: "Terjadi kesalahan. Coba lagi.",
              icon: "error",
              showConfirmButton: true,
            });
          },
        });
      }
    } catch (err) {
      toastError("Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleDelete = async (id) => {
    confirmDelete(() => {
      remove(id);
    });
  };

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Daftar Mahasiswa
        </Heading>
        {user?.permission?.includes("mahasiswa.create") && (
          <Button onClick={openAddModal}>+ Tambah Mahasiswa</Button>
        )}
      </div>

      {/* Search, Sort, and Limit Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama/NIM..."
          className="border border-gray-300 px-3 py-2 rounded flex-grow min-w-[200px]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {/* Sort By Field */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="nama">Sort by Nama</option>
          <option value="nim">Sort by NIM</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Limit per page */}
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="5">5 per halaman</option>
          <option value="10">10 per halaman</option>
          <option value="25">25 per halaman</option>
          <option value="50">50 per halaman</option>
        </select>
      </div>

      {user?.permission?.includes("mahasiswa.read") && (
        <TableMahasiswa
          data={mahasiswa}
          studentSksMap={studentSksMap}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onDetail={(id) => navigate(`/admin/mahasiswa/${id}`)}
          isLoading={isLoadingMahasiswa}
        />
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalPages || 1} (Total: {totalCount} data)
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrev}
            disabled={page === 1 || isLoadingMahasiswa}
          >
            Prev
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0 || isLoadingMahasiswa}
          >
            Next
          </button>
        </div>
      </div>

      <ModalMahasiswa
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        selectedMahasiswa={selectedMahasiswa}
      />
    </Card>
  );
};

export default Mahasiswa;


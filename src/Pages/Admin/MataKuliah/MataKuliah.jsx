import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Button from "@/Pages/Layouts/Components/Button";

import TableMataKuliah from "./TableMataKuliah";
import ModalMataKuliah from "./ModalMataKuliah";

import {
  useMataKuliah,
  useStoreMataKuliah,
  useUpdateMataKuliah,
  useDeleteMataKuliah,
} from "@/Utils/Hooks/useMataKuliah";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers";
import Swal from "sweetalert2";

const MataKuliah = () => {
  const { user } = useAuthStateContext();
  const navigate = useNavigate();

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // React Query Hooks
  const {
    data: result = { data: [], total: 0 },
    isLoading: isLoadingMataKuliah,
  } = useMataKuliah({
    q: search,
    _sort: sortBy,
    _order: sortOrder,
    _page: page,
    _limit: limit,
  });

  const { data: mataKuliah = [] } = result;
  const totalCount = result.total;
  const totalPages = Math.ceil(totalCount / limit);

  const { mutate: store } = useStoreMataKuliah();
  const { mutate: update } = useUpdateMataKuliah();
  const { mutate: remove } = useDeleteMataKuliah();

  // Local State
  const [selectedMK, setSelectedMK] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Check permissions
  const canCreate = user?.permission?.includes("matakuliah.create");
  const canUpdate = user?.permission?.includes("matakuliah.update");
  const canDelete = user?.permission?.includes("matakuliah.delete");
  const isReadOnly = !canCreate && !canUpdate && !canDelete;

  const openAddModal = () => {
    setSelectedMK(null);
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setSelectedMK(m);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      const kodeExists = mataKuliah.some((item) => {
        if (selectedMK && item.id === selectedMK.id) return false;
        return item.kode === formData.kode;
      });

      if (kodeExists) {
        toastError("Kode mata kuliah sudah digunakan!");
        return;
      }

      if (selectedMK) {
        confirmUpdate(() => {
          update({ id: selectedMK.id, data: formData });
          setModalOpen(false);
          setSelectedMK(null);
        });
      } else {
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
          Daftar Mata Kuliah
        </Heading>
        {canCreate && (
          <Button onClick={openAddModal}>+ Tambah Mata Kuliah</Button>
        )}
      </div>

      {isReadOnly && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          ℹ️ Anda hanya memiliki akses untuk melihat data mata kuliah
        </div>
      )}

      {/* Search, Sort, and Limit Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama/kode mata kuliah..."
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
          <option value="kode">Sort by Kode</option>
          <option value="sks">Sort by SKS</option>
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

      <TableMataKuliah
        data={mataKuliah}
        onEdit={canUpdate ? openEditModal : null}
        onDelete={canDelete ? handleDelete : null}
        onDetail={(id) => navigate(`/admin/matakuliah/${id}`)}
        isReadOnly={isReadOnly}
        isLoading={isLoadingMataKuliah}
      />

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalPages || 1} (Total: {totalCount} data)
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrev}
            disabled={page === 1 || isLoadingMataKuliah}
          >
            Prev
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0 || isLoadingMataKuliah}
          >
            Next
          </button>
        </div>
      </div>

      <ModalMataKuliah
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        selectedMK={selectedMK}
      />
    </Card>
  );
};

export default MataKuliah;

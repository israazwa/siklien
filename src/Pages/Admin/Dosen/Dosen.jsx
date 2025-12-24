import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Button from "@/Pages/Layouts/Components/Button";

import TableDosen from "./TableDosen";
import ModalDosen from "./ModalDosen";

// Import React Query Hooks
import {
  useDosen,
  useStoreDosen,
  useUpdateDosen,
  useDeleteDosen,
} from "@/Utils/Hooks/useDosen";
import { useKelas } from "@/Utils/Hooks/useKelas";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers";
import Swal from "sweetalert2";

const Dosen = () => {
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
    isLoading: isLoadingDosen,
  } = useDosen({
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

  const { data: dosen = [] } = result;

  // Calculate SKS map for dosen
  const dosenSksMap = {};
  dosen.forEach(d => {
    let total = 0;
    allKelas.forEach(k => {
      if (k.dosen_id == d.id) {
        const mk = allMK.find(mkItem => mkItem.id == k.matakuliah_id);
        total += mk?.sks || 0;
      }
    });
    dosenSksMap[d.id] = total;
  });

  const totalCount = result.total;
  const totalPages = Math.ceil(totalCount / limit);

  const { mutate: store } = useStoreDosen();
  const { mutate: update } = useUpdateDosen();
  const { mutate: remove } = useDeleteDosen();

  // Local State
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Check permissions
  const canCreate = user?.permission?.includes("dosen.create");
  const canUpdate = user?.permission?.includes("dosen.update");
  const canDelete = user?.permission?.includes("dosen.delete");
  const isReadOnly = !canCreate && !canUpdate && !canDelete;

  const openAddModal = () => {
    setSelectedDosen(null);
    setModalOpen(true);
  };

  const openEditModal = (d) => {
    setSelectedDosen(d);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      const nidnExists = dosen.some((item) => {
        if (selectedDosen && item.id === selectedDosen.id) return false;
        return item.nidn === formData.nidn;
      });

      if (nidnExists) {
        toastError("NIDN sudah digunakan!");
        return;
      }

      if (selectedDosen) {
        confirmUpdate(() => {
          update({ id: selectedDosen.id, data: formData });
          setModalOpen(false);
          setSelectedDosen(null);
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
          Daftar Dosen
        </Heading>
        {canCreate && (
          <Button onClick={openAddModal}>+ Tambah Dosen</Button>
        )}
      </div>

      {isReadOnly && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          ℹ️ Anda hanya memiliki akses untuk melihat data dosen
        </div>
      )}

      {/* Search, Sort, and Limit Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama/NIDN..."
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
          <option value="nidn">Sort by NIDN</option>
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

      <TableDosen
        data={dosen}
        dosenSksMap={dosenSksMap}
        onEdit={canUpdate ? openEditModal : null}
        onDelete={canDelete ? handleDelete : null}
        onDetail={(id) => navigate(`/admin/dosen/${id}`)}
        isReadOnly={isReadOnly}
        isLoading={isLoadingDosen}
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
            disabled={page === 1 || isLoadingDosen}
          >
            Prev
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0 || isLoadingDosen}
          >
            Next
          </button>
        </div>
      </div>

      <ModalDosen
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        selectedDosen={selectedDosen}
      />
    </Card>
  );
};

export default Dosen;

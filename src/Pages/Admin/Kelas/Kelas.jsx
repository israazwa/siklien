import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Button from "@/Pages/Layouts/Components/Button";
import { useState } from "react";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

// Import React Query Hooks
import {
    useKelas,
    useStoreKelas,
    useUpdateKelas,
    useDeleteKelas,
} from "@/Utils/Hooks/useKelas";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";
import { useDosen } from "@/Utils/Hooks/useDosen";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers";
import Swal from "sweetalert2";

import TableKelas from "./TableKelas";
import ModalKelas from "./ModalKelas";

import { getAllKRS, addKRS, deleteKRS } from "@/Utils/Apis/KRSApi";

const Kelas = () => {
    // Pagination & Filter State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [sortBy, setSortBy] = useState("kode");
    const [sortOrder, setSortOrder] = useState("asc");
    const [search, setSearch] = useState("");

    // React Query Hooks
    const {
        data: result = { data: [], total: 0 },
        isLoading: isLoadingKelas,
    } = useKelas({
        q: search,
        _sort: sortBy,
        _order: sortOrder,
        _page: page,
        _limit: limit,
    });

    const { data: mkResult } = useMataKuliah({ _limit: 1000 });
    const { data: dosenResult } = useDosen({ _limit: 1000 });

    const allMK = mkResult?.data || [];
    const allDosen = dosenResult?.data || [];

    const { data: rawKelas = [] } = result;

    // Enrich data with actual current names
    const enrichedKelas = rawKelas.map(k => {
        const mk = allMK.find(m => m.id == k.matakuliah_id);
        const dosen = allDosen.find(d => d.id == k.dosen_id);
        return {
            ...k,
            nama_matakuliah: mk ? mk.nama : (k.nama_matakuliah || '-'),
            nama_dosen: dosen ? dosen.nama : (k.nama_dosen || '-')
        };
    });

    const totalCount = result.total;
    const totalPages = Math.ceil(totalCount / limit);

    const { mutate: store } = useStoreKelas();
    const { mutate: update } = useUpdateKelas();
    const { mutate: remove } = useDeleteKelas();

    // Local State
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const { user } = useAuthStateContext();

    const openAddModal = () => {
        setSelectedKelas(null);
        setModalOpen(true);
    };

    const openEditModal = (kelasData) => {
        setSelectedKelas(kelasData);
        setModalOpen(true);
    };

    const syncKRS = async (mkId, newMahasiswaIds) => {
        try {
            // Get current KRS for this MK
            const krsRes = await getAllKRS();
            const currentKrsForMK = krsRes.data.filter(k => k.matakuliah_id == mkId);

            const currentMhsIds = currentKrsForMK.map(k => k.mahasiswa_id);

            // Students to add
            const toAdd = newMahasiswaIds.filter(id => !currentMhsIds.includes(id));
            // Students to remove
            const toRemove = currentKrsForMK.filter(k => !newMahasiswaIds.includes(k.mahasiswa_id));

            // Perform adds
            for (const mId of toAdd) {
                await addKRS({
                    mahasiswa_id: mId,
                    matakuliah_id: mkId,
                    semester: "Ganjil"
                });
            }

            // Perform deletes
            for (const krs of toRemove) {
                await deleteKRS(krs.id);
            }
        } catch (error) {
            console.error("Sync KRS Error:", error);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            // Validasi nama kelas duplikat
            const kodeKelasAda = enrichedKelas.some((k) => {
                if (selectedKelas && k.id === selectedKelas.id) return false;
                return k.kode === formData.kode;
            });

            if (kodeKelasAda) {
                toastError("Kode kelas sudah digunakan!");
                return;
            }

            if (selectedKelas) {
                // Edit Mode
                confirmUpdate(async () => {
                    update({ id: selectedKelas.id, data: formData });
                    // Sync KRS
                    await syncKRS(formData.matakuliah_id, formData.mahasiswa_ids);
                    setModalOpen(false);
                    setSelectedKelas(null);
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
                    onSuccess: async (newKelas) => {
                        // Sync KRS for the new class
                        await syncKRS(formData.matakuliah_id, formData.mahasiswa_ids);

                        Swal.fire({
                            title: "Berhasil",
                            text: "Kelas berhasil ditambahkan",
                            icon: "success",
                            timer: 3000,
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
                    Daftar Kelas
                </Heading>
                {user?.permission?.includes("kelas.create") && (
                    <Button onClick={openAddModal}>+ Tambah Kelas</Button>
                )}
            </div>

            {/* Search, Sort, and Limit Controls */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Cari kode kelas..."
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
                    <option value="kode">Sort by Kode</option>
                    <option value="hari">Sort by Hari</option>
                    <option value="semester">Sort by Semester</option>
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

            {user?.permission?.includes("kelas.read") && (
                <TableKelas
                    data={enrichedKelas}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    isLoading={isLoadingKelas}
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
                        disabled={page === 1 || isLoadingKelas}
                    >
                        Prev
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleNext}
                        disabled={page === totalPages || totalPages === 0 || isLoadingKelas}
                    >
                        Next
                    </button>
                </div>
            </div>

            <ModalKelas
                isModalOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                selectedKelas={selectedKelas}
            />
        </Card>
    );
};

export default Kelas;

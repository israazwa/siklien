// Utils/Hooks/useMataKuliah.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllMataKuliah,
    storeMataKuliah,
    updateMataKuliah,
    deleteMataKuliah,
} from "@/Utils/Apis/MataKuliahApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

// Ambil semua mata kuliah
export const useMataKuliah = (query = {}) =>
    useQuery({
        queryKey: ["matakuliah", query],
        queryFn: () => getAllMataKuliah(query),
        select: (res) => ({
            data: res?.data ?? [],
            total: parseInt(res.headers["x-total-count"] ?? "0", 10),
        }),
        keepPreviousData: true,
    });

// Tambah
export const useStoreMataKuliah = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: storeMataKuliah,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matakuliah"] });
            toastSuccess("Mata Kuliah berhasil ditambahkan!");
        },
        onError: () => toastError("Gagal menambahkan mata kuliah."),
    });
};

// Edit
export const useUpdateMataKuliah = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateMataKuliah(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matakuliah"] });
            toastSuccess("Mata Kuliah berhasil diperbarui!");
        },
        onError: () => toastError("Gagal memperbarui mata kuliah."),
    });
};

// Hapus
export const useDeleteMataKuliah = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMataKuliah,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matakuliah"] });
            toastSuccess("Mata Kuliah berhasil dihapus!");
        },
        onError: () => toastError("Gagal menghapus mata kuliah."),
    });
};

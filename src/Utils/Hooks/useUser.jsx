// Utils/Hooks/useUser.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
} from "@/Utils/Apis/AuthApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

// Ambil semua users
export const useUsers = (query = {}) =>
    useQuery({
        queryKey: ["users", query],
        queryFn: () => getAllUsers(query),
        select: (res) => ({
            data: res?.data ?? [],
            total: parseInt(res.headers["x-total-count"] ?? "0", 10),
        }),
        keepPreviousData: true,
    });

// Tambah
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toastSuccess("User berhasil ditambahkan!");
        },
        onError: (error) => toastError(error?.message || "Gagal menambahkan user."),
    });
};

// Edit
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toastSuccess("User berhasil diperbarui!");
        },
        onError: () => toastError("Gagal memperbarui user."),
    });
};

// Hapus
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toastSuccess("User berhasil dihapus!");
        },
        onError: () => toastError("Gagal menghapus user."),
    });
};

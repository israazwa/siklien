import axios from "@/Utils/AxiosInstance";

// Ambil semua matakuliah
export const getAllMataKuliah = (params = {}) => axios.get("/matakuliah", { params });

// Ambil satu matakuliah
export const getMataKuliah = (id) => axios.get(`/matakuliah/${id}`);

// Tambah matakuliah
export const storeMataKuliah = (data) => axios.post("/matakuliah", data);

// Update matakuliah
export const updateMataKuliah = (id, data) => axios.put(`/matakuliah/${id}`, data);

// Hapus matakuliah
export const deleteMataKuliah = (id) => axios.delete(`/matakuliah/${id}`);

export default {
    getAllMataKuliah,
    getMataKuliah,
    storeMataKuliah,
    updateMataKuliah,
    deleteMataKuliah,
};

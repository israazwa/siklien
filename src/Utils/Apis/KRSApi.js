import axios from "@/Utils/AxiosInstance";

// Get all KRS
export const getAllKRS = () => axios.get("/krs");

// Get KRS by mahasiswa ID
export const getKRSByMahasiswa = (mahasiswaId) =>
    axios.get("/krs", { params: { mahasiswa_id: mahasiswaId } });

// Add KRS (ambil mata kuliah)
export const addKRS = async (data) => {
    const res = await axios.post("/krs", data);
    return res.data;
};

// Delete KRS (batalkan mata kuliah)
export const deleteKRS = (id) => axios.delete(`/krs/${id}`);

// Get mata kuliah with dosen info
export const getMataKuliahWithDosen = async () => {
    const [mkRes, dosenRes] = await Promise.all([
        axios.get("/matakuliah"),
        axios.get("/dosen")
    ]);

    const matakuliah = mkRes.data;
    const dosen = dosenRes.data;

    // Join matakuliah dengan dosen
    return matakuliah.map(mk => ({
        ...mk,
        dosen: dosen.find(d => d.id == mk.dosen_id)
    }));
};

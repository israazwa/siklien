import { useState, useEffect } from "react";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";
import { getKRSByMahasiswa, addKRS, deleteKRS, getMataKuliahWithDosen } from "@/Utils/Apis/KRSApi";
import { getAllKelas, updateKelas } from "@/Utils/Apis/KelasApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";
import { confirmDelete } from "@/Utils/Helpers/SwalHelpers";
import Button from "@/Pages/Layouts/Components/Button";
import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";

const KRS = () => {
    const { user } = useAuthStateContext();
    const [krsData, setKrsData] = useState([]);
    const [availableMK, setAvailableMK] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [studentProfile, setStudentProfile] = useState(null);

    const MAX_SKS = studentProfile?.max_sks || 24;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Ambil profil mahasiswa untuk cek max_sks
            const mhsRes = await fetch(`http://localhost:3001/mahasiswa/${user.id}`).then(r => r.json());
            setStudentProfile(mhsRes);

            // Ambil KRS mahasiswa yang login
            const krsRes = await getKRSByMahasiswa(user.id);
            const mkWithDosen = await getMataKuliahWithDosen();

            // Join KRS dengan mata kuliah
            const krsWithMK = krsRes.data.map(krs => ({
                ...krs,
                matakuliah: mkWithDosen.find(mk => mk.id == krs.matakuliah_id)
            }));

            setKrsData(krsWithMK);
            setAvailableMK(mkWithDosen);
        } catch (error) {
            toastError("Gagal memuat data KRS");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalSKS = () => {
        return krsData.reduce((total, krs) => total + (krs.matakuliah?.sks || 0), 0);
    };

    const handleAddMK = async (matakuliah) => {
        // Cek apakah sudah diambil
        const sudahDiambil = krsData.some(krs => krs.matakuliah_id === matakuliah.id);
        if (sudahDiambil) {
            toastError("Mata kuliah sudah diambil");
            return;
        }

        // Cek maksimal SKS
        const totalSKS = getTotalSKS() + matakuliah.sks;
        if (totalSKS > MAX_SKS) {
            toastError(`Melebihi batas maksimal SKS (${MAX_SKS})`);
            return;
        }

        try {
            await addKRS({
                mahasiswa_id: user.id,
                matakuliah_id: matakuliah.id,
                semester: matakuliah.semester
            });

            // Sync ke Kelas: Tambahkan mahasiswa ke kelas matkul tersebut
            const kelasRes = await getAllKelas({ matakuliah_id: matakuliah.id });
            if (kelasRes.data.length > 0) {
                const targetKelas = kelasRes.data[0];
                const updatedIds = [...(targetKelas.mahasiswa_ids || []), user.id];
                await updateKelas(targetKelas.id, { ...targetKelas, mahasiswa_ids: updatedIds });
            }

            toastSuccess(`Berhasil mengambil ${matakuliah.nama}`);
            fetchData();
            setShowModal(false);
        } catch (error) {
            toastError("Gagal mengambil mata kuliah");
            console.error(error);
        }
    };

    const handleDeleteKRS = async (krs) => {
        confirmDelete(async () => {
            try {
                await deleteKRS(krs.id);

                // Sync ke Kelas: Hapus mahasiswa dari kelas matkul tersebut
                const kelasRes = await getAllKelas({ matakuliah_id: krs.matakuliah_id });
                if (kelasRes.data.length > 0) {
                    const targetKelas = kelasRes.data[0];
                    const updatedIds = (targetKelas.mahasiswa_ids || []).filter(id => id !== user.id);
                    await updateKelas(targetKelas.id, { ...targetKelas, mahasiswa_ids: updatedIds });
                }

                toastSuccess(`Berhasil membatalkan ${krs.matakuliah?.nama}`);
                fetchData();
            } catch (error) {
                toastError("Gagal membatalkan mata kuliah");
                console.error(error);
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Heading as="h1">Kartu Rencana Studi (KRS)</Heading>
                <Button onClick={() => setShowModal(true)}>
                    + Tambah Mata Kuliah
                </Button>
            </div>

            {/* Info SKS */}
            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">Total SKS Diambil</p>
                        <p className="text-3xl font-bold text-blue-600">{getTotalSKS()} SKS</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Maksimal SKS</p>
                        <p className="text-3xl font-bold text-gray-400">{MAX_SKS} SKS</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Sisa SKS</p>
                        <p className="text-3xl font-bold text-green-600">{MAX_SKS - getTotalSKS()} SKS</p>
                    </div>
                </div>
            </Card>

            {/* Daftar Mata Kuliah yang Diambil */}
            <Card>
                <Heading as="h2" className="mb-4">Mata Kuliah yang Diambil</Heading>

                {krsData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Belum ada mata kuliah yang diambil</p>
                        <p className="text-sm mt-2">Klik tombol "Tambah Mata Kuliah" untuk mengambil mata kuliah</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mata Kuliah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKS</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {krsData.map((krs, index) => (
                                    <tr key={krs.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{krs.matakuliah?.kode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{krs.matakuliah?.nama}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{krs.matakuliah?.sks}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{krs.matakuliah?.semester}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{krs.matakuliah?.dosen?.nama}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Button
                                                onClick={() => handleDeleteKRS(krs)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                            >
                                                Batalkan
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal Tambah Mata Kuliah */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <Heading as="h2">Pilih Mata Kuliah</Heading>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mata Kuliah</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKS</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availableMK.map((mk) => {
                                        const sudahDiambil = krsData.some(krs => krs.matakuliah_id === mk.id);
                                        const akanbelebihi = getTotalSKS() + mk.sks > MAX_SKS;

                                        return (
                                            <tr key={mk.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mk.kode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mk.nama}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mk.sks}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mk.semester}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mk.dosen?.nama}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {sudahDiambil ? (
                                                        <span className="text-green-600 font-medium">✓ Sudah diambil</span>
                                                    ) : akanbelebihi ? (
                                                        <span className="text-red-600 font-medium">⚠ Melebihi SKS</span>
                                                    ) : (
                                                        <span className="text-gray-400">Tersedia</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Button
                                                        onClick={() => handleAddMK(mk)}
                                                        disabled={sudahDiambil || akanbelebihi}
                                                        className={`px-3 py-1 text-xs ${sudahDiambil || akanbelebihi
                                                            ? "bg-gray-300 cursor-not-allowed"
                                                            : "bg-blue-600 hover:bg-blue-700"
                                                            }`}
                                                    >
                                                        {sudahDiambil ? "Diambil" : "Ambil"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default KRS;

import { useEffect, useState, useMemo } from "react";
import Form from "@/Pages/Layouts/Components/Form";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";
import { useDosen } from "@/Utils/Hooks/useDosen";
import { useMahasiswa } from "@/Utils/Hooks/useMahasiswa";
import { useKelas } from "@/Utils/Hooks/useKelas";
import { toastError } from "@/Utils/Helpers/ToastHelpers";

const ModalKelas = ({
    isModalOpen,
    onClose,
    onSubmit,
    selectedKelas
}) => {
    const { data: mkResult } = useMataKuliah({ _limit: 100 });
    const { data: dosenResult } = useDosen({ _limit: 100 });
    const { data: mhsResult } = useMahasiswa({ _limit: 100 });
    const { data: allKelasResult } = useKelas({ _limit: 1000 }); // Get all for validation

    const matakuliahs = mkResult?.data || [];
    const dosens = dosenResult?.data || [];
    const mahasiswas = mhsResult?.data || [];
    const allKelas = allKelasResult?.data || [];

    const [form, setForm] = useState({
        kode: "",
        semester: "Ganjil",
        matakuliah_id: "",
        nama_matakuliah: "",
        dosen_id: "",
        nama_dosen: "",
        hari: "",
        mahasiswa_ids: []
    });

    useEffect(() => {
        if (selectedKelas) {
            setForm({
                kode: selectedKelas.kode || selectedKelas.nama || "",
                semester: selectedKelas.semester || "Ganjil",
                matakuliah_id: selectedKelas.matakuliah_id || "",
                nama_matakuliah: selectedKelas.nama_matakuliah || "",
                dosen_id: selectedKelas.dosen_id || "",
                nama_dosen: selectedKelas.nama_dosen || "",
                hari: selectedKelas.hari || "",
                mahasiswa_ids: selectedKelas.mahasiswa_ids || []
            });
        } else {
            setForm({
                kode: "",
                semester: "Ganjil",
                matakuliah_id: "",
                nama_matakuliah: "",
                dosen_id: "",
                nama_dosen: "",
                hari: "",
                mahasiswa_ids: []
            });
        }
    }, [selectedKelas, isModalOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "matakuliah_id") {
            const mk = matakuliahs.find(m => m.id == value);
            if (mk) {
                // Auto pre-fill dosen if MK has one assigned
                const assignedDosen = dosens.find(d => d.id == mk.dosen_id);
                setForm(prev => ({
                    ...prev,
                    matakuliah_id: value,
                    nama_matakuliah: mk.nama,
                    dosen_id: assignedDosen ? assignedDosen.id : prev.dosen_id,
                    nama_dosen: assignedDosen ? assignedDosen.nama : prev.nama_dosen
                }));
            } else {
                setForm(prev => ({ ...prev, matakuliah_id: value, nama_matakuliah: "" }));
            }
        } else if (name === "dosen_id") {
            const d = dosens.find(d => d.id == value);
            setForm(prev => ({
                ...prev,
                dosen_id: value,
                nama_dosen: d ? d.nama : ""
            }));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleMahasiswaToggle = (id) => {
        const newIds = form.mahasiswa_ids.includes(id)
            ? form.mahasiswa_ids.filter(mId => mId !== id)
            : [...form.mahasiswa_ids, id];
        setForm({ ...form, mahasiswa_ids: newIds });
    };

    // Calculate current SKS for validation
    const studentSksMap = useMemo(() => {
        const map = {};
        mahasiswas.forEach(m => {
            let total = 0;
            allKelas.forEach(k => {
                // If student is in this class
                if (k.mahasiswa_ids?.includes(m.id)) {
                    // find mk sks
                    const mk = matakuliahs.find(mk => mk.id == k.matakuliah_id);
                    total += mk?.sks || 0;
                }
            });
            map[m.id] = total;
        });
        return map;
    }, [mahasiswas, allKelas, matakuliahs]);

    const dosenSksMap = useMemo(() => {
        const map = {};
        dosens.forEach(d => {
            let total = 0;
            allKelas.forEach(k => {
                if (k.dosen_id == d.id) {
                    const mk = matakuliahs.find(mk => mk.id == k.matakuliah_id);
                    total += mk?.sks || 0;
                }
            });
            map[d.id] = total;
        });
        return map;
    }, [dosens, allKelas, matakuliahs]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi form
        if (!form.kode.trim() || !form.matakuliah_id || !form.dosen_id) {
            toastError("Mohon lengkapi data Kode Kelas, Mata Kuliah, dan Dosen!");
            return;
        }

        const selectedMK = matakuliahs.find(mk => mk.id == form.matakuliah_id);
        const selectedDosen = dosens.find(d => d.id == form.dosen_id);
        const mkSks = selectedMK?.sks || 0;

        // 1. Validasi Dosen Max SKS
        let currentDosenSks = dosenSksMap[selectedDosen.id] || 0;
        // If editing, subtract the old SKS of this class if it was the same MK
        if (selectedKelas && selectedKelas.dosen_id == selectedDosen.id) {
            const oldMK = matakuliahs.find(mk => mk.id == selectedKelas.matakuliah_id);
            currentDosenSks -= (oldMK?.sks || 0);
        }

        if (currentDosenSks + mkSks > (selectedDosen.max_sks || 24)) {
            toastError(`Dosen ${selectedDosen.nama} melebihi batas maksimal SKS (${selectedDosen.max_sks || 24})!`);
            return;
        }

        // 2. Validasi Mahasiswa Max SKS
        for (const mId of form.mahasiswa_ids) {
            const m = mahasiswas.find(mhs => mhs.id == mId);
            let currentMhsSks = studentSksMap[mId] || 0;

            // If editing and student was already in this class, subtract old MK sks
            if (selectedKelas && selectedKelas.mahasiswa_ids?.includes(mId)) {
                const oldMK = matakuliahs.find(mk => mk.id == selectedKelas.matakuliah_id);
                currentMhsSks -= (oldMK?.sks || 0);
            }

            if (currentMhsSks + mkSks > (m.max_sks || 24)) {
                toastError(`Mahasiswa ${m.nama} melebihi batas maksimal SKS (${m.max_sks || 24})! Sudah mengambil ${currentMhsSks} SKS.`);
                return;
            }
        }

        // 3. Validasi 1 MK 1 Dosen
        const otherClassWithSameMK = allKelas.find(k => k.matakuliah_id == form.matakuliah_id && k.id != selectedKelas?.id);
        if (otherClassWithSameMK && otherClassWithSameMK.dosen_id != form.dosen_id) {
            toastError(`Mata Kuliah ini sudah diajar oleh Dosen lain (${otherClassWithSameMK.nama_dosen}). Sesuai aturan, 1 MK hanya boleh 1 Dosen.`);
            return;
        }

        // Construct final data
        const finalData = {
            ...form,
            matakuliah_id: Number(form.matakuliah_id),
            dosen_id: Number(form.dosen_id)
        };

        onSubmit(finalData);
        onClose();
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {selectedKelas ? "Edit Pengelolaan Kelas" : "Tambah Kelas Baru"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <Form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kolom Kiri: Detil Kelas */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-blue-600 border-b pb-2">Informasi Kelas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="kode">Kode Kelas</Label>
                                    <Input
                                        type="text"
                                        name="kode"
                                        value={form.kode}
                                        onChange={handleChange}
                                        placeholder="KL-001"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="semester">Semester</Label>
                                    <select
                                        name="semester"
                                        value={form.semester}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="hari">Hari</Label>
                                    <select
                                        name="hari"
                                        value={form.hari}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Pilih Hari</option>
                                        <option value="Senin">Senin</option>
                                        <option value="Selasa">Selasa</option>
                                        <option value="Rabu">Rabu</option>
                                        <option value="Kamis">Kamis</option>
                                        <option value="Jumat">Jumat</option>
                                        <option value="Sabtu">Sabtu</option>
                                    </select>
                                </div>
                            </div>

                            <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6">Mata Kuliah & Dosen</h3>
                            <div>
                                <Label htmlFor="matakuliah_id">Pilih Mata Kuliah</Label>
                                <select
                                    name="matakuliah_id"
                                    value={form.matakuliah_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- Pilih Mata Kuliah --</option>
                                    {matakuliahs.map(mk => (
                                        <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama} ({mk.sks} SKS)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="dosen_id">Dosen Pengampu (Otomatis)</Label>
                                <select
                                    name="dosen_id"
                                    value={form.dosen_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-80"
                                    disabled={true}
                                    required
                                >
                                    <option value="">-- Pilih Mata Kuliah Terlebih Dahulu --</option>
                                    {dosens.map(d => {
                                        const currentSks = dosenSksMap[d.id] || 0;
                                        return (
                                            <option key={d.id} value={d.id}>
                                                {d.nama} (Load: {currentSks}/{d.max_sks || 12} SKS)
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="text-[10px] text-gray-500 mt-1 italic">* Sesuai aturan: 1 MK hanya diampu oleh 1 Dosen tetap.</p>
                            </div>
                        </div>

                        {/* Kolom Kanan: Mahasiswa */}
                        <div className="flex flex-col h-full">
                            <h3 className="font-semibold text-blue-600 border-b pb-2">Daftar Mahaswiswa</h3>
                            <p className="text-xs text-gray-500 mb-2">Pilih mahasiswa yang akan masuk ke kelas ini.</p>
                            <div className="flex-1 border rounded-md overflow-hidden flex flex-col">
                                <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold flex justify-between">
                                    <span>Pilih</span>
                                    <span>Mahasiswa (SKS)</span>
                                </div>
                                <div className="overflow-y-auto max-h-[300px]">
                                    {mahasiswas.length === 0 ? (
                                        <p className="p-4 text-center text-gray-400 text-sm">Tidak ada data mahasiswa</p>
                                    ) : (
                                        mahasiswas.map(m => {
                                            const currentSks = studentSksMap[m.id] || 0;
                                            const isSelected = form.mahasiswa_ids.includes(m.id);
                                            const exceeded = currentSks >= (m.max_sks || 24) && !isSelected;

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                                                    onClick={() => !exceeded && handleMahasiswaToggle(m.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }} // Handled by div onClick
                                                            disabled={exceeded}
                                                            className="h-4 w-4 text-blue-600 rounded"
                                                        />
                                                        <div>
                                                            <p className={`text-sm font-medium ${exceeded ? 'text-gray-400' : 'text-gray-700'}`}>{m.nama}</p>
                                                            <p className="text-xs text-gray-500">{m.nim}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentSks >= (m.max_sks || 24) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {currentSks} / {m.max_sks || 24} SKS
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                        >
                            {selectedKelas ? "Simpan Perubahan" : "Buat Kelas"}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ModalKelas;

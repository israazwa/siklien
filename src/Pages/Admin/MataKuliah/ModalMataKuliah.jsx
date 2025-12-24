import { useEffect, useState } from "react";
import Form from "@/Pages/Layouts/Components/Form";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";
import { useDosen } from "@/Utils/Hooks/useDosen";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";
import { toastError } from "@/Utils/Helpers/ToastHelpers";

const ModalMataKuliah = ({ isModalOpen, onClose, onSubmit, selectedMK }) => {
  const { data: dosenResult } = useDosen({ _limit: 100 });
  const { data: mkResult } = useMataKuliah({ _limit: 1000 });

  const dosens = dosenResult?.data || [];
  const allMK = mkResult?.data || [];

  const [form, setForm] = useState({
    kode: "",
    nama: "",
    sks: 3,
    semester: "Ganjil",
    dosen_id: ""
  });

  useEffect(() => {
    if (selectedMK) {
      setForm({
        kode: selectedMK.kode,
        nama: selectedMK.nama,
        sks: selectedMK.sks || 3,
        semester: selectedMK.semester || "Ganjil",
        dosen_id: selectedMK.dosen_id || ""
      });
    } else {
      setForm({ kode: "", nama: "", sks: 3, semester: "Ganjil", dosen_id: "" });
    }
  }, [selectedMK, isModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.kode.trim() || !form.nama.trim() || !form.dosen_id) {
      toastError("Mohon lengkapi semua data, termasuk Dosen Pengampu!");
      return;
    }

    // Aturan: 1 Dosen hanya boleh 1 Matkul
    const isDosenBusy = allMK.find(mk =>
      mk.dosen_id == form.dosen_id && mk.id != selectedMK?.id
    );

    if (isDosenBusy) {
      const d = dosens.find(d => d.id == form.dosen_id);
      toastError(`Dosen ${d?.nama} sudah mengampu Mata Kuliah lain. Berdasarkan aturan, 1 Dosen hanya boleh mengampu 1 Mata Kuliah.`);
      return;
    }

    onSubmit({
      ...form,
      sks: Number(form.sks),
      semester: form.semester,
      dosen_id: Number(form.dosen_id)
    });
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedMK ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">&times;</button>
        </div>

        <Form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kode">Kode MK</Label>
              <Input type="text" name="kode" value={form.kode} onChange={handleChange} readOnly={selectedMK !== null} placeholder="MK001" required />
            </div>
            <div>
              <Label htmlFor="sks">SKS</Label>
              <Input type="number" name="sks" value={form.sks} onChange={handleChange} min="1" max="6" required />
            </div>
          </div>
          <div>
            <Label htmlFor="nama">Nama Mata Kuliah</Label>
            <Input type="text" name="nama" value={form.nama} onChange={handleChange} placeholder="Masukkan Nama" required />
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
          <div>
            <Label htmlFor="dosen_id">Dosen Pengampu</Label>
            <select
              name="dosen_id"
              value={form.dosen_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Pilih Dosen --</option>
              {dosens.map(d => {
                const isOccupied = allMK.some(mk => mk.dosen_id == d.id && mk.id != selectedMK?.id);
                return (
                  <option key={d.id} value={d.id} disabled={isOccupied} className={isOccupied ? "text-gray-400" : ""}>
                    {d.nama} {isOccupied ? "(Sudah mengampu MK lain)" : ""}
                  </option>
                );
              })}
            </select>
            <p className="text-[10px] text-gray-500 mt-1 italic">* 1 Dosen hanya diperbolehkan mengampu 1 Mata Kuliah.</p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" onClick={onClose} variant="secondary">Batal</Button>
            <Button type="submit" className="bg-blue-600">Simpan</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ModalMataKuliah;

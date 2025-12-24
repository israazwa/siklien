import { useEffect, useState } from "react";
import Form from "@/Pages/Layouts/Components/Form";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";

const ModalDosen = ({ isModalOpen, onClose, onSubmit, selectedDosen }) => {
  const [form, setForm] = useState({ nidn: "", nama: "" });

  useEffect(() => {
    if (selectedDosen) {
      setForm({ nidn: selectedDosen.nidn, nama: selectedDosen.nama });
    } else {
      setForm({ nidn: "", nama: "" });
    }
  }, [selectedDosen, isModalOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nidn.trim()) {
      alert("NIDN wajib diisi!");
      return;
    }
    if (!form.nama.trim()) {
      alert("Nama wajib diisi!");
      return;
    }

    onSubmit(form);
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {selectedDosen ? "Edit Dosen" : "Tambah Dosen"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">
            &times;
          </button>
        </div>

        <Form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="nidn">NIDN</Label>
            <Input
              type="text"
              name="nidn"
              value={form.nidn}
              onChange={handleChange}
              readOnly={selectedDosen !== null}
              placeholder="Masukkan NIDN"
              required
            />
          </div>
          <div>
            <Label htmlFor="nama">Nama</Label>
            <Input type="text" name="nama" value={form.nama} onChange={handleChange} placeholder="Masukkan Nama" required />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ModalDosen;

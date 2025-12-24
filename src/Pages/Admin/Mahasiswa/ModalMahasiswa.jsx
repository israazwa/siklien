import { useEffect, useState } from "react";
import Form from "@/Pages/Layouts/Components/Form";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";

const ModalMahasiswa = ({
  isModalOpen,
  onClose,
  onSubmit,
  selectedMahasiswa
}) => {
  const [form, setForm] = useState({ nim: "", nama: "" });

  useEffect(() => {
    if (selectedMahasiswa) {
      setForm({
        nim: selectedMahasiswa.nim,
        nama: selectedMahasiswa.nama
      });
    } else {
      setForm({ nim: "", nama: "" });
    }
  }, [selectedMahasiswa, isModalOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi form
    if (!form.nim.trim()) {
      alert("NIM wajib diisi!");
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
            {selectedMahasiswa ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-xl"
          >
            &times;
          </button>
        </div>

        <Form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="nim">NIM</Label>
            <Input
              type="text"
              name="nim"
              value={form.nim}
              onChange={handleChange}
              readOnly={selectedMahasiswa !== null}
              placeholder="Masukkan NIM"
              required
            />
          </div>
          <div>
            <Label htmlFor="nama">Nama</Label>
            <Input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan Nama"
              required
            />
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

export default ModalMahasiswa;
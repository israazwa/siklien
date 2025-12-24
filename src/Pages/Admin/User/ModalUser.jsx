import { useEffect, useState } from "react";
import Form from "@/Pages/Layouts/Components/Form";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";

const ModalUser = ({
  isModalOpen,
  onClose,
  onSubmit,
  selectedUser
}) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (selectedUser) {
      setForm({
        name: selectedUser.name,
        email: selectedUser.email,
        password: selectedUser.password
      });
    } else {
      setForm({ name: "", email: "", password: "" });
    }
  }, [selectedUser, isModalOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!form.name.trim()) {
      alert("Nama wajib diisi!");
      return;
    }
    if (!form.email.trim()) {
      alert("Email wajib diisi!");
      return;
    }
    if (!form.password.trim()) {
      alert("Password wajib diisi!");
      return;
    }

    onSubmit(form);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {selectedUser ? "Edit User" : "Tambah User"}
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
            <Label htmlFor="name">Nama</Label>
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan email"
              readOnly={selectedUser !== null}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
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

export default ModalUser;

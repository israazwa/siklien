import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Form from "@/Pages/Layouts/Components/Form";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";
import { createUser } from "@/Utils/Apis/AuthApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

const AddUser = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword } = form;

        // Validasi
        if (!name.trim() || !email.trim() || !password.trim()) {
            toastError("Semua field wajib diisi");
            return;
        }

        if (password !== confirmPassword) {
            toastError("Password dan konfirmasi password tidak sama");
            return;
        }

        if (password.length < 6) {
            toastError("Password minimal 6 karakter");
            return;
        }

        setIsSubmitting(true);
        try {
            await createUser({ name, email, password });
            toastSuccess("User berhasil ditambahkan");
            navigate("/admin/user");
        } catch (error) {
            toastError(error.message || "Gagal menambahkan user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/user");
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <Heading as="h2" className="mb-6">Tambah User Baru</Heading>

            <Form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Masukkan email"
                            required
                            disabled={isSubmitting}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Email akan digunakan untuk login
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Masukkan password (min. 6 karakter)"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Masukkan ulang password"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Menyimpan..." : "Simpan User"}
                        </Button>
                    </div>
                </div>
            </Form>
        </Card>
    );
};

export default AddUser;

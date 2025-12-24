import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Input from "@/Pages/Layouts/Components/Input";
import Label from "@/Pages/Layouts/Components/Label";
import Button from "@/Pages/Layouts/Components/Button";
import Link from "@/Pages/Layouts/Components/Link";
import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Form from "@/Pages/Layouts/Components/Form";
import { login } from "@/Utils/Apis/AuthApi";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

import { dummyUser } from "@/Data/Dummy";
import { toastError, toastSuccess } from "@/Utils/Helpers/ToastHelpers";

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStateContext();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Redirect jika sudah login
  if (user) return <Navigate to="/admin" />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    try {
      const user = await login(email, password);
      console.log("🔐 Login API returned user:", user);
      console.log("🔐 User has permission?", !!user.permission, user.permission);
      console.log("🔐 User has role?", !!user.role, user.role);

      setUser(user); // Simpan ke context + localStorage
      toastSuccess("Login berhasil");

      // Beri waktu React update context
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 10);
    } catch (err) {
      toastError(err.message);
    }
  };


  return (
    <Card className="max-w-md">
      <Heading as="h2">Login</Heading>
      <Form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan email"
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
        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">Ingat saya</span>
          </label>
          <Link href="#" className="text-sm">
            Lupa password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </Form>
      <p className="text-sm text-center text-gray-600 mt-4">
        Hubungi admin untuk membuat akun baru
      </p>
    </Card>
  );
};

export default Login

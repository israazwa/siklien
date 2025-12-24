import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import './App.css';

import { AuthProvider } from "@/Utils/Contexts/AuthContext";
import AuthLayout from "@/Pages/Layouts/AuthLayout";
import AdminLayout from "@/Pages/Layouts/AdminLayout";
import ProtectedRoute from "@/Pages/Layouts/Components/ProtectedRoute";

import Login from "@/Pages/Auth/Login/Login";
import Dashboard from "@/Pages/Admin/Dashboard/Dashboard";
import Mahasiswa from "@/Pages/Admin/Mahasiswa/Mahasiswa";
import MahasiswaDetail from "@/Pages/Admin/MahasiswaDetail/MahasiswaDetail";
import Dosen from "@/Pages/Admin/Dosen/Dosen";
import DosenDetail from "@/Pages/Admin/Dosen/DosenDetail";
import MataKuliah from "@/Pages/Admin/MataKuliah/MataKuliah";
import MataKuliahDetail from "@/Pages/Admin/MataKuliah/MataKuliahDetail";
import Kelas from "@/Pages/Admin/Kelas/Kelas";
import User from "@/Pages/Admin/User/User";
import AddUser from "@/Pages/Admin/User/AddUser";
import KRS from "@/Pages/Admin/KRS/KRS";
import Profile from "@/Pages/Admin/Profile/Profile";
import PageNotFound from "@/Pages/PageNotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "mahasiswa",
        children: [
          {
            index: true,
            element: <Mahasiswa />,
          },
          {
            path: ":id",
            element: <MahasiswaDetail />,
          },
        ],
      },
      {
        path: "dosen",
        children: [
          {
            index: true,
            element: <Dosen />,
          },
          {
            path: ":id",
            element: <DosenDetail />,
          },
        ],
      },
      {
        path: "matakuliah",
        children: [
          {
            index: true,
            element: <MataKuliah />,
          },
          {
            path: ":id",
            element: <MataKuliahDetail />,
          },
        ],
      },
      {
        path: "kelas",
        element: <Kelas />,
      },
      {
        path: "user",
        children: [
          {
            index: true,
            element: <User />,
          },
          {
            path: "add",
            element: <AddUser />,
          },
        ],
      },
      {
        path: "krs",
        element: <KRS />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 3000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

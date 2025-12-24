import { useState, useEffect } from "react";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";
import { getKRSByMahasiswa } from "@/Utils/Apis/KRSApi";
import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Button from "@/Pages/Layouts/Components/Button";
import { Link } from "react-router-dom";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";


// Import hooks untuk data real
import { useMahasiswa } from "@/Utils/Hooks/useMahasiswa";
import { useDosen } from "@/Utils/Hooks/useDosen";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";
import { useKelas } from "@/Utils/Hooks/useKelas";
import { useUsers } from "@/Utils/Hooks/useUser";


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];


const Dashboard = () => {
  const { user } = useAuthStateContext();


  // Fetch all real data (without pagination to get accurate totals)
  const { data: mahasiswaData, isLoading: loadingMahasiswa } = useMahasiswa({ _limit: 1000 });
  const { data: dosenData, isLoading: loadingDosen } = useDosen({ _limit: 1000 });
  const { data: matakuliahData, isLoading: loadingMatakuliah } = useMataKuliah({ _limit: 1000 });
  const { data: kelasData, isLoading: loadingKelas } = useKelas({ _limit: 1000 });
  const { data: usersData, isLoading: loadingUsers } = useUsers({ _limit: 1000 });


  const [stats, setStats] = useState({
    totalSKS: 0,
    totalMK: 0
  });


  const isLoading = loadingMahasiswa || loadingDosen || loadingMatakuliah || loadingKelas || loadingUsers;


  useEffect(() => {
    fetchStats();
  }, []);


  const fetchStats = async () => {
    try {
      if (user?.role === "mahasiswa") {
        const krsRes = await getKRSByMahasiswa(user.id);
        const mkRes = await matakuliahData?.data || [];

        let totalSKS = 0;
        krsRes.data.forEach(krs => {
          const mk = mkRes.find(m => m.id == krs.matakuliah_id);
          totalSKS += mk?.sks || 0;
        });

        setStats({
          totalSKS,
          totalMK: krsRes.data.length
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };


  // Process real data for charts
  const processChartData = () => {
    if (!mahasiswaData?.data || !dosenData?.data || !matakuliahData?.data || !kelasData?.data) {
      return {
        genderRatio: [],
        enrollmentByYear: [],
        dosenByRank: [],
        matakuliahBySemester: [],
        kelasByTahunAjaran: []
      };
    }


    // 1. Gender Ratio dari data mahasiswa
    const genderCount = mahasiswaData.data.reduce((acc, mhs) => {
      const gender = mhs.gender || "Tidak Diketahui";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});


    const genderRatio = Object.entries(genderCount).map(([gender, count]) => ({
      gender,
      count
    }));


    // 2. Enrollment by Year (Angkatan)
    const yearCount = mahasiswaData.data.reduce((acc, mhs) => {
      const year = mhs.angkatan || 2024;
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});


    const enrollmentByYear = Object.entries(yearCount)
      .map(([year, total]) => ({
        year: parseInt(year),
        total
      }))
      .sort((a, b) => a.year - b.year);


    // 3. Dosen by Academic Rank (Pangkat)
    const rankCount = dosenData.data.reduce((acc, dosen) => {
      const rank = dosen.pangkat || "Tidak Diketahui";
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});


    const dosenByRank = Object.entries(rankCount).map(([rank, count]) => ({
      rank,
      count
    }));


    // 4. Mata Kuliah by Semester (Ganjil/Genap)
    const semesterCount = matakuliahData.data.reduce((acc, mk) => {
      const sem = mk.semester || "Ganjil";
      acc[sem] = (acc[sem] || 0) + 1;
      return acc;
    }, {});


    const matakuliahBySemester = Object.entries(semesterCount)
      .map(([semester, count]) => ({
        semester: semester,
        count
      }))
      .sort((a, b) => (a.semester === "Ganjil" ? -1 : 1));


    return {
      genderRatio,
      enrollmentByYear,
      dosenByRank,
      matakuliahBySemester
    };
  };


  const chartData = processChartData();


  return (
    <div className="space-y-6">
      <Heading as="h1">Selamat Datang, {user?.name}!</Heading>


      {user?.role === "admin" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {loadingUsers ? "..." : usersData?.total || 0}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Mahasiswa</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {loadingMahasiswa ? "..." : mahasiswaData?.total || 0}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Dosen</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {loadingDosen ? "..." : dosenData?.total || 0}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Mata Kuliah</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">
                  {loadingMatakuliah ? "..." : matakuliahData?.total || 0}
                </p>
              </div>
            </Card>
          </div>


          <Card>
            <Heading as="h2" className="mb-4">Quick Actions</Heading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/admin/mahasiswa">
                <Button className="w-full">📚 Mahasiswa</Button>
              </Link>
              <Link to="/admin/dosen">
                <Button className="w-full">👩‍🏫 Dosen</Button>
              </Link>
              <Link to="/admin/matakuliah">
                <Button className="w-full">📖 Mata Kuliah</Button>
              </Link>
              <Link to="/admin/user">
                <Button className="w-full">👤 Users</Button>
              </Link>
            </div>
          </Card>


          {/* Charts Section */}
          {isLoading ? (
            <Card>
              <div className="p-6 text-center">Loading chart data...</div>
            </Card>
          ) : (
            <>
              <Heading as="h2" className="mt-8">📊 Visualisasi Data</Heading>


              {/* Row 1: Gender Ratio & Enrollment by Year */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <Heading as="h3" className="mb-4">Rasio Gender Mahasiswa</Heading>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.genderRatio}
                        dataKey="count"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {chartData.genderRatio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>


                <Card>
                  <Heading as="h3" className="mb-4">Tren Pendaftaran Mahasiswa per Angkatan</Heading>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.enrollmentByYear}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Jumlah Mahasiswa"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>


              {/* Row 2: Dosen by Rank */}
              <Card>
                <Heading as="h3" className="mb-4">Distribusi Dosen Berdasarkan Pangkat</Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.dosenByRank}>
                    <defs>
                      <linearGradient id="colorDosen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="rank" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorDosen)"
                      name="Jumlah Dosen"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>


              {/* Row 3: Mata Kuliah Distribution */}
              <Card>
                <Heading as="h3" className="mb-4">Distribusi Mata Kuliah per Semester</Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.matakuliahBySemester}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ffc658" name="Jumlah Mata Kuliah" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </>
      )}


      {user?.role === "mahasiswa" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total SKS Diambil</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalSKS} SKS</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Mata Kuliah</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalMK} MK</p>
              </div>
            </Card>
          </div>


          <Card>
            <Heading as="h2" className="mb-4">Quick Actions</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/admin/krs">
                <Button className="w-full">📝 Lihat KRS</Button>
              </Link>
              <Button className="w-full bg-gray-400 cursor-not-allowed" disabled>
                📊 Lihat Nilai (Coming Soon)
              </Button>
            </div>
          </Card>


          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900">Informasi Penting</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Pastikan Anda telah mengisi KRS sebelum batas waktu yang ditentukan.
                  Maksimal SKS yang dapat diambil adalah 24 SKS per semester.
                </p>
              </div>
            </div>
          </Card>


          {/* Charts Section for Mahasiswa */}
          {isLoading ? (
            <Card>
              <div className="p-6 text-center">Loading chart data...</div>
            </Card>
          ) : (
            <>
              <Heading as="h2" className="mt-8">📊 Statistik Kampus</Heading>


              {/* Row 1: Enrollment Trend & Gender */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <Heading as="h3" className="mb-4">Tren Pendaftaran Mahasiswa</Heading>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.enrollmentByYear}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Jumlah Mahasiswa"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>


                <Card>
                  <Heading as="h3" className="mb-4">Rasio Gender Mahasiswa</Heading>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.genderRatio}
                        dataKey="count"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {chartData.genderRatio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>


              {/* Row 2: Mata Kuliah Distribution */}
              <Card>
                <Heading as="h3" className="mb-4">Distribusi Mata Kuliah per Semester</Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.matakuliahBySemester}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Jumlah Mata Kuliah" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};


export default Dashboard;
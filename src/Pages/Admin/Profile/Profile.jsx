import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";
import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import { useEffect, useState } from "react";
import axios from "@/Utils/AxiosInstance";

const Profile = () => {
    const { user } = useAuthStateContext();
    const [extraInfo, setExtraInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExtraInfo = async () => {
            if (!user) return;
            try {
                setLoading(true);
                if (user.role === "mahasiswa") {
                    const res = await axios.get(`/mahasiswa/${user.id}`);
                    setExtraInfo(res.data);
                } else if (user.role === "dosen") {
                    const res = await axios.get(`/dosen/${user.id}`);
                    setExtraInfo(res.data);
                }
            } catch (error) {
                console.error("Error fetching extra info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExtraInfo();
    }, [user]);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <Heading as="h1">Profil Saya</Heading>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bagian Foto/Avatar */}
                <Card className="md:col-span-1 flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold border-4 border-white shadow-lg">
                        {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800">{extraInfo?.nama || user.name}</h2>
                        <p className="text-sm text-blue-600 font-medium capitalize px-3 py-1 bg-blue-50 rounded-full inline-block mt-2">
                            {user.role}
                        </p>
                    </div>
                </Card>

                {/* Bagian Informasi Detail */}
                <Card className="md:col-span-2 p-0 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h3 className="font-semibold text-gray-700">Informasi Akun</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</label>
                                <p className="text-gray-800 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">User ID</label>
                                <p className="text-gray-800 font-medium">{user.id}</p>
                            </div>
                        </div>

                        {user.role === "mahasiswa" && extraInfo && (
                            <>
                                <hr className="my-4 border-gray-100" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">NIM</label>
                                        <p className="text-gray-800 font-medium">{extraInfo.nim || "-"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Angkatan</label>
                                        <p className="text-gray-800 font-medium">{extraInfo.angkatan || "-"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Jenis Kelamin</label>
                                        <p className="text-gray-800 font-medium">{extraInfo.gender || "-"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Maks SKS</label>
                                        <p className="text-gray-800 font-medium">{extraInfo.max_sks || 24} SKS</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {user.role === "admin" && (
                            <>
                                <hr className="my-4 border-gray-100" />
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Hak Akses</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {user.permission?.slice(0, 5).map((p, i) => (
                                            <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                {p}
                                            </span>
                                        ))}
                                        {user.permission?.length > 5 && (
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                +{user.permission.length - 5} lainnya
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Coming Soon Features */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none shadow-xl">
                <div className="flex items-center space-x-4 p-4">
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Ubah Kata Sandi</h3>
                        <p className="text-blue-100 text-sm opacity-90">
                            Fitur untuk mengganti kata sandi sedang dalam pengembangan. Mohon tunggu pembaruan selanjutnya!
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Profile;

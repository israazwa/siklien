import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

const TableKelas = ({ data, onEdit, onDelete, isLoading = false }) => {
    const { user } = useAuthStateContext();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Kode Kelas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Mata Kuliah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Dosen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Mahasiswa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Hari
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Semester
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                        <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2">Memuat data...</span>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                Tidak ada data kelas
                            </td>
                        </tr>
                    ) : (
                        data.map((kelas, index) => (
                            <tr key={kelas.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-semibold">
                                    {kelas.kode || kelas.nama || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {kelas.nama_matakuliah || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {kelas.nama_dosen || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold">
                                        {kelas.mahasiswa_ids?.length || 0} Orang
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {kelas.hari || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {kelas.semester}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    {user?.permission?.includes("kelas.update") && (
                                        <button
                                            onClick={() => onEdit(kelas)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {user?.permission?.includes("kelas.delete") && (
                                        <button
                                            onClick={() => onDelete(kelas.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableKelas;

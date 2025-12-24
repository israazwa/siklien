import Button from "@/Pages/Layouts/Components/Button";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

const TableMahasiswa = ({
  data = [],
  studentSksMap = {},
  onEdit,
  onDelete,
  onDetail,
  isLoading = false
}) => {
  const { user } = useAuthStateContext();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">NIM</th>
            <th className="py-2 px-4 text-left">Nama</th>
            <th className="py-2 px-4 text-center">Total SKS</th>
            <th className="py-2 px-4 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Memuat data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                Tidak ada data mahasiswa
              </td>
            </tr>
          ) : (
            data.map((mhs, index) => (
              <tr
                key={mhs.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >
                <td className="py-2 px-4 font-mono">{mhs.nim}</td>
                <td className="py-2 px-4 font-semibold">{mhs.nama}</td>
                <td className="py-2 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${studentSksMap[mhs.id] >= (mhs.max_sks || 24) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {studentSksMap[mhs.id] || 0} / {mhs.max_sks || 24} SKS
                  </span>
                </td>

                <td className="py-2 px-4 text-center space-x-2">
                  <Button onClick={() => onDetail(mhs.id)}>
                    Detail
                  </Button>

                  {user?.permission?.includes("mahasiswa.update") && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => onEdit(mhs)}
                    >
                      Edit
                    </Button>
                  )}

                  {user?.permission?.includes("mahasiswa.delete") && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(mhs.id)}
                    >
                      Hapus
                    </Button>
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

export default TableMahasiswa;

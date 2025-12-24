import Button from "@/Pages/Layouts/Components/Button";

const TableMataKuliah = ({ data = [], onEdit, onDelete, onDetail, isReadOnly = false, isLoading = false }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Kode</th>
            <th className="py-2 px-4 text-left">Nama</th>
            <th className="py-2 px-4 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Memuat data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-4 px-4 text-center text-gray-500">Tidak ada data mata kuliah</td>
            </tr>
          ) : (
            data.map((m, index) => (
              <tr key={m.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                <td className="py-2 px-4">{m.kode}</td>
                <td className="py-2 px-4">{m.nama}</td>

                <td className="py-2 px-4 text-center space-x-2">
                  <Button onClick={() => onDetail(m.id)}>Detail</Button>

                  {onEdit && !isReadOnly && (
                    <Button size="sm" variant="warning" onClick={() => onEdit(m)}>Edit</Button>
                  )}

                  {onDelete && !isReadOnly && (
                    <Button size="sm" variant="danger" onClick={() => onDelete(m.id)}>Hapus</Button>
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

export default TableMataKuliah;

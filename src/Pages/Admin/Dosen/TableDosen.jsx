import Button from "@/Pages/Layouts/Components/Button";

const TableDosen = ({
  data = [],
  dosenSksMap = {},
  onEdit,
  onDelete,
  onDetail,
  isReadOnly = false,
  isLoading = false
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">NIDN</th>
            <th className="py-2 px-4 text-left">Nama</th>
            <th className="py-2 px-4 text-center">Beban Mengajar</th>
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
                Tidak ada data dosen
              </td>
            </tr>
          ) : (
            data.map((d, index) => (
              <tr key={d.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                <td className="py-2 px-4 font-mono">{d.nidn}</td>
                <td className="py-2 px-4 font-semibold">{d.nama}</td>
                <td className="py-2 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${dosenSksMap[d.id] >= (d.max_sks || 12) ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {dosenSksMap[d.id] || 0} / {d.max_sks || 12} SKS
                  </span>
                </td>

                <td className="py-2 px-4 text-center space-x-2">
                  <Button onClick={() => onDetail(d.id)}>Detail</Button>

                  {onEdit && !isReadOnly && (
                    <Button size="sm" variant="warning" onClick={() => onEdit(d)}>
                      Edit
                    </Button>
                  )}

                  {onDelete && !isReadOnly && (
                    <Button size="sm" variant="danger" onClick={() => onDelete(d.id)}>
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

export default TableDosen;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/Pages/Layouts/Components/Card";
import Heading from "@/Pages/Layouts/Components/Heading";
import Button from "@/Pages/Layouts/Components/Button";
import { confirmDelete } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers";
import { useUsers, useDeleteUser } from "@/Utils/Hooks/useUser";
import TableUser from "./TableUser";

const User = () => {
  const navigate = useNavigate();

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // React Query Hooks
  const {
    data: result = { data: [], total: 0 },
    isLoading: isLoadingUsers,
  } = useUsers({
    q: search,
    _sort: sortBy,
    _order: sortOrder,
    _page: page,
    _limit: limit,
  });

  const { data: users = [] } = result;
  const totalCount = result.total;
  const totalPages = Math.ceil(totalCount / limit);

  const { mutate: remove } = useDeleteUser();

  const handleAddUser = () => {
    navigate("/admin/user/add");
  };

  const handleEdit = (user) => {
    // Navigate to edit page (can be implemented later)
    toastError("Fitur edit belum diimplementasikan");
  };

  const handleDelete = (id) => {
    confirmDelete(() => {
      remove(id);
    });
  };

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Kelola User
        </Heading>
        <Button onClick={handleAddUser}>+ Tambah User</Button>
      </div>

      {/* Search, Sort, and Limit Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama/email..."
          className="border border-gray-300 px-3 py-2 rounded flex-grow min-w-[200px]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {/* Sort By Field */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="name">Sort by Nama</option>
          <option value="email">Sort by Email</option>
          <option value="role">Sort by Role</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Limit per page */}
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="5">5 per halaman</option>
          <option value="10">10 per halaman</option>
          <option value="25">25 per halaman</option>
          <option value="50">50 per halaman</option>
        </select>
      </div>

      <TableUser
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoadingUsers}
      />

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalPages || 1} (Total: {totalCount} data)
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrev}
            disabled={page === 1 || isLoadingUsers}
          >
            Prev
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0 || isLoadingUsers}
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

export default User;

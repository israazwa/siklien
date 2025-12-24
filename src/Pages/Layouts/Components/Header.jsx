import { Link } from "react-router-dom";
import Button from "@/Pages/Layouts/Components/Button";
import { confirmLogout } from "@/Utils/Helpers/SwalHelpers";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

const Header = () => {
  const { user, setUser } = useAuthStateContext();

  const handleLogout = () => {
    confirmLogout(() => {
      setUser(null); // Clear context + localStorage
      location.href = "/";
    });
  };

  const toggleProfileMenu = () => {
    const menu = document.getElementById("profileMenu");
    if (menu) menu.classList.toggle("hidden");
  };

  const closeMenu = () => {
    const menu = document.getElementById("profileMenu");
    if (menu) menu.classList.add("hidden");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Login sebagai: <strong>{user?.role || "User"}</strong>
        </h1>
        <div className="relative">
          <Button
            onClick={toggleProfileMenu}
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold focus:outline-none overflow-hidden"
          >
            {user?.name?.charAt(0) || "U"}
          </Button>
          <div
            id="profileMenu"
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 hidden border z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="px-4 py-2 border-b mb-1">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Link
              to="/admin/profile"
              onClick={closeMenu}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              👤 Profil Saya
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout 🚪
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

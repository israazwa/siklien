import { NavLink } from "react-router-dom";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

const Sidebar = () => {
  const { user } = useAuthStateContext();

  // Debug logging
  console.log("Sidebar - User:", user);
  console.log("Sidebar - User keys:", user ? Object.keys(user) : "no user");
  console.log("Sidebar - Permissions:", user?.permission);
  console.log("Sidebar - Permission type:", typeof user?.permission);
  console.log("Sidebar - Is Array:", Array.isArray(user?.permission));

  return (
    <aside className="bg-blue-800 text-white min-h-screen transition-all duration-300 w-20 lg:w-64">
      <div className="p-4 border-b border-blue-700">
        <span className="text-2xl font-bold hidden lg:block">Admin</span>
      </div>
      <nav className="p-4 space-y-2">
        {user?.permission?.includes("dashboard.page") && (
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>🏠</span>
            <span className="menu-text hidden lg:inline">Dashboard</span>
          </NavLink>
        )}
        {user?.permission?.includes("mahasiswa.page") && (
          <NavLink
            to="/admin/mahasiswa"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>🎓</span>
            <span className="menu-text hidden lg:inline">Mahasiswa</span>
          </NavLink>
        )}
        {user?.permission?.includes("dosen.page") && (
          <NavLink
            to="/admin/dosen"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>👩‍🏫</span>
            <span className="menu-text hidden lg:inline">Dosen</span>
          </NavLink>
        )}
        {user?.permission?.includes("matakuliah.page") && (
          <NavLink
            to="/admin/matakuliah"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>📚</span>
            <span className="menu-text hidden lg:inline">Mata Kuliah</span>
          </NavLink>
        )}
        {user?.permission?.includes("kelas.page") && (
          <NavLink
            to="/admin/kelas"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>🏫</span>
            <span className="menu-text hidden lg:inline">Kelas</span>
          </NavLink>
        )}
        {user?.permission?.includes("user.page") && (
          <NavLink
            to="/admin/user"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>👤</span>
            <span className="menu-text hidden lg:inline">User</span>
          </NavLink>
        )}
        {user?.permission?.includes("krs.page") && (
          <NavLink
            to="/admin/krs"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
          >
            <span>📝</span>
            <span className="menu-text hidden lg:inline">KRS</span>
          </NavLink>
        )}
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
            }`
          }
        >
          <span>👤</span>
          <span className="menu-text hidden lg:inline">Profil</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;

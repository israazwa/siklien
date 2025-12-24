import { createContext, useContext, useState } from "react";

const AuthStateContext = createContext({
    user: null,
    setUser: () => { },
});

export const AuthProvider = ({ children }) => {
    // Safely parse user from localStorage
    const getUserFromStorage = () => {
        try {
            const storedUser = localStorage.getItem("user");
            console.log("📦 Raw localStorage user:", storedUser);

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                console.log("🔍 Parsed user:", parsedUser);
                console.log("🔍 Has role?", !!parsedUser.role, parsedUser.role);
                console.log("🔍 Has permission?", !!parsedUser.permission, parsedUser.permission);

                // Validasi: pastikan user punya role dan permission
                if (!parsedUser.role || !parsedUser.permission) {
                    console.warn("⚠️ User data tidak valid (missing role/permission). Clearing localStorage...");
                    localStorage.removeItem("user");
                    return null;
                }

                console.log("✅ User loaded from localStorage:", parsedUser);
                return parsedUser;
            }
            return null;
        } catch (error) {
            console.error("❌ Error parsing user from localStorage:", error);
            localStorage.removeItem("user");
            return null;
        }
    };

    const [user, _setUser] = useState(getUserFromStorage());

    const setUser = (user) => {
        console.log("Setting user:", user);
        _setUser(user);

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    };

    return (
        <AuthStateContext.Provider value={{ user, setUser }}>
            {children}
        </AuthStateContext.Provider>
    );
};

export const useAuthStateContext = () => useContext(AuthStateContext);


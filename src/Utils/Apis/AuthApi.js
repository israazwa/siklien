import axios from "@/Utils/AxiosInstance";

export const login = async (email, password) => {
  const res = await axios.get("/user", { params: { email } });
  const user = res.data[0];

  if (!user) throw new Error("Email tidak ditemukan");
  if (user.password !== password) throw new Error("Password salah");

  return user;
};

// Get all users
export const getAllUsers = (params = {}) => axios.get("/user", { params });

// Get single user
export const getUser = (id) => axios.get(`/user/${id}`);

// Add new user
export const createUser = async ({ name, email, password }) => {
  // Cek apakah email sudah terdaftar
  const res = await axios.get("/user", { params: { email } });
  if (res.data && res.data.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  const payload = { name, email, password };
  const createRes = await axios.post("/user", payload);
  return createRes.data;
};

// Update user
export const updateUser = (id, data) => axios.put(`/user/${id}`, data);

// Delete user
export const deleteUser = (id) => axios.delete(`/user/${id}`);

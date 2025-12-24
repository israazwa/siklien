import axios from "@/Utils/AxiosInstance";

// Ambil semua data chart
export const getAllChartData = () => axios.get("/chart");

export default {
    getAllChartData,
};

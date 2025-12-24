// Utils/Hooks/useChart.jsx
import { useQuery } from "@tanstack/react-query";
import { getAllChartData } from "@/Utils/Apis/ChartApi";

// Ambil semua data chart
export const useChartData = () =>
    useQuery({
        queryKey: ["chart", "all"],
        queryFn: getAllChartData,
        select: (res) => res.data,
    });

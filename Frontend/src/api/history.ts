import api from "./config";
import type { historyProps } from "../types/history";

export const getRecentHistory = async (): Promise<historyProps[]> => {
    const response = await api.get("/history/recent");
    return response.data;
};

import api from "./config";
import type { historyProps } from "../types/history";

export const getRecentHistory = async (): Promise<historyProps[]> => {
    const response = await api.get("/history/recent");
    return response.data;
};

export const getAllHistory = async (): Promise<historyProps[]> => {
    const response = await api.get("/history/all");
    return response.data;
};

export const getHistoryById = async (historyId: number): Promise<historyProps> => {
    const response = await api.get(`/history/${historyId}`);
    return response.data;
};

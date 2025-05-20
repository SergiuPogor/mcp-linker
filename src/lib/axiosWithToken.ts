// src/lib/axiosWithToken.ts
import { API_BASE_URL } from "@/lib/axios";
import { getSession } from "@/services/auth";
import axios from "axios";

export const apiWithAuth = async () => {
  const session = await getSession();

  // Create a new isolated axios instance with the same baseURL as the original api
  const authApi = axios.create({ baseURL: API_BASE_URL }); // new isolated instance
  authApi.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    return config;
  });

  return authApi;
};

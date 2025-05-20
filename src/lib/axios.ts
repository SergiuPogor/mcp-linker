// src/lib/axios.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://mcp-linker-api.onrender.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

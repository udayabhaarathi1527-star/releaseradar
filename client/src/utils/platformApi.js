import axios from "axios";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const api = axios.create({ baseURL: apiBase, timeout: 12000 });

export const getProfessionals = (params, signal) =>
  api.get("/marketplace", { params, signal }).then((response) => response.data);

export const getProfessional = (id, signal) =>
  api.get(`/marketplace/${id}`, { signal }).then((response) => response.data);

export const sendConnectionRequest = (id, message, token) =>
  api.post(`/marketplace/${id}/connect`, { message }, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => response.data);

export const getOpportunities = (params, signal) =>
  api.get("/opportunities", { params, signal }).then((response) => response.data);

export const getOpportunity = (id, signal) =>
  api.get(`/opportunities/${id}`, { signal }).then((response) => response.data);
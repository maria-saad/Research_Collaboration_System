import { api } from "./client";

export const researchersApi = {
  // GET /api/researchers
  list: async () => {
    const res = await api.get("/researchers");
    return res.data;
  },

  // GET /api/researchers/:id
  getById: async (id) => {
    const res = await api.get(`/researchers/${id}`);
    return res.data;
  },

  // POST /api/researchers
  create: async (payload) => {
    const res = await api.post("/researchers", payload);
    return res.data;
  },

  // DELETE /api/researchers/:id
  remove: async (id) => {
    const res = await api.delete(`/researchers/${id}`);
    return res.data;
  },

  // GET /api/researchers/:id/projects
  projects: async (id) => {
    const res = await api.get(`/researchers/${id}/projects`);
    return res.data;
  },

  // GET /api/researchers/:id/publications
  publications: async (id) => {
    const res = await api.get(`/researchers/${id}/publications`);
    return res.data;
  },

  // (اختياري) GET /api/researchers/:id/profile
  profile: async (id) => {
    const res = await api.get(`/researchers/${id}/profile`);
    return res.data;
  }
};

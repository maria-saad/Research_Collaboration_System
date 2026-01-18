import { api } from "./client";

export const projectsApi = {
  list: async () => (await api.get("/projects")).data,
  getById: async (id) => (await api.get(`/projects/${id}`)).data,
  create: async (payload) => (await api.post("/projects", payload)).data,
  update: async (id, payload) => (await api.put(`/projects/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/projects/${id}`)).data,

  // Meaningful query (optional page later)
  byResearcher: async (researcherId) => (await api.get(`/researchers/${researcherId}/projects`)).data,
};

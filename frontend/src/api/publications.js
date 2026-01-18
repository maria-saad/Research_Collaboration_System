import { api } from "./client";

export const publicationsApi = {
  list: async () => (await api.get("/publications")).data,
  getById: async (id) => (await api.get(`/publications/${id}`)).data,
  create: async (payload) => (await api.post("/publications", payload)).data,
  update: async (id, payload) => (await api.put(`/publications/${id}`, payload)).data,

  // DELETE only if your backend supports it:
  remove: async (id) => (await api.delete(`/publications/${id}`)).data,

  recent: async (limit = 10) => (await api.get(`/publications/recent?limit=${limit}`)).data,
  byResearcher: async (researcherId) => (await api.get(`/researchers/${researcherId}/publications`)).data,
};

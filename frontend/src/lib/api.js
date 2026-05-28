import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  // Chat
  async sendQuery(query, sources = null) {
    const res = await client.post("/chat/query", { query, sources });
    return res.data;
  },

  // Streaming chat
  streamQuery(query, sources = null, signal = null) {
    return fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, sources }),
      signal,
    });
  },

  // Documents
  async uploadDocument(formData) {
    const res = await client.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getDocuments() {
    const res = await client.get("/documents/");
    return res.data;
  },

  async deleteDocument(docId) {
    const res = await client.delete(`/documents/${docId}`);
    return res.data;
  },

  // Sources
  async getSources() {
    const res = await client.get("/sources/");
    return res.data;
  },

  // Health
  async healthCheck() {
    const res = await client.get("/health");
    return res.data;
  },
};

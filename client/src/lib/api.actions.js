// src/lib/api.actions.js
import API from "./api";

// Auth
export const loginApi = (email, password) =>
  API.post("/api/auth/login", { email, password });

export const registerApi = (payload) =>
  API.post("/api/auth/register", payload);

// Advisory
export const getCropRecommendation = (payload) =>
  API.post("/api/advisory/crop", payload);

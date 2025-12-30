import axios from "axios";

export const backbaseURL="http://localhost:8000";
export const frontbaseURL="http://localhost:3000";

const API = axios.create({
  baseURL: backbaseURL
});

export const createPaste = (data) =>
  API.post("/api/pastes", data);

export const getPaste = (id) =>
  API.get(`/api/pastes/${id}`);

export const getLink = (id) =>
  API.get(`/p/${id}`);
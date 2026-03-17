"use client";
import axios from "axios";
import { SERVER_LOGOUT, USER_BLOCKED } from "@/fullStackUtils/utils/messages";
import { string2Json } from "@/fullStackUtils/utils/functions";

let logoutHandler: ((message: string) => void) | null = null;
export function setLogoutHandler(handler: () => void) {
  logoutHandler = handler;
}

const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("profile") || "{}";
    if (stored) {
      const { accessToken } = string2Json<{ accessToken: string }>(stored);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch (err) { }
  return config;
});

API.interceptors.response.use((res) => {
  if (logoutHandler) {
      if (res?.data?.action === "logout") {
        logoutHandler(SERVER_LOGOUT);
        return Promise.reject(new Error(SERVER_LOGOUT));
      }
      if (res?.data?.action === "blocked") {
        logoutHandler(USER_BLOCKED);
        return Promise.reject(new Error(USER_BLOCKED));
      }
    }
    return res;
},
  (error) => {
    if (logoutHandler) {
      if (error.response?.data?.action === "logout") {
        logoutHandler(SERVER_LOGOUT);
        return Promise.reject(new Error(SERVER_LOGOUT));
      }
      if (error.response?.data?.action === "blocked") {
        logoutHandler(USER_BLOCKED);
        return Promise.reject(new Error(USER_BLOCKED));
      }
    }
    return Promise.reject(error);
  }
);

export default API;
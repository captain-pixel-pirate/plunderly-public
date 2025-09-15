import axios from "axios";

function getApiBaseUrl(): string {
  const host = process.env.NEXT_PUBLIC_API_URL;
  if (!host) throw new Error("NEXT_PUBLIC_API_URL is not defined");

  const isDev = process.env.NODE_ENV === "development";
  const protocol = isDev ? "http" : "https";

  return `${protocol}://${host}`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export default api;

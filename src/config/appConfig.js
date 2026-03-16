const PROD_API_BASE_URL = "https://court-api.bram-jesse.sd-lab.nl/api";
const LOCAL_API_BASE_URL = "http://localhost:3000/api";

// Prefer explicit environment override when provided
const envApiBase =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : null;

// Fallback: choose based on current hostname
const inferredBaseUrl =
  typeof window !== "undefined" && window.location.hostname.endsWith(
    "sd-lab.nl",
  )
    ? PROD_API_BASE_URL
    : LOCAL_API_BASE_URL;

const appConfig = {
  name: "King of the Court",
  apiBaseUrl: envApiBase || inferredBaseUrl,
};

export default appConfig;

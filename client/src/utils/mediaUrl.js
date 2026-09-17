import { getBackendOrigin } from "../services/api";

export const DEFAULT_LOGO = "/logo.jpg";

/**
 * Resolves media URLs (gallery photos, banners, event posters, uploaded pictures)
 * so that they work reliably across all deployment configurations:
 * - Same domain (e.g. https://yourdomain.com/uploads/...)
 * - Split domain (e.g. Frontend on Vercel, Backend on Render)
 * - Subdirectory / Custom Base path (import.meta.env.BASE_URL)
 * - Stored localhost URLs from local development
 */
export const getMediaUrl = (url, fallback = "") => {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Base64 data URLs & Blob URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const backendOrigin = getBackendOrigin();

  // If local development hardcoded localhost:5000 in DB
  if (trimmed.includes("localhost:5000/uploads/")) {
    const filename = trimmed.split("/uploads/")[1];
    if (backendOrigin) {
      return `${backendOrigin}/uploads/${filename}`;
    }
    return `/uploads/${filename}`;
  }

  // Already absolute URL (http:// or https://)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // If this is an uploaded image path (/uploads/...)
  if (normalized.startsWith("/uploads/")) {
    // If backend origin is defined (different domain/server), route to backend
    if (backendOrigin) {
      return `${backendOrigin}${normalized}`;
    }
    // Otherwise route to relative uploads (served by frontend static or same host)
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    return `${base}${normalized}`;
  }

  // Relative static asset path like /logo.jpg
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  return `${base}${normalized}`;
};

/**
 * Image error handler that provides a graceful fallback rather than leaving blank spaces
 */
export const handleImageError = (e, fallback = DEFAULT_LOGO) => {
  const target = e.currentTarget || e.target;
  if (!target) return;

  const currentSrc = target.getAttribute("src") || "";
  const backendOrigin = getBackendOrigin();

  // If it was trying to load /uploads/... relatively and failed, try backend if available
  if (backendOrigin && currentSrc.startsWith("/uploads/") && !currentSrc.startsWith(backendOrigin)) {
    target.src = `${backendOrigin}${currentSrc}`;
    return;
  }

  // If fallback is provided and we haven't tried it yet
  if (fallback && !currentSrc.endsWith(fallback)) {
    target.src = fallback;
    return;
  }

  // As a last resort, style it or hide cleanly without breaking page layout
  target.style.opacity = "0.6";
};

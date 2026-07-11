/** Shared axios config for multipart/form-data uploads. */
export const MULTIPART = {
  headers: { "Content-Type": "multipart/form-data" },
} as const;

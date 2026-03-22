/// <reference types="vite/client" />
// src/vite-env.d.ts に追記

declare global {
  interface Window {
    gapi: typeof gapi;
  }

  const gapi: typeof import("gapi");
}

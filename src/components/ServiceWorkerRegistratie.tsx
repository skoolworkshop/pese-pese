"use client";

import { useEffect } from "react";

// Registreert de service worker zodat de app offline kan starten en als
// PWA geïnstalleerd kan worden.
export function ServiceWorkerRegistratie() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => undefined);
    }
  }, []);
  return null;
}

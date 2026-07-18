"use client";

import { useEffect } from "react";

const RANGEN = ["B", "V", "H"];
const KLEUREN = ["schoppen", "harten", "klaveren", "ruiten"];

// Registreert de service worker zodat de app offline kan starten en als
// PWA geïnstalleerd kan worden. Laadt ook de plaatjeskaarten alvast in,
// zodat J, Q en K meteen scherp in beeld staan zonder korte witte flits.
export function ServiceWorkerRegistratie() {
  useEffect(() => {
    // Kaarten vooraf inladen.
    for (const r of RANGEN) {
      for (const k of KLEUREN) {
        const img = new Image();
        img.src = `/cards/${r}_${k}.svg`;
      }
    }

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);
  return null;
}

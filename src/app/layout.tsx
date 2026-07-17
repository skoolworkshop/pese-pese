import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { SettingsProvider } from "@/lib/settings";
import { ServiceWorkerRegistratie } from "@/components/ServiceWorkerRegistratie";

export const metadata: Metadata = {
  title: "Pese Pese",
  description:
    "Het populaire Surinaamse kaartspel. Speel tegen de computer, samen op 1 apparaat of oefen rustig.",
  applicationName: "Pese Pese",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pese Pese",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c3222",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="font-body antialiased">
        <I18nProvider>
          <SettingsProvider>
            {children}
            <ServiceWorkerRegistratie />
          </SettingsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

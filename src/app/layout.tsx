import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // adjust weights as needed
});

export const metadata: Metadata = {
  title: "Kantin Digital",
  description: "Digital ordering system for canteen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${poppins.variable} antialiased dark`}
      >
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
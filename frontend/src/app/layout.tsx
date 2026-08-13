import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Airbnb Clone",
  description: "A full-stack Airbnb clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-airbnbDark dark:bg-gray-900 dark:text-gray-100">
        <ClientProviders>
          <Navbar />

          <main>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
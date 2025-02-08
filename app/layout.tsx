"use client";
import { useState } from "react";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";
import DearCareLogo from "@/components/logo";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/DearCare.png" sizes="32x32" />
      </head>
      <body>
        {loading ? (
          <DearCareLogo onComplete={() => setLoading(false)} />
        ) : (
          <AuthProvider>{children}</AuthProvider>
        )}
      </body>
    </html>
  );
}
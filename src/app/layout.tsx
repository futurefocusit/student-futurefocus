import type { Metadata } from "next";
import "./globals.css";
import React from "react";


export const metadata: Metadata = {
  title: "Students",
  description: "Student management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex ">
          <main className="flex-1 inline  bg-gray-100 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

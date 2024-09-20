import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import AuthContextAPI from "@/context/AuthContext";


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
      <AuthContextAPI>
          <main className="flex-1 inline  bg-gray-100 min-h-screen">
            {children}
          </main>
    </AuthContextAPI>
        </div>
      </body>
    </html>
  );
}

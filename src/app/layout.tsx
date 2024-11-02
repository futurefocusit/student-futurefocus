import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import AuthContextAPI from "@/context/AuthContext";
import { CartProvider } from "@/context/cartContext";


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
        <CartProvider>
          <main className="flex-1 inline  bg-gray-100 min-h-screen">
            {children}
          </main>
          </CartProvider>
    </AuthContextAPI>
        </div>
      </body>
    </html>
  );
}

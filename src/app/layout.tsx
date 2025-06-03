import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import AuthContextAPI  from "@/context/AuthContext";
import { CartProvider } from "@/context/cartContext";
import WhatsAppButton from "@/components/whatsApp";


export const metadata: Metadata = {
  title: "Students",
  description: "Xcool management system",
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
            <WhatsAppButton/>
          </main>
          </CartProvider>
    </AuthContextAPI>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sunway Global School - School Management System",
  description: "Advanced School Management System for Sunway Global School - Managing students, staff, and parents efficiently.",
  keywords: ["school management", "student portal", "attendance", "marks", "fee management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider><LanguageProvider>{children}</LanguageProvider></AuthProvider>
      </body>
    </html>
  );
}

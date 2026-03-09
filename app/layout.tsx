import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

const lato = Lato ({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Warlen Industrial Sales Corp.",
  description: "General Construction & Specialty Contractor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.className} antialiased`}
      >
        <Navbar />
        <Toaster position="top-right" reverseOrder={false}/>
        {children}
      </body>
    </html>
  );
}

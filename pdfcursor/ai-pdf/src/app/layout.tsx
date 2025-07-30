import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/utils/constants.utils";

const geistSans = {
  variable: "--font-geist-sans",
  subsets: ["latin"],
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "A web based PDF reader with AI integration, open-source, offline and custom api key",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/utils/constants.utils";
import { Pangolin } from "next/font/google";

const pangolinFont = Pangolin({
  weight: "400",
  variable: "--font-pangolin",
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
      <body className={`${pangolinFont.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

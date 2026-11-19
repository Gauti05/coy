import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { TabBar } from "@/components/TabBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coy",
  description: "Privacy-first crush discovery",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="bg-background text-text">
        <div
          data-app-frame
          className="relative mx-auto flex h-dvh max-w-md flex-col bg-surface shadow-lg sm:border sm:border-border"
        >
          <div
            data-app-inert
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {children}
          </div>
          <div data-app-inert>
            <TabBar />
          </div>
        </div>
      </body>
    </html>
  );
}

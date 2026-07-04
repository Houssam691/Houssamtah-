import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ToastProvider";
import HeaderNav from "@/components/HeaderNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexivo",
  description: "متجر حسابات الألعاب وخدمات الشحن",
  icons: [{ rel: "icon", url: "/logo.jpeg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:flex-row md:items-center md:justify-between md:gap-4 md:py-4">
              <HeaderNav />
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 md:py-10"><ToastProvider>{children}</ToastProvider></main>

          <footer className="border-t border-white/10 py-10 text-white/70">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
              <div>© {new Date().getFullYear()} Nexivo</div>

            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

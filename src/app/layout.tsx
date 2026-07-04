import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import NavDashboardLink from "@/components/NavDashboardLink";
import NavAuthButton from "@/components/NavAuthButton";
import NavNotificationBell from "@/components/NavNotificationBell";
import { ToastProvider } from "@/components/ToastProvider";
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
              <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
                <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 shadow-[0_10px_30px_rgba(2,6,23,0.18)]" />
                <span>Nexivo</span>
              </Link>

              <nav className="hidden items-center gap-2 md:flex" aria-label="التنقل الرئيسي">
                <Link href="/pubg" className="rounded-full px-4 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                  PUBG
                </Link>
                <Link href="/free-fire" className="rounded-full px-4 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                  Free Fire
                </Link>
                <Link href="/topup" className="rounded-full px-4 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white">
                  Top-up
                </Link>
                <NavDashboardLink className="rounded-full px-4 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white" />
                <NavNotificationBell className="rounded-full px-3 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white" />
                <NavAuthButton className="rounded-full px-4 py-2 font-bold text-white/80 hover:bg-white/5 hover:text-white" />
              </nav>

              <nav className="flex flex-wrap items-center gap-2 md:hidden" aria-label="التنقل الرئيسي">
                <Link href="/pubg" className="btn-secondary whitespace-nowrap px-4 py-2">
                  PUBG
                </Link>
                <Link href="/free-fire" className="btn-secondary whitespace-nowrap px-4 py-2">
                  Free Fire
                </Link>
                <Link href="/topup" className="btn-secondary whitespace-nowrap px-4 py-2">
                  Top-up
                </Link>
                <NavDashboardLink className="btn-secondary whitespace-nowrap px-4 py-2" />
                <NavNotificationBell className="btn-secondary whitespace-nowrap px-3 py-2" />
                <NavAuthButton className="btn-secondary whitespace-nowrap px-4 py-2" />
              </nav>
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

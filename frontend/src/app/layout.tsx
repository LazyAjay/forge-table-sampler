import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { MockApiInterceptor } from "@/components/MockApiInterceptor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Generic Table Model Framework Showcase",
  description: "Generic dynamic table client-server pipeline using Spring Boot and React.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4FBF7]">
        <MockApiInterceptor />
        {/* Top Premium Navigation Header */}
        <header className="bg-slate-900 text-white shadow-md z-30 select-none sticky top-0">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                T
              </div>
              <span className="font-bold text-sm tracking-tight text-white">Table Framework Pipeline</span>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-1.5">
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Mock Roster
              </Link>
              <span className="text-slate-800 text-xs hidden sm:inline">|</span>
              <Link
                href="/users"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-all border border-cyan-500/10"
              >
                Employees
              </Link>
              <Link
                href="/products"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-all border border-indigo-500/10"
              >
                Products
              </Link>
              <Link
                href="/orders"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all border border-amber-500/10"
              >
                Orders
              </Link>
              <Link
                href="/logs"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition-all border border-rose-500/10"
              >
                System Logs
              </Link>
              <Link
                href="/customers"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-all border border-emerald-500/10"
              >
                Customers
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

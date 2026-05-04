import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Fish, FileText, Plus } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Fish Invoice Generator",
  description: "Generate and manage sales invoices for fish merchants",
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="no-print sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Fish className="size-5" aria-hidden />
              <span>Fish Invoice</span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link
                href="/fish"
                className="rounded-md px-3 py-2 hover:bg-accent"
              >
                Fish
              </Link>
              <Link
                href="/invoices"
                className="rounded-md px-3 py-2 hover:bg-accent"
              >
                <span className="hidden sm:inline">Invoices</span>
                <FileText className="inline size-4 sm:hidden" aria-hidden />
              </Link>
              <Link
                href="/invoices/new"
                className="ml-1 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" aria-hidden />
                <span className="hidden sm:inline">New</span>
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          {children}
        </main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

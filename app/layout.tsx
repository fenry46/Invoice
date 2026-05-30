import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Fish, FileText, LogOut, Plus, Users } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/auth";
import { logoutAction } from "@/app/_actions/auth";
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
  title: "Pembuat Faktur Ikan",
  description: "Buat dan kelola faktur penjualan untuk pedagang ikan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="no-print sticky top-0 z-10 border-b border-border/60 bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-1.5 px-4 py-2.5">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight"
              >
                <Fish className="size-5 text-primary" aria-hidden />
                <span className="hidden sm:inline">Faktur Ikan</span>
                <span className="sm:hidden">Ikan</span>
              </Link>
              <div className="flex items-center gap-0.5 text-sm">
                {session?.user && (
                  <>
                    <Link
                      href="/fish"
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3"
                      aria-label="Ikan"
                    >
                      <Fish className="size-4 sm:hidden" aria-hidden />
                      <span className="hidden sm:inline">Ikan</span>
                    </Link>
                    <Link
                      href="/customers"
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3"
                      aria-label="Pelanggan"
                    >
                      <Users className="size-4 sm:hidden" aria-hidden />
                      <span className="hidden sm:inline">Pelanggan</span>
                    </Link>
                    <Link
                      href="/invoices"
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3"
                      aria-label="Faktur"
                    >
                      <FileText className="size-4 sm:hidden" aria-hidden />
                      <span className="hidden sm:inline">Faktur</span>
                    </Link>
                    <Link
                      href="/invoices/new"
                      className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-3"
                    >
                      <Plus className="size-4" aria-hidden />
                      <span className="hidden sm:inline">Baru</span>
                    </Link>
                  </>
                )}
                <ThemeToggle />
                {session?.user && (
                  <form action={logoutAction} className="ml-1 flex items-center">
                    <span
                      className="hidden max-w-[12ch] truncate px-2 text-xs text-muted-foreground sm:inline"
                      title={session.user.email ?? undefined}
                    >
                      {session.user.email}
                    </span>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Keluar"
                      title="Keluar"
                    >
                      <LogOut className="size-4" aria-hidden />
                    </Button>
                  </form>
                )}
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
            {children}
          </main>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

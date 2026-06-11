import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Fish, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav, DesktopNavLinks } from "@/app/_components/SiteNav";
import { cn } from "@/lib/utils";
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

// viewport-fit=cover is required for env(safe-area-inset-*) to report
// non-zero values, so the BottomNav and the invoice save bar clear the
// device home indicator / navigation bar on phones.
export const viewport: Viewport = {
  viewportFit: "cover",
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
                {session?.user && <DesktopNavLinks />}
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
          <main
            className={cn(
              "mx-auto w-full max-w-3xl flex-1 px-4 pt-6",
              session?.user
                ? "pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-6"
                : "pb-6",
            )}
          >
            {children}
          </main>
          {session?.user && <BottomNav />}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

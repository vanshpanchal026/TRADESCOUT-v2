import type { Metadata } from "next";
import { Inter, Hanken_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/common/Footer";
import { GlobalShell } from "@/components/shell/GlobalShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scan The Charts (TRADESCOUT) — Indian Equity Market Analytics & Screener",
  description:
    "Institutional-grade breadth metrics, customized stock screening, multi-timeframe stage analysis, and streamlined market regime identification for Indian National Stock Exchange (NSE).",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${hanken.variable} ${manrope.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var saved = localStorage.getItem('stc-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
              window.__feedbackDrawerPending = false;
              window.addEventListener('open-feedback-drawer', function() {
                window.__feedbackDrawerPending = true;
              });
            })();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider>
          <GlobalShell>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </GlobalShell>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAT.co Financial Indicator Monitor",
  description: "Track mNAV and Bitcoin treasury company metrics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col">
        <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-black text-sm">
                D
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  DAT.co Financial Indicator Monitor
                </h1>
                <p className="text-xs text-gray-500">
                  Bitcoin Treasury Company Analytics
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
          <p>
            Data sources: Yahoo Finance (MSTR), CoinGecko (BTC), Strategy
            IR (BTC holdings)
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} DAT.co Monitor · Not financial
            advice
          </p>
        </footer>
      </body>
    </html>
  );
}

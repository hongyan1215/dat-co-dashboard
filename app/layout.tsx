import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAT.co — mNAV & Bitcoin Treasury Analytics",
  description:
    "Track mNAV ratio, BTC holdings, and Strategy (MSTR) market data in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col antialiased">
        <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/20">
                D
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  DAT.co Financial Monitor
                </h1>
                <p className="text-xs text-gray-500">
                  Bitcoin Treasury Company Analytics
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-800/60 py-8 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <span>Yahoo Finance (MSTR)</span>
                <span className="text-gray-800">·</span>
                <span>CoinGecko (BTC)</span>
                <span className="text-gray-800">·</span>
                <span>Strategy IR (Holdings)</span>
              </div>
              <p>
                © {new Date().getFullYear()} DAT.co Monitor · Not financial
                advice
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

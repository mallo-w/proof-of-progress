import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Proof of Progress",
    template: "%s — Proof of Progress",
  },
  description:
    "Turn your most important founder commitment into a contract. Define the work, put money on the line, and prove you shipped—or forfeit.",
  metadataBase: new URL("https://proof-of-progress.vercel.app"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

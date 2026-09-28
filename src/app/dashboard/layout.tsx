import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your active commitment, stake at risk, and time remaining.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

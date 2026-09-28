import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Review",
  description: "Review submitted commitments and issue verdicts.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Proof",
  description: "Submit the pre-agreed evidence for your active commitment before the deadline.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

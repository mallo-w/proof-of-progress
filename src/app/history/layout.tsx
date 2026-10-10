import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description: "Review all your past and current commitments on Proof of Progress.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Commitment",
  description: "Define a measurable outcome, set a deadline, and put money on the line.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

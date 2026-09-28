import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Proof of Progress account and start your first commitment.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

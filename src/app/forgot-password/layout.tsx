import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link for your Proof of Progress account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

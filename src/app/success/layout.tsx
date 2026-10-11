import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commitment locked — Proof of Progress',
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

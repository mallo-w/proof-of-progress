import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Engagement verrouillé — Proof of Progress',
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started — Proof of Progress',
  description: 'Create an account or log in to start a commitment.',
}

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

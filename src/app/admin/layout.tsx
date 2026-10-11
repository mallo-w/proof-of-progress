import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Proof of Progress',
  description: 'Admin dashboard.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

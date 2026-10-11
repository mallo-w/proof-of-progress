import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('commitments')
      .select('title')
      .eq('id', id)
      .single()

    if (data?.title) {
      return {
        title: `${data.title} — Proof of Progress`,
      }
    }
  } catch {
    // fall through to default
  }

  return { title: 'Engagement public — Proof of Progress' }
}

export default function PublicCommitmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import { createClient } from '@supabase/supabase-js'
import { effectiveStatus } from '@/utils/status'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

type Commitment = {
  id: string
  user_id: string
  title: string
  stake_amount: number
  deadline: string | null
  status: string
  created_at: string
  evidence_url?: string | null
}

export default async function AdminDashboard() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: rawCommitments } = await supabaseAdmin
    .from('commitments')
    .select('*')
    .order('created_at', { ascending: false })

  const emailById: Record<string, string> = {}
  let totalUsers = 0
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (usersData?.users) {
      totalUsers = usersData.users.length
      for (const u of usersData.users) {
        if (u.email) emailById[u.id] = u.email
      }
    }
  } catch {
    // continue with ids only
  }

  const commitments = ((rawCommitments || []) as Commitment[])
    .filter((c) => c.status !== 'payment_pending')
    .map((c) => ({
      ...c,
      effStatus: effectiveStatus({ status: c.status, deadline: c.deadline }),
    }))

  return (
    <AdminClient
      commitments={commitments}
      emailById={emailById}
      totalUsers={totalUsers}
    />
  )
}

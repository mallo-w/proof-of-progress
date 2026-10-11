import { createClient } from '@supabase/supabase-js'
import { effectiveStatus } from '@/utils/status'

export const dynamic = 'force-dynamic'

type Commitment = {
  id: string
  user_id: string
  title: string
  stake_amount: number
  deadline: string | null
  status: string
  created_at: string
}

const STATUS_ORDER = ['active', 'submitted', 'completed', 'failed', 'expired'] as const

const STATUS_STYLES: Record<string, string> = {
  active: 'border-white text-black bg-white',
  submitted: 'border-amber-900 text-amber-500 bg-amber-950/20',
  completed: 'border-green-900 text-green-500 bg-green-950/20',
  failed: 'border-red-900 text-red-500 bg-red-950/20',
  expired: 'border-red-900 text-red-500 bg-red-950/20',
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminDashboard() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all commitments
  const { data: rawCommitments } = await supabaseAdmin
    .from('commitments')
    .select('*')
    .order('created_at', { ascending: false })

  // Map user ids -> emails
  const emailById = new Map<string, string>()
  let totalUsers = 0
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (usersData?.users) {
      totalUsers = usersData.users.length
      for (const u of usersData.users) {
        if (u.email) emailById.set(u.id, u.email)
      }
    }
  } catch {
    // listUsers may fail if misconfigured — continue with ids only
  }

  // Only paid commitments count (exclude abandoned checkouts)
  const commitments: Commitment[] = (rawCommitments || []).filter(
    (c: Commitment) => c.status !== 'payment_pending'
  )

  // Apply effective status (active past deadline -> expired)
  const withStatus = commitments.map((c) => ({
    ...c,
    effStatus: effectiveStatus({ status: c.status, deadline: c.deadline }),
  }))

  const totalCommitments = withStatus.length
  const totalStaked = withStatus.reduce((sum, c) => sum + (Number(c.stake_amount) || 0), 0)
  const revenue = withStatus
    .filter((c) => c.effStatus === 'failed' || c.effStatus === 'expired')
    .reduce((sum, c) => sum + (Number(c.stake_amount) || 0), 0)

  const breakdown = STATUS_ORDER.map((status) => {
    const items = withStatus.filter((c) => c.effStatus === status)
    return {
      status,
      count: items.length,
      total: items.reduce((sum, c) => sum + (Number(c.stake_amount) || 0), 0),
    }
  })

  const kpis = [
    { label: 'Total Users', value: String(totalUsers) },
    { label: 'Total Commitments', value: String(totalCommitments) },
    { label: 'Total Staked', value: `€${totalStaked}` },
    { label: 'Revenue', value: `€${revenue}` },
  ]

  return (
    <main className="min-h-screen bg-transparent text-white p-5 sm:p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-zinc-800 pb-6">
          <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white font-semibold">Dashboard</span>
            <a href="/admin/review" className="text-zinc-500 hover:text-white underline">Review Queue</a>
            <a href="/dashboard" className="text-zinc-500 hover:text-white underline">Back to App</a>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="border border-zinc-800 bg-zinc-950 rounded p-5">
              <div className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-2">
                {k.label}
              </div>
              <div className="text-2xl sm:text-3xl font-black">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-4">
            Breakdown by status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {breakdown.map((b) => (
              <div key={b.status} className="border border-zinc-800 bg-zinc-950 rounded p-4">
                <span
                  className={`inline-block text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded border ${STATUS_STYLES[b.status]}`}
                >
                  {b.status}
                </span>
                <div className="text-2xl font-black mt-3">{b.count}</div>
                <div className="text-zinc-500 text-xs mt-1">€{b.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitments table */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-4">
            All commitments
          </h2>
          {withStatus.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded text-zinc-500 text-sm">
              No commitments yet.
            </div>
          ) : (
            <div className="border border-zinc-800 rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500 text-[10px] uppercase tracking-widest">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Stake</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Deadline</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {withStatus.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-950/50">
                      <td className="px-4 py-3 text-zinc-400 break-all max-w-[180px]">
                        {emailById.get(c.user_id) || c.user_id}
                      </td>
                      <td className="px-4 py-3 text-white font-medium break-words max-w-[240px]">{c.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold">€{c.stake_amount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{fmtDate(c.deadline)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded border ${STATUS_STYLES[c.effStatus] || 'border-zinc-700 text-zinc-400'}`}
                        >
                          {c.effStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{fmtDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

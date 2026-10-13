'use client'

import { useState, useMemo } from 'react'

type CommitmentRow = {
  id: string
  user_id: string
  title: string
  stake_amount: number
  deadline: string | null
  status: string
  created_at: string
  effStatus: string
  evidence_url?: string | null
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

export default function AdminClient({
  commitments,
  emailById,
  totalUsers,
}: {
  commitments: CommitmentRow[]
  emailById: Record<string, string>
  totalUsers: number
}) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return commitments.filter((c) => {
      const created = new Date(c.created_at).getTime()
      if (dateFrom && created < new Date(dateFrom).getTime()) return false
      if (dateTo && created > new Date(dateTo + 'T23:59:59').getTime()) return false
      return true
    })
  }, [commitments, dateFrom, dateTo])

  const totalStaked = filtered.reduce((sum, c) => sum + (Number(c.stake_amount) || 0), 0)
  const revenue = filtered
    .filter((c) => c.effStatus === 'failed' || c.effStatus === 'expired')
    .reduce((sum, c) => sum + (Number(c.stake_amount) || 0), 0)

  const breakdown = STATUS_ORDER.map((status) => {
    const items = filtered.filter((c) => c.effStatus === status)
    return {
      status,
      count: items.length,
      total: items.reduce((sum, c) => sum + (Number(c.stake_amount) || 0), 0),
    }
  })

  const kpis = [
    { label: 'Total Users', value: String(totalUsers) },
    { label: 'Commitments', value: String(filtered.length) },
    { label: 'Total Staked', value: `€${totalStaked}` },
    { label: 'Revenue', value: `€${revenue}` },
  ]

  return (
    <main className="min-h-screen bg-transparent text-white p-5 sm:p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-zinc-800 pb-6">
          <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white font-semibold">Dashboard</span>
            <a href="/admin/review" className="text-zinc-500 hover:text-white underline">Review Queue</a>
            <a href="/dashboard" className="text-zinc-500 hover:text-white underline">Back to App</a>
          </div>
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap items-end gap-4 border border-zinc-800 rounded p-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-zinc-500 hover:text-white text-xs underline self-end pb-2"
            >
              Reset filter
            </button>
          )}
          {(dateFrom || dateTo) && (
            <span className="text-xs text-zinc-500 self-end pb-2">
              Showing {filtered.length} of {commitments.length} commitments
            </span>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="border border-zinc-800 bg-zinc-950 rounded p-5">
              <div className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-2">{k.label}</div>
              <div className="text-2xl sm:text-3xl font-black">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-4">Breakdown by status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {breakdown.map((b) => (
              <div key={b.status} className="border border-zinc-800 bg-zinc-950 rounded p-4">
                <span className={`inline-block text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded border ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
                <div className="text-2xl font-black mt-3">{b.count}</div>
                <div className="text-zinc-500 text-xs mt-1">€{b.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-4">All commitments</h2>
          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded text-zinc-500 text-sm">
              No commitments in this date range.
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
                    <th className="px-4 py-3 font-semibold">Evidence</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-950/50">
                      <td className="px-4 py-3 text-zinc-400 break-all max-w-[160px] text-xs">
                        {emailById[c.user_id] || c.user_id}
                      </td>
                      <td className="px-4 py-3 text-white font-medium break-words max-w-[200px]">{c.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold">€{c.stake_amount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{fmtDate(c.deadline)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded border ${STATUS_STYLES[c.effStatus] || 'border-zinc-700 text-zinc-400'}`}>
                          {c.effStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.evidence_url ? (
                          <a href={c.evidence_url} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 text-xs hover:text-zinc-300 whitespace-nowrap">
                            View →
                          </a>
                        ) : c.effStatus === 'submitted' ? (
                          <span className="text-amber-500 text-xs">Pending</span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-500 text-xs">{fmtDate(c.created_at)}</td>
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

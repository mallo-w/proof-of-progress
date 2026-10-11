'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { effectiveStatus, isTerminal, VISIBLE_STATUSES } from '@/utils/status'

const STATUS_STYLES: Record<string, string> = {
  active: 'border border-zinc-700 text-zinc-300 bg-zinc-900',
  submitted: 'border border-amber-800 text-amber-400 bg-amber-950/30',
  completed: 'border border-green-800 text-green-400 bg-green-950/30',
  failed: 'border border-red-800 text-red-400 bg-red-950/30',
  expired: 'border border-red-900 text-red-500 bg-red-950/20',
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'border border-zinc-700 text-zinc-300 bg-zinc-900'
  return (
    <span className={`${style} text-[10px] px-2.5 py-1 font-bold uppercase tracking-widest rounded`}>
      {status}
    </span>
  )
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline'
  const date = new Date(deadline)
  if (isNaN(date.getTime())) return 'No deadline'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function History() {
  const [commitments, setCommitments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('commitments')
        .select('*')
        .eq('user_id', user.id)
        .in('status', VISIBLE_STATUSES)
        .order('created_at', { ascending: false })

      if (data) setCommitments(data.map((c) => ({ ...c, status: effectiveStatus(c) })))
      setLoading(false)
    }
    fetchHistory()
  }, [router])

  const hasActive = commitments.some((c) => !isTerminal(c.status))

  if (loading) {
    return (
      <div className="bg-transparent min-h-screen text-white p-8 font-mono">Loading history...</div>
    )
  }

  return (
    <main className="min-h-screen bg-transparent text-white p-5 sm:p-8 md:p-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center gap-3 mb-8 sm:mb-12 border-b border-zinc-800 pb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Your Commitment History</h1>
          <a href="/dashboard" className="text-zinc-500 hover:text-white text-xs underline whitespace-nowrap">
            Back to Dashboard
          </a>
        </div>

        {commitments.length > 0 && (
          <div className="mb-8 text-center">
            <a
              href="/create"
              className="inline-block bg-white text-black px-8 py-4 rounded font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition"
            >
              Start a New Commitment →
            </a>
          </div>
        )}

        {commitments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded px-6">
            <p className="text-zinc-400 mb-8">No commitments yet.</p>
            <a
              href="/create"
              className="inline-block bg-white text-black px-8 py-4 rounded font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition"
            >
              Start your first commitment →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {commitments.map((c) => (
              <div
                key={c.id}
                className="border border-zinc-800 bg-zinc-950 rounded p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="min-w-0 space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold break-words">{c.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span>
                      {c.status === 'expired' ? 'Expired: ' : 'Due: '}
                      {formatDeadline(c.deadline)}
                    </span>
                    <span className="text-zinc-300 font-semibold">€{c.stake_amount}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}

        {commitments.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
            <a
              href="/create"
              className="inline-block bg-white text-black px-8 py-4 rounded font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition"
            >
              Start a New Commitment →
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

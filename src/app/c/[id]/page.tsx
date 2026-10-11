import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function effectiveStatus(c: { status: string; deadline: string | null }): string {
  if (c.status === 'active' && c.deadline && new Date(c.deadline).getTime() <= Date.now()) {
    return 'expired'
  }
  return c.status
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  submitted: 'Under Review',
  completed: 'Completed',
  failed: 'Failed',
  expired: 'Expired',
}

function statusBadgeClasses(status: string): string {
  switch (status) {
    case 'completed':
      return 'border-green-900 text-green-500 bg-green-950/20'
    case 'failed':
    case 'expired':
      return 'border-red-900 text-red-500 bg-red-950/20'
    case 'submitted':
      return 'border-amber-900 text-amber-500 bg-amber-950/20'
    case 'active':
    default:
      return 'border-white text-black bg-white'
  }
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Not set'
  return new Date(deadline).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function PublicCommitmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: commitment } = await supabase
    .from('commitments')
    .select('*')
    .eq('id', id)
    .single()

  if (!commitment) {
    return (
      <main className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center px-5 sm:px-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black mb-3">Commitment not found</h1>
          <p className="text-zinc-500 text-sm mb-8">This link doesn't match any commitment.</p>
          <a
            href="/"
            className="inline-block bg-white text-black px-8 py-4 rounded font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition"
          >
            Discover Proof of Progress →
          </a>
        </div>
      </main>
    )
  }

  const status = effectiveStatus(commitment)

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col items-center px-5 sm:px-8 py-12 sm:py-20">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <span className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold">
            Public Commitment
          </span>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 rounded p-6 sm:p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black leading-tight break-words">
              {commitment.title}
            </h1>
            <div className="mt-4">
              <span
                className={`inline-block text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded border ${statusBadgeClasses(status)}`}
              >
                {STATUS_LABELS[status] || status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 border-t border-b border-zinc-800 text-center">
            <div>
              <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">
                At Stake
              </span>
              <div className="text-2xl sm:text-3xl font-black">€{commitment.stake_amount}</div>
            </div>
            <div>
              <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">
                Deadline
              </span>
              <div className="text-sm font-bold">{formatDeadline(commitment.deadline)}</div>
              <div className="text-[10px] text-zinc-600 mt-1">(23:59:59 UTC)</div>
            </div>
          </div>

          <div>
            <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">
              Success Criteria
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              &quot;{commitment.binary_completion_criteria}&quot;
            </p>
          </div>
        </div>

        <div className="text-center border border-dashed border-zinc-800 rounded p-6">
          <p className="text-sm text-zinc-400 mb-4">
            This person committed publicly. You can too →
          </p>
          <a
            href="/"
            className="inline-block bg-white text-black px-8 py-4 rounded font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition"
          >
            Start my commitment →
          </a>
        </div>
      </div>
    </main>
  )
}

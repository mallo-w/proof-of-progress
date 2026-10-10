// An 'active' commitment whose deadline has passed without proof is expired (stake forfeited).
// The DB cron job persists this; this helper keeps the UI correct between cron runs.
export type CommitmentStatus = 'active' | 'submitted' | 'completed' | 'failed' | 'expired'

export const VISIBLE_STATUSES: CommitmentStatus[] = ['active', 'submitted', 'completed', 'failed', 'expired']

export function effectiveStatus(c: { status: string; deadline: string | null }): CommitmentStatus {
  if (c.status === 'active' && c.deadline && new Date(c.deadline).getTime() <= Date.now()) {
    return 'expired'
  }
  return c.status as CommitmentStatus
}

export function isTerminal(status: CommitmentStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'expired'
}

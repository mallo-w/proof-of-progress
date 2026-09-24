'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function AdminReview() {
  const [commitments, setCommitments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'mallory@system-strategy.co') {
        router.push('/dashboard')
        return
      }

      const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setCommitments(data)
      }
      setLoading(false)
    }

    fetchSubmissions()
  }, [router])

  const handleVerdict = async (id: string, status: 'completed' | 'failed') => {
    const { error } = await supabase
      .from('commitments')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setCommitments(commitments.filter((c) => c.id !== id))
    }
  }

  if (loading) return <div className="bg-black min-h-screen text-white p-8 font-mono">Loading review queue...</div>

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <h1 className="text-xl font-bold tracking-tight">Admin Review Queue</h1>
          <a href="/dashboard" className="text-zinc-500 hover:text-white text-xs underline">Back to Dashboard</a>
        </div>

        {commitments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded text-zinc-500 text-sm">
            No pending submissions to review.
          </div>
        ) : (
          <div className="space-y-6">
            {commitments.map((c) => (
              <div key={c.id} className="border border-zinc-800 bg-zinc-950 p-6 rounded space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">User: {c.user_id}</span>
                    <h2 className="text-2xl font-black">{c.title}</h2>
                  </div>
                  <span className="text-xl font-bold text-white">€{c.stake_amount}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-b border-zinc-900 py-3 text-zinc-400">
                  <div>
                    <span className="text-zinc-600 block uppercase font-bold">Criteria</span>
                    {c.binary_completion_criteria}
                  </div>
                  <div>
                    <span className="text-zinc-600 block uppercase font-bold">Required Evidence</span>
                    {c.evidence_requirements}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => handleVerdict(c.id, 'completed')}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold uppercase text-xs tracking-widest transition"
                  >
                    Approve (Completed)
                  </button>
                  <button
                    onClick={() => handleVerdict(c.id, 'failed')}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded font-bold uppercase text-xs tracking-widest transition"
                  >
                    Reject (Failed)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
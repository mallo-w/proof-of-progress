'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function SubmitEvidence() {
  const [commitment, setCommitment] = useState<any>(null)
  const [evidenceLink, setEvidenceLink] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCommitment = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('commitments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!data) router.push('/dashboard')
      else setCommitment(data)
    }
    fetchCommitment()
  }, [router])

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Pour l'MVP, on met simplement à jour le statut
    const { error } = await supabase
      .from('commitments')
      .update({ status: 'submitted' })
      .eq('id', commitment.id)

    if (error) alert(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  if (!commitment) return <div className="bg-black min-h-screen text-white p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full border border-zinc-800 p-10 rounded">
        <h1 className="text-xl font-bold mb-2">Submit Proof of Progress</h1>
        <p className="text-zinc-500 text-sm mb-8">
          You are submitting proof for: <span className="text-white font-semibold">{commitment.title}</span>
        </p>

        <form onSubmit={handleSubmitProof} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
              Evidence Link (URL, Loom, or Image Link)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={evidenceLink}
              onChange={(e) => setEvidenceLink(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white outline-none"
              required
            />
          </div>

          <div className="bg-zinc-950 p-4 rounded text-[11px] text-zinc-500 italic border border-zinc-900">
            Reminder of your criteria: "{commitment.binary_completion_criteria}"
          </div>

          <button
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded uppercase tracking-widest text-xs hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Confirm Completion'}
          </button>
        </form>
      </div>
    </main>
  )
}
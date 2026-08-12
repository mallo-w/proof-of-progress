'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [commitment, setCommitment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch the latest active commitment
      const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setCommitment(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return <div className="bg-black min-h-screen text-white p-8 font-mono">Loading contract...</div>

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Proof of Progress</h1>
            <p className="text-zinc-500 text-xs mt-1">{user?.email}</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-zinc-500 hover:text-white text-xs underline"
          >
            Logout
          </button>
        </div>

        {!commitment ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded">
            <p className="text-zinc-400 mb-6">No active commitment found.</p>
            <a href="/create" className="bg-white text-black px-6 py-3 rounded font-bold hover:bg-zinc-200 transition">
              Create your first commitment
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">Active Commitment</span>
                <h2 className="text-4xl font-black leading-tight">{commitment.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-b border-zinc-800">
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">Binary Criteria</span>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{commitment.binary_completion_criteria}"</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">Required Evidence</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{commitment.evidence_requirements}</p>
                </div>
              </div>

              <div className="pt-4">
                {commitment.status === 'active' && (
                    <a 
                    href="/submit"
                    className="w-full bg-white text-black py-4 rounded font-black hover:bg-zinc-200 transition uppercase tracking-widest text-sm block text-center"
                    >
                    Submit Proof of Progress
                    </a>
                )}

                {commitment.status === 'submitted' && (
                    <div className="w-full border border-zinc-800 text-zinc-500 py-4 rounded font-bold uppercase tracking-widest text-sm text-center bg-zinc-950">
                    Awaiting Review
                    </div>
                )}

                {commitment.status === 'completed' && (
                    <div className="w-full border border-green-900 text-green-500 py-4 rounded font-bold uppercase tracking-widest text-sm text-center bg-green-950/20">
                    Commitment Completed • Stake Released
                    </div>
                )}

                {commitment.status === 'failed' && (
                    <div className="w-full border border-red-900 text-red-500 py-4 rounded font-bold uppercase tracking-widest text-sm text-center bg-red-950/20">
                    Commitment Failed • Stake Forfeited
                    </div>
                )}
                
                <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase">Locked commitment — No edits allowed</p>
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded space-y-8 h-fit">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold text-center">Status</span>
                <div className="text-center">
                  <span className="bg-white text-black text-[10px] px-2 py-1 font-bold uppercase tracking-widest rounded">
                    {commitment.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-1 font-semibold text-center">Stake at Risk</span>
                <div className="text-3xl font-black text-center">€{commitment.stake_amount}</div>
              </div>

              <div className="pt-4 border-t border-zinc-900">
                <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold text-center">Deadline</span>
                <div className="text-sm font-bold text-center">
                  {new Date(commitment.deadline).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function CreateCommitment() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Ship a product / feature',
    deadline: '',
    binary_completion_criteria: '',
    evidence_requirements: '',
    review_method: 'self',
    referee_email: '',
    stake_amount: 50,
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }
    getUser()
  }, [router])

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from('commitments').insert([
      { 
        ...formData, 
        user_id: userId,
        status: 'active'
      }
    ])

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  if (!userId) return <div className="bg-black min-h-screen text-white p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-20 px-8">
      <div className="max-w-xl w-full border border-zinc-800 p-10 rounded">
        
        <div className="flex justify-between mb-10 text-xs font-mono text-zinc-500">
          <span>STEP {step} / 4</span>
          <span>{Math.round((step/4)*100)}% COMPLETE</span>
        </div>

        {/* STEP 1: DEFINE GOAL */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">What are you shipping?</h2>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Finish Landing Page"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Binary Completion Criteria</label>
              <textarea 
                placeholder="I will consider this complete ONLY when: (e.g. The URL is live and the buy button works)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm h-24"
                value={formData.binary_completion_criteria}
                onChange={(e) => setFormData({...formData, binary_completion_criteria: e.target.value})}
              />
              <p className="text-xs text-zinc-600 mt-1 italic">Make it binary: either it's done or it's not.</p>
            </div>
            <button onClick={handleNext} className="w-full bg-white text-black py-3 rounded font-bold">Next</button>
          </div>
        )}

        {/* STEP 2: EVIDENCE & DEADLINE */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Proof & Timing</h2>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Deadline Date</label>
              <input 
                type="date" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm"
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Evidence Required</label>
              <textarea 
                placeholder="e.g. A public URL + a screenshot of the dashboard."
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm h-24"
                value={formData.evidence_requirements}
                onChange={(e) => setFormData({...formData, evidence_requirements: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-zinc-800 py-3 rounded font-bold">Back</button>
              <button onClick={handleNext} className="flex-1 bg-white text-black py-3 rounded font-bold">Next</button>
            </div>
          </div>
        )}

        {/* STEP 3: STAKE */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Choose your stake</h2>
            <p className="text-zinc-500 text-sm">Select an amount to risk. If you fail, this amount is lost.</p>
            <div className="grid grid-cols-3 gap-3">
              {[25, 50, 100].map((amt) => (
                <button 
                  key={amt}
                  onClick={() => setFormData({...formData, stake_amount: amt})}
                  className={`py-4 rounded font-bold border ${formData.stake_amount === amt ? 'border-white bg-white text-black' : 'border-zinc-800'}`}
                >
                  €{amt}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-zinc-800 py-3 rounded font-bold">Back</button>
              <button onClick={handleNext} className="flex-1 bg-white text-black py-3 rounded font-bold">Next</button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-6 text-sm">
            <h2 className="text-xl font-bold">Submit Contract</h2>
            <div className="bg-zinc-950 p-6 rounded space-y-4 border border-zinc-900">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">Commitment</span>
                <span className="font-bold">{formData.title || 'Untitled'}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">Deadline</span>
                <span>{formData.deadline || 'No date set'}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">The Stake</span>
                <span className="text-white font-bold">€{formData.stake_amount}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500">By clicking below, you lock this contract. It cannot be edited after this point.</p>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-zinc-800 py-3 rounded font-bold">Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 bg-white text-black py-3 rounded font-bold disabled:opacity-50"
              >
                {loading ? 'Locking...' : 'Start Commitment'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
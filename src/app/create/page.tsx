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
    charity_name: '',
    charity_percentage: 25,
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
    if (!userId) return

    setLoading(true)

    // 1. Save with payment_pending status and retrieve the generated row
    const { data, error } = await supabase
      .from('commitments')
      .insert([
        {
          ...formData,
          user_id: userId,
          status: 'payment_pending',
        },
      ])
      .select('id')
      .single()

    if (error || !data) {
      alert(`Error: ${error?.message || 'Could not save commitment'}`)
      setLoading(false)
      return
    }

    // 2. Create Stripe session passing the commitment ID
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.stake_amount,
          title: formData.title,
          commitmentId: data.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to create Stripe Checkout session')
      }

      if (!result.url) {
        throw new Error('Stripe did not return a checkout URL')
      }

      window.location.href = result.url
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment error'
      alert(message)
      setLoading(false)
    }
  }

  if (!userId) return <div className="bg-transparent min-h-screen text-white p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col items-center py-10 sm:py-20 px-5 sm:px-8">
      <div className="max-w-xl w-full border border-zinc-800 p-6 sm:p-8 rounded">
        
        <div className="flex justify-between mb-10 text-xs font-mono text-zinc-500">
          <span>STEP {step} / 5</span>
          <span>{Math.round((step/5)*100)}% COMPLETE</span>
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
                onChange={(e) => {
                  const v = e.target.value
                  if (v) {
                    const localEOD = new Date(v + 'T23:59:59')
                    setFormData({...formData, deadline: localEOD.toISOString()})
                  } else {
                    setFormData({...formData, deadline: ''})
                  }
                }}
              />
              <p className="text-xs text-zinc-600 mt-1 italic">
                Deadline = end of this day at 23:59:59 in your local timezone.
              </p>
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
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Or enter a custom amount (min. €25)</label>
              <input
                type="number"
                min={25}
                placeholder="ex: 75"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm"
                value={formData.stake_amount}
                onChange={(e) => setFormData({...formData, stake_amount: Number(e.target.value)})}
              />
            </div>
            {formData.stake_amount < 25 && (
              <p className="text-xs text-red-500 leading-relaxed">
                ⚠️ Below €25, the stake is too low to create real psychological pressure. The point is that losing should hurt.
              </p>
            )}
            <p className="text-[11px] text-zinc-500 italic leading-relaxed">
              Behavioral economics research (Kahneman, Yale/stickK) recommends 1–5% of your monthly disposable income. Enough to sting, not enough to paralyze.
            </p>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-zinc-800 py-3 rounded font-bold">Back</button>
              <button
                onClick={handleNext}
                disabled={formData.stake_amount < 25}
                className="flex-1 bg-white text-black py-3 rounded font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHARITY & CAUSE */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">If you fail, where does the money go?</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              If you don&apos;t deliver, your money is lost. You can choose where it goes — ideally somewhere you hate. Optional, but it multiplies the motivation.
            </p>
            <div className="bg-zinc-950 border border-amber-900 text-amber-500 rounded p-4 text-xs leading-relaxed">
              This isn&apos;t about charity. The idea is that your money goes somewhere that bothers you — so that failing becomes unbearable. Choose an organization you have no interest in funding.
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Organization name</label>
              <input
                type="text"
                placeholder="e.g. Party X, Organization Y..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm"
                value={formData.charity_name}
                onChange={(e) => setFormData({...formData, charity_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-2">Percentage of stake</label>
              <div className="grid grid-cols-3 gap-3">
                {[25, 33, 50].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setFormData({...formData, charity_percentage: pct})}
                    className={`py-4 rounded font-bold border ${formData.charity_percentage === pct ? 'border-white bg-white text-black' : 'border-zinc-800'}`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-zinc-600 italic leading-relaxed">
              You&apos;ll receive an invoice once the amount is sent to the organization.
            </p>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-zinc-800 py-3 rounded font-bold">Back</button>
              <button
                onClick={() => { setFormData({...formData, charity_name: '', charity_percentage: 25}); handleNext() }}
                className="flex-1 border border-zinc-800 py-3 rounded font-bold text-zinc-400"
              >
                Skip
              </button>
              <button onClick={handleNext} className="flex-1 bg-white text-black py-3 rounded font-bold">Next</button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 5 && (
          <div className="space-y-6 text-sm">
            <h2 className="text-xl font-bold">Submit Contract</h2>
            <div className="bg-zinc-950 p-6 rounded space-y-4 border border-zinc-900">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">Commitment</span>
                <span className="font-bold">{formData.title || 'Untitled'}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">Deadline</span>
                <span>
                  {formData.deadline
                    ? new Date(formData.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' — end of day (23:59:59 local time)'
                    : 'No date set'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">The Stake</span>
                <span className="text-white font-bold">€{formData.stake_amount}</span>
              </div>
              {formData.charity_name && (
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block">If failed</span>
                  <span className="text-white">{formData.charity_percentage}% → {formData.charity_name}</span>
                </div>
              )}
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